"use client";

import { useState, useTransition } from "react";
import { deleteClient } from "../actions";

export function DeleteClientButton({ id, name }: { id: number; name: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const remove = () => {
    if (!window.confirm(`Delete ${name}? Their unpaid invoices and inactive subscriptions are deleted too; their orders are kept. This cannot be undone.`)) return;
    setError("");
    startTransition(async () => {
      // On success the action redirects to the client list.
      const result = await deleteClient(id);
      if (!result.ok) setError(result.message ?? "Something went wrong.");
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={remove}
        disabled={pending}
        className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
      {error && <p className="max-w-xs text-right text-xs text-red-700">{error}</p>}
    </div>
  );
}
