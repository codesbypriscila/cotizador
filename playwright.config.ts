import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

// End-to-end tests always run against a LOCAL database, never Neon:
// they wipe it and load demo data (npm run db:seed:demo).
export const E2E_DATABASE_URL =
  process.env.E2E_DATABASE_URL ?? "postgres://postgres:postgres@localhost:51225/template1?sslmode=disable";

if (/neon\.tech/.test(E2E_DATABASE_URL)) {
  throw new Error(
    "E2E_DATABASE_URL points to Neon. The tests erase the database: use the local one (npx prisma dev --name cotizador-e2e).",
  );
}

const PORT = 3200;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  globalSetup: "./tests/e2e/global-setup.ts",
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: "es-DO",
    timezoneId: "America/Santo_Domingo",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: [
    {
      // Local Prisma Postgres for the tests; Playwright starts and stops it with the run
      // (a server left running after a killed client can stop answering).
      command: "node tests/e2e/start-db.mjs",
      port: 51225,
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: `npx next dev -p ${PORT}`,
      url: `http://localhost:${PORT}/admin/login`,
      reuseExistingServer: false,
      timeout: 180_000,
      // No real Gmail in tests: the email sheet shows the "not configured" state.
      env: { DATABASE_URL: E2E_DATABASE_URL, DIRECT_URL: E2E_DATABASE_URL },
    },
  ],
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
