import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from "crypto";

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

type PendingSignup = {
  name: string;
  workspaceName: string;
  email: string;
  passwordHash: string;
  otpHash: string;
  expiresAt: number;
  sentAt: number;
  attempts: number;
};

const getKey = () => {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is not configured");
  }

  return createHash("sha256").update(secret).digest();
};

const encrypt = (payload: string) => {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(payload, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    iv.toString("base64url"),
    tag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
};

const decrypt = (token: string) => {
  const [ivValue, tagValue, ciphertextValue] = token.split(".");

  if (!ivValue || !tagValue || !ciphertextValue) {
    throw new Error("Invalid verification token");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    getKey(),
    Buffer.from(ivValue, "base64url"),
  );

  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");
};

const hashOtp = (otp: string) =>
  createHmac("sha256", getKey()).update(otp).digest("hex");

const hashesMatch = (left: string, right: string) => {
  const a = Buffer.from(left, "hex");
  const b = Buffer.from(right, "hex");

  return a.length === b.length && timingSafeEqual(a, b);
};

export function createPendingSignup(input: {
  name: string;
  workspaceName: string;
  email: string;
  passwordHash: string;
}) {
  const otp = randomInt(0, 10000).toString().padStart(4, "0");
  const now = Date.now();

  const pending: PendingSignup = {
    ...input,
    otpHash: hashOtp(otp),
    expiresAt: now + OTP_TTL_MS,
    sentAt: now,
    attempts: 0,
  };

  return {
    otp,
    token: encrypt(JSON.stringify(pending)),
  };
}

export function readPendingSignup(token: string): PendingSignup {
  const pending = JSON.parse(decrypt(token)) as PendingSignup;

  if (
    !pending.name ||
    !pending.workspaceName ||
    !pending.email ||
    !pending.passwordHash ||
    !pending.otpHash ||
    !pending.expiresAt
  ) {
    throw new Error("Invalid verification token");
  }

  if (Date.now() > pending.expiresAt) {
    throw new Error("OTP_EXPIRED");
  }

  return pending;
}

export function canResend(pending: PendingSignup) {
  return Date.now() - pending.sentAt >= RESEND_COOLDOWN_MS;
}

export function verifyPendingOtp(token: string, otp: string) {
  const pending = readPendingSignup(token);

  if (pending.attempts >= MAX_ATTEMPTS) {
    throw new Error("OTP_ATTEMPTS_EXCEEDED");
  }

  if (!/^\d{4}$/.test(otp) || !hashesMatch(pending.otpHash, hashOtp(otp))) {
    pending.attempts += 1;

    if (pending.attempts >= MAX_ATTEMPTS) {
      throw new Error("OTP_ATTEMPTS_EXCEEDED");
    }

    return {
      verified: false,
      attemptsRemaining: MAX_ATTEMPTS - pending.attempts,
      token: encrypt(JSON.stringify(pending)),
    };
  }

  return {
    verified: true,
    token,
  };
}

export function getResendWaitSeconds(pending: PendingSignup) {
  return Math.max(
    1,
    Math.ceil(
      (RESEND_COOLDOWN_MS - (Date.now() - pending.sentAt)) / 1000,
    ),
  );
}

export function getOtpExpirySeconds(pending: PendingSignup) {
  return Math.max(0, Math.ceil((pending.expiresAt - Date.now()) / 1000));
}

export function signVerifiedToken(pendingToken: string) {
  return createHmac("sha256", getKey())
    .update(pendingToken)
    .digest("base64url");
}

export function isVerifiedToken(
  pendingToken: string,
  verifiedToken: string,
) {
  const expected = signVerifiedToken(pendingToken);
  return hashesMatch(
    Buffer.from(expected).toString("hex"),
    Buffer.from(verifiedToken).toString("hex"),
  );
}

export function getOtpForDevelopmentOnly() {
  return null;
}
