# discord-world-time-bot

## setup

dotenv ディレクトリを作成し、configファイルを作成

```
mkdir dotenv; touch dotenv/config
```

環境変数にトークンを設定する

https://discord.com/developers/applications/　にて　Botを選択 > Settings > Bot > TOKEN > Click to Reveal Token

configファイルの内容は以下の通り

```
BOT_TOKEN={Botのトークン}
```

Bot を実行する

```
node -r dotenv/config index.js
```