import { LinksModel } from '@/models/links/index.js';

const remove = async ({ id }: { id: string }) => {
  const removed = await LinksModel.findByIdAndDelete(id).exec();
  return removed !== null;
};

export { remove };
