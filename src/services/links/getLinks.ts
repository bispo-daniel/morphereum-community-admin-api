import { LinksModel, LinksSchema } from '@/models/links/index.js';

const get = async () => {
  const links = await LinksModel.find().exec();

  if (!links || links.length === 0) return null;

  const parsedLinks = LinksSchema.safeParse(links);

  if (!parsedLinks.success) return null;

  return parsedLinks.data;
};

export { get };
