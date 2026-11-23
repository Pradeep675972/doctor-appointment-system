"use server";

import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  appointments,
  doctorAvailability,
  doctorBlockedDates,
  doctors,
  specialties,
} from "@/db/schema";
import type { ActionState } from "@/lib/action-state";
import { requireAdmin } from "@/lib/auth";
import { WEEKDAYS } from "@/lib/format";
import { toMinutes } from "@/lib/scheduling";
import { isISODate, isTime, isUniqueViolation, num, slugify, str } from "@/lib/validation";

const STATUS_TRANSITIONS: Record<string, { from: string[]; label: string }> = {
  confirmed: { from: ["pending"], label: "approved" },
  rejected: { from: ["pending"], label: "declined" },
  completed: { from: ["confirmed"], label: "marked as completed" },
  cancelled: { from: ["pending", "confirmed"], label: "cancelled" },
};

function refreshPublic() {
  revalidatePath("/", "layout");
  revalidatePath("/doctors", "layout");
  revalidatePath("/dashboard", "layout");
  revalidatePath("/admin", "layout");
}

export async function setAppointmentStatusAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = num(formData, "appointmentId");
  const status = str(formData, "status");
  const transition = STATUS_TRANSITIONS[status];
  if (!Number.isInteger(id) || !transition) return { ok: false, message: "Unknown action." };

  const [appointment] = await db
    .select({ id: appointments.id, status: appointments.status })
    .from(appointments)
    .where(eq(appointments.id, id))
    .limit(1);
  if (!appointment) return { ok: false, message: "Appointment not found." };
  if (!transition.from.includes(appointment.status)) {
    return { ok: false, message: `This appointment is ${appointment.status} and cannot be ${transition.label}.` };
  }

  await db
    .update(appointments)
    .set({ status, updatedAt: new Date() })
    .where(eq(appointments.id, id));

  refreshPublic();
  return { ok: true, message: `Appointment ${transition.label}.` };
}

export async function saveDoctorAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const id = Number(str(formData, "id")) || 0;
  const fullName = str(formData, "fullName");
  const title = str(formData, "title") || "MD";
  const slug = slugify(str(formData, "slug") || fullName);
  const tagline = str(formData, "tagline").slice(0, 160);
  const bio = str(formData, "bio").slice(0, 2000);
  const photo = str(formData, "photo") || "/images/doctors/doc-1.jpg";
  const specialtyId = num(formData, "specialtyId");
  const clinicId = num(formData, "clinicId");
  const yearsExperience = num(formData, "yearsExperience");
  const consultationFee = num(formData, "consultationFee");
  const slotMinutes = num(formData, "slotMinutes");
  const languages = str(formData, "languages")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);
  const qualifications = str(formData, "qualifications")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);
  const isActive = formData.get("isActive") === "on";

  const errors: Record<string, string> = {};
  if (fullName.length < 3) errors.fullName = "Enter the doctor's full name.";
  if (!slug) errors.slug = "Add a valid URL slug.";
  if (!Number.isInteger(specialtyId)) errors.specialtyId = "Choose a specialty.";
  if (!Number.isInteger(clinicId)) errors.clinicId = "Choose a clinic.";
  if (!Number.isInteger(yearsExperience) || yearsExperience < 0 || yearsExperience > 70) {
    errors.yearsExperience = "Enter between 0 and 70 years.";
  }
  if (!Number.isInteger(consultationFee) || consultationFee < 0 || consultationFee > 5000) {
    errors.consultationFee = "Enter a fee between 0 and 5000.";
  }
  if (![15, 20, 30, 45, 60].includes(slotMinutes)) errors.slotMinutes = "Choose a slot length.";
  if (!photo.startsWith("/") && !photo.startsWith("https://")) {
    errors.photo = "Use a path such as /images/doctors/… or an https URL.";
  }
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors, message: "Please fix the highlighted fields." };
  }

  const values = {
    slug,
    fullName,
    title,
    tagline,
    bio,
    photo,
    specialtyId,
    clinicId,
    yearsExperience,
    consultationFee,
    slotMinutes,
    languages,
    qualifications,
    isActive,
  };

  let newId = 0;
  try {
    if (id) {
      await db.update(doctors).set(values).where(eq(doctors.id, id));
    } else {
      const [row] = await db.insert(doctors).values(values).returning({ id: doctors.id });
      newId = row.id;
    }
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, errors: { slug: "Another doctor already uses this URL." }, message: "That URL is taken." };
    }
    throw error;
  }

  refreshPublic();
  if (!id) redirect(`/admin/doctors/${newId}?created=1`);
  return { ok: true, message: "Doctor profile saved." };
}

