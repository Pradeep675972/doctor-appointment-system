import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BookingFlow } from "@/components/doctors/BookingFlow";
import { Eyebrow } from "@/components/ui/primitives";
import { isChangeable } from "@/lib/appointment-rules";
import { requireUser } from "@/lib/auth";
import { formatDate, formatTime } from "@/lib/format";
import { getAppointmentForUser, getDoctorProfile } from "@/lib/queries";
import { getDaySlotsFor } from "@/lib/scheduling";

export const metadata: Metadata = { title: "Reschedule appointment" };

type Params = Promise<{ id: string }>;

export default async function ReschedulePage({ params }: { params: Params }) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  const user = await requireUser(`/dashboard/appointments/${rawId}/reschedule`);
  if (!Number.isInteger(id)) notFound();

  const appointment = await getAppointmentForUser(id, user.id);
  if (!appointment) notFound();
  if (!isChangeable(appointment)) redirect(`/dashboard/appointments/${id}`);

  const [doctor, days] = await Promise.all([
    getDoctorProfile(appointment.doctorSlug),
    getDaySlotsFor(appointment.doctorId, { excludeAppointmentId: appointment.id }),
  ]);
  if (!doctor) notFound();

  const currentLabel = `${formatDate(appointment.date, { weekday: "short", month: "short", day: "numeric" })} at ${formatTime(appointment.time)}`;

  return (
    <section className="space-y-10">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href={`/dashboard/appointments/${appointment.id}`} className="transition-colors hover:text-brand-deep">
          Appointment #{appointment.id}
        </Link>
        <span aria-hidden> / </span>
        <span className="font-semibold text-navy">Reschedule</span>
      </nav>

      <div className="max-w-3xl">
        <Eyebrow>Reschedule</Eyebrow>
        <h1 className="mt-6 font-display text-5xl leading-none tracking-tight text-navy sm:text-6xl">
          Find a <span className="text-brand italic">better time.</span>
        </h1>
        <p className="mt-5 text-lg text-navy-soft">
          Choose a new open slot with {doctor.fullName}. Your current time is released as soon as you confirm.
        </p>
      </div>

      <BookingFlow
        mode="reschedule"
        appointmentId={appointment.id}
        currentLabel={currentLabel}
        initialVisitType={appointment.visitType}
        doctor={{
          id: doctor.id,
          slug: doctor.slug,
          fullName: doctor.fullName,
          title: doctor.title,
          specialtyName: doctor.specialtyName,
          clinicName: doctor.clinic.name,
          clinicAddress: doctor.clinic.address,
          photo: doctor.photo,
          consultationFee: doctor.consultationFee,
        }}
        days={days}
        initialSelection={null}
      />
    </section>
  );
}
