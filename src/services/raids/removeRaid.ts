import { RaidModel } from '@/models/raids/index.js';

const remove = async ({ id }: { id: string }) => {
  const removed = await RaidModel.findByIdAndDelete(id).exec();
  return removed !== null;
};

export { remove };
