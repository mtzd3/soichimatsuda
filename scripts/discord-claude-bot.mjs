import { spawn } from "node:child_process";
import process from "node:process";

import {
  Client,
  GatewayIntentBits,
  MessageFlags,
} from "discord.js";

import {
  buildClaudeArgs,
  formatDuration,
  formatUsd,
  loadConfig,
  makeJobId,
  parseClaudeResult,
  renderJobReport,
  truncate,
  writeJobRecord,
} from "./discord-claude-shared.mjs";

const config = loadConfig();

class JobManager {
  constructor(client, runtimeConfig) {
    this.client = client;
    this.config = runtimeConfig;
    this.currentJob = null;
    this.queue = [];
    this.recentJobs = [];
  }

  enqueue({ channelId, prompt, projectAlias, sessionId, userId, userTag }) {
    const project = this.config.projectMap.get(projectAlias) ||
      this.config.projectMap.get(this.config.defaultProject);

    if (!project) {
      throw new Error(`Unknown project alias: ${projectAlias}`);
    }

    const job = {
      id: makeJobId(),
      status: "queued",
      prompt,
      projectAlias: project.alias,
      cwd: project.cwd,
      sessionId: sessionId || null,
      userId,
      userTag,
      channelId,
      createdAt: new Date().toISOString(),
      startedAt: null,
      finishedAt: null,
      exitCode: null,
      signal: null,
      costUsd: null,
      resultText: null,
      stdout: "",
      stderr: "",
      parseError: null,
      child: null,
      cancelRequested: false,
    };

    writeJobRecord(this.config, job);
    this.queue.push(job);
    const queuedAhead = (this.currentJob ? 1 : 0) + this.queue.length - 1;

    this.runNext().catch((error) => {
      console.error("Failed to run queued job:", error);
    });

    return {
      id: job.id,
      projectAlias: job.projectAlias,
      queuedAhead,
      startsNow: queuedAhead === 0,
    };
  }

  getStatusLines() {
    const lines = [];

    if (this.currentJob) {
      const elapsed = Date.now() - new Date(this.currentJob.startedAt).getTime();
      lines.push(
        `Running: ${this.currentJob.id} on ${this.currentJob.projectAlias} for ${formatDuration(elapsed)} (requested by <@${this.currentJob.userId}>)`,
      );
    } else {
      lines.push("Running: none");
    }

    if (this.queue.length > 0) {
      lines.push("Queued:");
      for (const job of this.queue.slice(0, 5)) {
        lines.push(
          `- ${job.id} on ${job.projectAlias} (requested by <@${job.userId}>)`,
        );
      }
    } else {
      lines.push("Queued: none");
    }

    if (this.recentJobs.length > 0) {
      lines.push("Recent:");
      for (const job of this.recentJobs.slice(0, 5)) {
        lines.push(`- ${job.id} ${job.status} on ${job.projectAlias}`);
      }
    }

    return lines;
  }

  cancel(jobId) {
    if (jobId && this.currentJob?.id === jobId) {
      this.currentJob.cancelRequested = true;
      this.currentJob.child?.kill("SIGINT");
      return `Sent SIGINT to ${jobId}.`;
    }

    if (!jobId && this.currentJob) {
      this.currentJob.cancelRequested = true;
      this.currentJob.child?.kill("SIGINT");
      return `Sent SIGINT to ${this.currentJob.id}.`;
    }

    const queuedIndex = this.queue.findIndex((job) => job.id === jobId);

    if (queuedIndex >= 0) {
      const [removedJob] = this.queue.splice(queuedIndex, 1);
      removedJob.status = "cancelled";
      removedJob.finishedAt = new Date().toISOString();
      writeJobRecord(this.config, removedJob);
      this.rememberJob(removedJob);
      return `Cancelled queued job ${removedJob.id}.`;
    }

    return jobId
      ? `Job ${jobId} was not found.`
      : "There is no running job to cancel.";
  }

  rememberJob(job) {
    this.recentJobs.unshift({
      id: job.id,
      status: job.status,
      projectAlias: job.projectAlias,
    });

    if (this.recentJobs.length > 5) {
      this.recentJobs.length = 5;
    }
  }

  async runNext() {
    if (this.currentJob || this.queue.length === 0) {
      return;
    }

    const job = this.queue.shift();
    this.currentJob = job;
    job.status = "running";
    job.startedAt = new Date().toISOString();
    writeJobRecord(this.config, job);

    await this.announceStart(job);
    await this.executeJob(job);

    this.currentJob = null;

    if (this.queue.length > 0) {
      await this.runNext();
    }
  }

