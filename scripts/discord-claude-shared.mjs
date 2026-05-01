import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import dotenv from "dotenv";

dotenv.config();

const PERMISSION_MODES = new Set([
  "acceptEdits",
  "auto",
  "bypassPermissions",
  "default",
  "dontAsk",
  "plan",
]);

function readRequiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

function readOptionalEnv(name) {
  const value = process.env[name]?.trim();
  return value || null;
}

function splitCsv(value) {
  return (value || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseProjects(value) {
  const entries = splitCsv(value).map((entry) => {
    const separatorIndex = entry.indexOf("=");

    if (separatorIndex <= 0 || separatorIndex === entry.length - 1) {
      throw new Error(
        `CLAUDE_PROJECTS entry must look like alias=/absolute/path, received: ${entry}`,
      );
    }

    const alias = entry.slice(0, separatorIndex).trim();
    const cwd = path.resolve(entry.slice(separatorIndex + 1).trim());

    if (!alias) {
      throw new Error(`CLAUDE_PROJECTS entry is missing an alias: ${entry}`);
    }

    if (!fs.existsSync(cwd)) {
      throw new Error(`Project path does not exist for alias "${alias}": ${cwd}`);
    }

    return { alias, cwd };
  });

  if (entries.length === 0) {
    throw new Error("CLAUDE_PROJECTS must include at least one alias=/path entry.");
  }

  if (entries.length > 25) {
    throw new Error("Discord slash command choices are limited to 25 projects.");
  }

  return entries;
}

export function loadConfig() {
  const projects = parseProjects(readRequiredEnv("CLAUDE_PROJECTS"));
  const projectMap = new Map(projects.map((project) => [project.alias, project]));
  const defaultProject = readOptionalEnv("CLAUDE_DEFAULT_PROJECT") || projects[0].alias;
  const permissionMode = readOptionalEnv("CLAUDE_PERMISSION_MODE") || "acceptEdits";
  const logDir =
    readOptionalEnv("DISCORD_CLAUDE_LOG_DIR") ||
    path.resolve(process.cwd(), "var", "discord-claude-bot");

  if (!projectMap.has(defaultProject)) {
    throw new Error(
      `CLAUDE_DEFAULT_PROJECT "${defaultProject}" is not defined in CLAUDE_PROJECTS.`,
    );
  }

  if (!PERMISSION_MODES.has(permissionMode)) {
    throw new Error(
      `CLAUDE_PERMISSION_MODE must be one of: ${[...PERMISSION_MODES].join(", ")}`,
    );
  }

  fs.mkdirSync(path.join(logDir, "jobs"), { recursive: true });

  return {
    applicationId: readRequiredEnv("DISCORD_APPLICATION_ID"),
    botToken: readRequiredEnv("DISCORD_BOT_TOKEN"),
    guildId: readOptionalEnv("DISCORD_GUILD_ID"),
    allowedUserIds: new Set(splitCsv(readRequiredEnv("DISCORD_ALLOWED_USER_IDS"))),
    allowedChannelIds: new Set(splitCsv(readOptionalEnv("DISCORD_ALLOWED_CHANNEL_IDS"))),
    notificationChannelId: readOptionalEnv("DISCORD_NOTIFICATION_CHANNEL_ID"),
    claudeBin: readOptionalEnv("CLAUDE_BIN") || "claude",
    claudeModel: readOptionalEnv("CLAUDE_MODEL"),
    permissionMode,
    projects,
    projectMap,
    defaultProject,
    logDir,
  };
}

export function buildClaudeArgs(config, { prompt, sessionId }) {
  const args = [
    "-p",
    "--output-format",
    "json",
    "--permission-mode",
    config.permissionMode,
  ];

  if (config.claudeModel) {
    args.push("--model", config.claudeModel);
  }

  if (sessionId) {
    args.push("--resume", sessionId);
  }

  args.push(prompt);
  return args;
}

export function truncate(text, limit = 1600) {
  if (!text) {
    return "";
  }

  return text.length <= limit ? text : `${text.slice(0, limit - 1)}…`;
}

export function formatDuration(ms) {
  const seconds = Math.max(0, Math.round(ms / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainder}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${remainder}s`;
  }

  return `${remainder}s`;
}

export function formatUsd(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  return `$${value.toFixed(4)}`;
}

export function makeJobId() {
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const random = Math.random().toString(36).slice(2, 6);
  return `job-${stamp}-${random}`;
}

export function parseClaudeResult(stdout) {
  const raw = stdout.trim();

  if (!raw) {
    return { raw, parsed: null, parseError: "stdout was empty" };
  }

  try {
    return { raw, parsed: JSON.parse(raw), parseError: null };
  } catch (error) {
    return {
      raw,
      parsed: null,
      parseError: error instanceof Error ? error.message : String(error),
    };
  }
}

export function writeJobRecord(config, job) {
  const filePath = path.join(config.logDir, "jobs", `${job.id}.json`);
  const record = {
    id: job.id,
    status: job.status,
    project: job.projectAlias,
    cwd: job.cwd,
    requestedBy: job.userId,
    channelId: job.channelId,
    createdAt: job.createdAt,
    startedAt: job.startedAt,
    finishedAt: job.finishedAt,
    sessionId: job.sessionId ?? null,
    prompt: job.prompt,
    exitCode: job.exitCode ?? null,
    signal: job.signal ?? null,
    costUsd: job.costUsd ?? null,
    stdout: job.stdout ?? "",
    stderr: job.stderr ?? "",
    resultText: job.resultText ?? "",
    parseError: job.parseError ?? null,
  };

  fs.writeFileSync(filePath, `${JSON.stringify(record, null, 2)}\n`, "utf8");
  return filePath;
}

export function renderJobReport(job) {
  const lines = [
    `Job ID: ${job.id}`,
    `Status: ${job.status}`,
    `Project: ${job.projectAlias}`,
    `Working Directory: ${job.cwd}`,
    `Requested By: ${job.userId}`,
    `Channel ID: ${job.channelId}`,
    `Created At: ${job.createdAt}`,
    `Started At: ${job.startedAt || ""}`,
    `Finished At: ${job.finishedAt || ""}`,
    `Session ID: ${job.sessionId || ""}`,
    `Exit Code: ${job.exitCode ?? ""}`,
    `Signal: ${job.signal || ""}`,
    `Cost USD: ${job.costUsd ?? ""}`,
    "",
    "Prompt:",
    job.prompt,
    "",
    "Result:",
    job.resultText || "",
    "",
    "stderr:",
    job.stderr || "",
    "",
    "Raw stdout:",
    job.stdout || "",
  ];

  return `${lines.join("\n")}\n`;
}
