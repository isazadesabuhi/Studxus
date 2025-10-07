// components/Card.tsx
import React from "react";
import Image from "next/image";
import { StarIcon, HeartIcon } from "@heroicons/react/24/solid";

interface CardProps {
  title: string;
  description: string;
  price: string;
  teacher: string;
  rating: number;
  distance: string;
  tag?: string;
  image?: string;
}

const Card: React.FC<CardProps> = ({
  title,
  description,
  price,
  teacher,
  rating,
  distance,
  tag,
  image,
}) => {
  return (
    <div className="relative bg-indigo-900 text-white rounded-2xl p-4 w-64 flex-shrink-0">
      {/* Tag */}
      {tag && (
        <span className="absolute top-2 left-2 bg-gray-200 text-gray-800 text-xs font-medium rounded-full px-2 py-1">
          {tag}
        </span>
      )}

      {/* Heart */}
      <HeartIcon className="absolute top-2 right-2 h-5 w-5 text-white" />

      {/* Image fictive */}
      <div className="rounded-xl overflow-hidden mb-3">
        <Image
          src={image || "/placeholder.jpg"}
          alt={title}
          width={300}
          height={160}
          className="object-cover w-full h-32"
        />
      </div>

      {/* Infos */}
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      <p className="text-sm opacity-90 mb-2">{description}</p>

      <div className="flex justify-between items-center mt-3">
        <span className="bg-gray-700 text-sm px-2 py-1 rounded-md">{price}</span>
        <div className="flex items-center gap-1">
          <StarIcon className="h-4 w-4 text-alternative" />
          <span className="text-sm">{rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="flex justify-between items-center mt-2 text-xs opacity-80">
        <span>{teacher}</span>
        <span>{distance}</span>
      </div>
    </div>
  );
};

export default Card;
