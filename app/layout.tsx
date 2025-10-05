"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import MobileLayout from "@/components/MobileLayout";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Hide MobileLayout on home page using Tailwind */}
        <div className={pathname === "/" ? "hidden" : "block"}>
          <MobileLayout title="">{children}</MobileLayout>
        </div>

        {/* Show content normally on home page */}
        {pathname === "/" && <div>{children}</div>}
      </body>
    </html>
  );
}
