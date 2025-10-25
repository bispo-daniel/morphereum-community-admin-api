import { type Response } from 'express';

export const ok = (res: Response) => {
  res.status(200).end();
};

export const sendJson = (res: Response, json: Record<any, any>) => {
  res.status(200).json(json);
};

export const internalServerError = (res: Response) => {
  res.status(500).end();
};

export const badRequest = (res: Response) => {
  res.status(400).end();
};

export const unauthorized = (res: Response) => {
  res.status(401).end();
};

export const notFound = (res: Response) => {
  res.status(404).end();
};
