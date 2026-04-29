import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Can I use text only?",
    a: "Yes. Describe the symptoms in plain language and our text model will run a full analysis even without a photo. Adding an image always improves accuracy.",
  },
  {
    q: "Can I upload an image only?",
    a: "Absolutely. The vision model can identify most common diseases from a clear close-up leaf photo alone — no description required.",
  },
  {
    q: "How accurate is hybrid diagnosis?",
    a: "On our benchmark of 32 crop diseases, the hybrid model reaches 94% top-1 accuracy — significantly higher than either model alone, because image and text errors rarely overlap.",
  },
  {
    q: "What should I do if confidence is low?",
    a: "Capture a sharper close-up in natural daylight, add more symptom details, and re-run the diagnosis. If confidence stays below 60%, consult a local agronomist.",
  },
  {
    q: "Does it work offline?",
    a: "The web app needs an internet connection for inference, but we cache your last 10 diagnoses for offline review.",
  },
];

export function FAQ() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">
            FAQ
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold">
            Frequently asked questions
          </h2>
        </div>

        <Accordion type="single" collapsible className="mt-12 space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="rounded-2xl bg-card border border-border/50 px-5 shadow-soft hover:shadow-card transition-smooth"
            >
              <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
