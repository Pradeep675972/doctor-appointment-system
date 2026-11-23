import { sql } from "drizzle-orm";
import { db, pool } from "@/db";
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
import { hashPassword } from "@/lib/password";

const DAY = 24 * 60 * 60 * 1000;
const isoOffset = (days: number) => new Date(Date.now() + days * DAY).toISOString().slice(0, 10);
const weekdayOffset = (from: number) => {
  let offset = from;
  while ([0, 6].includes(new Date(Date.now() + offset * DAY).getUTCDay())) offset++;
  return isoOffset(offset);
};

const SPECIALTIES = [
  { name: "Cardiology", slug: "cardiology", icon: "heart", description: "Heart rhythm, blood pressure and preventive cardiovascular care." },
  { name: "Neurology", slug: "neurology", icon: "brain", description: "Headaches, memory, movement disorders and nerve health." },
  { name: "Dermatology", slug: "dermatology", icon: "sparkles", description: "Skin, hair and nail conditions with modern, gentle treatments." },
  { name: "Orthopedics", slug: "orthopedics", icon: "bone", description: "Joints, sports injuries and musculoskeletal recovery." },
  { name: "Pediatrics", slug: "pediatrics", icon: "baby", description: "Compassionate care for infants, children and teenagers." },
  { name: "Psychiatry", slug: "psychiatry", icon: "handshake", description: "Mental wellbeing, therapy and medication management." },
  { name: "Dentistry", slug: "dentistry", icon: "smile", description: "Preventive dentistry, cosmetic work and family dental care." },
  { name: "General Medicine", slug: "general-medicine", icon: "stethoscope", description: "Your first point of contact for checkups and everyday health." },
  { name: "Ophthalmology", slug: "ophthalmology", icon: "eye", description: "Vision care, eye health and surgical consultations." },
  { name: "Gynecology", slug: "gynecology", icon: "flower", description: "Women's health, prenatal care and reproductive wellness." },
];

const CLINICS = [
  { slug: "vitalis-midtown", name: "Vitalis Midtown", city: "New York", country: "USA", address: "240 East 58th Street, Suite 6B, New York, NY", timezone: "America/New_York", image: "/images/clinics/clinic-1.jpg", description: "A light-filled flagship clinic with same-day labs and a dedicated telehealth suite.", phone: "+1 212 555 0148", openingHours: "Mon–Sat · 8:00–18:00", features: ["On-site parking", "Step-free access", "Same-day lab", "Telehealth suite"] },
  { slug: "vitalis-marylebone", name: "Vitalis Marylebone", city: "London", country: "United Kingdom", address: "18 Wimpole Street, Marylebone, London", timezone: "Europe/London", image: "/images/clinics/clinic-2.jpg", description: "Quiet consulting rooms in the heart of Marylebone with specialist diagnostics.", phone: "+44 20 7946 0192", openingHours: "Mon–Fri · 8:00–19:00", features: ["Diagnostics suite", "Private waiting lounge", "Evening clinics"] },
  { slug: "vitalis-mitte", name: "Vitalis Mitte", city: "Berlin", country: "Germany", address: "Friedrichstraße 112, Mitte, Berlin", timezone: "Europe/Berlin", image: "/images/clinics/clinic-3.jpg", description: "A bright, contemporary clinic designed around calm, unhurried consultations.", phone: "+49 30 5557 0120", openingHours: "Mon–Sat · 8:00–18:00", features: ["Multilingual team", "Dermatology lab", "Bike parking"] },
  { slug: "vitalis-marina", name: "Vitalis Marina", city: "Dubai", country: "UAE", address: "Marina Plaza, Dubai Marina, Dubai", timezone: "Asia/Dubai", image: "/images/clinics/clinic-4.jpg", description: "Extended hours and a family-friendly floor with paediatric and women's health wings.", phone: "+971 4 555 0177", openingHours: "Daily · 9:00–21:00", features: ["Family wing", "Extended hours", "Valet parking", "Pharmacy on site"] },
];

