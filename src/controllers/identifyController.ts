import { Request, Response } from 'express';
import { handleIdentify } from '../services/contactService';

export const identifyController = async (req: Request, res: Response) => {
  try {
    const { email, phoneNumber } = req.body;
    const result = await handleIdentify({ email, phoneNumber });
    res.status(200).json({ contact: result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
 