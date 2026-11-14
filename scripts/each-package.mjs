// Runs an npm command in every package, in order, stopping at the first failure.
// Usage: node scripts/each-package.mjs <npm args...>   e.g. `run lint`
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const packages = ["user-service", "freelance-service", "event-service", "frontend"];
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Usage: node scripts/each-package.mjs <npm args...>");
  process.exit(1);
}

for (const name of packages) {
  const cwd = path.join(root, "packages", name);
  console.log(`\n> [${name}] npm ${args.join(" ")}`);
  const result = spawnSync("npm", args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    console.error(`\n✖ ${name} failed`);
    process.exit(result.status ?? 1);
  }
}
console.log("\n✔ all packages passed");
