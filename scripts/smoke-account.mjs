/**
 * Headless smoke test for the customer account flow.
 *
 * Drives a real Chrome over CDP (no extra dependencies) through sign-in and each
 * account tab, asserting the rendered text. Run against a server started with
 * NEXT_PUBLIC_API_URL pointing at a Laravel instance that has the test customer:
 *
 *   node scripts/smoke-account.mjs --base http://127.0.0.1:3011 \
 *     --email buyer1@example.com --password newsecret123
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
const EMAIL = args.email ?? "buyer1@example.com";
const PASSWORD = args.password ?? "newsecret123";
const CHROME =
  args.chrome ??
  "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = Number(args.port ?? 9333);

const profile = mkdtempSync(join(tmpdir(), "tp-smoke-"));
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
  checks.push({ name, ok, detail });
  if (!ok) failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok || !detail ? "" : ` — ${detail}`}`);
}

async function connect() {
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      const { webSocketDebuggerUrl } = await res.json();
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
      const attached = await send("Target.attachToTarget", { targetId: page.targetId, flatten: true });
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

  // innerText reflects CSS text-transform, so compare case-insensitively.
  const text = async () => (await evaluate("document.body.innerText")).toLowerCase();
  const href = () => evaluate("location.pathname + location.search");

  // 1. Sign-in page renders and posts real credentials.
  await goto("/login");
  check("login page renders", (await text()).includes("welcome back"));
  check("login page links to forgot-password", (await text()).includes("forgot your password?"));

  await evaluate(`(() => {
    const form = document.querySelector("form");
    form.querySelector('input[name="email"]').value = ${JSON.stringify(EMAIL)};
    form.querySelector('input[name="password"]').value = ${JSON.stringify(PASSWORD)};
    form.requestSubmit();
    return true;
  })()`);
  await sleep(3000);
  check("sign-in lands on /account", (await href()).startsWith("/account"), await href());

  // 2. Dashboard.
  const overview = await text();
  check("overview shows subscription tile", overview.includes("subscription"));
  check("overview shows next renewal", overview.includes("next renewal"));
  check("overview shows amount due", overview.includes("amount due"));
  check("overview greets the customer", /hi,\s+\w+/.test(overview));

  // 3. Subscription tab.
  await goto("/account/subscription");
  const subscription = await text();
  check("subscription tab shows renewal date", subscription.includes("renewal date"));
  check("subscription tab shows a yearly total", subscription.includes("yearly total"));
  check("subscription tab lists plans", /subscribe —/.test(subscription));

  // 4. Billing tab.
  await goto("/account/billing");
  const billing = await text();
  check("billing shows outstanding balance", billing.includes("outstanding balance"));
  check("billing lists an invoice", /inv-\d{6}/.test(billing), billing.slice(0, 160));

  // 4b. Pay a renewal, if one is outstanding. Skipped once everything is paid,
  //     so the script stays re-runnable.
  const payable = await evaluate(
    `Boolean([...document.querySelectorAll("button")].find((b) => /^pay/i.test(b.textContent.trim())))`
  );
  if (payable) {
    await evaluate(
      `(() => { [...document.querySelectorAll("button")].find((b) => /^pay/i.test(b.textContent.trim())).click(); return true; })()`
    );
    await sleep(3000);
    const afterPay = await text();
    check(
      "paying a renewal invoice confirms and refreshes",
      afterPay.includes("payment recorded") || afterPay.includes("renewed"),
      afterPay.slice(0, 160)
    );
  } else {
    console.log("SKIP  paying a renewal invoice (nothing outstanding)");
  }

  // 5. Orders tab.
  await goto("/account/orders");
  const orders = await text();
  check("orders tab renders", orders.includes("my orders"));
  check("orders tab lists the paid order", /tp-\d{6}/.test(orders));

  // 6. Guard: signing out must bounce /account to /login.
  await evaluate("localStorage.clear(); true");
  await goto("/account");
  check("unauthenticated /account redirects to /login", (await href()).startsWith("/login"), await href());

  // 7. Forgot-password page submits and confirms.
  await goto("/forgot-password");
  await evaluate(`(() => {
    const form = document.querySelector("form");
    form.querySelector('input[name="email"]').value = ${JSON.stringify(EMAIL)};
    form.requestSubmit();
    return true;
  })()`);
  await sleep(2500);
  check(
    "forgot-password confirms submission",
    (await text()).includes("password reset link is on its way") ||
      (await text()).includes("check your inbox")
  );

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
