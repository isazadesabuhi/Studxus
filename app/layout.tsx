"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import MobileLayout from "@/components/MobileLayout";
import { usePathname } from "next/navigation";
import Navbar from "@/components/NavBar";
const inter = Inter({ subsets: ["latin"] });
import motif_jeune from "@/public/motif_jaune.png";
import path from "path";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  console.log("/accueil");
  console.log(pathname);

  return (
    <html lang="en">
      <body
        className={`${inter.className} grid place-items-center max-w-[450px] min-h-screen`}
      >
        <div className={`w-full ${pathname === "/" ? "hidden" : "block"}`}>
          <Navbar />
        </div>

        {/* Hide MobileLayout on home page using Tailwind */}
        <div
          className={`relative ${pathname === "/" ? "hidden" : "block bg-repeat bg-[length:280px_120px]"
            }`}
          style={{ backgroundImage: `url(${motif_jeune.src})` }}
        >
          {/* Overlay */}
          {<div className="absolute inset-0 bg-white/90"></div>}

          {/* Content */}
          <div className="relative z-10">
            <MobileLayout title="">{children}</MobileLayout>
          </div>
        </div>

        {/* Show content normally on home page */}
        {pathname === "/" && <div>{children}</div>}
      </body>
    </html>
  );
}
