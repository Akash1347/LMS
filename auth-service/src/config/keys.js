import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const privateKeyPath = fs.readFileSync(path.join(__dirname, "../keys/private.pem"), "utf8");
const publicKeyPath = fs.readFileSync(path.join(__dirname, "../keys/public.pem"), "utf8");

export const privateKey = privateKeyPath;
export const publicKey = publicKeyPath;
