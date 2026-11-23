import { and, eq, gte, inArray, lte, ne } from "drizzle-orm";
import { db } from "@/db";
import {
  appointments,
  clinics,
  doctorAvailability,
  doctorBlockedDates,
  doctors,
} from "@/db/schema";

export const SCHEDULE_DAYS = 14;
const BLOCKING_STATUSES = ["pending", "confirmed", "completed"];

export type Window = { weekday: number; startTime: string; endTime: string };
export type Slot = { time: string; available: boolean };
export type DaySlots = { date: string; weekday: number; blocked: boolean; slots: Slot[] };

export function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function fromMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

export function weekdayOf(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** Current date and HH:MM in a given IANA timezone (the clinic's local time). */
export function localNow(timeZone: string): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour")}:${get("minute")}`,
  };
}

/** Pure slot engine: builds day-by-day slots from weekly windows, blocks and bookings. */
export function buildDaySlots(input: {
  today: string;
  nowTime: string;
  days: number;
  windows: Window[];
  slotMinutes: number;
  blockedDates: Set<string>;
  booked: Set<string>;
}): DaySlots[] {
  const out: DaySlots[] = [];
  for (let i = 0; i < input.days; i++) {
    const date = addDays(input.today, i);
    const weekday = weekdayOf(date);
    const blocked = input.blockedDates.has(date);
    const times = new Set<string>();
    if (!blocked) {
      for (const w of input.windows) {
        if (w.weekday !== weekday) continue;
        const end = toMinutes(w.endTime);
        for (let t = toMinutes(w.startTime); t + input.slotMinutes <= end; t += input.slotMinutes) {
          times.add(fromMinutes(t));
        }
      }
    }
    const slots: Slot[] = [...times].sort().map((time) => ({
      time,
      available: !(i === 0 && time <= input.nowTime) && !input.booked.has(`${date} ${time}`),
    }));
    out.push({ date, weekday, blocked, slots });
  }
  return out;
}

type ScheduleContext = {
  timeZone: string;
  slotMinutes: number;
  windows: Window[];
  blockedDates: Set<string>;
  booked: Set<string>;
};

export async function getScheduleForDoctors(
  doctorIds: number[],
  options: { excludeAppointmentId?: number } = {},
): Promise<Map<number, DaySlots[]>> {
  const result = new Map<number, DaySlots[]>();
  if (doctorIds.length === 0) return result;

  const doctorRows = await db
    .select({ id: doctors.id, slotMinutes: doctors.slotMinutes, timeZone: clinics.timezone })
    .from(doctors)
    .innerJoin(clinics, eq(clinics.id, doctors.clinicId))
    .where(inArray(doctors.id, doctorIds));

  const availabilityRows = await db
    .select()
    .from(doctorAvailability)
    .where(inArray(doctorAvailability.doctorId, doctorIds));

  const blockedRows = await db
    .select()
    .from(doctorBlockedDates)
    .where(inArray(doctorBlockedDates.doctorId, doctorIds));

  const utcToday = new Date().toISOString().slice(0, 10);
  const bookedRows = await db
    .select({
      doctorId: appointments.doctorId,
      date: appointments.appointmentDate,
      time: appointments.startTime,
    })
    .from(appointments)
    .where(
      and(
        inArray(appointments.doctorId, doctorIds),
        inArray(appointments.status, BLOCKING_STATUSES),
        gte(appointments.appointmentDate, addDays(utcToday, -2)),
        lte(appointments.appointmentDate, addDays(utcToday, SCHEDULE_DAYS + 2)),
        options.excludeAppointmentId ? ne(appointments.id, options.excludeAppointmentId) : undefined,
      ),
    );

  const contexts = new Map<number, ScheduleContext>();
  for (const d of doctorRows) {
    contexts.set(d.id, {
      timeZone: d.timeZone,
      slotMinutes: d.slotMinutes,
      windows: [],
      blockedDates: new Set(),
      booked: new Set(),
    });
  }
  for (const a of availabilityRows) {
    contexts.get(a.doctorId)?.windows.push({
      weekday: a.weekday,
      startTime: a.startTime,
      endTime: a.endTime,
    });
  }
  for (const b of blockedRows) {
    contexts.get(b.doctorId)?.blockedDates.add(b.date);
  }
  for (const b of bookedRows) {
    contexts.get(b.doctorId)?.booked.add(`${b.date} ${b.time}`);
  }

  for (const [doctorId, ctx] of contexts) {
    const today = localNow(ctx.timeZone);
    result.set(
      doctorId,
      buildDaySlots({
        today: today.date,
        nowTime: today.time,
        days: SCHEDULE_DAYS,
        windows: ctx.windows,
        slotMinutes: ctx.slotMinutes,
        blockedDates: ctx.blockedDates,
        booked: ctx.booked,
      }),
    );
  }
  return result;
}

export async function getDaySlotsFor(
  doctorId: number,
  options: { excludeAppointmentId?: number } = {},
): Promise<DaySlots[]> {
  const map = await getScheduleForDoctors([doctorId], options);
  return map.get(doctorId) ?? [];
}

export function firstAvailable(days: DaySlots[]): { date: string; time: string } | null {
  for (const day of days) {
    const slot = day.slots.find((s) => s.available);
    if (slot) return { date: day.date, time: slot.time };
  }
  return null;
}

export async function isSlotAvailable(
  doctorId: number,
  date: string,
  time: string,
  excludeAppointmentId?: number,
): Promise<boolean> {
  const days = await getDaySlotsFor(doctorId, { excludeAppointmentId });
  const day = days.find((d) => d.date === date);
  return day?.slots.some((s) => s.time === time && s.available) ?? false;
}
