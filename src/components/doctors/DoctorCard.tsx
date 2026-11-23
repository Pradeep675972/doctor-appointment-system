import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { formatFee, slotLabel } from "@/lib/format";
import type { DoctorSummary } from "@/lib/queries";

export function DoctorCard({ doctor }: { doctor: DoctorSummary }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-4xl border border-line bg-white p-3 shadow-soft transition-all duration-500 ease-premium hover:-translate-y-2 hover:shadow-lift">
      <Link
        href={`/doctors/${doctor.slug}`}
        className="relative block aspect-4/5 overflow-hidden rounded-3xl bg-sky"
        aria-label={`View profile of ${doctor.fullName}`}
      >
        <Image
          src={doctor.photo}
          alt={doctor.fullName}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-1000 ease-premium group-hover:scale-110"
        />
        <span className="glass absolute top-3 left-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-navy">
          <Star className="h-3.5 w-3.5 fill-amber text-amber" aria-hidden />
          {doctor.reviewCount > 0 ? `${doctor.rating.toFixed(1)} (${doctor.reviewCount})` : "New"}
        </span>
        <span className="glass-dark absolute right-3 bottom-3 left-3 flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm text-white">
          {doctor.nextSlot ? (
            <>
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping-soft rounded-full bg-mint" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-mint" />
              </span>
              <span className="truncate">Next: {slotLabel(doctor.nextSlot)}</span>
            </>
          ) : (
            <span className="truncate text-white/80">Fully booked this fortnight</span>
          )}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4 pt-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-bold tracking-widest text-brand-deep uppercase">{doctor.specialtyName}</span>
          <span className="truncate text-sm text-muted">{doctor.clinicCity}</span>
        </div>
        <h3 className="font-display text-3xl leading-none text-navy">
          <Link href={`/doctors/${doctor.slug}`} className="transition-colors hover:text-brand-deep">
            {doctor.fullName}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-navy-soft">{doctor.tagline}</p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <p className="text-xs text-muted">Consultation</p>
            <p className="text-lg font-semibold text-navy">{formatFee(doctor.consultationFee)}</p>
          </div>
          <div className="flex gap-2">
            <LinkButton href={`/doctors/${doctor.slug}`} variant="light" size="sm">
              Profile
            </LinkButton>
            <LinkButton href={`/doctors/${doctor.slug}#availability`} variant="primary" size="sm">
              Book
            </LinkButton>
          </div>
        </div>
      </div>
    </article>
  );
}
