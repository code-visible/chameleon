import { MD5 } from "bun";
import crypto from "node:crypto";

export function caculateHashID(info: string): string {
    const h = MD5.hash(info).toString();
    return Buffer.from(h).toString("hex");
}

export function getNameFromPath(path: string): string {
    for (let i = path.length - 1; i >= 0; i--) {
        if (path.charAt(i) === "/") return path.substring(i + 1);
    }
    return path;
}

export function getPrefixPathFromPath(path: string): string {
    for (let i = path.length - 1; i >= 0; i--) {
        if (path.charAt(i) === "/") return path.substring(0, i);
    }
    return "";
}

export function normalizePath(path: string): string {
    let path_ = path.trim();
    if (!path_.startsWith("/")) path_ = `/${path}`;
    for (let n = path_.length - 1; n >= 0; n--) {
        const ch = path_.charAt(n);
        if (ch !== "/" && ch !== ".") return path_.slice(0, n + 1);
    }
    return "/";
}

export function generateRandomString(length = 8): string {
    return `${crypto.randomBytes(length).toString("hex").slice(0, length)}`;
}
