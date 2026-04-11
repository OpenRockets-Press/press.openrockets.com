import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from "node:crypto";

function deriveKey(secret: string): Buffer {
  return createHash("sha256").update(secret).digest();
}

export function encryptText(plaintext: string, secret: string): string {
  const key = deriveKey(secret);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptText(ciphertext: string, secret: string): string {
  const [ivB64, tagB64, dataB64] = ciphertext.split(".");
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("Invalid ciphertext format");
  }

  const key = deriveKey(secret);
  const iv = Buffer.from(ivB64, "base64url");
  const tag = Buffer.from(tagB64, "base64url");
  const data = Buffer.from(dataB64, "base64url");

  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString("utf8");
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function signToken(payload: Record<string, unknown>, secret: string): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function verifyToken(token: string, secret: string): Record<string, unknown> {
  const [body, signature] = token.split(".");
  if (!body || !signature) {
    throw new Error("Invalid token format");
  }

  const expectedSignature = createHmac("sha256", secret).update(body).digest("base64url");
  if (signature !== expectedSignature) {
    throw new Error("Invalid token signature");
  }

  return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Record<string, unknown>;
}
