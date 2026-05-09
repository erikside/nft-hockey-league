import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import "dotenv/config";

const sourceDir = path.resolve(process.argv[2] ?? "public/metadata");
const prefix = normalizePrefix(process.argv[3] ?? process.env.FOUR_EVERLAND_BUCKET_PREFIX ?? "metadata");
const bucket = requireEnv("FOUR_EVERLAND_BUCKET_NAME");
const endpoint = process.env.FOUR_EVERLAND_BUCKET_ENDPOINT ?? "https://endpoint.4everland.co";
const region = process.env.FOUR_EVERLAND_BUCKET_REGION ?? "us-east-1";
const publicUrl = process.env.FOUR_EVERLAND_BUCKET_PUBLIC_URL;
const cacheControl = process.env.FOUR_EVERLAND_BUCKET_CACHE_CONTROL;

const client = new S3Client({
  endpoint,
  forcePathStyle: true,
  region,
  credentials: {
    accessKeyId: requireEnv("FOUR_EVERLAND_BUCKET_ACCESS_KEY_ID"),
    secretAccessKey: requireEnv("FOUR_EVERLAND_BUCKET_SECRET_ACCESS_KEY"),
  },
});

const files = await listFiles(sourceDir);
if (files.length === 0) {
  throw new Error(`No files found in ${sourceDir}`);
}

for (const filePath of files) {
  const relativePath = path.relative(sourceDir, filePath).replace(/\\/g, "/");
  const key = prefix ? `${prefix}/${relativePath}` : relativePath;

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: await readFile(filePath),
      ContentType: contentTypeFor(filePath),
      CacheControl: cacheControl ?? cacheControlFor(filePath),
    }),
  );

  console.log(`Uploaded ${key}`);
}

console.log(`Uploaded ${files.length} files to 4EVERLAND bucket "${bucket}".`);
if (publicUrl) {
  console.log(`Public base URL: ${joinUrl(publicUrl, prefix)}`);
}

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const output = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      output.push(...(await listFiles(fullPath)));
    } else if (entry.isFile() && (await stat(fullPath)).size >= 0) {
      output.push(fullPath);
    }
  }

  return output;
}

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
  };

  return types[ext] ?? "application/octet-stream";
}

function cacheControlFor(filePath) {
  return path.extname(filePath).toLowerCase() === ".json"
    ? "public, max-age=300"
    : "public, max-age=31536000, immutable";
}

function joinUrl(base, child) {
  const normalizedBase = `${String(base).replace(/\/+$/, "")}/`;
  const normalizedChild = child ? `${child.replace(/^\/+|\/+$/g, "")}/` : "";
  return new URL(normalizedChild, normalizedBase).toString();
}

function normalizePrefix(value) {
  return String(value).replace(/^\/+|\/+$/g, "");
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