export async function saveScheduleAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const doctorId = num(formData, "doctorId");
  const slotMinutes = num(formData, "slotMinutes");
  if (!Number.isInteger(doctorId) || ![15, 20, 30, 45, 60].includes(slotMinutes)) {
    return { ok: false, message: "Check the slot length and doctor." };
  }

  const rows: { doctorId: number; weekday: number; startTime: string; endTime: string }[] = [];
  for (let weekday = 0; weekday < 7; weekday++) {
    if (formData.get(`day${weekday}_on`) !== "on") continue;
    for (const n of [1, 2]) {
      const start = str(formData, `day${weekday}_start${n}`);
      const end = str(formData, `day${weekday}_end${n}`);
      if (!start && !end) continue;
      if (!isTime(start) || !isTime(end) || toMinutes(start) >= toMinutes(end)) {
        return { ok: false, message: `Check the hours for ${WEEKDAYS[weekday]}: the end time must be after the start.` };
      }
      rows.push({ doctorId, weekday, startTime: start, endTime: end });
    }
  }

  await db.transaction(async (tx) => {
    await tx.update(doctors).set({ slotMinutes }).where(eq(doctors.id, doctorId));
    await tx.delete(doctorAvailability).where(eq(doctorAvailability.doctorId, doctorId));
    if (rows.length > 0) await tx.insert(doctorAvailability).values(rows);
  });

  refreshPublic();
  return { ok: true, message: `Schedule saved · ${rows.length} working block${rows.length === 1 ? "" : "s"} each week.` };
}

export async function addBlockedDateAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const doctorId = num(formData, "doctorId");
  const date = str(formData, "date");
  const reason = str(formData, "reason").slice(0, 160);
  if (!Number.isInteger(doctorId) || !isISODate(date)) {
    return { ok: false, message: "Choose a valid date to block." };
  }
  await db
    .insert(doctorBlockedDates)
    .values({ doctorId, date, reason })
    .onConflictDoUpdate({ target: [doctorBlockedDates.doctorId, doctorBlockedDates.date], set: { reason } });
  refreshPublic();
  return { ok: true, message: `Blocked ${date} from bookings.` };
}

export async function removeBlockedDateAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = num(formData, "id");
  const doctorId = num(formData, "doctorId");
  if (!Number.isInteger(id) || !Number.isInteger(doctorId)) return { ok: false, message: "Unknown date." };
  await db
    .delete(doctorBlockedDates)
    .where(and(eq(doctorBlockedDates.id, id), eq(doctorBlockedDates.doctorId, doctorId)));
  refreshPublic();
  return { ok: true, message: "Date re-opened for bookings." };
}

export async function saveSpecialtyAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const name = str(formData, "name").slice(0, 60);
  const description = str(formData, "description").slice(0, 240);
  const icon = str(formData, "icon") || "stethoscope";
  if (name.length < 2) return { ok: false, errors: { name: "Enter a specialty name." }, message: "Please check the name." };
  try {
    await db.insert(specialties).values({ name, slug: slugify(name), description, icon });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, errors: { name: "This specialty already exists." }, message: "Already listed." };
    }
    throw error;
  }
  refreshPublic();
  return { ok: true, message: `${name} added to specialties.` };
}

export async function deleteSpecialtyAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = num(formData, "id");
  if (!Number.isInteger(id)) return { ok: false, message: "Unknown specialty." };
  const [count] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(doctors)
    .where(eq(doctors.specialtyId, id));
  if ((count?.total ?? 0) > 0) {
    return { ok: false, message: "Reassign or remove its doctors before deleting this specialty." };
  }
  await db.delete(specialties).where(eq(specialties.id, id));
  refreshPublic();
  return { ok: true, message: "Specialty removed." };
}

