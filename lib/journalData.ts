export interface JournalArticle {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  image_url: string;
  body: string;
}

export const JOURNAL_ARTICLES: JournalArticle[] = [
  {
    slug: "the-linen-season",
    title: "The Linen Season",
    excerpt: "Why we wait for the right harvest before cutting a single panel — and why you should care about where your fabric begins.",
    date: "September 2026",
    readingTime: "4 min read",
    image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDmX3KormHYbutSbXybG6ONE4M0iDUCls7UUyBzSuvWORWzah0BAMbQCGvJykJP44EeFz_hB_blSuH-UfA0tyyVbZ2rnuSQMKaIrNP4n0pun4dxGkgEhdn-Z2Yxv2FxK1XUzKTkTSjF9_2TeRbtmtWYKNm8JItLx4jxwTL3ORa0x694jbxIfAlkPThQak95Jfq2o5Ew3WQ2ymafraYu9ocmybedPpOPNvumcyGjkdxpNm91AfK8-1xn",
    body: `Linen is not simply a fabric — it is a calendar. The flax plant that becomes your overshirt was sown in March, harvested in July, and retted through the late monsoon months before being spun in small workshops across Belgium and Kutch.\n\nAt Anabia, we do not rush this process. We wait for the fibres to reach the exact hand-feel we want: slightly slubby, cool to the touch, with that characteristic dry drape that softens beautifully over time. Each harvest yields a slightly different texture, and we consider this a feature, not a flaw.\n\nOur linen pieces are garment-washed once before they reach you, giving them an immediate softness while preserving the raw character of the cloth. No chemical softeners, no resin finishes. Just water, time, and air.\n\nThe result is a fabric that tells time — it creases where you bend, fades where the sun catches it, and develops a patina that is entirely your own. After six months, your Anabia linen overshirt will look nothing like it did on the day it arrived. It will look better.`
  },
  {
    slug: "on-clay-and-quiet",
    title: "On Clay & Quiet",
    excerpt: "A visit to our ceramic studio in Khurja, where every mug begins as a lump of river clay and ends as a vessel for morning ritual.",
    date: "August 2026",
    readingTime: "5 min read",
    image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAu2A0ewYASPD60d6k5kT0a6UlFeXnt2zWTnOmPSNGjd8MAAd7PonzrS_c701JT-MOKV9lHGVJThI1FvLL0FFNB_6gtq5C5XUzzuECVZtORjskqS9vkoCQDZneyWLUuKJOeDXaJfLC0hLUBEUVjTJ0ZjuOvGNF60DKKfdoDw8H4IbxolcNiChfMFdFegy_Zih01pfVc2icGDwPc2Tup7VHk6ZU2b0H31uZhuIEUGCXhgKFJSq04Pgwc",
    body: `Khurja sits about ninety kilometres southeast of Delhi, in a belt of Uttar Pradesh known informally as the pottery corridor. The town has been making ceramics for over six hundred years, and when you arrive, you can feel it: the air smells faintly of kiln smoke, and the roadside is lined with towers of terracotta in every conceivable shade of earth.\n\nOur studio partner, Raza Bhai, is a third-generation potter. His workshop is a single large room with high windows that let in slanted morning light. There are no machines here beyond a single kick wheel and a small electric kiln. Everything else is done by hand.\n\nThe clay comes from the nearby Ganges floodplain — a dense, iron-rich alluvial deposit that fires to a warm sandstone colour. Raza Bhai mixes it with a small proportion of local feldspar to improve thermal shock resistance, meaning your mug can go from boiling chai to a cold countertop without cracking.\n\nEach mug is thrown individually, dried for three days, bisque-fired at 900°C, and then given a final firing at 1,200°C. The entire process takes about a week. No two mugs are identical, and that is precisely the point.\n\nWhen you hold an Anabia clay mug, you are holding a small piece of the Gangetic plain, shaped by hands that have been refining the same motion for decades. We think that matters.`
  },
  {
    slug: "packaging-without-waste",
    title: "Packaging Without Waste",
    excerpt: "How we ship every order in materials that can return to the earth — and why the unboxing experience still feels considered.",
    date: "July 2026",
    readingTime: "3 min read",
    image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAy0BGMO2GfrAJc0OKBbwyAFZUjYEjwAwwfCvcNUY_teM2kEbtW8Y-_LkqKodBGr3A63lPjOe0DWDi_jeVj3ecO4WFXjkLsPV-S0_tTXkn96EK6QIm5-NA8mcicnZxCakHXJFuBeJkivrjgKhkND6ekKbZShf4hf6lxpNKkLYYv7BtqlNAvZPzlbnQ_eoi-XqVriZIEtwSLA4RWE4LLxH5GWxsUZRc-_q4D8kDlpD6fvu_QTVlyxkRq",
    body: `Every Anabia order ships in the same box: unbleached corrugated kraft, sealed with water-activated paper tape printed with vegetable-based ink. Inside, items are wrapped in acid-free tissue and cushioned with shredded recycled newsprint. There is no plastic anywhere in the process.\n\nThis was not always easy to achieve. When we started, biodegradable void fill was expensive and unreliable. Compostable mailer bags disintegrated in the monsoon. Paper tape wouldn't adhere in humid conditions. We spent the better part of a year testing materials before settling on our current system.\n\nThe box itself is designed to be reused. It's deliberately plain — no glossy prints, no lamination — so it can serve as storage, a gift box, or simply go straight into recycling. We include a small card printed on seed paper (embedded with wildflower seeds) that explains how to compost it.\n\nWe believe that packaging should protect what's inside and then disappear gracefully. No one needs another branded tote bag or a box too pretty to throw away. What they need is assurance that the object they ordered was handled with care, and that the materials used to deliver it won't outlast the object itself.\n\nOur packaging costs about 40% more than conventional alternatives. We absorb this cost entirely. It's not a line item, and it's not a surcharge. It's simply how we do things.`
  }
];

export function getArticleBySlug(slug: string): JournalArticle | undefined {
  return JOURNAL_ARTICLES.find(a => a.slug === slug);
}
