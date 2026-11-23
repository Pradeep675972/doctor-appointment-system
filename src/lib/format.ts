export const APP_NAME = "Vitalis";

export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const VISIT_TYPES = [
  { value: "in-person", label: "In person" },
  { value: "video", label: "Video consultation" },
];

export const GENDERS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "non-binary", label: "Non-binary" },
  { value: "prefer-not", label: "Prefer not to say" },
];

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export type StatusTone = "amber" | "mint" | "sky" | "rose" | "slate";

export const STATUS_META: Record<string, { label: string; tone: StatusTone }> = {
  pending: { label: "Awaiting confirmation", tone: "amber" },
  confirmed: { label: "Confirmed", tone: "mint" },
  completed: { label: "Completed", tone: "sky" },
  cancelled: { label: "Cancelled", tone: "slate" },
  rejected: { label: "Declined", tone: "rose" },
};

export const TONE_CLASSES: Record<StatusTone, string> = {
  amber: "bg-amber-soft text-amber-deep",
  mint: "bg-mint-soft text-mint-deep",
  sky: "bg-sky text-brand-deep",
  rose: "bg-rose-soft text-rose",
  slate: "bg-mist text-muted",
};

export function formatDate(
  date: string,
  options: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric", year: "numeric" },
): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { ...options, timeZone: "UTC" });
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

export function formatFee(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function initials(name: string): string {
  return name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function firstName(name: string): string {
  return name.replace(/^Dr\.?\s+/i, "").split(/\s+/)[0] ?? name;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function slotLabel(slot: { date: string; time: string }): string {
  const day =
    slot.date === todayISO()
      ? "Today"
      : formatDate(slot.date, { weekday: "short", month: "short", day: "numeric" });
  return `${day} · ${formatTime(slot.time)}`;
}

export function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}
