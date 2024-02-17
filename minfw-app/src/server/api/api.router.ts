import express from 'express';

const router = express.Router();

router.get('/hello', (_req, res) => {
  res.status(200).json({hello: 'world!!!'});
});

router.use('/*', (_req, res) => {
  res.status(404).json({messages: 'Not found', status: 404});
});

export const apiRouter = router;
