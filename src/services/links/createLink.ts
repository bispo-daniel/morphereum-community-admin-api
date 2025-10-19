import { type Link, LinksModel } from '@/models/links/index.js';

const create = async ({ icon, label, type, url }: Omit<Link, '_id'>) => {
  const newLink = new LinksModel({ icon, label, type, url });
  return await newLink.save();
};

export { create };
