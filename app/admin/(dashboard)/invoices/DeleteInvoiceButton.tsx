"use client";

import { useState, useTransition } from "react";
import { deleteCustomInvoice } from "./actions";

export function DeleteInvoiceButton({ id, number }: { id: number; number: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const remove = () => {
    if (!window.confirm(`Delete invoice ${number}? This cannot be undone.`)) return;
    setError("");
    startTransition(async () => {
      // On success the action redirects to the invoice list.
      const result = await deleteCustomInvoice(id);
      if (!result.ok) setError(result.message ?? "Something went wrong.");
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={remove}
        disabled={pending}
        title={error || undefined}
        className="rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
      {error && <span className="self-center text-xs text-red-700">{error}</span>}
    </>
  );
}
