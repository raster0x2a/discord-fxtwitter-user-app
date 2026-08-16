# Discord FXTwitter User App

Discordの**ユーザーインストール型アプリ**です。

対象メッセージのコンテキストメニューから `FXTwitterに変換` を実行すると、本文中の
`https://x.com` / `https://www.x.com` を `https://fxtwitter.com` に置換し、**実行した本人だけに見える ephemeral 応答**として返します。  
これにより、XのWebサイトやアプリを開かなくても埋め込み動画をDiscord上で再生できます。

例:

```text
https://x.com/example/status/123?s=20
```

↓

```text
https://fxtwitter.com/example/status/123?s=20
```

## 1. Discord Developer Portal

1. Discord Developer PortalでApplicationを作成。
2. **Installation** で `User Install` を有効化。
3. User InstallのInstall Linkで `applications.commands` を利用できる設定にする。
4. General Informationから以下を取得する。
   - Application ID
   - Public Key
5. BotページからBot Tokenを取得する。

`.env.example` を `.env` にコピーして値を設定します。

```bash
cp .env.example .env
```

```dotenv
DISCORD_APPLICATION_ID=...
DISCORD_PUBLIC_KEY=...
DISCORD_BOT_TOKEN=...
PORT=3000
```

## 2. 起動

```bash
npm install
npm start
```

外部公開URLが `https://example.com` の場合、Developer Portalの
**Interactions Endpoint URL** を次に設定します。

```text
https://example.com/interactions
```

保存時にDiscordからPINGが送られ、署名検証とPONG応答が成功すれば登録できます。

## 3. メッセージコマンド登録

```bash
npm run register
```

グローバルなMessage Commandとして以下を登録します。

- `type: 3` — Message Command
- `integration_types: [1]` — USER_INSTALLのみ
- `contexts: [0, 1, 2]` — Server / Bot DM / DM・Group DM

## 4. アプリをユーザーにインストール

Developer PortalのInstallationページにあるInstall Linkを開き、
**Add to my apps** で自分のDiscordアカウントに追加します。

その後、任意のメッセージで右クリック（モバイルでは長押し）し、Appsから
`FXTwitterに変換` を実行します。

## セキュリティ上の実装ポイント

- Discordの `X-Signature-Ed25519` / `X-Signature-Timestamp` をPublic Keyで検証。
- 署名対象はJSONを再serializeせず、生のHTTP bodyを使用。
- 応答に `flags: 64` を指定してephemeral化。
- コピー元メッセージに `@everyone` 等が含まれてもmentionを発生させないよう `allowed_mentions.parse = []`。
- Gateway接続もMessage Content Intentも不要。

## 動作仕様

- 本文中に複数の `https://x.com/...` があればすべて変換します。
- `https://www.x.com/...` も変換します。
- path/query/fragmentはそのまま保持します。
- x.com URLがなければ本人だけにエラーを表示します。
- 元メッセージが2000文字を超える場合は、変換したURLだけを抽出して返します。
