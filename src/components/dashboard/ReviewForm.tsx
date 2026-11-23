"use client";

import { Star } from "lucide-react";
import { useActionState, useState } from "react";
import { submitReviewAction } from "@/app/actions/appointments";
import { SubmitButton } from "@/components/ui/Button";
import { FormNotice, Textarea } from "@/components/ui/Field";
import { initialActionState } from "@/lib/action-state";

export function ReviewForm({ appointmentId, doctorName }: { appointmentId: number; doctorName: string }) {
  const [state, formAction] = useActionState(submitReviewAction, initialActionState);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const shown = hover || rating;

  if (state.ok) {
    return <FormNotice state={state} />;
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <input type="hidden" name="rating" value={rating} />

      <fieldset>
        <legend className="font-display text-2xl text-navy">How was your visit with {doctorName}?</legend>
        <div role="radiogroup" aria-label="Rating" className="mt-4 flex gap-2" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={rating === value}
              aria-label={`${value} star${value === 1 ? "" : "s"}`}
              onMouseEnter={() => setHover(value)}
              onFocus={() => setHover(value)}
              onBlur={() => setHover(0)}
              onClick={() => setRating(value)}
              className="rounded-full p-1 transition-transform duration-300 hover:scale-110 active:scale-90"
            >
              <Star className={`h-9 w-9 transition-colors duration-200 ${shown >= value ? "fill-amber text-amber" : "text-line"}`} aria-hidden />
            </button>
          ))}
        </div>
      </fieldset>

      <Textarea name="comment" label="Share a few words (optional)" rows={3} maxLength={600} placeholder="What did the doctor do well?" />
      <FormNotice state={state} />
      <SubmitButton variant="dark" pendingLabel="Sending review…">
        Submit review
      </SubmitButton>
    </form>
  );
}
