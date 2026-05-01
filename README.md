# Miro Mind Map Importer

This workspace contains a small private Miro app that imports a structured CSV and creates a native Miro mind map on the current board.

The original export at `/Users/so01/Downloads/Mind Maps.csv` is a flat one-column list, so the included sample data is a reviewed and reorganized draft rather than a round-trip export.

## Files

- `miro-app/`: static Miro app UI.
- `data/proposed-mindmap.csv`: reviewed starter outline based on your current mind map.
- `docs/discord-claude-bridge.md`: Discord to Claude Code CLI bridge setup for `MTZ-155`.

## Local setup

1. Create a private app in Miro.
2. Set the app URL to `http://localhost:3000/miro-app/`.
3. Add the scopes `boards:read` and `boards:write`.
4. Install the app to your Miro team.
5. Start the local server:

   ```bash
   npm run serve
   ```

6. Open a Miro board, launch the app, and click `Load reviewed sample`, then `Create in Miro`.

## CSV format

The importer expects a hierarchical CSV with one header row and one path per line.

Example:

```csv
level_1,level_2,level_3,level_4,level_5
今後10年を幸せに過ごすには,ありたい状態,お金,必要ライン,最低年収1100万円
今後10年を幸せに過ごすには,ありたい状態,健康,身体,週2回ジム
```

- Each row is one path from root to leaf.
- Empty trailing cells are allowed.
- The first column should stay the same across all rows, because Miro mind maps have one root node.

## Notes

- The app uses the Miro Web SDK `experimental.createMindmapNode` API.
- The SDK works only inside an installed Miro app; opening the page in a normal browser is only useful for checking the static UI.
- Miro documents this CSV-to-mind-map flow in its official tutorial:
  - https://developers.miro.com/docs/create-mind-map-from-csv
  - https://developers.miro.com/docs/websdk-reference-mindmap-node
  - https://developers.miro.com/docs/deploy-a-miro-app
