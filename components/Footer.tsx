import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-[var(--bg)] border-t border-[var(--line)]">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex flex-col">
            <span className="text-[14px] text-[var(--ink)] mb-4 uppercase tracking-wider font-normal">
              Shop
            </span>
            <ul className="flex flex-col space-y-2">
              <li>
                <Link href="/?category=clothing" className="text-[13px] text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
                  Linen &amp; apparel
                </Link>
              </li>
              <li>
                <Link href="/?category=home" className="text-[13px] text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
                  Ceramics
                </Link>
              </li>
              <li>
                <Link href="/?category=home" className="text-[13px] text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
                  Home fragrance
                </Link>
              </li>
              <li>
                <Link href="/?category=accessories" className="text-[13px] text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
                  Objects
                </Link>
              </li>
              <li>
                <Link href="/?category=care" className="text-[13px] text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
                  Care &amp; body
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col">
            <span className="text-[14px] text-[var(--ink)] mb-4 uppercase tracking-wider font-normal">
              About
            </span>
            <ul className="flex flex-col space-y-2">
              <li>
                <Link href="/about" className="text-[13px] text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
                  Our philosophy
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[13px] text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
                  Materials &amp; craft
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[13px] text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
                  Sustainability
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[13px] text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[13px] text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
                  Stockists
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col">
            <span className="text-[14px] text-[var(--ink)] mb-4 uppercase tracking-wider font-normal">
              Stay in touch
            </span>
            <p className="text-[13px] text-[var(--muted)] mb-4">
              Receive periodic dispatches on artisanal editions and architectural objects.
            </p>
            <form className="flex items-center w-full" action="#">
              <input
                className="flex-1 h-12 bg-[var(--surface)] border border-[var(--line)] px-4 text-[13px] text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--ink)] rounded-none"
                placeholder="Enter your email"
                type="email"
              />
              <button
                className="h-12 px-6 bg-[var(--ink)] text-[var(--surface)] text-[14px] hover:bg-[var(--accent)] transition-colors rounded-none whitespace-nowrap cursor-pointer"
                type="submit"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-[var(--line)] mt-16 text-center">
          <p className="text-[12px] text-[var(--muted)]">© Anabia. Made with care.</p>
        </div>
      </div>
    </footer>
  );
}
