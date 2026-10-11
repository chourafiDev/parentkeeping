// Creates the first store owner account. Run with: pnpm auth:create-owner
// Refuses to run if an owner already exists — add more team members from the admin.
import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { auth } from ".";

// Reads a line without echoing it (raw mode). Ctrl+C cancels.
function promptHidden(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    stdout.write(question);
    let value = "";
    const wasRaw = stdin.isRaw;

    const cleanup = () => {
      stdin.off("data", onData);
      if (stdin.isTTY) stdin.setRawMode(wasRaw);
      stdin.pause();
      stdout.write("\n");
    };

    const onData = (chunk: string) => {
      for (const ch of chunk) {
        if (ch === "\r" || ch === "\n" || ch === "\u0004") {
          cleanup();
          return resolve(value);
        }
        if (ch === "\u0003") {
          cleanup();
          return reject(new Error("Cancelled."));
        }
        if (ch === "\u007f" || ch === "\b") value = value.slice(0, -1);
        else value += ch;
      }
    };

    if (stdin.isTTY) stdin.setRawMode(true);
    stdin.setEncoding("utf8");
    stdin.on("data", onData);
    stdin.resume();
  });
}

async function main() {
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, "owner"))
    .limit(1);
  if (existing) {
    console.error("An owner already exists. Add team members from the admin instead.");
    process.exitCode = 1;
    return;
  }

  const rl = createInterface({ input: stdin, output: stdout });
  const name = (await rl.question("Name: ")).trim();
  const email = (await rl.question("Email: ")).trim().toLowerCase();
  rl.close();

  const password = await promptHidden("Password (min 10 characters): ");
  const confirm = await promptHidden("Confirm password: ");

  if (!name || !email) throw new Error("Name and email are required.");
  if (password.length < 10) throw new Error("Password must be at least 10 characters.");
  if (password !== confirm) throw new Error("Passwords do not match.");

  const { user } = await auth.api.createUser({
    body: { name, email, password, role: "owner" },
  });
  console.log(`\nOwner created: ${user.email}. Sign in at /admin/login`);
}

main()
  .catch((err: unknown) => {
    console.error(`\n${err instanceof Error ? err.message : String(err)}`);
    process.exitCode = 1;
  })
  .finally(() => db.$client.end());
