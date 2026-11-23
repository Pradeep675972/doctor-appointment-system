"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { appointments, doctors, reviews } from "@/db/schema";
import type { ActionState } from "@/lib/action-state";
import { getCurrentUser } from "@/lib/auth";
import { isSlotAvailable } from "@/lib/scheduling";
import { isISODate, isTime, isUniqueViolation, num, str } from "@/lib/validation";

const SLOT_TAKEN = "That time was just taken. Please choose another slot.";
const ACTIVE_STATUSES: string[] = ["pending", "confirmed"];
const VISIT_TYPES: string[] = ["in-person", "video"];

function refreshAppointmentViews() {
  revalidatePath("/dashboard", "layout");
  revalidatePath("/admin", "layout");
  revalidatePath("/doctors", "layout");
}

export async function bookAppointmentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in to book an appointment." };

  const doctorId = num(formData, "doctorId");
  const date = str(formData, "date");
  const time = str(formData, "time");
  const reason = str(formData, "reason").slice(0, 500);
  const visitType = str(formData, "visitType") || "in-person";

  const errors: Record<string, string> = {};
  if (!Number.isInteger(doctorId) || doctorId <= 0) errors.doctorId = "Choose a doctor.";
  if (!isISODate(date)) errors.date = "Choose a date from the calendar.";
  if (!isTime(time)) errors.time = "Choose a time slot.";
  if (!VISIT_TYPES.includes(visitType)) errors.visitType = "Choose a visit type.";
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors, message: "Please choose a date and time." };
  }

  const [doctor] = await db
    .select({ id: doctors.id, isActive: doctors.isActive })
    .from(doctors)
    .where(eq(doctors.id, doctorId))
    .limit(1);
  if (!doctor || !doctor.isActive) {
    return { ok: false, message: "This doctor is not accepting appointments right now." };
  }

  if (!(await isSlotAvailable(doctorId, date, time))) {
    return { ok: false, message: SLOT_TAKEN };
  }

  let appointmentId = 0;
  try {
    const [row] = await db
      .insert(appointments)
      .values({
        patientId: user.id,
        doctorId,
        appointmentDate: date,
        startTime: time,
        reason,
        visitType,
        status: "pending",
      })
      .returning({ id: appointments.id });
    appointmentId = row.id;
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, message: SLOT_TAKEN };
    throw error;
  }

  refreshAppointmentViews();
  redirect(`/dashboard/appointments/${appointmentId}?booked=1`);
}

export async function rescheduleAppointmentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in to reschedule." };

  const id = num(formData, "appointmentId");
  const date = str(formData, "date");
  const time = str(formData, "time");
  if (!Number.isInteger(id) || !isISODate(date) || !isTime(time)) {
    return { ok: false, message: "Please choose a new date and time." };
  }

  const [appointment] = await db
    .select()
    .from(appointments)
    .where(and(eq(appointments.id, id), eq(appointments.patientId, user.id)))
    .limit(1);
  if (!appointment) return { ok: false, message: "We could not find that appointment." };
  if (!ACTIVE_STATUSES.includes(appointment.status)) {
    return { ok: false, message: "Only upcoming appointments can be rescheduled." };
  }
  if (appointment.appointmentDate === date && appointment.startTime === time) {
    return { ok: false, message: "That is already your appointment time." };
  }

  if (!(await isSlotAvailable(appointment.doctorId, date, time, appointment.id))) {
    return { ok: false, message: SLOT_TAKEN };
  }

  try {
    await db
      .update(appointments)
      .set({
        appointmentDate: date,
        startTime: time,
        status: "pending",
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, appointment.id));
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, message: SLOT_TAKEN };
    throw error;
  }

  refreshAppointmentViews();
  redirect(`/dashboard/appointments/${appointment.id}?rescheduled=1`);
}

export async function cancelAppointmentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in first." };

  const id = num(formData, "appointmentId");
  if (!Number.isInteger(id)) return { ok: false, message: "Invalid appointment." };

  const [appointment] = await db
    .select({ id: appointments.id, status: appointments.status })
    .from(appointments)
    .where(and(eq(appointments.id, id), eq(appointments.patientId, user.id)))
    .limit(1);
  if (!appointment) return { ok: false, message: "We could not find that appointment." };
  if (!ACTIVE_STATUSES.includes(appointment.status)) {
    return { ok: false, message: "This appointment can no longer be cancelled." };
  }

  await db
    .update(appointments)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(appointments.id, id));

  refreshAppointmentViews();
  return { ok: true, message: "Your appointment has been cancelled." };
}

export async function submitReviewAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in first." };

  const id = num(formData, "appointmentId");
  const rating = num(formData, "rating");
  const comment = str(formData, "comment").slice(0, 600);
  if (!Number.isInteger(id)) return { ok: false, message: "Invalid appointment." };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, message: "Choose a rating from 1 to 5 stars." };
  }

  const [appointment] = await db
    .select()
    .from(appointments)
    .where(and(eq(appointments.id, id), eq(appointments.patientId, user.id)))
    .limit(1);
  if (!appointment) return { ok: false, message: "We could not find that visit." };
  if (appointment.status !== "completed") {
    return { ok: false, message: "You can review a visit once it has been completed." };
  }

  try {
    await db.insert(reviews).values({
      appointmentId: appointment.id,
      doctorId: appointment.doctorId,
      patientId: user.id,
      rating,
      comment,
    });
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: true, message: "You have already reviewed this visit." };
    throw error;
  }

  revalidatePath("/", "layout");
  revalidatePath("/dashboard", "layout");
  return { ok: true, message: "Thank you! Your review helps other patients choose with confidence." };
}
