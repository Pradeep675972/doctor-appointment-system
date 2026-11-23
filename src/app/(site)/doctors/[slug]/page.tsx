import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Building2, CalendarCheck2, Clock, MapPin, Phone, Languages, Video } from "lucide-react";
import { AvailabilityPanel } from "@/components/doctors/AvailabilityPanel";
import { Counter } from "@/components/motion/Counter";
import { Reveal } from "@/components/motion/Reveal";
import { LinkButton } from "@/components/ui/Button";
import { Eyebrow, SectionHeading, Stars } from "@/components/ui/primitives";
import { formatDate, formatFee, slotLabel } from "@/lib/format";
import { getDoctorProfile } from "@/lib/queries";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const doctor = await getDoctorProfile(slug);
  if (!doctor) return { title: "Doctor not found" };
  return {
    title: `${doctor.fullName} · ${doctor.specialtyName}`,
    description: doctor.tagline,
  };
}

export default async function DoctorProfilePage({ params }: { params: Params }) {
  const { slug } = await params;
  const doctor = await getDoctorProfile(slug);
  if (!doctor) notFound();

  const nextLabel = doctor.nextSlot ? slotLabel(doctor.nextSlot) : "No openings in the next two weeks";
  const distributionTotal = doctor.ratingCounts.reduce((sum, n) => sum + n, 0);

  return (
    <>
      <section className="mesh-hero relative overflow-hidden pt-32 pb-20 lg:pt-40">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-12 lg:px-10">
          <nav aria-label="Breadcrumb" className="text-sm text-muted lg:col-span-12">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/doctors" className="transition-colors hover:text-brand-deep">
                  Doctors
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href={`/doctors?specialty=${doctor.specialtySlug}`} className="transition-colors hover:text-brand-deep">
                  {doctor.specialtyName}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="font-semibold text-navy">
                {doctor.fullName}
              </li>
            </ol>
          </nav>

          <div className="lg:col-span-5">
            <Reveal y={60}>
              <div className="relative mx-auto aspect-4/5 max-w-md overflow-hidden rounded-5xl shadow-lift lg:max-w-none">
                <Image
                  src={doctor.photo}
                  alt={`Portrait of ${doctor.fullName}`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  className="object-cover transition-transform duration-1000 hover:scale-105"
                />
                <div className="glass absolute right-4 bottom-4 left-4 flex items-center gap-4 rounded-3xl p-5">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-mint-soft text-mint-deep">
                    <CalendarCheck2 className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-xs font-bold tracking-widest text-muted uppercase">Next available</p>
                    <p className="font-semibold text-navy">{nextLabel}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal>
              <Eyebrow>{doctor.specialtyName}</Eyebrow>
              <h1 className="mt-6 font-display text-6xl leading-none tracking-tight text-navy sm:text-7xl">
                {doctor.fullName}
              </h1>
              <p className="mt-4 text-lg font-semibold text-brand-deep">{doctor.title}</p>
              <p className="mt-6 max-w-2xl text-xl leading-relaxed text-navy-soft">{doctor.tagline}</p>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-4xl border border-line bg-line sm:grid-cols-4">
                <div className="bg-white p-6">
                  <p className="font-display text-4xl leading-none text-navy">
                    <Counter to={doctor.yearsExperience} />
                  </p>
                  <p className="mt-2 text-sm text-muted">Years experience</p>
                </div>
                <div className="bg-white p-6">
                  <p className="font-display text-4xl leading-none text-navy">{doctor.reviewCount ? doctor.rating.toFixed(1) : "New"}</p>
                  {doctor.reviewCount > 0 && <Stars value={doctor.rating} size={14} className="mt-2" />}
                  <p className="mt-2 text-sm text-muted">Patient rating</p>
                </div>
                <div className="bg-white p-6">
                  <p className="font-display text-4xl leading-none text-navy">
                    <Counter to={doctor.reviewCount} />
                  </p>
                  <p className="mt-2 text-sm text-muted">Verified reviews</p>
                </div>
                <div className="bg-white p-6">
                  <p className="font-display text-4xl leading-none text-navy">{formatFee(doctor.consultationFee)}</p>
                  <p className="mt-2 text-sm text-muted">Consultation fee</p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-8 flex flex-wrap items-center gap-2">
                <Languages className="mr-2 h-5 w-5 text-brand" aria-hidden />
                {doctor.languages.map((language) => (
                  <span key={language} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-navy-soft ring-1 ring-line">
                    {language}
                  </span>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-navy-soft">
                <span className="inline-flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-brand" aria-hidden />
                  {doctor.clinic.name}
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brand" aria-hidden />
                  {doctor.clinic.city}, {doctor.clinic.country}
                </span>
              </div>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <LinkButton href="#availability" size="lg" magnetic arrow>
                  Book Appointment
                </LinkButton>
                <LinkButton href="#reviews" size="lg" variant="light">
                  Read reviews
                </LinkButton>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-12 lg:px-10">
          <div className="space-y-24 lg:col-span-8">
            <div id="about" className="scroll-mt-28">
              <SectionHeading eyebrow="About" title={<>Care rooted in <span className="text-brand italic">clarity.</span></>} description={doctor.bio} />
              <div className="mt-12 grid gap-6 md:grid-cols-2">
                <div className="rounded-4xl border border-line bg-mist p-8">
                  <h3 className="font-display text-3xl text-navy">Qualifications</h3>
                  <ul className="mt-6 space-y-4">
                    {doctor.qualifications.map((item) => (
                      <li key={item} className="flex gap-3 text-base leading-relaxed text-navy-soft">
                        <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-mint" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="overflow-hidden rounded-4xl border border-line bg-white">
                  <div className="relative aspect-4/3">
                    <Image src={doctor.clinic.image} alt={`${doctor.clinic.name} consulting area`} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover transition-transform duration-1000 hover:scale-105" />
                  </div>
                  <div className="p-6">
                    <p className="font-display text-2xl text-navy">{doctor.clinic.name}</p>
                    <p className="mt-2 text-sm text-navy-soft">{doctor.clinic.address}</p>
                    <ul className="mt-4 space-y-2 text-sm text-navy-soft">
                      <li className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-brand" aria-hidden /> {doctor.clinic.hours}
                      </li>
                      <li className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-brand" aria-hidden />
                        <a href={`tel:${doctor.clinic.phone.replace(/\s+/g, "")}`} className="transition-colors hover:text-brand-deep">
                          {doctor.clinic.phone}
                        </a>
                      </li>
                      <li className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-brand" aria-hidden /> In person or video consultation
                      </li>
                    </ul>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {doctor.clinic.features.map((f) => (
                        <span key={f} className="rounded-full bg-mist px-3 py-1.5 text-xs font-semibold text-navy-soft">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div id="availability" className="scroll-mt-28">
              <SectionHeading
                eyebrow="Availability"
                title={<>Choose a time that <span className="text-brand italic">suits you.</span></>}
                description={`Next two weeks · ${doctor.slotMinutes}-minute consultations`}
              />
              <div className="mt-12">
                <AvailabilityPanel doctorSlug={doctor.slug} days={doctor.days} />
              </div>
            </div>

            <div id="reviews" className="scroll-mt-28">
              <SectionHeading
                eyebrow="Reviews"
                title={
                  doctor.reviewCount > 0 ? (
                    <>
                      {doctor.rating.toFixed(1)} <span className="text-brand italic">out of 5.</span>
                    </>
                  ) : (
                    <>No reviews <span className="text-brand italic">yet.</span></>
                  )
                }
                description={doctor.reviewCount > 0 ? `Based on ${doctor.reviewCount} verified visits.` : "Be among the first to share your experience after a visit."}
              />
              {doctor.reviewCount > 0 && (
                <div className="mt-12 grid gap-10 lg:grid-cols-12">
                  <div className="space-y-3 rounded-4xl border border-line bg-mist p-8 lg:col-span-4">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = doctor.ratingCounts[star - 1];
                      const pct = distributionTotal ? Math.round((count / distributionTotal) * 100) : 0;
                      return (
                        <div key={star} className="flex items-center gap-3 text-sm">
                          <span className="w-8 font-semibold text-navy">{star}★</span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white">
                            <div className="h-full rounded-full bg-linear-to-r from-brand to-mint transition-all duration-1000" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-10 text-right text-muted">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 lg:col-span-8">
                    {doctor.reviews.map((review) => (
                      <article key={review.id} className="rounded-4xl border border-line bg-white p-7 shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-lift">
                        <Stars value={review.rating} size={16} />
                        <p className="mt-4 font-display text-2xl leading-snug text-navy italic">
                          {review.comment ? `“${review.comment}”` : "Great experience."}
                        </p>
                        <p className="mt-5 text-sm text-muted">
                          {review.reviewer} · {formatDate(review.createdAt.toISOString().slice(0, 10), { month: "short", year: "numeric" })}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="mesh-navy sticky top-28 space-y-6 overflow-hidden rounded-5xl bg-navy p-8 text-white shadow-lift">
              <div>
                <p className="text-xs font-bold tracking-widest text-white/60 uppercase">Consultation</p>
                <p className="mt-2 font-display text-6xl leading-none">{formatFee(doctor.consultationFee)}</p>
                <p className="mt-2 text-sm text-white/70">{doctor.slotMinutes}-minute visit · {doctor.clinic.city}</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-5">
                <p className="text-xs font-bold tracking-widest text-white/60 uppercase">Next available</p>
                <p className="mt-2 flex items-center gap-3 font-semibold">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className={`absolute inline-flex h-full w-full rounded-full ${doctor.nextSlot ? "animate-ping-soft bg-mint" : "bg-white/40"}`} />
                    <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${doctor.nextSlot ? "bg-mint" : "bg-white/40"}`} />
                  </span>
                  {nextLabel}
                </p>
              </div>
              <LinkButton href="#availability" block size="lg" arrow magnetic>
                Book Appointment
              </LinkButton>
              <p className="text-center text-xs text-white/60">Requests are confirmed by the clinic. Cancel or reschedule anytime from your dashboard.</p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
