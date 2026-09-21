import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Anabia",
  description: "Considered things for considered people. Our philosophy, materials, and commitment to sustainability.",
};

export default function AboutPage() {
  return (
    <div className="w-full bg-[var(--bg)] min-h-screen">
      <div className="w-full h-[200px] flex flex-col items-center justify-center pt-10">
        <h1 className="font-serif text-[36px] md:text-[40px] text-[var(--ink)] mb-6">
          About Anabia
        </h1>
        <div className="w-12 h-[1px] bg-[var(--line)]" />
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-24">
        <section>
          <h2 className="font-serif text-[24px] text-[var(--ink)] mb-6">Our Philosophy</h2>
          <p className="text-[14px] leading-relaxed text-[var(--muted)] whitespace-pre-wrap">
            Anabia was born from a simple conviction: the things we surround ourselves with should be made with intention. We curate and produce small-batch homewares, garments, and handcrafted objects that are designed to endure — not just physically, but emotionally.

            Every piece in our collection is chosen for its quiet beauty, honest construction, and the story of the hands that made it. We believe in slow commerce — taking time to source, to make, and to deliver things that matter.
          </p>
        </section>

        <div className="w-full h-[1px] bg-[var(--line)] my-12" />

        <section>
          <h2 className="font-serif text-[24px] text-[var(--ink)] mb-6">Materials & Craft</h2>
          <p className="text-[14px] leading-relaxed text-[var(--muted)] whitespace-pre-wrap">
            We work exclusively with natural, minimally processed materials: organic linen, unglazed stoneware, beeswax, raw brass, mulberry silk. Each material is selected for its tactile quality and its ability to age gracefully.

            Our artisans are regional masters — weavers in Kutch, potters in Khurja, brass workers in Moradabad. We maintain direct relationships with every maker, ensuring fair compensation and preserving traditional craft techniques.
          </p>
        </section>

        <div className="w-full h-[1px] bg-[var(--line)] my-12" />

        <section>
          <h2 className="font-serif text-[24px] text-[var(--ink)] mb-6">Sustainability</h2>
          <p className="text-[14px] leading-relaxed text-[var(--muted)]">
            Sustainability at Anabia isn't a marketing label — it's the foundation of every decision we make.
          </p>
          <ul className="text-[14px] leading-relaxed text-[var(--muted)] mt-4 space-y-2">
            <li>• Plastic-free, unbleached paper packaging</li>
            <li>• Carbon-neutral dispatch via regional courier partners</li>
            <li>• Zero-waste studio practices</li>
            <li>• Small-batch production to eliminate overstock</li>
            <li>• Direct artisan partnerships reducing supply chain waste</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
