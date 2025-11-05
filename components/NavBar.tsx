"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import SlidingIconButton from "@/components/SlidingIconButton";
import logo from "@/public/logo.png";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-white shadow-md">
      {/* Left: Burger Icon */}
      {/* <button className="p-2 rounded-md hover:bg-gray-100">
        <Menu className="h-6 w-6 text-gray-700" />
      </button> */}

      {/* Center: Logo */}
      <div className="flex justify-center flex-1">
        <Link href="/">
          <Image
            src={logo} // ← replace with your logo path
            alt="Main Logo"
            width={100}
            height={30}
            className="object-contain"
          />
        </Link>
      </div>
      {/* <SlidingIconButton /> */}
    </nav>
  );
}
