import process from "node:process";

import { REST, Routes, SlashCommandBuilder } from "discord.js";

import { loadConfig } from "./discord-claude-shared.mjs";

const config = loadConfig();

const projectChoices = config.projects.map((project) => ({
  name: project.alias,
  value: project.alias,
}));

const commands = [
  new SlashCommandBuilder()
    .setName("claude-run")
    .setDescription("Claude Code CLI taskを実行します")
    .addStringOption((option) =>
      option
        .setName("prompt")
        .setDescription("Claude Codeへ渡す指示")
        .setRequired(true)
        .setMaxLength(4000),
    )
    .addStringOption((option) =>
      option
        .setName("project")
        .setDescription("実行先の作業ディレクトリ")
        .setRequired(false)
        .addChoices(...projectChoices),
    )
    .addStringOption((option) =>
      option
        .setName("session_id")
        .setDescription("前回のsession_idを引き継ぐときに指定")
        .setRequired(false)
        .setMaxLength(64),
    ),
  new SlashCommandBuilder()
    .setName("claude-status")
    .setDescription("現在の実行状況と待ち行列を表示します"),
  new SlashCommandBuilder()
    .setName("claude-cancel")
    .setDescription("実行中または待機中のジョブを停止します")
    .addStringOption((option) =>
      option
        .setName("job_id")
        .setDescription("省略時は現在の実行中ジョブを停止")
        .setRequired(false)
        .setMaxLength(64),
    ),
].map((command) => command.toJSON());

const rest = new REST({ version: "10" }).setToken(config.botToken);

const route = config.guildId
  ? Routes.applicationGuildCommands(config.applicationId, config.guildId)
  : Routes.applicationCommands(config.applicationId);

await rest.put(route, { body: commands });

const scope = config.guildId ? `guild ${config.guildId}` : "global";
process.stdout.write(`Registered ${commands.length} commands to ${scope}.\n`);
