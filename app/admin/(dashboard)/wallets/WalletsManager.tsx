"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { peso } from "@/lib/admin/format";
import type { Wallet, WalletType, WalletsResponse } from "@/lib/admin/types";
import { deleteTransfer, removeWallet, saveWallet, transferMoney } from "./actions";

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

const TYPES: { value: WalletType; label: string; icon: string }[] = [
  { value: "cash", label: "Cash", icon: "💵" },
  { value: "ewallet", label: "E-wallet (GCash, Maya…)", icon: "📱" },
  { value: "bank", label: "Bank account", icon: "🏦" },
  { value: "other", label: "Other", icon: "👛" },
];
const typeOf = (t: WalletType) => TYPES.find((x) => x.value === t) ?? TYPES[3];

/** −₱1,200 for negatives. */
const money = (n: number) => (n < 0 ? `−${peso(-n)}` : peso(n));

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-PH", { timeZone: "Asia/Manila", month: "short", day: "numeric", year: "numeric" });

type Result = { ok: boolean; message?: string };

export function WalletsManager({ data, today }: { data: WalletsResponse; today: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [editing, setEditing] = useState<number | null>(null);

  const active = data.data.filter((w) => w.is_active !== false);
  const inactive = data.data.filter((w) => w.is_active === false);

  function run(action: () => Promise<Result>, success: string, after?: () => void) {
    setNotice(null);
    startTransition(async () => {
      const r = await action();
      // A wallet with history is deactivated rather than deleted — say so instead of "Removed".
      const text = r.ok ? (r.message?.includes("deactivated") ? r.message : success) : r.message ?? "Something went wrong.";
      setNotice({ ok: r.ok, text });
      if (r.ok) {
        after?.();
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Total */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total across wallets</p>
          <p className={`mt-1 text-3xl font-extrabold tracking-tight ${data.total < 0 ? "text-red-600" : "text-gray-900"}`}>
            {money(data.total)}
          </p>
        </div>
        <p className="max-w-md text-xs text-gray-500">
          Sales (paid orders and subscription payments) go into the <span className="font-semibold">default</span> wallet.
          Expenses come out of the wallet they were paid from. Use a transfer to move money between wallets.
        </p>
      </div>

      {notice && (
        <div
          className={`rounded-lg border px-4 py-2.5 text-sm ${
            notice.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {notice.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Wallet cards */}
        <div className={`space-y-4 ${pending ? "opacity-60" : ""}`}>
          <div className="grid gap-4 sm:grid-cols-2">
            {active.map((w) =>
              editing === w.id ? (
                <WalletForm
                  key={w.id}
                  wallet={w}
                  pending={pending}
                  onCancel={() => setEditing(null)}
                  onSave={(d) => run(() => saveWallet(w.id, d), `Saved “${d.name}”.`, () => setEditing(null))}
                />
              ) : (
                <WalletCard
                  key={w.id}
                  wallet={w}
                  pending={pending}
                  onEdit={() => setEditing(w.id)}
                  onDefault={() => run(() => saveWallet(w.id, { is_default: true }), `“${w.name}” now receives sales.`)}
                  onRemove={() => {
                    if (window.confirm(`Remove “${w.name}”? If it has expenses or transfers it will be deactivated instead.`)) {
                      run(() => removeWallet(w.id), `Removed “${w.name}”.`);
                    }
                  }}
                />
              )
            )}
          </div>

          {inactive.length > 0 && (
            <section className="rounded-2xl border border-dashed border-gray-300 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Inactive</h3>
              <ul className="mt-2 divide-y divide-gray-100">
                {inactive.map((w) => (
                  <li key={w.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <span className="text-gray-600">
                      {typeOf(w.type).icon} {w.name} · <span className="tabular-nums">{money(w.balance ?? 0)}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => run(() => saveWallet(w.id, { is_active: true }), `Reactivated “${w.name}”.`)}
                      className="text-xs font-semibold text-brand hover:underline"
                    >
                      Reactivate
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <Transfers transfers={data.transfers} pending={pending} onDelete={(id) => run(() => deleteTransfer(id), "Transfer removed.")} />
        </div>

        {/* Forms */}
        <div className="space-y-6">
          <TransferForm wallets={active} today={today} pending={pending} run={run} />
          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="font-bold">Add a wallet</h2>
            <AddWallet pending={pending} run={run} />
          </section>
        </div>
      </div>
    </div>
  );
}

function WalletCard({
  wallet: w,
  pending,
  onEdit,
  onDefault,
  onRemove,
}: {
  wallet: Wallet;
  pending: boolean;
  onEdit: () => void;
  onDefault: () => void;
  onRemove: () => void;
}) {
  const balance = w.balance ?? 0;
  return (
    <article className={`flex flex-col rounded-2xl border bg-white p-5 ${w.is_default ? "border-brand/40 ring-1 ring-brand/20" : "border-gray-200"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gray-100 text-lg" aria-hidden>
            {typeOf(w.type).icon}
          </span>
          <div className="min-w-0">
            <p className="truncate font-bold text-gray-900">{w.name}</p>
            <p className="text-xs text-gray-500">{typeOf(w.type).label}</p>
          </div>
        </div>
        {w.is_default && (
          <span className="shrink-0 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">Default</span>
        )}
      </div>

      <p className={`mt-4 text-2xl font-extrabold tracking-tight tabular-nums ${balance < 0 ? "text-red-600" : "text-gray-900"}`}>
        {money(balance)}
      </p>
      <div className="mt-1 flex gap-4 text-xs text-gray-500">
        <span>
          This month <span className="font-semibold text-emerald-700">+{peso(w.month?.in ?? 0)}</span>
        </span>
        <span className="font-semibold text-red-600">−{peso(w.month?.out ?? 0)}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-gray-100 pt-3 text-xs font-semibold">
        <button type="button" onClick={onEdit} disabled={pending} className="text-brand hover:underline">
          Edit
        </button>
        {!w.is_default && (
          <>
            <button type="button" onClick={onDefault} disabled={pending} className="text-gray-600 hover:text-gray-900">
              Make default
            </button>
            <button type="button" onClick={onRemove} disabled={pending} className="text-gray-400 hover:text-red-600">
              Remove
            </button>
          </>
        )}
      </div>
    </article>
  );
}

type WalletDraft = { name: string; type: WalletType; opening_balance: number };

function WalletFields({ initial }: { initial?: Partial<WalletDraft> }) {
  return (
    <>
      <input name="name" required maxLength={60} defaultValue={initial?.name} placeholder="e.g. GCash, BDO Savings" className={inputCls} />
      <div className="grid grid-cols-2 gap-3">
        <select name="type" defaultValue={initial?.type ?? "cash"} className={inputCls}>
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.icon} {t.label}
            </option>
          ))}
        </select>
        <label className="block">
          <span className="sr-only">Opening balance</span>
          <input
            name="opening_balance"
            type="number"
            step={1}
            defaultValue={initial?.opening_balance ?? 0}
            placeholder="Opening balance"
            title="Opening balance (₱)"
            className={inputCls}
          />
        </label>
      </div>
      <p className="text-[11px] text-gray-500">Opening balance = what was in this wallet before you started recording here.</p>
    </>
  );
}

const readDraft = (form: HTMLFormElement): WalletDraft => {
  const d = new FormData(form);
  return {
    name: String(d.get("name") ?? "").trim(),
    type: String(d.get("type") ?? "cash") as WalletType,
    opening_balance: parseInt(String(d.get("opening_balance") ?? "0"), 10) || 0,
  };
};

function WalletForm({
  wallet,
  pending,
  onSave,
  onCancel,
}: {
  wallet: Wallet;
  pending: boolean;
  onSave: (d: WalletDraft) => void;
  onCancel: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(readDraft(e.currentTarget));
      }}
      className="space-y-3 rounded-2xl border border-brand/40 bg-white p-5"
    >
      <WalletFields initial={{ name: wallet.name, type: wallet.type, opening_balance: wallet.opening_balance }} />
      <div className="flex gap-2">
        <button disabled={pending} className="flex-1 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          Save
        </button>
        <button type="button" onClick={onCancel} className="rounded-full px-4 py-2 text-sm font-semibold text-gray-500">
          Cancel
        </button>
      </div>
    </form>
  );
}

function AddWallet({ pending, run }: { pending: boolean; run: (a: () => Promise<Result>, s: string, after?: () => void) => void }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const d = readDraft(form);
        run(() => saveWallet(null, d), `Added “${d.name}”.`, () => form.reset());
      }}
      className="mt-4 space-y-3"
    >
      <WalletFields />
      <button disabled={pending} className="w-full rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50">
        Add Wallet
      </button>
    </form>
  );
}

