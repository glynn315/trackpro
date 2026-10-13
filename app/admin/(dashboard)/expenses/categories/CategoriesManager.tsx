"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { peso } from "@/lib/admin/format";
import type { ExpenseCategory } from "@/lib/admin/types";
import { deleteCategory, saveCategory } from "../actions";

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

export function CategoriesManager({ categories }: { categories: ExpenseCategory[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [removing, setRemoving] = useState<ExpenseCategory | null>(null);
  const [moveTo, setMoveTo] = useState<number | "">("");

  function run(action: () => Promise<{ ok: boolean; message?: string }>, success: string, after?: () => void) {
    setNotice(null);
    startTransition(async () => {
      const r = await action();
      setNotice({ ok: r.ok, text: r.ok ? success : r.message ?? "Something went wrong." });
      if (r.ok) {
        after?.();
        router.refresh();
      }
    });
  }

  function add(form: HTMLFormElement) {
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    if (!name) return;
    run(
      () => saveCategory(null, { name, requires_reference: data.get("requires_reference") === "on" }),
      `Added “${name}”.`,
      () => form.reset()
    );
  }

  function rename(c: ExpenseCategory) {
    const name = draft.trim();
    if (!name || name === c.name) return setEditing(null);
    run(() => saveCategory(c.id, { name }), `Renamed to “${name}”.`, () => setEditing(null));
  }

  function remove(c: ExpenseCategory) {
    if ((c.expenses_count ?? 0) > 0) {
      setRemoving(c);
      setMoveTo("");
      return;
    }
    if (!window.confirm(`Delete “${c.name}”?`)) return;
    run(() => deleteCategory(c.id, null), `Deleted “${c.name}”.`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <section className="rounded-2xl border border-gray-200 bg-white">
        <header className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="font-bold">Categories</h2>
          <span className="text-xs text-gray-500">{categories.length} total</span>
        </header>

        {notice && (
          <p
            className={`border-b px-5 py-2.5 text-sm ${
              notice.ok ? "border-emerald-100 bg-emerald-50 text-emerald-800" : "border-red-100 bg-red-50 text-red-800"
            }`}
          >
            {notice.text}
          </p>
        )}

        <ul className={`divide-y divide-gray-100 ${pending ? "opacity-60" : ""}`}>
          {categories.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
              <div className="min-w-0 flex-1">
                {editing === c.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      rename(c);
                    }}
                    className="flex gap-2"
                  >
                    <input
                      autoFocus
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      maxLength={60}
                      className={`${inputCls} py-1.5`}
                    />
                    <button className="rounded-lg bg-ink px-3 text-xs font-semibold text-white">Save</button>
                    <button type="button" onClick={() => setEditing(null)} className="px-2 text-xs font-semibold text-gray-500">
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    <p className="font-semibold text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-500">
                      {c.expenses_count ?? 0} expense{c.expenses_count === 1 ? "" : "s"} · {peso(c.expenses_total ?? 0)}
                    </p>
                  </>
                )}
              </div>

              {editing !== c.id && (
                <div className="flex items-center gap-4 text-xs">
                  <label className="flex cursor-pointer items-center gap-1.5 text-gray-600" title="Require a description and an invoice / OR reference">
                    <input
                      type="checkbox"
                      checked={c.requires_reference}
                      disabled={pending}
                      onChange={(e) =>
                        run(
                          () => saveCategory(c.id, { requires_reference: e.target.checked }),
                          e.target.checked
                            ? `“${c.name}” expenses now need a description and invoice / OR reference.`
                            : `“${c.name}” expenses no longer need a reference.`
                        )
                      }
                      className="h-4 w-4 rounded border-gray-300 accent-brand"
                    />
                    Needs OR ref.
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(c.id);
                      setDraft(c.name);
                    }}
                    className="font-semibold text-brand hover:underline"
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(c)}
                    disabled={pending || categories.length <= 1}
                    className="font-semibold text-gray-400 hover:text-red-600 disabled:opacity-40"
                  >
                    Delete
                  </button>
                </div>
              )}

              {removing?.id === c.id && (
                <div className="w-full rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  <p>
                    “{c.name}” has {c.expenses_count} expense{c.expenses_count === 1 ? "" : "s"}. Move them to:
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <select
                      value={moveTo}
                      onChange={(e) => setMoveTo(e.target.value ? Number(e.target.value) : "")}
                      className={`${inputCls} w-auto py-1.5`}
                    >
                      <option value="">Choose a category…</option>
                      {categories
                        .filter((o) => o.id !== c.id)
                        .map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.name}
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      disabled={!moveTo || pending}
                      onClick={() => run(() => deleteCategory(c.id, Number(moveTo)), `Deleted “${c.name}” and moved its expenses.`, () => setRemoving(null))}
                      className="rounded-lg bg-red-600 px-3 py-1.5 font-semibold text-white disabled:opacity-40"
                    >
                      Move &amp; delete
                    </button>
                    <button type="button" onClick={() => setRemoving(null)} className="px-2 font-semibold text-amber-800">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="h-fit rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="font-bold">Add a category</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            add(e.currentTarget);
          }}
          className="mt-4 space-y-3"
        >
          <input name="name" required maxLength={60} placeholder="e.g. Fuel, Repairs, Internet" className={inputCls} />
          <label className="flex items-start gap-2 text-sm text-gray-700">
            <input type="checkbox" name="requires_reference" className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-brand" />
            <span>
              Require a description and invoice / OR reference
              <span className="block text-xs text-gray-500">Like “Other” — for expenses that don&apos;t explain themselves.</span>
            </span>
          </label>
          <button disabled={pending} className="w-full rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50">
            Add Category
          </button>
        </form>
      </section>
    </div>
  );
}