const DOCTORS = [
  { slug: "elena-marquez", fullName: "Dr. Elena Marquez", title: "MD, FACC", specialty: "cardiology", clinic: "vitalis-midtown", photo: "/images/doctors/doc-1.jpg", years: 14, fee: 180, languages: ["English", "Spanish"], tagline: "Preventive heart care with clear, calm guidance.", bio: "Dr. Marquez focuses on prevention, early detection and long-term heart health. She listens first, explains every option in plain language and builds plans patients can actually follow.", qualifications: ["MD — Johns Hopkins University School of Medicine", "Interventional Cardiology Fellowship — Mayo Clinic", "Fellow of the American College of Cardiology"] },
  { slug: "michael-chen", fullName: "Dr. Michael Chen", title: "MD, PhD", specialty: "neurology", clinic: "vitalis-marylebone", photo: "/images/doctors/doc-2.jpg", years: 11, fee: 210, languages: ["English", "Mandarin"], tagline: "Precise neurological care for headaches, memory and movement.", bio: "Dr. Chen combines clinical neurology with research-led diagnostics. He is known for thorough assessments and for coordinating care across specialists.", qualifications: ["MD — University College London", "PhD in Neuroscience — King's College London", "Clinical Neurology Residency — Royal London Hospital"] },
  { slug: "sofia-lindqvist", fullName: "Dr. Sofia Lindqvist", title: "MD, Dermatology", specialty: "dermatology", clinic: "vitalis-mitte", photo: "/images/doctors/doc-3.jpg", years: 9, fee: 150, languages: ["English", "German", "Swedish"], tagline: "Modern skin science with gentle, personalised treatments.", bio: "Dr. Lindqvist treats acne, eczema, pigmentation and skin cancer screening with a conservative, evidence-led approach and a strong focus on skin confidence.", qualifications: ["MD — Charité Universitätsmedizin Berlin", "Board Certification in Dermatology", "Dermatopathology Certificate"] },
  { slug: "james-whitfield", fullName: "Dr. James Whitfield", title: "MS, FRCS", specialty: "orthopedics", clinic: "vitalis-marylebone", photo: "/images/doctors/doc-4.jpg", years: 18, fee: 240, languages: ["English"], tagline: "Joint and sports medicine focused on getting you moving again.", bio: "Dr. Whitfield treats sports injuries, joint pain and post-operative recovery. He favours non-surgical options first and plans return-to-activity milestones with every patient.", qualifications: ["MS Orthopaedics — University of Oxford", "Fellow of the Royal College of Surgeons", "Sports Medicine Diploma"] },
  { slug: "priya-raman", fullName: "Dr. Priya Raman", title: "MD, FAAP", specialty: "pediatrics", clinic: "vitalis-marina", photo: "/images/doctors/doc-5.jpg", years: 12, fee: 130, languages: ["English", "Hindi", "Tamil"], tagline: "Gentle, unhurried care for every stage of childhood.", bio: "Dr. Raman has spent more than a decade caring for newborns, toddlers and teenagers. Parents appreciate her warmth, clear guidance and calm approach to vaccinations and growth.", qualifications: ["MD — All India Institute of Medical Sciences", "Paediatric Residency — Boston Children's Hospital", "Fellow of the American Academy of Pediatrics"] },
  { slug: "lucas-moreau", fullName: "Dr. Lucas Moreau", title: "MD, Psychiatry", specialty: "psychiatry", clinic: "vitalis-mitte", photo: "/images/doctors/doc-6.jpg", years: 16, fee: 190, languages: ["English", "French", "German"], tagline: "Thoughtful mental health care that puts you in control.", bio: "Dr. Moreau offers evidence-based psychiatric care for anxiety, mood disorders and sleep. He works collaboratively with therapists and keeps every treatment decision transparent.", qualifications: ["MD — Université Paris Cité", "Psychiatry Residency — Charité Berlin", "Certified CBT Practitioner"] },
  { slug: "hannah-brooks", fullName: "Dr. Hannah Brooks", title: "DDS, MSD", specialty: "dentistry", clinic: "vitalis-midtown", photo: "/images/doctors/doc-7.jpg", years: 10, fee: 120, languages: ["English"], tagline: "Healthy smiles through preventive and cosmetic dentistry.", bio: "Dr. Brooks blends preventive dentistry with thoughtful cosmetic work. Her gentle chairside manner is especially popular with nervous patients and families.", qualifications: ["DDS — NYU College of Dentistry", "MSD in Prosthodontics", "Invisalign Certified Provider"] },
  { slug: "ravi-menon", fullName: "Dr. Ravi Menon", title: "MD, FACP", specialty: "general-medicine", clinic: "vitalis-marina", photo: "/images/doctors/doc-8.jpg", years: 20, fee: 110, languages: ["English", "Malayalam", "Arabic"], tagline: "Your trusted family doctor for checkups, chronic care and advice.", bio: "Dr. Menon has been a family physician for two decades. He manages chronic conditions, coordinates referrals and makes sure nothing important is overlooked.", qualifications: ["MD — Christian Medical College, Vellore", "Fellow of the American College of Physicians", "Diploma in Preventive Medicine"] },
  { slug: "clara-vogel", fullName: "Dr. Clara Vogel", title: "MD, Ophthalmology", specialty: "ophthalmology", clinic: "vitalis-marylebone", photo: "/images/doctors/doc-9.jpg", years: 13, fee: 160, languages: ["English", "German"], tagline: "Clear vision, healthy eyes and expert surgical planning.", bio: "Dr. Vogel manages cataracts, glaucoma and retinal conditions. She is known for precise surgical planning and patient-friendly explanations.", qualifications: ["MD — Ludwig Maximilian University of Munich", "Fellowship in Cataract Surgery — Moorfields Eye Hospital", "Glaucoma Specialist Certification"] },
  { slug: "nadia-haddad", fullName: "Dr. Nadia Haddad", title: "MD, FRCOG", specialty: "gynecology", clinic: "vitalis-marina", photo: "/images/doctors/doc-10.jpg", years: 15, fee: 170, languages: ["English", "Arabic", "French"], tagline: "Compassionate women's health from prenatal care to menopause.", bio: "Dr. Haddad supports women through every life stage, with a focus on prenatal wellbeing, minimally invasive procedures and open, judgement-free conversations.", qualifications: ["MD — American University of Beirut", "Fellow of the Royal College of Obstetricians and Gynaecologists", "Advanced Laparoscopy Training"] },
];

