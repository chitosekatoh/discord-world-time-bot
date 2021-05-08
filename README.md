# discord-world-time-bot

## Getting started

1. 依存パッケージのインストール
    ``` 
    npm i
    ```

2. 環境変数の用意
  - Botトークンを取得する
    [Discord Developer Portal](https://discord.com/developers/applications/)　にて Botを選択 > Settings > Bot > TOKEN > Click to Reveal Token でトークンをコピー

  - .envにエントリを定義する
      ```
      BOT_TOKEN={Botのトークン}
      ```

3. Bot を実行する
    ```
    // 開発時
    npm run dev

    // 本番
    npm run start
    ```
