import type { Metadata } from "next";
import { CtaBand } from "@/components/home/CtaBand";
import { Facilities } from "@/components/home/Facilities";
import { Faq } from "@/components/home/Faq";
import { Hero, type HeroSlot } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { TrustStrip } from "@/components/home/Stats";
import { SearchDoctors } from "@/components/home/SearchDoctors";
import { Specialties } from "@/components/home/Specialties";
import { Testimonials } from "@/components/home/Testimonials";
import { WhyChoose } from "@/components/home/WhyChoose";
import { RevealItem, RevealStagger } from "@/components/motion/Reveal";
import { type GalleryItem, StickyGallery } from "@/components/motion/StickyGallery";
import { ScrollWords } from "@/components/motion/ScrollWords";

const GALLERY: GalleryItem[] = [
  {
    src: "/images/gallery/nurse-corridor.jpg",
    title: "Calm, guided arrivals",
    caption: "Staff walk you from reception to your consulting room, never rushed.",
    credit: "RDNE Stock project",
    source: "Pexels",
  },
  {
    src: "/images/gallery/doctor-phone.jpg",
    title: "Specialists who follow up",
    caption: "Clinicians stay connected between visits, so your plan keeps moving.",
    credit: "Unsplash contributor",
    source: "Unsplash",
  },
  {
    src: "/images/gallery/team-smiling.jpg",
    title: "A team that works together",
    caption: "Doctors and nurses coordinate every referral and test result.",
    credit: "RDNE Stock project",
    source: "Pexels",
  },
  {
    src: "/images/gallery/consult.jpg",
    title: "Unhurried consultations",
    caption: "Time to ask questions and understand every option before you decide.",
    credit: "cottonbro studio",
    source: "Pexels",
  },
  {
    src: "/images/gallery/clinic-reception.jpg",
    title: "Bright, welcoming clinics",
    caption: "Light-filled spaces designed to make a difficult day feel easier.",
    credit: "Unsplash contributor",
    source: "Unsplash",
  },
  {
    src: "/images/gallery/exam-room.jpg",
    title: "Modern examination rooms",
    caption: "Thoughtfully equipped rooms built for comfort and privacy.",
    credit: "Nenad Delibos",
    source: "Pexels",
  },
];
import { DoctorCard } from "@/components/doctors/DoctorCard";
import { LinkButton } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/primitives";
import { slotLabel } from "@/lib/format";
import {
  getCityOptions,
  getClinicsWithCounts,
  getFeaturedDoctors,
  getPlatformStats,
  getSpecialtiesWithCounts,
  getTopReviews,
  listDoctors,
} from "@/lib/queries";

export const metadata: Metadata = {
  title: "Vitalis · Premium Doctor Appointments",
};

export default async function HomePage() {
  const [stats, specialties, featured, soonest, clinics, reviews, cities] = await Promise.all([
    getPlatformStats(),
    getSpecialtiesWithCounts(),
    getFeaturedDoctors(4),
    listDoctors({ sort: "soonest" }),
    getClinicsWithCounts(),
    getTopReviews(8),
    getCityOptions(),
  ]);

  const heroSlots: HeroSlot[] = soonest
    .filter((d) => d.nextSlot)
    .slice(0, 2)
    .map((d) => ({
      slug: d.slug,
      name: d.fullName,
      specialty: d.specialtyName,
      when: slotLabel(d.nextSlot!),
    }));

  return (
    <>
      <Hero
        cities={cities.length}
        rating={stats.rating}
        reviewCount={stats.reviews}
        photos={featured.map((d) => ({ src: d.photo, name: d.fullName }))}
        slots={heroSlots}
      />
      <TrustStrip stats={stats} specialties={specialties.map((s) => s.name)} />
      <SearchDoctors
        specialties={specialties.map((s) => ({ slug: s.slug, name: s.name }))}
        cities={cities}
      />
      <section className="bg-white px-6 py-24 md:py-32 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <p className="mb-8 text-xs font-bold tracking-widest text-brand-deep uppercase">Our promise</p>
          <ScrollWords
            className="font-display text-4xl leading-snug tracking-tight text-navy sm:text-5xl lg:text-6xl"
            text="Every appointment is a promise we take seriously. We keep the calendar honest, the waiting short and the conversation human, from the first search to the last follow-up."
          />
        </div>
      </section>
      <Specialties items={specialties} />

      <section id="doctors" className="scroll-mt-24 bg-white py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <SectionHeading
              eyebrow="Featured specialists"
              title={
                <>
                  Highly rated doctors, <span className="text-brand italic">ready</span> when you are.
                </>
              }
              description="Hand-picked for outstanding reviews, clear communication and real-time availability."
            />
            <LinkButton href="/doctors?sort=rating" variant="light" arrow>
              See all doctors
            </LinkButton>
          </div>
          <RevealStagger className="mt-16 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {featured.map((doctor) => (
              <RevealItem key={doctor.id} className="h-full">
                <DoctorCard doctor={doctor} />
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      <HowItWorks />
      <StickyGallery items={GALLERY} />
      <WhyChoose />
      <Testimonials
        reviews={reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          patientName: r.patientName,
          doctorName: r.doctorName,
          specialtyName: r.specialtyName,
          createdAt: r.createdAt,
        }))}
      />
      <Facilities clinics={clinics} />
      <Faq />
      <CtaBand />
    </>
  );
}
