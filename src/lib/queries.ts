import { and, asc, desc, eq, gte, ilike, inArray, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import {
  appointments,
  clinics,
  doctorAvailability,
  doctorBlockedDates,
  doctors,
  reviews,
  specialties,
  users,
} from "@/db/schema";
import {
  type DaySlots,
  firstAvailable,
  getDaySlotsFor,
  getScheduleForDoctors,
} from "@/lib/scheduling";

/* ----------------------------- doctors ----------------------------- */

const doctorColumns = {
  id: doctors.id,
  slug: doctors.slug,
  fullName: doctors.fullName,
  title: doctors.title,
  tagline: doctors.tagline,
  bio: doctors.bio,
  photo: doctors.photo,
  yearsExperience: doctors.yearsExperience,
  consultationFee: doctors.consultationFee,
  languages: doctors.languages,
  qualifications: doctors.qualifications,
  slotMinutes: doctors.slotMinutes,
  isActive: doctors.isActive,
  specialtyId: doctors.specialtyId,
  clinicIdRef: doctors.clinicId,
  specialtyName: specialties.name,
  specialtySlug: specialties.slug,
  specialtyIcon: specialties.icon,
  specialtyDescription: specialties.description,
  clinicId: clinics.id,
  clinicName: clinics.name,
  clinicSlug: clinics.slug,
  clinicCity: clinics.city,
  clinicCountry: clinics.country,
  clinicAddress: clinics.address,
  clinicPhone: clinics.phone,
  clinicHours: clinics.openingHours,
  clinicFeatures: clinics.features,
  clinicImage: clinics.image,
  clinicDescription: clinics.description,
  clinicTimezone: clinics.timezone,
};

function doctorBaseQuery() {
  return db
    .select(doctorColumns)
    .from(doctors)
    .innerJoin(specialties, eq(specialties.id, doctors.specialtyId))
    .innerJoin(clinics, eq(clinics.id, doctors.clinicId));
}

type DoctorRow = Awaited<ReturnType<typeof doctorBaseQuery>>[number];

export type DoctorSummary = {
  id: number;
  slug: string;
  fullName: string;
  title: string;
  tagline: string;
  photo: string;
  yearsExperience: number;
  consultationFee: number;
  languages: string[];
  specialtyName: string;
  specialtySlug: string;
  specialtyIcon: string;
  clinicName: string;
  clinicSlug: string;
  clinicCity: string;
  clinicCountry: string;
  rating: number;
  reviewCount: number;
  nextSlot: { date: string; time: string } | null;
  availableOnDate: boolean | null;
};

async function ratingMap() {
  const rows = await db
    .select({
      doctorId: reviews.doctorId,
      avg: sql<string>`avg(${reviews.rating})`,
      total: sql<number>`count(*)::int`,
    })
    .from(reviews)
    .groupBy(reviews.doctorId);
  return new Map<number, { rating: number; total: number }>(
    rows.map((r) => [r.doctorId, { rating: Math.round(Number(r.avg) * 10) / 10, total: r.total }] as const),
  );
}

function summarize(
  row: DoctorRow,
  rating: { rating: number; total: number } | undefined,
  days: DaySlots[],
  date?: string,
): DoctorSummary {
  return {
    id: row.id,
    slug: row.slug,
    fullName: row.fullName,
    title: row.title,
    tagline: row.tagline,
    photo: row.photo,
    yearsExperience: row.yearsExperience,
    consultationFee: row.consultationFee,
    languages: row.languages,
    specialtyName: row.specialtyName,
    specialtySlug: row.specialtySlug,
    specialtyIcon: row.specialtyIcon,
    clinicName: row.clinicName,
    clinicSlug: row.clinicSlug,
    clinicCity: row.clinicCity,
    clinicCountry: row.clinicCountry,
    rating: rating?.rating ?? 0,
    reviewCount: rating?.total ?? 0,
    nextSlot: firstAvailable(days),
    availableOnDate: date ? (days.find((d) => d.date === date)?.slots.some((s) => s.available) ?? false) : null,
  };
}

export type DoctorFilters = {
  q?: string;
  specialty?: string;
  city?: string;
  date?: string;
  availableSoon?: boolean;
  sort?: string;
};

export async function listDoctors(filters: DoctorFilters = {}): Promise<DoctorSummary[]> {
  const rows = await doctorBaseQuery().where(eq(doctors.isActive, true));
  const [ratings, schedule] = await Promise.all([
    ratingMap(),
    getScheduleForDoctors(rows.map((r) => r.id)),
  ]);

  let items = rows.map((r) =>
    summarize(r, ratings.get(r.id), schedule.get(r.id) ?? [], filters.date || undefined),
  );

  const q = filters.q?.trim().toLowerCase();
  if (q) {
    items = items.filter((d) =>
      [d.fullName, d.specialtyName, d.tagline, d.clinicCity, d.clinicName, d.clinicCountry]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }
  if (filters.specialty) items = items.filter((d) => d.specialtySlug === filters.specialty);
  if (filters.city) {
    const city = filters.city.toLowerCase();
    items = items.filter((d) => d.clinicCity.toLowerCase() === city);
  }
  if (filters.date) items = items.filter((d) => d.availableOnDate === true);
  if (filters.availableSoon) items = items.filter((d) => d.nextSlot !== null);

  switch (filters.sort) {
    case "rating":
      items.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
      break;
    case "experience":
      items.sort((a, b) => b.yearsExperience - a.yearsExperience);
      break;
    case "fee":
      items.sort((a, b) => a.consultationFee - b.consultationFee);
      break;
    default:
      items.sort((a, b) => {
        const left = a.nextSlot ? `${a.nextSlot.date} ${a.nextSlot.time}` : "9999";
        const right = b.nextSlot ? `${b.nextSlot.date} ${b.nextSlot.time}` : "9999";
        return left.localeCompare(right);
      });
  }
  return items;
}

export async function getFeaturedDoctors(limit: number): Promise<DoctorSummary[]> {
  const items = await listDoctors({ sort: "rating" });
  return items.slice(0, limit);
}

export async function getDoctorProfile(slug: string) {
  const [row] = await doctorBaseQuery().where(eq(doctors.slug, slug)).limit(1);
  if (!row || !row.isActive) return null;

  const [ratings, days, reviewRows, distribution] = await Promise.all([
    ratingMap(),
    getDaySlotsFor(row.id),
    db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        patientName: users.fullName,
      })
      .from(reviews)
      .innerJoin(users, eq(users.id, reviews.patientId))
      .where(eq(reviews.doctorId, row.id))
      .orderBy(desc(reviews.createdAt))
      .limit(12),
    db
      .select({ rating: reviews.rating, total: sql<number>`count(*)::int` })
      .from(reviews)
      .where(eq(reviews.doctorId, row.id))
      .groupBy(reviews.rating),
  ]);

  const summary = summarize(row, ratings.get(row.id), days);
  return {
    ...summary,
    bio: row.bio,
    qualifications: row.qualifications,
    slotMinutes: row.slotMinutes,
    specialtyDescription: row.specialtyDescription,
    clinic: {
      id: row.clinicId,
      name: row.clinicName,
      city: row.clinicCity,
      country: row.clinicCountry,
      address: row.clinicAddress,
      phone: row.clinicPhone,
      hours: row.clinicHours,
      features: row.clinicFeatures,
      image: row.clinicImage,
      description: row.clinicDescription,
      timezone: row.clinicTimezone,
    },
    days,
    reviews: reviewRows.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      reviewer: reviewerName(r.patientName),
    })),
    ratingCounts: [1, 2, 3, 4, 5].map((s) => distribution.find((d) => d.rating === s)?.total ?? 0),
  };
}