function TransferForm({
  wallets,
  today,
  pending,
  run,
}: {
  wallets: Wallet[];
  today: string;
  pending: boolean;
  run: (a: () => Promise<Result>, s: string, after?: () => void) => void;
}) {
  if (wallets.length < 2) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="font-bold">Transfer money</h2>
        <p className="mt-2 text-sm text-gray-500">Add a second wallet to move money between wallets.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="font-bold">Transfer money</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const d = new FormData(form);
          const amount = parseInt(String(d.get("amount") ?? "0"), 10) || 0;
          run(
            () =>
              transferMoney({
                from_wallet_id: Number(d.get("from")),
                to_wallet_id: Number(d.get("to")),
                amount,
                transferred_on: String(d.get("date")),
                notes: String(d.get("notes") ?? "").trim() || null,
              }),
            `Transferred ${peso(amount)}.`,
            () => form.reset()
          );
        }}
        className="mt-4 space-y-3"
      >
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <select name="from" required defaultValue={wallets[0].id} className={inputCls} aria-label="From wallet">
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          <span className="text-gray-400" aria-hidden>
            →
          </span>
          <select name="to" required defaultValue={wallets[1].id} className={inputCls} aria-label="To wallet">
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input name="amount" type="number" min={1} required placeholder="Amount (₱)" aria-label="Amount" className={inputCls} />
          <input name="date" type="date" required defaultValue={today} aria-label="Date" className={inputCls} />
        </div>
        <input name="notes" maxLength={255} placeholder="Note (optional) — e.g. Deposit to bank" className={inputCls} />
        <button disabled={pending} className="w-full rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-black disabled:opacity-50">
          Record Transfer
        </button>
      </form>
    </section>
  );
}

function Transfers({
  transfers,
  pending,
  onDelete,
}: {
  transfers: WalletsResponse["transfers"];
  pending: boolean;
  onDelete: (id: number) => void;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white">
      <header className="border-b border-gray-200 px-5 py-4">
        <h2 className="font-bold">Recent transfers</h2>
      </header>
      {transfers.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-gray-500">No transfers yet.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {transfers.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
              <div className="min-w-0">
                <p className="truncate text-gray-900">
                  {t.from.name} <span className="text-gray-400">→</span> {t.to.name}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {fmtDate(t.transferred_on)}
                  {t.notes ? ` · ${t.notes}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="font-semibold tabular-nums text-gray-900">{peso(t.amount)}</span>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => window.confirm("Remove this transfer?") && onDelete(t.id)}
                  className="text-xs font-semibold text-gray-400 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
