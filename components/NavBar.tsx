"use client";

import logo from "@/public/logo.png";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-md shadow-md">
      {/* Center: Logo */}
      <div className="flex justify-center flex-1">
        <Link href="/accueil">
          <Image
            src={logo}
            alt="Main Logo"
            width={100}
            height={30}
            className="object-contain"
          />
        </Link>
      </div>
    </nav>
  );
}
