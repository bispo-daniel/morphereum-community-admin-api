import { getChannel } from './rabbit.js';
import { env } from '@/config/index.js';
import {
  flushArtsCache,
} from '@/cache/index.js';

export const startCacheInvalidationConsumer = async () => {
  const ch = await getChannel();
  const exchange = env.RABBITMQ_EXCHANGE;

  const { queue } = await ch.assertQueue('', {
    exclusive: true,
    autoDelete: true,
    durable: false,
  });

  const topics = ['arts.flush'];
  for (const key of topics) {
    await ch.bindQueue(queue, exchange, key);
  }

  await ch.consume(
    queue,
    (msg) => {
      if (!msg) return;

      const key = msg.fields.routingKey;

      let payload: any = {};
      try {
        payload = JSON.parse(msg.content.toString());
      } catch {}

      if (payload?.source === 'admin-api') {
        ch.ack(msg);
        return;
      }

      try {
        if (key === 'arts.flush') flushArtsCache();

        console.log(`[rabbitmq] --> consumed ${key} (flush-all done)`);
        ch.ack(msg);
      } catch (e) {
        console.error('[rabbitmq] --> error handling message', e);
        ch.nack(msg, false, false);
      }
    },
    { noAck: false }
  );

  console.log(`[rabbitmq] --> consumer online. Bound to ${topics.join(', ')}`);
};
