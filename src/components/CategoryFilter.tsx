"use client";

import { CATEGORIES } from "@/lib/types";

interface Props {
  selected: string | null;
  onSelect: (cat: string | null) => void;
  counts?: Record<string, number>;
}

export function CategoryFilter({ selected, onSelect, counts }: Props) {
  const total = counts
    ? Object.values(counts).reduce((a, b) => a + b, 0)
    : undefined;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`text-sm px-4 py-2 rounded-full border transition-all inline-flex items-center gap-1.5 ${
          selected === null
            ? "bg-gray-900 text-white border-gray-900 shadow-md"
            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:shadow-sm"
        }`}
      >
        All
        {total !== undefined && (
          <span
            className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
              selected === null
                ? "bg-white/20 text-white"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {total}
          </span>
        )}
      </button>
      {CATEGORIES.map((cat) => {
        const count = counts?.[cat] || 0;
        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`text-sm px-4 py-2 rounded-full border transition-all inline-flex items-center gap-1.5 ${
              selected === cat
                ? "bg-gray-900 text-white border-gray-900 shadow-md"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:shadow-sm"
            }`}
          >
            {cat}
            {counts && count > 0 && (
              <span
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                  selected === cat
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
