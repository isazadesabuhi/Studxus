"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode, ComponentType } from "react";
import { Search, BookOpen, MessageSquare, User2 } from "lucide-react";

type IconType = ComponentType<{
  className?: string;
  size?: number;
  strokeWidth?: number;
}>;

type MobileLayoutProps = {
  title?: string;
  children?: ReactNode;
};

export default function MobileLayout({ title, children }: MobileLayoutProps) {
  const pathname = usePathname();

  const itemBase =
    "flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs font-medium select-none";
  const labelBase = "leading-none";
  const inactiveIcon = "text-gray-700";
  const inactiveText = "text-gray-700";

  const items: {
    id: "circle-star" | "search" | "courses" | "messages" | "account";
    label: string;
    icon: IconType | null;
    href: string;
  }[] = [
    { id: "circle-star", label: "Accueil", icon: null, href: "/accueil" },
    { id: "search", label: "Recherche", icon: Search, href: "/search" },
    { id: "courses", label: "Mes cours", icon: BookOpen, href: "/cours" },
    {
      id: "messages",
      label: "Messages",
      icon: MessageSquare,
      href: "/message",
    },
    { id: "account", label: "Compte", icon: User2, href: "/profile" },
  ];

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="flex min-h-screen flex-col">
      {/* Optional top title */}
      {title ? (
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200 px-4 py-3">
          <h1 className="text-base font-semibold">{title}</h1>
        </header>
      ) : null}

      {/* Page content */}
      <main className="flex-1 pb-20">{children}</main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white shadow-t flex justify-around items-center border-t border-gray-200">
        {items.map(({ id, label, icon: Icon, href }) => {
          const active = isActive(href);
          return (
            <Link
              key={id}
              href={href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={itemBase}
            >
              <span className="relative h-11 w-11 flex items-center justify-center">
                {active && <SunStarBadge />}
                {Icon ? (
                  <Icon
                    className={`absolute ${
                      active ? "text-gray-900" : inactiveIcon
                    }`}
                    size={36}
                    strokeWidth={2.5}
                  />
                ) : (
                  <svg
                    className={`absolute h-9 w-9 ${
                      active ? "text-gray-900" : inactiveIcon
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11.051 7.616a1 1 0 0 1 1.909.024l.737 1.452a1 1 0 0 0 .737.535l1.634.256a1 1 0 0 1 .588 1.806l-1.172 1.168a1 1 0 0 0-.282.866l.259 1.613a1 1 0 0 1-1.541 1.134l-1.465-.75a1 1 0 0 0-.912 0l-1.465.75a1 1 0 0 1-1.539-1.133l.258-1.613a1 1 0 0 0-.282-.867l-1.156-1.152a1 1 0 0 1 .572-1.822l1.633-.256a1 1 0 0 0 .737-.535z" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                )}
              </span>
              <span
                className={`${labelBase} ${
                  active ? "text-gray-900" : inactiveText
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function SunStarBadge() {
  return (
    <div className="absolute h-11 w-11">
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-11 w-11"
        aria-hidden
      >
        <defs>
          <radialGradient id="g" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopOpacity="1" stopColor="#FACC15" />
            <stop offset="100%" stopOpacity="1" stopColor="#EAB308" />
          </radialGradient>
        </defs>
        <path
          d="M50 5 C60 10, 65 10, 70 5 C75 10, 80 10, 90 10 C90 20, 95 25, 100 30 C95 35, 95 40, 100 50 C95 60, 95 65, 100 70 C95 75, 90 80, 90 90 C80 90, 75 90, 70 95 C65 90, 60 90, 50 95 C40 90, 35 90, 30 95 C25 90, 20 90, 10 90 C10 80, 5 75, 0 70 C5 65, 5 60, 0 50 C5 40, 5 35, 0 30 C5 25, 10 20, 10 10 C20 10, 25 10, 30 5 C35 10, 40 10, 50 5Z"
          fill="url(#g)"
        />
      </svg>
    </div>
  );
}
