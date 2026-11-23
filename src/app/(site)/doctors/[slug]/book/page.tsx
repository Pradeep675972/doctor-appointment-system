import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingFlow } from "@/components/doctors/BookingFlow";
import { Eyebrow } from "@/components/ui/primitives";
import { requireUser } from "@/lib/auth";
import { formatDate, formatTime } from "@/lib/format";
import { getDoctorProfile } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Book an appointment",
  robots: { index: false },
};

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ date?: string; time?: string }>;

const isDate = (v?: string) => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);
const isTimeValue = (v?: string) => !!v && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);

export default async function BookAppointmentPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const initialDate = isDate(sp.date) ? sp.date! : null;
  const initialTime = isTimeValue(sp.time) ? sp.time! : null;

  const query = initialDate ? `?date=${initialDate}${initialTime ? `&time=${initialTime}` : ""}` : "";
  await requireUser(`/doctors/${slug}/book${query}`);

  const doctor = await getDoctorProfile(slug);
  if (!doctor) notFound();

  return (
    <section className="mesh-hero relative min-h-screen overflow-hidden pt-32 pb-24 lg:pt-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href={`/doctors/${doctor.slug}`} className="transition-colors hover:text-brand-deep">
                {doctor.fullName}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="font-semibold text-navy">
              Book
            </li>
          </ol>
        </nav>

        <div className="mt-8 max-w-3xl">
          <Eyebrow>Step 2 of 2 · Choose your time</Eyebrow>
          <h1 className="mt-6 font-display text-5xl leading-none tracking-tight text-navy sm:text-6xl">
            Book with <span className="text-brand italic">{doctor.fullName}</span>
          </h1>
          <p className="mt-5 text-lg text-navy-soft">
            Pick an open time, choose how you would like to be seen, and send your request. You will receive a status
            update in your dashboard.
          </p>
        </div>

        <div className="mt-14">
          <BookingFlow
            mode="book"
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
            days={doctor.days}
            initialSelection={initialDate && initialTime ? { date: initialDate, time: initialTime } : null}
          />
        </div>
        {initialDate && initialTime && (
          <p className="mt-8 text-sm text-muted">
            Selected {formatDate(initialDate, { weekday: "long", month: "long", day: "numeric" })} at{" "}
            {formatTime(initialTime)}. Change the time above if you need a different slot.
          </p>
        )}
      </div>
    </section>
  );
}
