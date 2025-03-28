import { MD5 } from "bun";

export const caculateHashID = (info: string): string => {
  const h = MD5.hash(info).toString();
  return Buffer.from(h).toString('hex');
};

export const getNameFromPath = (path: string): string => {
  for (let i = path.length - 1; i >= 0; i--) {
    if (path.charAt(i) === '/') return path.substring(i + 1);
  }
  return path;
};

export const getPrefixPathFromPath = (path: string): string => {
  for (let i = path.length - 1; i >= 0; i--) {
    if (path.charAt(i) === '/') return path.substring(0, i);
  }
  return "";
};

export const normalizePath = (path: string): string => {
  path = path.trim();
  if (!path.startsWith("/")) path = "/" + path;
  for (let n = path.length - 1; n >= 0; n--) {
    const ch = path.charAt(n);
    if (ch !== '/' && ch !== '.') return path.substring(0, n + 1);
  }
  return "/";
}