import { verifyKey } from 'discord-interactions';

const COMMAND_NAME = 'FXTwitterに変換';

function ephemeral(content) {
  return {
    type: 4,
    data: {
      content,
      flags: 64,
      allowed_mentions: { parse: [] },
    },
  };
}

export function convertXLinks(text) {
  if (typeof text !== 'string' || text.length === 0) return text ?? '';
  return text.replace(
    /https:\/\/(?:www\.)?x\.com(?=[:/?#\s]|$)/gi,
    'https://fxtwitter.com',
  );
}

function hasConvertibleXLink(text) {
  return /https:\/\/(?:www\.)?x\.com(?=[:/?#\s]|$)/i.test(text);
}

function fitDiscordMessage(original, converted) {
  if (converted.length <= 2000) return converted;
  const urls = original.match(/https:\/\/(?:www\.)?x\.com[^\s<>]*/gi) ?? [];
  const compact = [...new Set(urls.map(convertXLinks))].join('\n');
  if (compact.length <= 2000 && compact.length > 0) return compact;
  return compact.slice(0, 1997) + '...';
}

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  const publicKey = process.env.DISCORD_PUBLIC_KEY;
  if (!publicKey) return res.status(500).send('DISCORD_PUBLIC_KEY is not configured');

  const signature = req.headers['x-signature-ed25519'];
  const timestamp = req.headers['x-signature-timestamp'];
  const rawBody = await readRawBody(req);

  if (!signature || !timestamp) return res.status(401).send('invalid request');

  const valid = await verifyKey(rawBody, signature, timestamp, publicKey);
  if (!valid) return res.status(401).send('invalid request signature');

  let interaction;
  try {
    interaction = JSON.parse(rawBody.toString('utf8'));
  } catch {
    return res.status(400).send('invalid json');
  }

  if (interaction.type === 1) return res.status(200).json({ type: 1 });

  if (
    interaction.type !== 2 ||
    interaction.data?.type !== 3 ||
    interaction.data?.name !== COMMAND_NAME
  ) {
    return res.status(200).json(ephemeral('未対応のコマンドです。'));
  }

  const targetId = interaction.data?.target_id;
  const targetMessage = interaction.data?.resolved?.messages?.[targetId];
  const content = targetMessage?.content ?? '';

  if (!hasConvertibleXLink(content)) {
    return res.status(200).json(
      ephemeral('このメッセージには `https://x.com` のURLがありません。'),
    );
  }

  const converted = fitDiscordMessage(content, convertXLinks(content));
  return res.status(200).json(ephemeral(converted));
}
