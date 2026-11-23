import { Bell, CalendarCheck, Lock, Receipt, ShieldCheck, Video } from "lucide-react";
import { RevealItem, RevealStagger } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/ui/primitives";

const SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"];
const BOOKED = new Set(["09:30", "10:30", "14:30", "16:00"]);

function cardClass(extra = "") {
  return `group relative flex h-full flex-col overflow-hidden rounded-4xl border border-line bg-white p-8 shadow-soft transition-all duration-500 ease-premium hover:-translate-y-1.5 hover:shadow-lift ${extra}`;
}

function IconBubble({ children, tone = "sky" }: { children: React.ReactNode; tone?: "sky" | "mint" | "navy" }) {
  const toneClass = {
    sky: "bg-sky text-brand-deep group-hover:bg-brand group-hover:text-white",
    mint: "bg-mint-soft text-mint-deep group-hover:bg-mint group-hover:text-white",
    navy: "bg-white/10 text-white group-hover:bg-mint",
  }[tone];
  return (
    <span className={`grid h-14 w-14 place-items-center rounded-2xl transition-all duration-500 group-hover:-rotate-6 ${toneClass}`}>
      {children}
    </span>
  );
}

export function WhyChoose() {
  return (
    <section className="bg-mist py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow="Why Vitalis"
          title={
            <>
              Healthcare that feels <span className="text-brand italic">considered.</span>
            </>
          }
          description="Every detail, from the first search to the follow-up, is designed to make care easier to access and easier to trust."
        />

        <RevealStagger className="mt-16 grid gap-6 md:grid-cols-3">
          <RevealItem className="md:col-span-2">
            <div className={cardClass("min-h-96")}>
              <IconBubble>
                <CalendarCheck className="h-6 w-6" aria-hidden />
              </IconBubble>
              <h3 className="mt-8 font-display text-4xl leading-none text-navy">Real-time availability, zero double-bookings.</h3>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-navy-soft">
                Slots update the instant someone books. Our booking engine checks every request against the clinic&apos;s
                live calendar, so two patients can never receive the same time.
              </p>
              <div className="mt-auto grid grid-cols-4 gap-2 pt-10 sm:grid-cols-6">
                {SLOTS.map((slot) => {
                  const booked = BOOKED.has(slot);
                  return (
                    <span
                      key={slot}
                      className={`rounded-xl px-2 py-2 text-center text-xs font-semibold transition-all duration-500 ${
                        booked
                          ? "bg-mist text-muted line-through"
                          : "bg-mint-soft text-mint-deep group-hover:bg-mint group-hover:text-white"
                      }`}
                    >
                      {slot}
                    </span>
                  );
                })}
              </div>
            </div>
          </RevealItem>

          <RevealItem>
            <div className={cardClass("bg-navy! border-navy text-white")}>
              <div aria-hidden className="mesh-navy absolute inset-0 opacity-80" />
              <div className="relative flex h-full flex-col">
                <IconBubble tone="navy">
                  <ShieldCheck className="h-6 w-6" aria-hidden />
                </IconBubble>
                <h3 className="mt-8 font-display text-4xl leading-none">Verified specialists only.</h3>
                <p className="mt-4 text-base leading-relaxed text-white/75">
                  Credentials, licences and training are reviewed before a doctor is listed on Vitalis.
                </p>
              </div>
            </div>
          </RevealItem>

          <RevealItem>
            <div className={cardClass()}>
              <IconBubble tone="mint">
                <Receipt className="h-6 w-6" aria-hidden />
              </IconBubble>
              <h3 className="mt-8 font-display text-4xl leading-none text-navy">Transparent fees.</h3>
              <p className="mt-4 text-base leading-relaxed text-navy-soft">
                The consultation fee is shown on every profile and booking summary. No hidden extras.
              </p>
            </div>
          </RevealItem>

          <RevealItem>
            <div className={cardClass()}>
              <IconBubble>
                <Video className="h-6 w-6" aria-hidden />
              </IconBubble>
              <h3 className="mt-8 font-display text-4xl leading-none text-navy">In person or on video.</h3>
              <p className="mt-4 text-base leading-relaxed text-navy-soft">
                Choose the format that suits your day when you book, and switch with a simple reschedule.
              </p>
            </div>
          </RevealItem>

          <RevealItem>
            <div className={cardClass()}>
              <IconBubble tone="mint">
                <Bell className="h-6 w-6" aria-hidden />
              </IconBubble>
              <h3 className="mt-8 font-display text-4xl leading-none text-navy">Status you can see.</h3>
              <p className="mt-4 text-base leading-relaxed text-navy-soft">
                From awaiting confirmation to completed, every visit has a clear status in your dashboard.
              </p>
            </div>
          </RevealItem>

          <RevealItem className="md:col-span-3">
            <div className="group relative grid items-center gap-8 overflow-hidden rounded-4xl border border-line bg-white p-8 shadow-soft transition-all duration-500 hover:shadow-lift sm:p-10 lg:grid-cols-3">
              <div className="flex items-start gap-5 lg:col-span-2">
                <IconBubble>
                  <Lock className="h-6 w-6" aria-hidden />
                </IconBubble>
                <div>
                  <h3 className="font-display text-4xl leading-none text-navy">Private by design.</h3>
                  <p className="mt-3 max-w-xl text-base leading-relaxed text-navy-soft">
                    Your medical details are visible only to you and the clinic team. Update allergies, conditions and
                    emergency contacts whenever they change.
                  </p>
                </div>
              </div>
              <p className="font-display text-6xl leading-none text-brand/25 transition-colors duration-500 group-hover:text-brand lg:text-right">
                Encrypted at rest &amp; in transit
              </p>
            </div>
          </RevealItem>
        </RevealStagger>
      </div>
    </section>
  );
}
