import { ArtsModel, ArtsSchema } from '@/models/arts/index.js';

const RECORDS_PER_PAGE = 10;

const get = async ({ page }: { page: number }) => {
  const skip = (page - 1) * RECORDS_PER_PAGE;

  const arts = await ArtsModel.find().skip(skip).limit(RECORDS_PER_PAGE).exec();

  if (!arts || arts.length === 0) return null;

  const parsedArts = ArtsSchema.safeParse(arts);

  if (!parsedArts.success) return null;

  const hasNext = await ArtsModel.findOne()
    .skip(skip + RECORDS_PER_PAGE)
    .limit(1)
    .exec();

  const next = !!hasNext;

  return { arts: parsedArts.data, page, next };
};

export { get };
