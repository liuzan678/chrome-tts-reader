// @vitest-environment node

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

describe("content bundle", () => {
  const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

  it("emits a classic-script content bundle without top-level imports", async () => {
    execFileSync("npm", ["run", "build"], {
      cwd: rootDir,
      stdio: "pipe"
    });

    const bundle = readFileSync(join(rootDir, "dist/content.js"), "utf8");

    expect(bundle).not.toMatch(/^import\b/m);
  });
});
