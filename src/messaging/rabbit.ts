import { connect } from 'amqplib';
import type { Channel, ChannelModel } from 'amqplib';
import { env } from '@/config/index.js';

let conn: ChannelModel | undefined;
let ch: Channel | undefined;

export const getChannel = async (): Promise<Channel> => {
  if (ch) return ch;

  const connection: ChannelModel = await connect(env.RABBITMQ_URL);
  const channel: Channel = await connection.createChannel();

  const exchange = env.RABBITMQ_EXCHANGE;
  await channel.assertExchange(exchange, 'topic', { durable: false });

  conn = connection;
  ch = channel;

  const handleShutdown = async () => {
    try {
      await ch?.close();
    } catch {}
    try {
      await conn?.close();
    } catch {}
    process.exit(0);
  };

  process.once('SIGINT', handleShutdown);
  process.once('SIGTERM', handleShutdown);

  return channel;
};
