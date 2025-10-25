import { getChannel } from './rabbit.js';
import { env } from '@/config/index.js';

type FlushTopic = 'arts' | 'links' | 'raids';

export const publishFlush = async (topic: FlushTopic) => {
  const ch = await getChannel();
  const exchange = env.RABBITMQ_EXCHANGE;
  const routingKey = `${topic}.flush`;

  const payload = Buffer.from(
    JSON.stringify({ type: routingKey, ts: Date.now(), source: 'admin-api' })
  );

  ch.publish(exchange, routingKey, payload, { persistent: false });
  console.log(`[rabbitmq] --> published ${routingKey}`);
};
