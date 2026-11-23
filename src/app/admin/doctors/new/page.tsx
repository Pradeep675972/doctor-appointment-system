import type { Metadata } from "next";
import Link from "next/link";
import { DoctorForm } from "@/components/admin/AdminForms";
import { Eyebrow } from "@/components/ui/primitives";
import { getClinicOptions, getSpecialtyOptions } from "@/lib/queries";

export const metadata: Metadata = { title: "New doctor · Admin" };

export default async function NewDoctorPage() {
  const [specialties, clinics] = await Promise.all([getSpecialtyOptions(), getClinicOptions()]);
  return (
    <div className="space-y-10">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/admin/doctors" className="transition-colors hover:text-brand-deep">
          Doctors
        </Link>
        <span aria-hidden> / </span>
        <span className="font-semibold text-navy">New</span>
      </nav>
      <header>
        <Eyebrow>New doctor</Eyebrow>
        <h1 className="mt-6 font-display text-5xl leading-none tracking-tight text-navy sm:text-6xl">
          Add a <span className="text-brand italic">specialist.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-navy-soft">
          Create the public profile first. You can set weekly hours and blocked dates once the doctor is saved.
        </p>
      </header>
      <DoctorForm specialties={specialties} clinics={clinics} />
    </div>
  );
}
