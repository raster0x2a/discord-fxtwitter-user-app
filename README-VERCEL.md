# Vercel deployment

1. Import this repository into Vercel.
2. Set `DISCORD_PUBLIC_KEY` in Vercel Project Settings -> Environment Variables for Production.
3. Redeploy after adding/changing the environment variable.
4. Open `/api/interactions` in a browser. It should return:
   `{"ok":true,"endpoint":"discord-interactions"}`
5. In Discord Developer Portal, set Interactions Endpoint URL to:
   `https://YOUR-PROJECT.vercel.app/api/interactions`
6. Register the message command once using `npm run register` with
   `DISCORD_APPLICATION_ID` and `DISCORD_BOT_TOKEN` available locally.

Important: `DISCORD_PUBLIC_KEY` is the application's **Public Key** from
Discord Developer Portal -> General Information. It is not the Client Secret
or Bot Token.