export type DoctorProfile = NonNullable<Awaited<ReturnType<typeof getDoctorProfile>>>;

export function reviewerName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

export async function getDoctorBasic(id: number) {
  const [row] = await doctorBaseQuery().where(eq(doctors.id, id)).limit(1);
  return row ?? null;
}

/* ----------------------------- catalogue ----------------------------- */

export async function getSpecialtiesWithCounts() {
  return db
    .select({
      id: specialties.id,
      name: specialties.name,
      slug: specialties.slug,
      description: specialties.description,
      icon: specialties.icon,
      doctorCount: sql<number>`count(${doctors.id})::int`,
    })
    .from(specialties)
    .leftJoin(doctors, eq(doctors.specialtyId, specialties.id))
    .groupBy(specialties.id)
    .orderBy(asc(specialties.name));
}

export async function getClinicsWithCounts() {
  return db
    .select({
      id: clinics.id,
      slug: clinics.slug,
      name: clinics.name,
      city: clinics.city,
      country: clinics.country,
      address: clinics.address,
      image: clinics.image,
      description: clinics.description,
      phone: clinics.phone,
      openingHours: clinics.openingHours,
      features: clinics.features,
      doctorCount: sql<number>`count(${doctors.id})::int`,
    })
    .from(clinics)
    .leftJoin(doctors, eq(doctors.clinicId, clinics.id))
    .groupBy(clinics.id)
    .orderBy(asc(clinics.name));
}

export async function getSpecialtyOptions() {
  return db.select({ id: specialties.id, name: specialties.name }).from(specialties).orderBy(asc(specialties.name));
}

