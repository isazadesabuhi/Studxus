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

type TabBarProps = {
  title?: string;
  children?: ReactNode;
};

export default function TabBar({ title, children }: TabBarProps) {
  const pathname = usePathname();

  const itemBase =
    "flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs font-medium select-none";
  const labelBase = "leading-none";
  const inactiveIcon = "text-gray-700";
  const inactiveText = "text-gray-700";

  const items: {
    id: "circle-star" | "recherche" | "courses" | "messages" | "account";
    label: string;
    icon: IconType | null;
    href: string;
  }[] = [
    { id: "circle-star", label: "Accueil", icon: null, href: "/accueil" },
    { id: "recherche", label: "Recherche", icon: Search, href: "/recherche" },
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
    <div className="fixed bottom-0 left-0 right-0 bg-white ">
      <nav className="flex justify-between h-16 items-center max-w-[450px] mx-auto shadow-t border-t border-gray-200">
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
    <div className="absolute h-20 w-20">
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <path
          d="M48 22C49 20 51 20 52 22L55 27C56 29 58 30 60 29L66 27C68 26 70 28 70 30L69 35C69 37 70 39 72 40L78 42C80 43 81 46 79 48L76 51C75 52 75 54 76 56L79 59C81 61 80 64 78 65L72 67C70 68 69 70 69 72L70 77C70 79 68 81 66 80L60 78C58 77 56 78 55 80L52 85C51 87 49 87 48 85L45 80C44 78 42 77 40 78L34 80C32 81 30 79 30 77L31 72C31 70 30 68 28 67L22 65C20 64 19 61 21 59L24 56C25 54 25 52 24 51L21 48C19 46 20 43 22 42L28 40C30 39 31 37 31 35L30 30C30 28 32 26 34 27L40 29C42 30 44 29 45 27L48 22Z"
          fill="#FAB818"
        />
      </svg>
    </div>
  );
}
