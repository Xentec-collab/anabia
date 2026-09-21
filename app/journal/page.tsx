import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { JOURNAL_ARTICLES } from "@/lib/journalData";

export const metadata: Metadata = {
  title: "Journal — Anabia",
  description: "Stories behind the objects. Essays on materials, craft, and intentional living.",
};

export default function JournalPage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="h-[200px] flex flex-col items-center justify-center border-b border-[var(--line)] bg-[var(--surface)] mb-16">
        <h1 className="font-serif text-[36px] md:text-[40px] text-[var(--ink)] font-normal">
          Journal
        </h1>
      </div>

      {/* Grid */}
      <div className="max-w-4xl mx-auto px-6 pb-24 grid grid-cols-1 gap-12">
        {JOURNAL_ARTICLES.map((article) => (
          <Link
            key={article.slug}
            href={`/journal/${article.slug}`}
            className="group flex flex-col"
          >
            <div className="aspect-[16/9] w-full bg-[#F2F1EF] overflow-hidden relative border border-[var(--line)]/40 mb-5">
              <Image
                src={article.image_url}
                alt={article.title}
                fill
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>
            
            <div className="text-[12px] text-[var(--muted)] uppercase tracking-wider mb-2">
              {article.date} • {article.readingTime}
            </div>
            
            <h2 className="font-serif text-[22px] text-[var(--ink)] mt-2 transition-colors group-hover:text-[var(--accent)]">
              {article.title}
            </h2>
            
            <p className="text-[14px] text-[var(--muted)] leading-relaxed mt-2 line-clamp-3">
              {article.excerpt}
            </p>
            
            <span className="text-[13px] text-[var(--ink)] mt-3 inline-block font-medium group-hover:underline underline-offset-4 decoration-[var(--line)] transition-all">
              Read more →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
