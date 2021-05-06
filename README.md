# discord-world-time-bot

## Getting started

1. dotenv ディレクトリを作成し、configファイルを作成
  ```
  mkdir dotenv; touch dotenv/config
  ```

2. 環境変数にトークンを設定する
  [Discord Developer Portal](https://discord.com/developers/applications/)　にて Botを選択 > Settings > Bot > TOKEN > Click to Reveal Token
  configファイルの内容は以下の通り
  ```
  BOT_TOKEN={Botのトークン}
  ```

3. Bot を実行する
  ```bash
  node -r dotenv/config index.js
  ```
