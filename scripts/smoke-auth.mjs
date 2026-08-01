/**
 * Headless smoke test for the two auth paths that can't be checked with curl:
 * the customer reset-password page (needs a real emailed token) and the admin
 * sign-in form (which posts to /api/admin/session).
 *
 *   node scripts/smoke-auth.mjs --base http://127.0.0.1:3011 \
 *     --reset "/reset-password?token=…&email=…" --new-password secret123 \
 *     --admin-email admin@trackprogps.com --admin-password trackpro-change-me
 */

import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, arg, i, all) => {
    if (arg.startsWith("--")) pairs.push([arg.slice(2), all[i + 1]]);
    return pairs;
  }, [])
);

const BASE = args.base ?? "http://127.0.0.1:3000";
const RESET_PATH = args.reset ?? "";
const NEW_PASSWORD = args["new-password"] ?? "secret123";
const ADMIN_EMAIL = args["admin-email"] ?? "admin@trackprogps.com";
const ADMIN_PASSWORD = args["admin-password"] ?? "";
const CHROME = args.chrome ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = Number(args.port ?? 9334);

const profile = mkdtempSync(join(tmpdir(), "tp-smoke-auth-"));
const chrome = spawn(CHROME, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  "--no-first-run",
  "--no-default-browser-check",
  "--disable-gpu",
  "about:blank",
]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const failures = [];
const checks = [];

function check(name, ok, detail = "") {
  checks.push({ name, ok });
  if (!ok) failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok || !detail ? "" : ` — ${detail}`}`);
}

async function connect() {
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      const { webSocketDebuggerUrl } = await fetch(
        `http://127.0.0.1:${PORT}/json/version`
      ).then((r) => r.json());
      const socket = new WebSocket(webSocketDebuggerUrl);
      await new Promise((resolve, reject) => {
        socket.onopen = resolve;
        socket.onerror = reject;
      });
      return socket;
    } catch {
      await sleep(250);
    }
  }
  throw new Error("Could not connect to Chrome");
}

let nextId = 1;
function makeClient(socket) {
  const pending = new Map();
  let sessionId;

  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(JSON.stringify(msg.error)));
      else resolve(msg.result);
    }
  };

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = nextId++;
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params, sessionId }));
    });

  return {
    send,
    attach: async () => {
      const { targetInfos } = await send("Target.getTargets");
      const page = targetInfos.find((t) => t.type === "page");
      const attached = await send("Target.attachToTarget", {
        targetId: page.targetId,
        flatten: true,
      });
      sessionId = attached.sessionId;
      await send("Page.enable");
      await send("Runtime.enable");
    },
  };
}

async function main() {
  const socket = await connect();
  const client = makeClient(socket);
  await client.attach();

  const evaluate = async (expression) => {
    const { result, exceptionDetails } = await client.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (exceptionDetails) throw new Error(exceptionDetails.text ?? "evaluation failed");
    return result.value;
  };

  const goto = async (path) => {
    await client.send("Page.navigate", { url: `${BASE}${path}` });
    await sleep(2200);
  };
  const text = async () => (await evaluate("document.body.innerText")).toLowerCase();
  const href = () => evaluate("location.pathname + location.search");

  // 1. An incomplete reset link must not offer a form.
  await goto("/reset-password");
  check("reset-password without a token explains itself", (await text()).includes("incomplete or has expired"));

  // 2. A real emailed link resets the password and signs the customer in.
  if (RESET_PATH) {
    await goto(RESET_PATH);
    check("reset-password renders the form", (await text()).includes("set a new password"));

    await evaluate(`(() => {
      const form = document.querySelector("form");
      form.querySelector('input[name="password"]').value = ${JSON.stringify(NEW_PASSWORD)};
      form.querySelector('input[name="password_confirmation"]').value = ${JSON.stringify(NEW_PASSWORD)};
      form.requestSubmit();
      return true;
    })()`);
    await sleep(3200);
    check("reset lands in the account area", (await href()).startsWith("/account"), await href());
    check("reset confirms the password change", (await text()).includes("password has been updated"));
  } else {
    console.log("SKIP  reset-password with a real token (no --reset given)");
  }

  // 3. Admin sign-in: wrong password shows the reason, right one reaches /admin.
  await goto("/admin/login");
  check("admin login renders", (await text()).includes("sign in to manage"));

  const submitAdmin = async (password) => {
    await evaluate(`(() => {
      const form = document.querySelector("form");
      form.querySelector('input[name="email"]').value = ${JSON.stringify(ADMIN_EMAIL)};
      form.querySelector('input[name="password"]').value = ${JSON.stringify(password)};
      form.requestSubmit();
      return true;
    })()`);
    await sleep(2600);
  };

  await submitAdmin("definitely-wrong");
  check("admin login rejects a bad password", (await text()).includes("invalid email or password"));

  if (ADMIN_PASSWORD) {
    await submitAdmin(ADMIN_PASSWORD);
    await sleep(1500);
    check("admin login reaches the dashboard", (await href()) === "/admin", await href());
    const dashboard = await text();
    check("dashboard shows the subscriptions card", dashboard.includes("recurring / year"));
    check("sidebar has a Subscriptions tab", dashboard.includes("subscriptions"));

    await goto("/admin/subscriptions");
    check("admin subscriptions page loads", (await text()).includes("annual recurring revenue"));

    // The admin mutations are Server Actions — click one to prove the whole
    // round trip works, not just the API behind it.
    const clicked = await evaluate(
      `(() => {
        const button = [...document.querySelectorAll("button")]
          .find((b) => b.textContent.trim() === "Raise invoice");
        if (!button) return false;
        button.click();
        return true;
      })()`
    );
    if (clicked) {
      await sleep(3000);
      const after = await text();
      check(
        "raising an invoice from the admin succeeds",
        !after.includes("something went wrong") && !after.includes("update failed"),
        after.slice(0, 200)
      );
    } else {
      console.log("SKIP  raising an invoice (no subscriptions listed)");
    }

    await goto("/admin/subscriptions/billing");
    check("admin billing page loads", (await text()).includes("collected this year"));

    const marked = await evaluate(
      `(() => {
        const button = [...document.querySelectorAll("button")]
          .find((b) => b.textContent.trim() === "Mark paid");
        if (!button) return false;
        button.click();
        return true;
      })()`
    );
    if (marked) {
      await sleep(3000);
      const after = await text();
      check(
        "marking an invoice paid from the admin succeeds",
        !after.includes("could not mark it paid") && !after.includes("something went wrong"),
        after.slice(0, 200)
      );
    } else {
      console.log("SKIP  marking an invoice paid (nothing outstanding)");
    }

    await goto("/admin/subscriptions/plans");
    check("admin plans page loads", (await text()).includes("new yearly plan"));
  } else {
    console.log("SKIP  admin sign-in (no --admin-password given)");
  }

  console.log(
    `\n${checks.filter((c) => c.ok).length}/${checks.length} checks passed` +
      (failures.length ? `\nFAILURES:\n- ${failures.join("\n- ")}` : "")
  );
  socket.close();
}

main()
  .catch((err) => {
    console.error("smoke test error:", err.message);
    process.exitCode = 1;
  })
  .finally(() => {
    chrome.kill();
    try {
      rmSync(profile, { recursive: true, force: true });
    } catch {
      /* the profile dir sometimes lingers on Windows */
    }
    if (failures.length) process.exitCode = 1;
  });
