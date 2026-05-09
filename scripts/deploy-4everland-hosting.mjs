import { createWriteStream } from "node:fs";
import { mkdir, readFile, rm, stat } from "node:fs/promises";
import path from "node:path";
import { ZipArchive } from "archiver";
import "dotenv/config";

const apiBase = "https://hosting.api.4everland.org";
const distDir = path.resolve(process.argv[2] ?? "dist");
const workDir = path.join(process.cwd(), ".4everland");
const zipPath = path.join(workDir, "dist.zip");
const token = requireEnv("FOUR_EVERLAND_HOSTING_TOKEN");
const projectName = process.env.FOUR_EVERLAND_PROJECT_NAME ?? "hockey-nft-league";
const platform = process.env.FOUR_EVERLAND_PLATFORM ?? "IPFS";

await assertDirectory(distDir);
await mkdir(workDir, { recursive: true });
await rm(zipPath, { force: true });
await zipDirectory(distDir, zipPath);

const projectId = process.env.FOUR_EVERLAND_PROJECT_ID || (await createProject());
const deployment = await deployProject(projectId, zipPath);

console.log("4EVERLAND deployment submitted.");
console.log(`Project ID: ${projectId}`);
if (deployment.fileHash) {
  console.log(`IPFS hash: ${deployment.fileHash}`);
}
if (deployment.taskId) {
  console.log(`Task ID: ${deployment.taskId}`);
  await printTaskStatus(deployment.taskId);
}
if (deployment.domainList?.length) {
  console.log("Domains:");
  for (const domain of deployment.domainList) {
    console.log(`- https://${domain}`);
  }
}

async function createProject() {
  const body = new FormData();
  body.set("deployType", "CLI");
  body.set("name", projectName);
  body.set("platform", platform);

  const response = await requestJson("/project", { method: "POST", body });
  const projectId = response.content?.projectId;
  if (!projectId) {
    throw new Error(`4EVERLAND did not return a projectId: ${JSON.stringify(response)}`);
  }

  console.log(`Created 4EVERLAND project "${projectName}" (${projectId}).`);
  console.log("Add FOUR_EVERLAND_PROJECT_ID to .env to reuse this project next time.");
  return projectId;
}

async function deployProject(projectId, filePath) {
  const body = new FormData();
  const file = new Blob([await readFile(filePath)], { type: "application/zip" });
  body.set("file", file, "dist.zip");
  body.set("projectId", projectId);

  const response = await requestJson("/deploy", { method: "POST", body });
  return response.content ?? {};
}

async function printTaskStatus(taskId) {
  try {
    const response = await requestJson(`/tasks/${taskId}`, { method: "GET" });
    if (response.content?.status) {
      console.log(`Task status: ${response.content.status}`);
    }
  } catch (error) {
    console.log(`Task status lookup skipped: ${error.message}`);
  }
}

async function requestJson(endpoint, options) {
  const response = await fetch(`${apiBase}${endpoint}`, {
    ...options,
    headers: {
      token,
      ...(options.headers ?? {}),
    },
  });
  const text = await response.text();
  const json = parseJson(text);

  if (!response.ok || json.code !== 200) {
    throw new Error(`4EVERLAND API error ${response.status}: ${text}`);
  }

  return json;
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`4EVERLAND returned a non-JSON response: ${text}`);
  }
}

async function zipDirectory(sourceDir, outputPath) {
  await new Promise((resolve, reject) => {
    const output = createWriteStream(outputPath);
    const archive = new ZipArchive({ zlib: { level: 9 } });

    output.on("close", resolve);
    archive.on("error", reject);
    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });

  console.log(`Created ${outputPath}`);
}

async function assertDirectory(dir) {
  const stats = await stat(dir).catch(() => null);
  if (!stats?.isDirectory()) {
    throw new Error(`Missing directory: ${dir}. Run npm run build first.`);
  }
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
