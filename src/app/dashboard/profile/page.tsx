import type { Metadata } from "next";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { Eyebrow } from "@/components/ui/primitives";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "My profile" };

export default async function ProfilePage() {
  const user = await requireUser("/dashboard/profile");
  return (
    <div className="space-y-10">
      <div className="max-w-3xl">
        <Eyebrow>Profile & medical information</Eyebrow>
        <h1 className="mt-6 font-display text-5xl leading-none tracking-tight text-navy sm:text-6xl">
          Your details, <span className="text-brand italic">kept current.</span>
        </h1>
        <p className="mt-5 text-lg text-navy-soft">
          Member since {formatDate(user.createdAt.toISOString().slice(0, 10), { month: "long", year: "numeric" })}. Clinic
          teams see this information to keep your care safe.
        </p>
      </div>
      <ProfileForm
        user={{
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          bloodGroup: user.bloodGroup,
          allergies: user.allergies,
          conditions: user.conditions,
          emergencyName: user.emergencyName,
          emergencyPhone: user.emergencyPhone,
        }}
      />
    </div>
  );
}
