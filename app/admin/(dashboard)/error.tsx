"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-7 text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-red-100 text-xl text-red-600">!</div>
        <h1 className="text-lg font-bold text-gray-900">Something went wrong</h1>
        <p className="mt-2 text-sm text-gray-600">{error.message}</p>
        <button
          onClick={reset}
          className="mt-5 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
