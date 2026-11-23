"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { users } from "@/db/schema";
import type { ActionState } from "@/lib/action-state";
import { hashPassword, requireUser, verifyPassword } from "@/lib/auth";
import { isISODate, str } from "@/lib/validation";

const GENDER_VALUES = ["female", "male", "non-binary", "prefer-not"];
const BLOOD_VALUES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const orNull = (value: string) => (value === "" ? null : value);

export async function updateProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser("/dashboard/profile");

  const fullName = str(formData, "fullName");
  const phone = str(formData, "phone");
  const dateOfBirth = str(formData, "dateOfBirth");
  const gender = str(formData, "gender");
  const bloodGroup = str(formData, "bloodGroup");
  const allergies = str(formData, "allergies").slice(0, 500);
  const conditions = str(formData, "conditions").slice(0, 500);
  const emergencyName = str(formData, "emergencyName");
  const emergencyPhone = str(formData, "emergencyPhone");
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");

  const errors: Record<string, string> = {};
  if (fullName.length < 2) errors.fullName = "Enter your full name.";
  if (dateOfBirth && !isISODate(dateOfBirth)) errors.dateOfBirth = "Enter a valid date of birth.";
  if (phone && !/^[+()\d\s-]{6,20}$/.test(phone)) errors.phone = "Enter a valid phone number.";
  if (emergencyPhone && !/^[+()\d\s-]{6,20}$/.test(emergencyPhone)) {
    errors.emergencyPhone = "Enter a valid phone number.";
  }

  let passwordHash: string | undefined;
  if (newPassword) {
    if (newPassword.length < 8) {
      errors.newPassword = "Use at least 8 characters.";
    } else if (!currentPassword) {
      errors.currentPassword = "Enter your current password to set a new one.";
    } else {
      const [row] = await db
        .select({ passwordHash: users.passwordHash })
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);
      if (!row || !(await verifyPassword(currentPassword, row.passwordHash))) {
        errors.currentPassword = "Your current password is incorrect.";
      } else {
        passwordHash = await hashPassword(newPassword);
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors, message: "Please fix the highlighted fields." };
  }

  await db
    .update(users)
    .set({
      fullName,
      phone: orNull(phone),
      dateOfBirth: orNull(dateOfBirth),
      gender: GENDER_VALUES.includes(gender) ? gender : null,
      bloodGroup: BLOOD_VALUES.includes(bloodGroup) ? bloodGroup : null,
      allergies: orNull(allergies),
      conditions: orNull(conditions),
      emergencyName: orNull(emergencyName),
      emergencyPhone: orNull(emergencyPhone),
      ...(passwordHash ? { passwordHash } : {}),
    })
    .where(eq(users.id, user.id));

  revalidatePath("/dashboard", "layout");
  return {
    ok: true,
    message: passwordHash ? "Profile and password updated." : "Your profile has been saved.",
  };
}
