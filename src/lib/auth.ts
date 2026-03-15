import crypto from "crypto";

export const SESSION_COOKIE = "aiworkout_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET environment variable is required in production.");
    }
    console.warn(
      "[auth] SESSION_SECRET is not set. Using an insecure default – set SESSION_SECRET before deploying to production."
    );
    return "change-me-in-production-secret";
  }
  return secret;
}

// ---------------------------------------------------------------------------
// Password hashing using Node.js built-in crypto (scrypt)
// ---------------------------------------------------------------------------

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, key] = hash.split(":");
  if (!salt || !key) return false;
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      else {
        const derived = derivedKey.toString("hex");
        try {
          resolve(
            crypto.timingSafeEqual(Buffer.from(derived, "hex"), Buffer.from(key, "hex"))
          );
        } catch {
          resolve(false);
        }
      }
    });
  });
}

// ---------------------------------------------------------------------------
// Session token: base64url(userId:timestamp).HMAC-SHA256
// ---------------------------------------------------------------------------

export function createSessionToken(userId: string): string {
  const payload = Buffer.from(`${userId}:${Date.now()}`).toString("base64url");
  const hmac = crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${payload}.${hmac}`;
}

export function verifySessionToken(token: string): string | null {
  try {
    const dotIndex = token.indexOf(".");
    if (dotIndex === -1) return null;

    const payload = token.slice(0, dotIndex);
    const signature = token.slice(dotIndex + 1);

    const expectedSig = crypto
      .createHmac("sha256", getSecret())
      .update(payload)
      .digest("hex");

    if (signature.length !== expectedSig.length) return null;

    const sigBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSig, "hex");

    if (sigBuffer.length !== expectedBuffer.length) return null;
    if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return null;

    const decoded = Buffer.from(payload, "base64url").toString();
    const colonIndex = decoded.indexOf(":");
    if (colonIndex === -1) return null;

    const userId = decoded.slice(0, colonIndex);
    return userId || null;
  } catch {
    return null;
  }
}
