"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/app/actions/profile";
import { SubmitButton } from "@/components/ui/Button";
import { FormNotice, Input, Select, Textarea } from "@/components/ui/Field";
import { initialActionState } from "@/lib/action-state";
import { BLOOD_GROUPS, GENDERS } from "@/lib/format";

type ProfileValues = {
  fullName: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  bloodGroup: string | null;
  allergies: string | null;
  conditions: string | null;
  emergencyName: string | null;
  emergencyPhone: string | null;
};

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-8 rounded-5xl border border-line bg-white p-6 shadow-soft sm:p-10 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <h2 className="font-display text-3xl text-navy">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-navy-soft">{description}</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:col-span-8">{children}</div>
    </section>
  );
}

export function ProfileForm({ user }: { user: ProfileValues }) {
  const [state, formAction] = useActionState(updateProfileAction, initialActionState);

  return (
    <form action={formAction} className="space-y-8">
      <Section title="Personal details" description="How the clinic should address you and how to reach you.">
        <Input name="fullName" label="Full name" defaultValue={user.fullName} error={state.errors?.fullName} />
        <Input name="email" label="Email address" defaultValue={user.email} disabled hint="Your sign-in email can't be changed here." />
        <Input name="phone" type="tel" label="Phone number" defaultValue={user.phone ?? ""} placeholder="+1 555 000 0000" error={state.errors?.phone} />
        <Input name="dateOfBirth" type="date" label="Date of birth" defaultValue={user.dateOfBirth ?? ""} error={state.errors?.dateOfBirth} />
        <Select name="gender" label="Gender" defaultValue={user.gender ?? ""}>
          <option value="">Prefer not to say</option>
          {GENDERS.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </Select>
      </Section>

      <Section title="Medical information" description="Shared with your clinic to keep prescriptions and treatments safe.">
        <Select name="bloodGroup" label="Blood group" defaultValue={user.bloodGroup ?? ""}>
          <option value="">Unknown</option>
          {BLOOD_GROUPS.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </Select>
        <div className="hidden sm:block" aria-hidden />
        <div className="sm:col-span-2">
          <Textarea name="allergies" label="Allergies" rows={2} defaultValue={user.allergies ?? ""} hint="Medications, foods or materials to avoid." maxLength={500} />
        </div>
        <div className="sm:col-span-2">
          <Textarea name="conditions" label="Ongoing conditions" rows={2} defaultValue={user.conditions ?? ""} hint="Chronic conditions or current treatments." maxLength={500} />
        </div>
      </Section>

      <Section title="Emergency contact" description="Someone we can reach if you are unable to speak for yourself.">
        <Input name="emergencyName" label="Contact name" defaultValue={user.emergencyName ?? ""} />
        <Input name="emergencyPhone" type="tel" label="Contact phone" defaultValue={user.emergencyPhone ?? ""} error={state.errors?.emergencyPhone} />
      </Section>

      <Section title="Security" description="Leave these blank unless you want to change your password.">
        <Input name="currentPassword" type="password" autoComplete="current-password" label="Current password" error={state.errors?.currentPassword} />
        <Input name="newPassword" type="password" autoComplete="new-password" label="New password" placeholder="At least 8 characters" error={state.errors?.newPassword} />
      </Section>

      <div className="sticky bottom-4 z-10 flex flex-col gap-4 rounded-4xl glass p-4 shadow-lift sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="min-w-0 flex-1">
          <FormNotice state={state} />
          {!state.message && <p className="text-sm text-muted">Changes are saved securely to your Vitalis profile.</p>}
        </div>
        <SubmitButton size="lg" pendingLabel="Saving…" arrow>
          Save changes
        </SubmitButton>
      </div>
    </form>
  );
}
