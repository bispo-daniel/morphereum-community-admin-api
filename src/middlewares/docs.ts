import path from 'path';
import express from 'express';
import swaggerUi from 'swagger-ui-express';

const docs = () => {
  const router = express.Router();

  router.use('/openapi', express.static(path.resolve(process.cwd(), 'docs')));
  router.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(null, {
      swaggerOptions: { url: '/openapi/openapi.json' },
      customSiteTitle: 'Morphereum Community Admin API — Docs',
    })
  );

  return router;
};

export default docs;
