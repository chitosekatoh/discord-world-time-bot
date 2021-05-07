# discord-world-time-bot

## Getting started

1. 依存パッケージのインストール
    ``` 
    npm i
    ```

2. 環境変数の用意
  - dotenv ディレクトリを作成し、configファイルを作成
      ```
      mkdir dotenv; touch dotenv/config
      ```
  
  - Botトークンを取得する
    [Discord Developer Portal](https://discord.com/developers/applications/)　にて Botを選択 > Settings > Bot > TOKEN > Click to Reveal Token でトークンをコピー

  - 環境変数にトークンを設定する

    configファイルの内容は以下の通り
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
