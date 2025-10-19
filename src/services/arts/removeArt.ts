import { ArtsModel } from '@/models/arts/index.js';
import { cloudinaryConnection } from '@/utils/connectToCloudinary.js';

const remove = async ({ id }: { id: string }) => {
  const art = await ArtsModel.findById(id).exec();

  if (!art) return false;

  const artName = art.name;

  await cloudinaryConnection.uploader.destroy(artName);

  const removed = await ArtsModel.findByIdAndDelete(id).exec();

  return removed !== null;
};

export { remove };
