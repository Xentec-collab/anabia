"use client";

export type Category = "all" | "clothing" | "accessories" | "home" | "care";
export type SortOption = "default" | "price-asc" | "price-desc" | "newest" | "name-az";

export const CATEGORIES: { label: string; value: Category }[] = [
  { label: "All", value: "all" },
  { label: "Clothing", value: "clothing" },
  { label: "Accessories", value: "accessories" },
  { label: "Home", value: "home" },
  { label: "Care", value: "care" },
];

export const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Default", value: "default" },
  { label: "Price: Low → High", value: "price-asc" },
  { label: "Price: High → Low", value: "price-desc" },
  { label: "Newest", value: "newest" },
  { label: "Name A–Z", value: "name-az" },
];

interface FilterBarProps {
  activeCategory: Category;
  activeSort: SortOption;
  onSelectCategory: (cat: Category) => void;
  onSelectSort: (sort: SortOption) => void;
}

export default function FilterBar({
  activeCategory,
  activeSort,
  onSelectCategory,
  onSelectSort,
}: FilterBarProps) {
  return (
    <section className="max-w-6xl w-full mx-auto px-6 mb-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => onSelectCategory(cat.value)}
                className={`text-[13px] px-4 py-1.5 rounded-none font-normal transition-colors duration-200 ease-out cursor-pointer select-none active:scale-[0.97] ${
                  isActive
                    ? "bg-[var(--ink)] text-[var(--surface)] shadow-xs"
                    : "bg-[var(--ghost)] text-[var(--ink)] hover:bg-[var(--line)]"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider text-[var(--muted)] hidden sm:inline">
            Sort by
          </span>
          <select
            value={activeSort}
            onChange={(e) => onSelectSort(e.target.value as SortOption)}
            className="h-8 px-3 bg-[var(--surface)] border border-[var(--line)] text-[13px] text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] rounded-none cursor-pointer appearance-none pr-8 transition-colors duration-100 active:border-[var(--ink)]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238A8780' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 8px center",
            }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
