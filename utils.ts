import { MD5 } from "bun";

export const caculateHashID = (info: string): string => {
  const h = MD5.hash(info).toString();
  return Buffer.from(h).toString('hex');
};