import { type Response } from 'express';

export const sendJson = (res: Response, json: Record<any, any>) => {
  res.status(200).json(json);
};

export const internalServerError = (res: Response) => {
  res.status(500).end();
};

export const notFound = (res: Response) => {
  res.status(404).end();
};

export const endResponseWithCode = (res: Response, status: number) => {
  res.status(status).end();
};
