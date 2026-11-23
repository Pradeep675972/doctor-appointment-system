import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlockedDateForm, DoctorForm, RemoveDateButton, ScheduleEditor } from "@/components/admin/AdminForms";
import { Avatar, Eyebrow, StatusBadge } from "@/components/ui/primitives";
import { formatDate } from "@/lib/format";
import { getAdminDoctor, getClinicOptions, getSpecialtyOptions } from "@/lib/queries";

export const metadata: Metadata = { title: "Manage doctor · Admin" };

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ created?: string }>;

export default async function ManageDoctorPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { id: rawId } = await params;
  const sp = await searchParams;
  const id = Number(rawId);
  if (!Number.isInteger(id)) notFound();

  const [record, specialties, clinics] = await Promise.all([
    getAdminDoctor(id),
    getSpecialtyOptions(),
    getClinicOptions(),
  ]);
  if (!record) notFound();
  const { doctor, windows, blocked } = record;

  return (
    <div className="space-y-14">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/admin/doctors" className="transition-colors hover:text-brand-deep">
          Doctors
        </Link>
        <span aria-hidden> / </span>
        <span className="font-semibold text-navy">{doctor.fullName}</span>
      </nav>

      <header className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <Avatar name={doctor.fullName} src={doctor.photo} size="xl" />
        <div>
          <Eyebrow>{doctor.specialtyName}</Eyebrow>
          <h1 className="mt-4 font-display text-5xl leading-none tracking-tight text-navy sm:text-6xl">{doctor.fullName}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <StatusBadge status={doctor.isActive ? "confirmed" : "cancelled"} />
            <Link href={`/doctors/${doctor.slug}`} className="text-sm font-semibold text-brand-deep transition-colors hover:text-navy">
              View public profile →
            </Link>
          </div>
          {sp.created === "1" && <p className="mt-4 text-sm font-medium text-mint-deep">Doctor created. Now set their weekly hours below.</p>}
        </div>
      </header>

      <section aria-labelledby="profile-heading" className="space-y-6">
        <div>
          <h2 id="profile-heading" className="font-display text-4xl text-navy">Profile</h2>
          <p className="mt-2 text-navy-soft">Public details shown on the doctor&apos;s profile and listing cards.</p>
        </div>
        <DoctorForm
          doctor={{
            id: doctor.id,
            slug: doctor.slug,
            fullName: doctor.fullName,
            title: doctor.title,
            tagline: doctor.tagline,
            bio: doctor.bio,
            photo: doctor.photo,
            specialtyId: doctor.specialtyId,
            clinicId: doctor.clinicId,
            yearsExperience: doctor.yearsExperience,
            consultationFee: doctor.consultationFee,
            slotMinutes: doctor.slotMinutes,
            languages: doctor.languages,
            qualifications: doctor.qualifications,
            isActive: doctor.isActive,
          }}
          specialties={specialties}
          clinics={clinics}
        />
      </section>

      <section aria-labelledby="schedule-heading" className="space-y-6">
        <div>
          <h2 id="schedule-heading" className="font-display text-4xl text-navy">Weekly availability</h2>
          <p className="mt-2 max-w-2xl text-navy-soft">
            Set the hours this doctor accepts patients. Open slots in the next two weeks update immediately, and booked slots
            are protected automatically.
          </p>
        </div>
        <ScheduleEditor doctorId={doctor.id} slotMinutes={doctor.slotMinutes} windows={windows} />
      </section>

      <section aria-labelledby="blocked-heading" className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 id="blocked-heading" className="font-display text-4xl text-navy">Days off</h2>
          <p className="mt-2 text-navy-soft">Block a date for leave, conferences or training. Patients will not see slots on that day.</p>
          <div className="mt-8 rounded-4xl border border-line bg-white p-6 shadow-soft">
            <BlockedDateForm doctorId={doctor.id} />
          </div>
        </div>
        <div className="lg:col-span-7">
          <div className="overflow-hidden rounded-4xl border border-line bg-white shadow-soft">
            {blocked.length === 0 ? (
              <p className="p-8 text-center text-navy-soft">No blocked dates. Every working day is open for booking.</p>
            ) : (
              <ul className="divide-y divide-line">
                {blocked.map((b) => (
                  <li key={b.id} className="flex flex-wrap items-center justify-between gap-4 p-5 transition-colors hover:bg-mist/60 sm:px-7">
                    <div>
                      <p className="font-semibold text-navy">{formatDate(b.date, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
                      <p className="text-sm text-muted">{b.reason || "Closed"}</p>
                    </div>
                    <RemoveDateButton id={b.id} doctorId={doctor.id} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
