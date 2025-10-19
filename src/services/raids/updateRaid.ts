import { type Raid, RaidModel } from '@/models/raids/index.js';

const update = async (id: string, updateData: Raid) => {
  const parsedDate = new Date(updateData.date);
  parsedDate.setUTCHours(0, 0, 0, 0);

  updateData.date = parsedDate;

  const updatedRaid = await RaidModel.findByIdAndUpdate(id, updateData).exec();

  return updatedRaid;
};

export { update };