export async function getClinicOptions() {
  return db.select({ id: clinics.id, name: clinics.name, city: clinics.city }).from(clinics).orderBy(asc(clinics.name));
}

export async function getCityOptions() {
  const rows = await db.select({ city: clinics.city }).from(clinics).orderBy(asc(clinics.city));
  return [...new Set(rows.map((r) => r.city))];
}

export async function getPlatformStats() {
  const [doctorCount, patientCount, ratingAgg, completed, appointmentCount, clinicCount, specialtyCount] =
    await Promise.all([
      db.select({ total: sql<number>`count(*)::int` }).from(doctors).where(eq(doctors.isActive, true)),
      db.select({ total: sql<number>`count(*)::int` }).from(users).where(eq(users.role, "patient")),
      db
        .select({ avg: sql<string>`avg(${reviews.rating})`, total: sql<number>`count(*)::int` })
        .from(reviews),
      db.select({ total: sql<number>`count(*)::int` }).from(appointments).where(eq(appointments.status, "completed")),
      db.select({ total: sql<number>`count(*)::int` }).from(appointments),
      db.select({ total: sql<number>`count(*)::int` }).from(clinics),
      db.select({ total: sql<number>`count(*)::int` }).from(specialties),
    ]);
  return {
    doctors: doctorCount[0]?.total ?? 0,
    patients: patientCount[0]?.total ?? 0,
    rating: Math.round(Number(ratingAgg[0]?.avg ?? 5) * 10) / 10,
    reviews: ratingAgg[0]?.total ?? 0,
    completed: completed[0]?.total ?? 0,
    appointments: appointmentCount[0]?.total ?? 0,
    clinics: clinicCount[0]?.total ?? 0,
    specialties: specialtyCount[0]?.total ?? 0,
  };
}

export async function getTopReviews(limit: number) {
  const rows = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      patientName: users.fullName,
      doctorName: doctors.fullName,
      doctorSlug: doctors.slug,
      specialtyName: specialties.name,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .innerJoin(users, eq(users.id, reviews.patientId))
    .innerJoin(doctors, eq(doctors.id, reviews.doctorId))
    .innerJoin(specialties, eq(specialties.id, doctors.specialtyId))
    .where(gte(reviews.rating, 5))
    .orderBy(desc(reviews.createdAt))
    .limit(limit);
  return rows.map((r) => ({ ...r, patientName: reviewerName(r.patientName) }));
}

/* ----------------------------- appointments ----------------------------- */

const appointmentColumns = {
  id: appointments.id,
  status: appointments.status,
  date: appointments.appointmentDate,
  time: appointments.startTime,
  visitType: appointments.visitType,
  reason: appointments.reason,
  createdAt: appointments.createdAt,
  updatedAt: appointments.updatedAt,
  patientId: appointments.patientId,
  doctorId: appointments.doctorId,
  doctorSlug: doctors.slug,
  doctorName: doctors.fullName,
  doctorTitle: doctors.title,
  doctorPhoto: doctors.photo,
  specialtyName: specialties.name,
  clinicName: clinics.name,
  clinicCity: clinics.city,
  clinicAddress: clinics.address,
  clinicPhone: clinics.phone,
  patientName: users.fullName,
  patientEmail: users.email,
  patientPhone: users.phone,
  reviewId: reviews.id,
  reviewRating: reviews.rating,
};

function appointmentBaseQuery() {
  return db
    .select(appointmentColumns)
    .from(appointments)
    .innerJoin(doctors, eq(doctors.id, appointments.doctorId))
    .innerJoin(specialties, eq(specialties.id, doctors.specialtyId))
    .innerJoin(clinics, eq(clinics.id, doctors.clinicId))
    .innerJoin(users, eq(users.id, appointments.patientId))
    .leftJoin(reviews, eq(reviews.appointmentId, appointments.id));
}

export type AppointmentRow = Awaited<ReturnType<typeof appointmentBaseQuery>>[number];

export async function getPatientAppointments(userId: number): Promise<AppointmentRow[]> {
  return appointmentBaseQuery()
    .where(eq(appointments.patientId, userId))
    .orderBy(desc(appointments.appointmentDate), desc(appointments.startTime));
}

export async function getAppointmentForUser(id: number, userId: number): Promise<AppointmentRow | null> {
  const [row] = await appointmentBaseQuery()
    .where(and(eq(appointments.id, id), eq(appointments.patientId, userId)))
    .limit(1);
  return row ?? null;
}

export async function getAdminAppointments(status?: string): Promise<AppointmentRow[]> {
  return appointmentBaseQuery()
    .where(status ? eq(appointments.status, status) : undefined)
    .orderBy(desc(appointments.appointmentDate), desc(appointments.startTime))
    .limit(300);
}

