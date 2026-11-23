"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import type { ActionState } from "@/lib/action-state";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";
import { isEmail, safeNext, str } from "@/lib/validation";

export async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const fullName = str(formData, "fullName");
  const email = str(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const errors: Record<string, string> = {};
  if (fullName.length < 2) errors.fullName = "Enter your full name.";
  if (!isEmail(email)) errors.email = "Enter a valid email address.";
  if (password.length < 8) errors.password = "Use at least 8 characters.";
  if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match.";
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors, message: "Please fix the highlighted fields." };
  }

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    return {
      ok: false,
      errors: { email: "An account with this email already exists." },
      message: "Try signing in instead.",
    };
  }

  const [user] = await db
    .insert(users)
    .values({ fullName, email, passwordHash: await hashPassword(password), role: "patient" })
    .returning({ id: users.id });

  await createSession(user.id);
  redirect(safeNext(str(formData, "next")) ?? "/dashboard");
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = str(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");

  const errors: Record<string, string> = {};
  if (!isEmail(email)) errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Enter your password.";
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors, message: "Please check your details." };
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { ok: false, message: "Email or password is incorrect." };
  }

  await createSession(user.id);
  const next = safeNext(str(formData, "next"));
  redirect(next ?? (user.role === "admin" ? "/admin" : "/dashboard"));
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