  async executeJob(job) {
    const args = buildClaudeArgs(this.config, {
      prompt: job.prompt,
      sessionId: job.sessionId,
    });

    const child = spawn(this.config.claudeBin, args, {
      cwd: job.cwd,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    job.child = child;

    const stdoutChunks = [];
    const stderrChunks = [];
    let settled = false;

    child.stdout.on("data", (chunk) => {
      stdoutChunks.push(chunk);
    });

    child.stderr.on("data", (chunk) => {
      stderrChunks.push(chunk);
    });

    await new Promise((resolve) => {
      const finalize = async ({ code, signal, spawnError = null }) => {
        if (settled) {
          resolve();
          return;
        }

        settled = true;
        job.exitCode = code ?? null;
        job.signal = signal ?? null;
        job.finishedAt = new Date().toISOString();
        job.stdout = Buffer.concat(stdoutChunks).toString("utf8");
        job.stderr =
          Buffer.concat(stderrChunks).toString("utf8") ||
          (spawnError instanceof Error ? spawnError.stack || spawnError.message : "");

        const parsed = parseClaudeResult(job.stdout);
        job.parseError = parsed.parseError;

        if (parsed.parsed) {
          job.resultText =
            typeof parsed.parsed.result === "string"
              ? parsed.parsed.result
              : JSON.stringify(parsed.parsed, null, 2);
          job.sessionId = parsed.parsed.session_id || job.sessionId;
          job.costUsd = parsed.parsed.total_cost_usd ?? null;
        } else if (!job.resultText) {
          job.resultText = parsed.raw;
        }

        if (job.cancelRequested || signal === "SIGINT") {
          job.status = "cancelled";
        } else if (code === 0 && !parsed.parsed?.is_error) {
          job.status = "completed";
        } else {
          job.status = "failed";
        }

        writeJobRecord(this.config, job);
        this.rememberJob(job);
        await this.announceCompletion(job);
        resolve();
      };

      child.on("error", (error) => {
        void finalize({ spawnError: error });
      });

      child.on("close", (code, signal) => {
        void finalize({ code, signal });
      });
    });
  }

  async announceStart(job) {
    const content = [
      `<@${job.userId}> ${job.id} started on \`${job.projectAlias}\`.`,
      `Prompt:`,
      "```text",
      truncate(job.prompt, 1000),
      "```",
      job.sessionId ? `Session: \`${job.sessionId}\`` : "Session: new",
    ].join("\n");

    await this.sendMessages(job, {
      content,
      mentionUser: true,
      dmUser: false,
    });
  }

  async announceCompletion(job) {
    const startedAt = job.startedAt ? new Date(job.startedAt).getTime() : Date.now();
    const finishedAt = job.finishedAt ? new Date(job.finishedAt).getTime() : Date.now();
    const duration = formatDuration(finishedAt - startedAt);
    const resultPreview = truncate(job.resultText || job.stderr || "No output", 1400);
    const cost = formatUsd(job.costUsd);
    const summaryLine =
      job.status === "completed"
        ? "completed successfully"
        : job.status === "cancelled"
          ? "was cancelled"
          : "failed";

    const contentLines = [
      `<@${job.userId}> ${job.id} ${summaryLine} on \`${job.projectAlias}\` after ${duration}.`,
      job.sessionId ? `Session: \`${job.sessionId}\`` : null,
      cost ? `Cost: ${cost}` : null,
      "Result:",
      "```text",
      resultPreview,
      "```",
      `Log: \`${writeJobRecord(this.config, job)}\``,
    ].filter(Boolean);

    await this.sendMessages(job, {
      content: contentLines.join("\n"),
      mentionUser: true,
      dmUser: true,
      files: [
        {
          attachment: Buffer.from(renderJobReport(job), "utf8"),
          name: `${job.id}.txt`,
        },
      ],
    });
  }

  async sendMessages(job, { content, files = [], mentionUser, dmUser }) {
    const channelIds = new Set([job.channelId]);

    if (this.config.notificationChannelId) {
      channelIds.add(this.config.notificationChannelId);
    }

    for (const channelId of channelIds) {
      try {
        const channel = await this.client.channels.fetch(channelId);

        if (!channel?.isTextBased?.()) {
          continue;
        }

        await channel.send({
          content,
          files,
          allowedMentions: mentionUser
            ? { parse: [], users: [job.userId] }
            : { parse: [] },
        });
      } catch (error) {
        console.error(`Failed to send message to channel ${channelId}:`, error);
      }
    }

    if (!dmUser) {
      return;
    }

    try {
      const user = await this.client.users.fetch(job.userId);
      await user.send({ content, files });
    } catch (error) {
      console.error(`Failed to DM user ${job.userId}:`, error);
    }
  }
}

function isAuthorized(interaction) {
  if (!config.allowedUserIds.has(interaction.user.id)) {
    return false;
  }

  if (config.allowedChannelIds.size === 0) {
    return true;
  }

  if (!interaction.guildId) {
    return true;
  }

  return config.allowedChannelIds.has(interaction.channelId);
}

function getProjectAlias(interaction) {
  return interaction.options.getString("project") || config.defaultProject;
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const jobs = new JobManager(client, config);

client.once("clientReady", () => {
  console.log(`Discord Claude bot is ready as ${client.user.tag}.`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  if (!isAuthorized(interaction)) {
    await interaction.reply({
      content: "This command is not allowed from your user or channel.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (interaction.commandName === "claude-run") {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const prompt = interaction.options.getString("prompt", true);
      const projectAlias = getProjectAlias(interaction);
      const sessionId = interaction.options.getString("session_id");
      const queued = jobs.enqueue({
        channelId: interaction.channelId,
        prompt,
        projectAlias,
        sessionId,
        userId: interaction.user.id,
        userTag: interaction.user.tag,
      });

      const statusLine = queued.startsNow
        ? "Started immediately."
        : `Queued behind ${queued.queuedAhead} job(s).`;

      await interaction.editReply(
        `${queued.id} accepted for \`${queued.projectAlias}\`. ${statusLine}`,
      );
    } catch (error) {
      await interaction.editReply(
        `Failed to queue job: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return;
  }

  if (interaction.commandName === "claude-status") {
    await interaction.reply({
      content: jobs.getStatusLines().join("\n"),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (interaction.commandName === "claude-cancel") {
    const jobId = interaction.options.getString("job_id");
    const message = jobs.cancel(jobId);

    await interaction.reply({
      content: message,
      flags: MessageFlags.Ephemeral,
    });
  }
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    try {
      if (jobs.currentJob?.child) {
        jobs.currentJob.cancelRequested = true;
        jobs.currentJob.child.kill("SIGINT");
      }
      client.destroy();
    } finally {
      process.exit(0);
    }
  });
}

await client.login(config.botToken);