export async function getAdminOverview() {
  const today = new Date().toISOString().slice(0, 10);
  const since = new Date(Date.now() - 13 * 24 * 60 * 60 * 1000);
  since.setUTCHours(0, 0, 0, 0);

  const [patients, activeDoctors, statusRows, todayRows, recentRows, specialtyRows, pending] = await Promise.all([
    db.select({ total: sql<number>`count(*)::int` }).from(users).where(eq(users.role, "patient")),
    db.select({ total: sql<number>`count(*)::int` }).from(doctors).where(eq(doctors.isActive, true)),
    db
      .select({ status: appointments.status, total: sql<number>`count(*)::int` })
      .from(appointments)
      .groupBy(appointments.status),
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(appointments)
      .where(and(eq(appointments.appointmentDate, today), inArray(appointments.status, ["pending", "confirmed"]))),
    db.select({ createdAt: appointments.createdAt }).from(appointments).where(gte(appointments.createdAt, since)),
    db
      .select({
        name: specialties.name,
        total: sql<number>`count(${appointments.id})::int`,
      })
      .from(specialties)
      .leftJoin(doctors, eq(doctors.specialtyId, specialties.id))
      .leftJoin(appointments, eq(appointments.doctorId, doctors.id))
      .groupBy(specialties.id, specialties.name),
    appointmentBaseQuery()
      .where(eq(appointments.status, "pending"))
      .orderBy(asc(appointments.appointmentDate), asc(appointments.startTime))
      .limit(6),
  ]);

  const byStatus: Record<string, number> = {};
  let total = 0;
  for (const row of statusRows) {
    byStatus[row.status] = row.total;
    total += row.total;
  }

  const days: { date: string; label: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const iso = d.toISOString().slice(0, 10);
    days.push({
      date: iso,
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
      count: recentRows.filter((r) => r.createdAt.toISOString().slice(0, 10) === iso).length,
    });
  }

  return {
    patients: patients[0]?.total ?? 0,
    doctors: activeDoctors[0]?.total ?? 0,
    total,
    byStatus,
    todayCount: todayRows[0]?.total ?? 0,
    pendingCount: byStatus.pending ?? 0,
    days,
    specialties: specialtyRows
      .map((s) => ({ name: s.name, total: s.total }))
      .sort((a, b) => b.total - a.total),
    pending,
  };
}

/* ----------------------------- admin lists ----------------------------- */

export async function getAdminDoctors() {
  const [rows, upcoming] = await Promise.all([
    doctorBaseQuery().orderBy(asc(doctors.fullName)),
    db
      .select({ doctorId: appointments.doctorId, total: sql<number>`count(*)::int` })
      .from(appointments)
      .where(
        and(
          inArray(appointments.status, ["pending", "confirmed"]),
          gte(appointments.appointmentDate, new Date().toISOString().slice(0, 10)),
        ),
      )
      .groupBy(appointments.doctorId),
  ]);
  const counts = new Map(upcoming.map((u) => [u.doctorId, u.total]));
  return rows.map((r) => ({ ...r, upcomingCount: counts.get(r.id) ?? 0 }));
}

export async function getAdminDoctor(id: number) {
  const [doctor] = await doctorBaseQuery().where(eq(doctors.id, id)).limit(1);
  if (!doctor) return null;
  const [windows, blocked] = await Promise.all([
    db
      .select()
      .from(doctorAvailability)
      .where(eq(doctorAvailability.doctorId, id))
      .orderBy(asc(doctorAvailability.weekday), asc(doctorAvailability.startTime)),
    db
      .select()
      .from(doctorBlockedDates)
      .where(eq(doctorBlockedDates.doctorId, id))
      .orderBy(asc(doctorBlockedDates.date)),
  ]);
  return { doctor, windows, blocked };
}

export async function getAdminPatients(q?: string) {
  const search = q
    ? or(ilike(users.fullName, `%${q}%`), ilike(users.email, `%${q}%`))
    : undefined;
  const [patients, stats] = await Promise.all([
    db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        phone: users.phone,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(and(eq(users.role, "patient"), search))
      .orderBy(desc(users.createdAt)),
    db
      .select({
        patientId: appointments.patientId,
        total: sql<number>`count(*)::int`,
        lastDate: sql<string>`max(${appointments.appointmentDate})`,
      })
      .from(appointments)
      .groupBy(appointments.patientId),
  ]);
  const map = new Map(stats.map((s) => [s.patientId, s]));
  return patients.map((p) => ({
    ...p,
    total: map.get(p.id)?.total ?? 0,
    lastDate: map.get(p.id)?.lastDate ?? null,
  }));
}

export type { SQL };
