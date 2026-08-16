import 'dotenv/config';

const applicationId = process.env.DISCORD_APPLICATION_ID;
const botToken = process.env.DISCORD_BOT_TOKEN;

if (!applicationId || !botToken) {
  throw new Error('DISCORD_APPLICATION_ID and DISCORD_BOT_TOKEN are required');
}

const command = {
  name: 'FXTwitterに変換',
  type: 3, // MESSAGE
  integration_types: [1], // USER_INSTALL
  contexts: [0, 1, 2], // GUILD, BOT_DM, PRIVATE_CHANNEL
};

const response = await fetch(
  `https://discord.com/api/v10/applications/${applicationId}/commands`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bot ${botToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  },
);

const body = await response.text();
if (!response.ok) {
  console.error(body);
  process.exit(1);
}

console.log('Registered global message command:');
console.log(body);
