import mongoose from "mongoose";

// Register all schemas before populate() calls (Tag, User, Category, etc.)
import "@/models";

/** Prefer standard URI (no DNS SRV) when SRV lookups time out on your network */
function getMongoUri(): string | undefined {
  return process.env.MONGODB_URI_STANDARD || process.env.MONGODB_URI;
}

const CONNECT_TIMEOUT_MS = 8_000;
const FAILURE_COOLDOWN_MS = 60_000;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  lastFailureAt: number;
  lastLogAt: number;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
  lastFailureAt: 0,
  lastLogAt: 0,
};

global.mongooseCache = cached;

const mongooseOptions: mongoose.ConnectOptions = {
  bufferCommands: false,
  serverSelectionTimeoutMS: CONNECT_TIMEOUT_MS,
  connectTimeoutMS: CONNECT_TIMEOUT_MS,
  /** IPv4 only — avoids some Windows DNS/SRV issues */
  family: 4,
};

function isInCooldown(): boolean {
  return (
    cached.lastFailureAt > 0 &&
    Date.now() - cached.lastFailureAt < FAILURE_COOLDOWN_MS
  );
}

function logConnectionFailure(err: unknown): void {
  const now = Date.now();
  if (now - cached.lastLogAt < FAILURE_COOLDOWN_MS) return;
  cached.lastLogAt = now;

  console.error("MongoDB connection failed:", err);

  const uri = getMongoUri() || "";
  const isSrv = uri.startsWith("mongodb+srv://");
  const code =
    err && typeof err === "object" && "code" in err
      ? String((err as { code?: string }).code)
      : "";

  if (isSrv && (code === "ETIMEOUT" || code === "ENOTFOUND")) {
    console.error(
      "[MongoDB] SRV DNS lookup failed. In Atlas → Connect → Drivers, copy the " +
        '"Standard connection string" and set MONGODB_URI_STANDARD in .env.local ' +
        "(or switch PC DNS to 8.8.8.8 / 1.1.1.1)."
    );
  }
}

function markFailure(): void {
  cached.lastFailureAt = Date.now();
  cached.conn = null;
  cached.promise = null;
}

export async function connectDB(): Promise<typeof mongoose> {
  const uri = getMongoUri();
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  if (isInCooldown()) {
    throw new Error("MongoDB is temporarily unavailable (recent connection failure)");
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, mongooseOptions).then((conn) => {
      cached.lastFailureAt = 0;
      return conn;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    markFailure();
    logConnectionFailure(err);
    throw err;
  }
}

/** Connect without throwing — skips retries during cooldown */
export async function tryConnectDB(): Promise<boolean> {
  if (!getMongoUri()) return false;
  if (isInCooldown()) return false;

  try {
    await connectDB();
    return true;
  } catch {
    return false;
  }
}

export function isDbConfigured(): boolean {
  return Boolean(getMongoUri());
}

export function isUsingSrvUri(): boolean {
  const uri = getMongoUri() || "";
  return uri.startsWith("mongodb+srv://") && !process.env.MONGODB_URI_STANDARD;
}
