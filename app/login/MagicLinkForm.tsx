"use client";

import { useFormState } from "react-dom";
import { requestMagicLink, type MagicLinkState } from "./actions";

const initialState: MagicLinkState = { status: "idle" };

export function MagicLinkForm() {
  const [state, formAction] = useFormState(requestMagicLink, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-800">Email</span>
        <input
          required
          type="email"
          name="email"
          placeholder="you@example.com"
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </label>
      <button
        type="submit"
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
      >
        Log in with email →
      </button>
      {state.status !== "idle" && (
        <p
          className={`text-sm ${
            state.status === "success" ? "text-green-600" : "text-rose-600"
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
