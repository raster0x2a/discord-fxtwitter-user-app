import { verifyKey } from 'discord-interactions';

const COMMAND_NAME = 'FXTwitterに変換';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function text(message, status = 200) {
  return new Response(message, {
    status,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}

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

export function convertXLinks(value) {
  if (typeof value !== 'string' || value.length === 0) return value ?? '';
  return value.replace(
    /https:\/\/(?:www\.)?x\.com(?=[:/?#\s]|$)/gi,
    'https://fxtwitter.com',
  );
}

function hasConvertibleXLink(value) {
  return /https:\/\/(?:www\.)?x\.com(?=[:/?#\s]|$)/i.test(value);
}

function fitDiscordMessage(original, converted) {
  if (converted.length <= 2000) return converted;
  const urls = original.match(/https:\/\/(?:www\.)?x\.com[^\s<>]*/gi) ?? [];
  const compact = [...new Set(urls.map(convertXLinks))].join('\n');
  if (compact.length <= 2000 && compact.length > 0) return compact;
  return compact.slice(0, 1997) + '...';
}

export async function GET() {
  return json({ ok: true, endpoint: 'discord-interactions' });
}

export async function POST(request) {
  const publicKey = process.env.DISCORD_PUBLIC_KEY?.trim();
  if (!publicKey) return text('DISCORD_PUBLIC_KEY is not configured', 500);

  const signature = request.headers.get('x-signature-ed25519');
  const timestamp = request.headers.get('x-signature-timestamp');
  const rawBody = await request.text();

  if (!signature || !timestamp) return text('invalid request', 401);

  let valid = false;
  try {
    valid = await verifyKey(rawBody, signature, timestamp, publicKey);
  } catch (error) {
    console.error('Signature verification failed:', error);
    return text('invalid request signature', 401);
  }

  if (!valid) return text('invalid request signature', 401);

  let interaction;
  try {
    interaction = JSON.parse(rawBody);
  } catch {
    return text('invalid json', 400);
  }

  // Discord's endpoint validation PING.
  if (interaction.type === 1) return json({ type: 1 });

  if (
    interaction.type !== 2 ||
    interaction.data?.type !== 3 ||
    interaction.data?.name !== COMMAND_NAME
  ) {
    return json(ephemeral('未対応のコマンドです。'));
  }

  const targetId = interaction.data?.target_id;
  const targetMessage = interaction.data?.resolved?.messages?.[targetId];
  const content = targetMessage?.content ?? '';

  if (!hasConvertibleXLink(content)) {
    return json(ephemeral('このメッセージには `https://x.com` のURLがありません。'));
  }

  const converted = fitDiscordMessage(content, convertXLinks(content));
  return json(ephemeral(converted));
}
