# Vercel deployment

## Environment variables

Set these in Vercel Project Settings > Environment Variables:

- `DISCORD_PUBLIC_KEY`
- `DISCORD_APPLICATION_ID` (only needed when registering the command locally/CI)
- `DISCORD_BOT_TOKEN` (only needed when registering the command locally/CI; not required by the runtime function)

## Deploy

Import this repository into Vercel. No framework preset is required.

After deployment, set the Discord Developer Portal Interaction Endpoint URL to:

`https://YOUR-PROJECT.vercel.app/api/interactions`

Then register the message command once from a trusted local environment:

```bash
npm install
DISCORD_APPLICATION_ID=... DISCORD_BOT_TOKEN=... npm run register
```

Do not commit the bot token.
