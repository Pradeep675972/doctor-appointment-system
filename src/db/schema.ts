import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

const stringList = (name: string) =>
  jsonb(name)
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'::jsonb`);

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  role: text("role").notNull().default("patient"),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  phone: text("phone"),
  dateOfBirth: text("date_of_birth"),
  gender: text("gender"),
  bloodGroup: text("blood_group"),
  allergies: text("allergies"),
  conditions: text("conditions"),
  emergencyName: text("emergency_name"),
  emergencyPhone: text("emergency_phone"),
  createdAt: createdAt(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const specialties = pgTable("specialties", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  icon: text("icon").notNull().default("stethoscope"),
});

export const clinics = pgTable("clinics", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  address: text("address").notNull(),
  timezone: text("timezone").notNull(),
  image: text("image").notNull(),
  description: text("description").notNull().default(""),
  phone: text("phone").notNull(),
  openingHours: text("opening_hours").notNull(),
  features: stringList("features"),
});

export const doctors = pgTable(
  "doctors",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    slug: text("slug").notNull().unique(),
    fullName: text("full_name").notNull(),
    title: text("title").notNull().default("MD"),
    tagline: text("tagline").notNull().default(""),
    bio: text("bio").notNull().default(""),
    photo: text("photo").notNull(),
    specialtyId: integer("specialty_id")
      .notNull()
      .references(() => specialties.id, { onDelete: "restrict" }),
    clinicId: integer("clinic_id")
      .notNull()
      .references(() => clinics.id, { onDelete: "restrict" }),
    yearsExperience: integer("years_experience").notNull().default(0),
    consultationFee: integer("consultation_fee").notNull().default(0),
    languages: stringList("languages"),
    qualifications: stringList("qualifications"),
    slotMinutes: integer("slot_minutes").notNull().default(30),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [index("doctors_specialty_idx").on(t.specialtyId)],
);

export const doctorAvailability = pgTable(
  "doctor_availability",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    doctorId: integer("doctor_id")
      .notNull()
      .references(() => doctors.id, { onDelete: "cascade" }),
    weekday: integer("weekday").notNull(),
    startTime: text("start_time").notNull(),
    endTime: text("end_time").notNull(),
  },
  (t) => [index("availability_doctor_idx").on(t.doctorId)],
);

export const doctorBlockedDates = pgTable(
  "doctor_blocked_dates",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    doctorId: integer("doctor_id")
      .notNull()
      .references(() => doctors.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
    reason: text("reason").notNull().default(""),
  },
  (t) => [uniqueIndex("blocked_doctor_date_uidx").on(t.doctorId, t.date)],
);

export const appointments = pgTable(
  "appointments",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    patientId: integer("patient_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    doctorId: integer("doctor_id")
      .notNull()
      .references(() => doctors.id, { onDelete: "cascade" }),
    appointmentDate: text("appointment_date").notNull(),
    startTime: text("start_time").notNull(),
    status: text("status").notNull().default("pending"),
    visitType: text("visit_type").notNull().default("in-person"),
    reason: text("reason").notNull().default(""),
    createdAt: createdAt(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("appointments_patient_idx").on(t.patientId),
    index("appointments_doctor_date_idx").on(t.doctorId, t.appointmentDate),
    uniqueIndex("appointments_active_slot_uidx")
      .on(t.doctorId, t.appointmentDate, t.startTime)
      .where(sql`${t.status} in ('pending', 'confirmed', 'completed')`),
  ],
);

export const reviews = pgTable(
  "reviews",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    appointmentId: integer("appointment_id")
      .notNull()
      .unique()
      .references(() => appointments.id, { onDelete: "cascade" }),
    doctorId: integer("doctor_id")
      .notNull()
      .references(() => doctors.id, { onDelete: "cascade" }),
    patientId: integer("patient_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    comment: text("comment").notNull().default(""),
    createdAt: createdAt(),
  },
  (t) => [index("reviews_doctor_idx").on(t.doctorId)],
);
