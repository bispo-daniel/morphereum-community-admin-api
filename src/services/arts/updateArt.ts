import { type Art, ArtsModel } from '@/models/arts/index.js';

const update = async (
  id: string,
  data: Pick<Art, 'approved'>
): Promise<boolean> => {
  const result = await ArtsModel.findByIdAndUpdate(id, data).exec();
  return result !== null;
};

export { update };
