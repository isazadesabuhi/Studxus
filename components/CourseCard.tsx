"use client";

import Image from "next/image";
import { MapPin, Star } from "lucide-react";
import vba from "@/public/vba.jpg";

export type Course = {
  id: string;
  title: string;
  schedule?: string;
  wednesday?: string;
  level: string;
  price: string;
  image?: string;

  // New fields from API
  category?: string;
  teacherName?: string;
  rating?: number;
  distance?: number;
  days?: string[]; // e.g., ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"]
  timeSlot?: string; // e.g., "18h-19h"
};

type Props = {
  course: Course;
  onDetails?: (id: string) => void;
  onEdit?: (id: string) => void;
};

export default function CourseCard({ course, onDetails, onEdit }: Props) {
  // Default values
  const {
    id,
    title = "Cours sans titre",
    level = "Débutant",
    price = "0€",
    image = vba,
    teacherName = "Enseignant",
    rating = 4.0,
    distance = 0,
    days = [],
    timeSlot = "Horaire à définir",
  } = course;

  // Extract numeric price for display
  const priceValue = price.replace(/[^\d]/g, "") || "0";

  // Available days of week
  const weekDays = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];

  return (
    <div className="w-full rounded-3xl border-2 border-slate-300 bg-gradient-to-br from-sky-100 to-blue-50 p-4 shadow-md">
      <div className="flex items-start gap-4">
        {/* Left: Course Image with Teacher Avatar */}
        <div className="relative flex-shrink-0">
          <div className="relative h-20 w-20 overflow-hidden rounded-2xl">
            <Image
              src={typeof image === "string" ? image : vba}
              alt={title}
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>

          {/* Teacher Avatar (bottom-left overlay) */}
          <div className="absolute -bottom-2 -left-2 flex items-center gap-1 rounded-full bg-slate-800 px-2 py-1">
            <div className="h-6 w-6 overflow-hidden rounded-full bg-white">
              {/* Placeholder avatar - you can replace with actual teacher image */}
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 text-xs text-white font-bold">
                {teacherName.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              <span className="text-xs font-bold text-white">
                {rating.toFixed(1)}
              </span>
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Right: Course Info */}
        <div className="flex flex-1 flex-col">
          {/* Title and Price */}
          <div className="mb-1 flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-800 leading-tight">
                {title}
              </h3>
              <p className="text-sm text-slate-600">{level}</p>
            </div>
            <div className="ml-2 rounded-full bg-white px-3 py-1 shadow-sm">
              <span className="text-lg font-bold text-slate-800">
                {priceValue}€
              </span>
            </div>
          </div>

          {/* Days of Week */}
          <div className="mb-2 flex items-center gap-1.5">
            {weekDays.map((day) => {
              const isActive = days.includes(day);
              return (
                <div
                  key={day}
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-slate-800 text-white"
                      : "bg-white text-slate-400"
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>

          {/* Time Slot and Distance */}
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span className="font-medium">{timeSlot}</span>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">{distance.toFixed(1)} km</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onDetails?.(id)}
          className="flex-1 rounded-full border-2 border-slate-800 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
        >
          Plus de détails
        </button>
        {onEdit && (
          <button
            onClick={() => onEdit(id)}
            className="flex-1 rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
          >
            Modifier
          </button>
        )}
      </div>
    </div>
  );
}
