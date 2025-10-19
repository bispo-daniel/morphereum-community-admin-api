import { RaidModel, RaidsSchema } from '@/models/raids/index.js';

const get = async () => {
  const raids = await RaidModel.find().exec();

  if (!raids || raids.length === 0) return null;

  const parsedRaids = RaidsSchema.safeParse(raids);

  if (!parsedRaids.success) return null;

  return parsedRaids.data;
};

export { get };
