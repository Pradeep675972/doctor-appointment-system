"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle } from "lucide-react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import type { ActionState } from "@/lib/action-state";

export const fieldControl =
  "w-full rounded-2xl border border-line bg-white px-4 py-3.5 text-base text-navy shadow-sm outline-none transition-all duration-300 placeholder:text-muted/60 hover:border-navy/25 focus:border-brand focus:ring-4 focus:ring-brand/15 aria-invalid:border-rose aria-invalid:ring-rose/10 disabled:cursor-not-allowed disabled:bg-mist";

function FieldShell({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-navy">
        {label}
      </label>
      {children}
      <AnimatePresence mode="wait">
        {error ? (
          <motion.p
            key="error"
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm font-medium text-rose"
          >
            {error}
          </motion.p>
        ) : hint ? (
          <p key="hint" className="text-sm text-muted">
            {hint}
          </p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

type CommonFieldProps = { label: string; error?: string; hint?: string };

export function Input({
  label,
  error,
  hint,
  id,
  name,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & CommonFieldProps) {
  const fieldId = id ?? name ?? label;
  return (
    <FieldShell label={label} htmlFor={fieldId} error={error} hint={hint}>
      <input
        {...props}
        id={fieldId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={`${fieldControl} ${className}`}
      />
    </FieldShell>
  );
}

export function Select({
  label,
  error,
  hint,
  id,
  name,
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & CommonFieldProps) {
  const fieldId = id ?? name ?? label;
  return (
    <FieldShell label={label} htmlFor={fieldId} error={error} hint={hint}>
      <select
        {...props}
        id={fieldId}
        name={name}
        aria-invalid={error ? true : undefined}
        className={`${fieldControl} ${className}`}
      >
        {children}
      </select>
    </FieldShell>
  );
}

export function Textarea({
  label,
  error,
  hint,
  id,
  name,
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & CommonFieldProps) {
  const fieldId = id ?? name ?? label;
  return (
    <FieldShell label={label} htmlFor={fieldId} error={error} hint={hint}>
      <textarea
        {...props}
        id={fieldId}
        name={name}
        aria-invalid={error ? true : undefined}
        className={`${fieldControl} min-h-28 resize-y ${className}`}
      />
    </FieldShell>
  );
}

export function FormNotice({ state }: { state: ActionState }) {
  return (
    <AnimatePresence mode="wait">
      {state.message && (
        <motion.div
          key={state.message}
          role="status"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`flex items-start gap-3 rounded-2xl px-4 py-3 text-sm font-medium ${
            state.ok ? "bg-mint-soft text-mint-deep" : "bg-rose-soft text-rose"
          }`}
        >
          {state.ok ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          )}
          <span>{state.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
