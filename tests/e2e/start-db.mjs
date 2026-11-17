// Starts the local Prisma Postgres used by the e2e tests and keeps it running.
// After a previous run the server's lock file stays "held" for a few seconds,
// so this retries until it can start (up to ~1 minute).
import { spawn } from "node:child_process";

const NAME = "cotizador-e2e";
const deadline = Date.now() + 60_000;

function start() {
  const child = spawn("npx", ["prisma", "dev", "--name", NAME], { shell: true, stdio: ["ignore", "pipe", "pipe"] });
  let out = "";
  const onData = (d) => {
    out += d.toString();
    process.stdout.write(d);
  };
  child.stdout.on("data", onData);
  child.stderr.on("data", onData);
  child.on("exit", (code) => {
    if (/Lock file is already being held/.test(out) && Date.now() < deadline) {
      setTimeout(start, 5000);
      return;
    }
    process.exit(code ?? 1);
  });
  const stop = () => child.kill();
  process.on("SIGTERM", stop);
  process.on("SIGINT", stop);
}

start();
