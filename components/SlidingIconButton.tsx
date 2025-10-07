// app/components/SlidingIconButton.tsx
"use client";

import { useState, useCallback } from "react";
import Image from "next/image";

import casquette from "@/public/casquette.svg";
import lumiere from "@/public/lumiere.svg";

export default function SlidingIconButton() {
  const [on, setOn] = useState(false);

  const toggle = useCallback(() => setOn((v) => !v), []);
  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOn((v) => !v);
    }
  }, []);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={toggle}
      onKeyDown={onKeyDown}
      className={[
        // Fixed size per your spec
        "relative w-[74px] h-[32px] ",
        // Yellow track
        "bg-[#D4EEFF]",
        // Rounded pill, nice shadow + focus ring
        "rounded-full shadow-sm",
        "outline-none focus-visible:ring-2 focus-visible:ring-yellow-600 focus-visible:ring-offset-2",
        // Smooth background tint when toggled (optional)
        on ? "bg-[#D4EEFF]" : "bg-[#FAB818]",
      ].join(" ")}
      aria-label="Toggle"
    >
      {/* Knob (white circle with icon inside) */}
      <span
        className={[
          "absolute top-1/2 left-1 -translate-y-1/2", // ✅ perfectly centers vertically
          "h-[28px] w-[28px] rounded-full bg-white shadow",
          "grid place-items-center",
          "transition-transform duration-300 ease-out",
          on ? "translate-x-[42px]" : "translate-x-0",
        ].join(" ")}
      >
        {/* Icon (example: chevron) */}
        <Image
          src={on ? lumiere : casquette}
          alt="Secondary Logo"
          // width={30}
          // height={30}
          className="object-contain"
        />
      </span>
    </button>
  );
}
