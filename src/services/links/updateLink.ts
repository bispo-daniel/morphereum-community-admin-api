import { type Link, LinksModel } from '@/models/links/index.js';

const update = async (id: string, data: Omit<Link, '_id'>) => {
  const result = await LinksModel.findByIdAndUpdate(id, data).exec();
  return result !== null;
};

export { update };
