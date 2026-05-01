# Discord -> Claude Code CLI bridge

`MTZ-155` 用に、Discord から `Claude Code CLI` を叩く常駐ボットを追加しました。

## できること

- iPhone の Discord アプリから slash command で Claude Code を実行
- 1本ずつ順番に実行するキュー制御
- 完了時に Discord へ結果通知と添付ファイルを返送
- `session_id` を渡して前回セッションを継続
- 利用ユーザー、チャンネル、作業ディレクトリを allowlist で制限

## 追加したコマンド

- `/claude-run`
  - `prompt`: Claude Code へ渡す指示
  - `project`: 実行先エイリアス
  - `session_id`: 前回の会話を継続したいときだけ指定
- `/claude-status`
- `/claude-cancel`

## セットアップ

1. Discord Developer Portal でアプリと bot を作る
2. bot を使いたいサーバーへ招待する
3. このリポジトリ直下で `.env` を作る

```bash
cp .env.example .env
```

4. `.env` を埋める

```dotenv
DISCORD_BOT_TOKEN=...
DISCORD_APPLICATION_ID=...
DISCORD_GUILD_ID=...
DISCORD_ALLOWED_USER_IDS=123456789012345678
DISCORD_ALLOWED_CHANNEL_IDS=234567890123456789
DISCORD_NOTIFICATION_CHANNEL_ID=

CLAUDE_BIN=/opt/homebrew/bin/claude
CLAUDE_PERMISSION_MODE=acceptEdits
CLAUDE_PROJECTS=codex=/Users/so01/codex
CLAUDE_DEFAULT_PROJECT=codex
DISCORD_CLAUDE_LOG_DIR=/Users/so01/codex/var/discord-claude-bot
```

5. 依存を入れる

```bash
npm install
```

6. slash command を登録する

```bash
npm run discord-bot:register
```

7. ローカル起動で確認する

```bash
npm run discord-bot
```

## 常駐

`launchd/com.mtzd.discord-claude-bot.plist` を用意してあります。必要なら以下で読み込みます。

```bash
mkdir -p /Users/so01/codex/var/discord-claude-bot/jobs
cp launchd/com.mtzd.discord-claude-bot.plist ~/Library/LaunchAgents/
launchctl unload ~/Library/LaunchAgents/com.mtzd.discord-claude-bot.plist 2>/dev/null || true
launchctl load ~/Library/LaunchAgents/com.mtzd.discord-claude-bot.plist
launchctl start com.mtzd.discord-claude-bot
```

ログは `var/discord-claude-bot/` に出ます。

## 運用メモ

- `Claude Code` はこの Mac 上で動くので、Mac がスリープすると bot も止まります
- 完了通知は実行したチャンネルに返し、`DISCORD_NOTIFICATION_CHANNEL_ID` があればそこにもミラーします
- 各ジョブの詳細ログは `var/discord-claude-bot/jobs/` に JSON で保存されます
- bot の権限は最小にして、専用チャンネルだけ許可するのが安全です
- 別マシンに移して完全ヘッドレスで動かすなら、Claude Code 側の認証方式もそのホスト向けに整えてください

## 動作イメージ

```text
/claude-run project:codex prompt:"READMEのTODOを片付けて、終わったら要点だけ報告して"
```

完了すると、結果プレビューと `session_id`、全文入りの添付ファイルが Discord に返ってきます。
