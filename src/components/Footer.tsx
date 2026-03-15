import { Star } from "lucide-react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://saasstars.com";

function catSlug(cat: string) {
  return cat.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
          <div>
            <h3 className="flex items-center gap-2 font-bold text-gray-900 mb-1.5">
              <Star className="w-4 h-4 text-emerald-500 fill-emerald-500" />
              SaaS Stars
            </h3>
            <p className="text-sm text-gray-500 max-w-md">
              The free directory for SaaS startups to get discovered by customers,
              investors, and partners.
            </p>
          </div>
          <a
            href="https://x.com/SaaS_Stars"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Follow on X
          </a>
        </div>

        {/* Category links for internal linking / SEO */}
        <nav className="mb-6">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Browse by Category
          </h4>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/category/${catSlug(cat)}`}
                className="text-xs text-gray-500 hover:text-emerald-600 bg-gray-50 hover:bg-emerald-50 border border-gray-200 rounded-md px-2.5 py-1 transition-colors"
              >
                {cat} SaaS
              </Link>
            ))}
          </div>
        </nav>

        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-400 mb-4">
          <span>SaaS startups</span>
          <span>AI SaaS</span>
          <span>B2B SaaS</span>
          <span>SaaS tools</span>
          <span>SaaS software</span>
          <span>SaaS companies</span>
          <span>SaaS sales</span>
          <span>SaaS marketing</span>
          <span>SaaS SEO</span>
          <span>SaaS news</span>
        </div>
        <p className="text-xs text-gray-300">
          © {new Date().getFullYear()} SaaS Stars. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