const COMMENTS = [
  "Dr. Marquez explained everything clearly and never rushed me. Booking took under a minute.",
  "Calm, thorough and genuinely kind. The follow-up reminder was a lovely touch.",
  "I finally understand my skin routine. Booking and rescheduling were effortless.",
  "The visit felt warm and unhurried. My daughter actually smiled at the end!",
  "Clear diagnosis, a practical plan and no surprises on the bill. Highly recommend.",
  "The clinic is beautiful and the appointment started exactly on time.",
  "Patient, attentive and very knowledgeable. The video consultation was seamless.",
  "I was seen within two days of booking. Remarkable service from start to finish.",
  "Listened carefully and explained every option. I left feeling genuinely cared for.",
  "Efficient, modern and human. This is exactly what healthcare should feel like.",
  "Brilliant bedside manner and a very clear follow-up plan. I felt in safe hands.",
  "Every question answered without any rush. The dashboard made managing visits simple.",
];

async function main() {
  console.log("Resetting Vitalis data…");
  await db.execute(
    sql`TRUNCATE sessions, reviews, appointments, doctor_blocked_dates, doctor_availability, doctors, clinics, specialties, users RESTART IDENTITY CASCADE`,
  );

  const specialtyRows = await db.insert(specialties).values(SPECIALTIES).returning({ id: specialties.id, slug: specialties.slug });
  const specialtyId = new Map(specialtyRows.map((r) => [r.slug, r.id]));

  const clinicRows = await db.insert(clinics).values(CLINICS).returning({ id: clinics.id, slug: clinics.slug });
  const clinicId = new Map(clinicRows.map((r) => [r.slug, r.id]));

  const doctorRows = await db
    .insert(doctors)
    .values(
      DOCTORS.map((d) => ({
        slug: d.slug,
        fullName: d.fullName,
        title: d.title,
        tagline: d.tagline,
        bio: d.bio,
        photo: d.photo,
        specialtyId: specialtyId.get(d.specialty)!,
        clinicId: clinicId.get(d.clinic)!,
        yearsExperience: d.years,
        consultationFee: d.fee,
        languages: d.languages,
        qualifications: d.qualifications,
        slotMinutes: 30,
        isActive: true,
      })),
    )
    .returning({ id: doctors.id, slug: doctors.slug });
  const doctorId = new Map(doctorRows.map((r) => [r.slug, r.id]));

  // Weekly availability: Mon–Fri with a lunch break, Saturday mornings for half the team.
  const availability: { doctorId: number; weekday: number; startTime: string; endTime: string }[] = [];
  DOCTORS.forEach((d, index) => {
    const id = doctorId.get(d.slug)!;
    for (let weekday = 1; weekday <= 5; weekday++) {
      availability.push({ doctorId: id, weekday, startTime: "09:00", endTime: "13:00" });
      availability.push({ doctorId: id, weekday, startTime: "14:00", endTime: "17:00" });
    }
    if (index % 2 === 0) {
      availability.push({ doctorId: id, weekday: 6, startTime: "09:00", endTime: "12:30" });
    }
  });
  await db.insert(doctorAvailability).values(availability);

  await db.insert(doctorBlockedDates).values([
    { doctorId: doctorId.get("elena-marquez")!, date: weekdayOffset(3), reason: "Cardiology conference" },
    { doctorId: doctorId.get("priya-raman")!, date: weekdayOffset(5), reason: "Training day" },
  ]);

  const passwordAdmin = await hashPassword("Admin123!");
  const passwordPatient = await hashPassword("Patient123!");

  const [admin] = await db
    .insert(users)
    .values({ role: "admin", fullName: "Vitalis Administrator", email: "admin@vitalis.health", passwordHash: passwordAdmin })
    .returning({ id: users.id });

  const [demo] = await db
    .insert(users)
    .values({
      role: "patient",
      fullName: "Alex Morgan",
      email: "demo@vitalis.health",
      passwordHash: passwordPatient,
      phone: "+1 415 555 0134",
      dateOfBirth: "1989-06-14",
      gender: "female",
      bloodGroup: "O+",
      allergies: "Penicillin",
      conditions: "Mild asthma",
      emergencyName: "Daniel Morgan",
      emergencyPhone: "+1 415 555 0192",
    })
    .returning({ id: users.id });

  const otherPatients = await db
    .insert(users)
    .values(
      [
        "Amelia Wright",
        "Omar Khalid",
        "Grace Lee",
        "Thomas Müller",
        "Sara Ibrahim",
      ].map((fullName) => ({
        role: "patient",
        fullName,
        email: `${fullName.toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.|\.$/g, "")}@example.com`,
        passwordHash: passwordPatient,
      })),
    )
    .returning({ id: users.id });
  const patientIds = otherPatients.map((p) => p.id);

  const TIMES = ["10:00", "11:30", "15:00", "16:30"];
  const rows: (typeof appointments.$inferInsert)[] = [];

  // Demo patient: upcoming, pending, completed (reviewed) and cancelled visits.
  rows.push(
    { patientId: demo.id, doctorId: doctorId.get("elena-marquez")!, appointmentDate: weekdayOffset(1), startTime: "09:30", status: "confirmed", visitType: "in-person", reason: "Annual heart check-up" },
    { patientId: demo.id, doctorId: doctorId.get("priya-raman")!, appointmentDate: weekdayOffset(2), startTime: "14:00", status: "pending", visitType: "video", reason: "Vaccination follow-up" },
    { patientId: demo.id, doctorId: doctorId.get("michael-chen")!, appointmentDate: isoOffset(-10), startTime: "10:00", status: "completed", visitType: "in-person", reason: "Recurring headaches" },
    { patientId: demo.id, doctorId: doctorId.get("james-whitfield")!, appointmentDate: isoOffset(-21), startTime: "11:30", status: "completed", visitType: "video", reason: "Knee rehabilitation review" },
    { patientId: demo.id, doctorId: doctorId.get("hannah-brooks")!, appointmentDate: isoOffset(-4), startTime: "15:00", status: "cancelled", visitType: "in-person", reason: "Dental cleaning" },
  );

  // Upcoming bookings from other patients keep the calendars realistically busy.
  DOCTORS.forEach((d, i) => {
    const id = doctorId.get(d.slug)!;
    for (let k = 0; k < 3; k++) {
      rows.push({
        patientId: patientIds[(i + k) % patientIds.length],
        doctorId: id,
        appointmentDate: weekdayOffset(1 + k),
        startTime: TIMES[(i + k) % TIMES.length],
        status: k % 2 === 0 ? "confirmed" : "pending",
        visitType: k === 1 ? "video" : "in-person",
        reason: "Routine consultation",
      });
    }
  });

  // Past completed visits for every doctor, each with a review.
  const reviewPlan: { rowIndex: number; rating: number; comment: string }[] = [];
  const reviewSource: { idx: number; rating: number }[] = [];
  DOCTORS.forEach((d, i) => {
    const id = doctorId.get(d.slug)!;
    [isoOffset(-(7 + i * 2)), isoOffset(-(25 + i))].forEach((date, n) => {
      rows.push({
        patientId: patientIds[(i + n + 1) % patientIds.length],
        doctorId: id,
        appointmentDate: date,
        startTime: n === 0 ? "09:00" : "10:30",
        status: "completed",
        visitType: "in-person",
        reason: "Follow-up visit",
      });
      reviewSource.push({ idx: rows.length - 1, rating: n === 0 ? 5 : i % 3 === 0 ? 4 : 5 });
    });
  });

  const inserted = await db.insert(appointments).values(rows).returning({ id: appointments.id, patientId: appointments.patientId, doctorId: appointments.doctorId, status: appointments.status, date: appointments.appointmentDate });

  // Map inserted rows back to their completed-visit reviews.
  const completedRows = inserted.filter((r) => r.status === "completed");
  completedRows.forEach((row, index) => {
    const rating = index % 7 === 3 ? 4 : 5;
    reviewPlan.push({ rowIndex: index, rating, comment: COMMENTS[index % COMMENTS.length] });
  });
  const reviewValues = reviewPlan.map((plan) => {
    const row = completedRows[plan.rowIndex];
    return {
      appointmentId: row.id,
      doctorId: row.doctorId,
      patientId: row.patientId,
      rating: plan.rating,
      comment: plan.comment,
    };
  });
  if (reviewValues.length) await db.insert(reviews).values(reviewValues);

  console.log(
    `Seeded ${SPECIALTIES.length} specialties, ${CLINICS.length} clinics, ${DOCTORS.length} doctors, ${inserted.length} appointments and ${reviewValues.length} reviews.`,
  );
  console.log("Admin login:   admin@vitalis.health / Admin123!");
  console.log("Patient login: demo@vitalis.health / Patient123!");
  void admin;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
