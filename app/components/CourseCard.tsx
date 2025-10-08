"use client";

import React from "react";
import Image from "next/image";
import { HeartIcon, StarIcon, MapPinIcon } from "@heroicons/react/24/solid";

interface CourseCardProps {
  title: string;
  subtitle: string;
  level: string;
  price: string;
  teacher: string;
  rating: number;
  distance: string;
  image: string;
}

export default function CourseCard({
  title,
  subtitle,
  level,
  price,
  teacher,
  rating,
  distance,
  image,
}: CourseCardProps) {
  return (
    <div className="flex justify-between items-center bg-blue-100 rounded-2xl p-3 mb-3 shadow-sm">
      <div className="flex gap-3">
        <Image
          src={image}
          alt={title}
          width={60}
          height={60}
          className="rounded-xl object-cover"
        />
        <div>
          <h3 className="font-semibold text-sm text-primary">{title}</h3>
          <p className="text-xs text-primary">{subtitle}</p>
          <p className="text-xs text-primary mt-1">{level}</p>
          <div className="flex items-center text-xs text-primary mt-1">
            <span className="font-semibold text-primary">{teacher}</span>
            <StarIcon className="w-4 h-4 text-yellow-400 mx-1" />
            <span>{rating}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end">
        <HeartIcon className="w-5 h-5 text-primary mb-1" />
        <span className="font-bold text-sm text-primary">{price}</span>
        <div className="flex items-center text-xs text-primary mt-1">
          <MapPinIcon className="w-4 h-4 mr-1" />
          {distance}
        </div>
      </div>
    </div>
  );
}
