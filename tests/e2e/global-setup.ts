import { execSync } from "node:child_process";
import { E2E_DATABASE_URL } from "../../playwright.config";
import { E2E_ADMIN } from "./helpers";

/** Runs a command, retrying a few times: the local Prisma Postgres can take a moment to wake up. */
function run(cmd: string, env: NodeJS.ProcessEnv, tries = 4) {
  for (let i = 1; ; i++) {
    try {
      execSync(cmd, { env, stdio: "inherit" });
      return;
    } catch (err) {
      if (i >= tries) throw err;
      execSync(process.platform === "win32" ? "ping -n 4 127.0.0.1 > NUL" : "sleep 3");
    }
  }
}

/** Fresh demo data in the local test database before every run. */
export default function globalSetup() {
  const env = { ...process.env, DATABASE_URL: E2E_DATABASE_URL, DIRECT_URL: E2E_DATABASE_URL };
  run("npx prisma migrate deploy", env);
  run("npx tsx prisma/seed.ts --demo", env);
  run(`npx tsx scripts/set-admin.ts ${E2E_ADMIN.email} ${E2E_ADMIN.password}`, env);
}
