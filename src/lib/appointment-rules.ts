import { todayISO } from "@/lib/format";

/** An appointment can be rescheduled or cancelled while it is pending or confirmed and in the future. */
export function isChangeable(appointment: { status: string; date: string }): boolean {
  return (appointment.status === "pending" || appointment.status === "confirmed") && appointment.date >= todayISO();
}
