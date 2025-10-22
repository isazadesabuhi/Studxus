"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import Navbar from "@/components/NavBar";
const inter = Inter({ subsets: ["latin"] });
import motif_jeune from "@/public/motif_jaune.png";
import path from "path";
import TabBar from "@/components/TabBar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <body
        className={`${inter.className} flex flex-col items-center min-h-screen pb-10`}
      >
        <div
          className={`w-full max-w-[450px] xs:mx-auto relative" ${
            pathname === "/" ? "hidden" : "block"
          }`}
        >
          <Navbar />
        </div>

        <div
          className={`relative ${
            pathname === "/"
              ? "hidden"
              : "block bg-repeat bg-[length:280px_120px]"
          }`}
          style={{ backgroundImage: `url(${motif_jeune.src})` }}
        >
          {/* Overlay */}
          {<div className="absolute inset-0 bg-white/90"></div>}

          {/* Content */}
          <div className="w-full sm:max-w-[450px] sm:mx-auto sm:text-center relative z-10">
            {children}
          </div>
        </div>
        <div className="z-99 relative max-w-[450px] w-full">
          <TabBar />
        </div>

        {/* Show content normally on home page */}
        {pathname === "/" && <div>{children}</div>}
      </body>
    </html>
  );
}
