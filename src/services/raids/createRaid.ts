import { type Raid, RaidModel } from '@/models/raids/index.js';

const create = async ({
  content,
  date,
  platform,
  shareMessage,
  url,
}: Omit<Raid, '_id'>) => {
  const parsedDate = new Date(date);
  parsedDate.setUTCHours(0, 0, 0, 0);

  const newRaid = new RaidModel({
    content,
    date: parsedDate,
    platform,
    shareMessage,
    url,
  });
  return await newRaid.save();
};

export { create };
