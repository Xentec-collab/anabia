import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getArticleBySlug, JOURNAL_ARTICLES } from "@/lib/journalData";

export async function generateStaticParams() {
  return JOURNAL_ARTICLES.map(article => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  
  if (!article) return { title: "Article Not Found — Anabia" };
  
  return {
    title: `${article.title} — Anabia Journal`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [{ url: article.image_url }],
    },
  };
}

export default async function JournalArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto px-6 pt-6 pb-24">
        {/* Top Navigation */}
        <div className="mb-8">
          <Link
            href="/journal"
            className="inline-flex items-center gap-1.5 text-[13px] text-[var(--muted)] hover:text-[var(--ink)] transition-colors group"
          >
            <span className="transition-transform duration-150 group-hover:-translate-x-0.5">
              ←
            </span>
            <span>Back to journal</span>
          </Link>
        </div>

        {/* Hero Image */}
        <div className="aspect-[21/9] w-full max-w-4xl mx-auto bg-[#F2F1EF] overflow-hidden relative border border-[var(--line)]/40 mb-12">
          <Image
            src={article.image_url}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 896px"
            className="object-cover object-center"
          />
        </div>

        {/* Article Header */}
        <div className="max-w-3xl mx-auto mb-10 text-center">
          <div className="text-[12px] text-[var(--muted)] uppercase tracking-wider mb-4">
            {article.date} • {article.readingTime}
          </div>
          <h1 className="font-serif text-[32px] md:text-[40px] text-[var(--ink)] font-normal leading-tight">
            {article.title}
          </h1>
        </div>

        {/* Article Body */}
        <div className="max-w-3xl mx-auto">
          <p className="text-[15px] leading-[1.8] text-[var(--muted)] font-normal whitespace-pre-line">
            {article.body}
          </p>
        </div>
      </div>
    </div>
  );
}
