import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { env } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootPath = path.resolve(__dirname, '../../');

const getCert = () => {
  if (env.NODE_ENV === 'development') {
    try {
      const cert = {
        key: readFileSync(path.join(rootPath, 'localhost-key.pem')),
        cert: readFileSync(path.join(rootPath, 'localhost.pem')),
      };

      return cert;
    } catch (error) {
      throw new Error(
        'Error reading certificate files (localhost.pem & localhost-key.pem) - error:' +
          error
      );
    }
  }
};

export const cert = getCert();
