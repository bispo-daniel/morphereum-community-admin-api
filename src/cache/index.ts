import NodeCache from 'node-cache';
import { getEndOfDayTTL } from '@/utils/getEndOfDayTTL.js';

const ttl = getEndOfDayTTL();

export const artsCache = new NodeCache({ stdTTL: ttl });
export const linksCache = new NodeCache({ stdTTL: ttl });
export const raidCache  = new NodeCache({ stdTTL: ttl });

export const flushArtsCache = () => artsCache.flushAll();
export const flushLinksCache = () => linksCache.flushAll();
export const flushRaidCache  = () => raidCache.flushAll();
