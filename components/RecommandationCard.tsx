"use client";
import Image from "next/image";
import Heading from "./Heading";

type CourseCardProps = {
  title: string;
  subtitle: string;
  level: string;
  days: string;
  time: string;
  price: string;
  teacherName: string;
  rating: number;
  distanceKm?: number;
  avatarUrl?: string;
  popular?: boolean;
  liked?: boolean;
  onToggleLike?: () => void;
  className?: string;
};

export default function CourseCard(props: CourseCardProps) {
  const {
    title,
    subtitle,
    level,
    days,
    time,
    price,
    teacherName,
    rating,
    distanceKm,
    avatarUrl,
    popular,
    liked,
    onToggleLike,
    className,
  } = props;

  const join = (...xs: Array<string | undefined | false>) =>
    xs.filter(Boolean).join(" ");

  return (
    <div
      className={join(
        "relative w-[320px] sm:w-[360px] rounded-[28px] bg-[#1F3456] text-white p-5 pb-6 shadow-lg",
        "border border-[#1F3456]/20",
        "flex flex-col justify-between space-y-3.5",
        className
      )}
    >
      {popular && (
        <div className="w-max  rounded-full bg-white/20 text-white/90 text-sm px-3 py-1 font-medium">
          Populaire
        </div>
      )}

      <div className="relative flex flex-col justify-between">

        <button
          type="button"
          aria-label={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
          onClick={onToggleLike}
          className="absolute right-0 top-2"
        >
          <svg
            viewBox="0 0 24 24"
            className={join(
              "h-8 w-8 drop-shadow-sm",
              liked ? "fill-white" : "fill-transparent",
              "stroke-white stroke-[2]"
            )}
          >
            <path d="M12 21s-7.5-4.5-10-8.5C-0.5 8.5 2.2 3 7 3c2.1 0 3.6 1.1 5 2.8C13.4 4.1 14.9 3 17 3c4.8 0 7.5 5.5 5 9.5S12 21 12 21z" />
          </svg>
        </button>

        <div className="">
          <Heading as="h3" >
            {title}
          </Heading>
          <Heading as="h4" >
            {subtitle}
          </Heading>
        </div>


        <div className="flex flex-row w-full justify-between items-center mt-2">

          <div className=" text-white/70 space-y-1">
            <p className="text-xs">{level}</p>
            <p className="text-xs">{days}</p>
            <p className="text-xs">{time}</p>
          </div>

          <div >
            <div className="rounded-2xl bg-white/30 px-3 py-2 text-l font-semibold">
              {price}
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-white/30">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={teacherName}
                  width={30}
                  height={30}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-white/20" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-m font-medium">{teacherName}</span>
              <span className="ml-1 flex items-center gap-1 text-white">
                <span className="text-m">{rating.toFixed(1)}</span>
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-yellow-400">
                  <path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.787 1.402 8.168L12 18.896l-7.336 3.87 1.402-8.168L.132 9.211l8.2-1.193L12 .587z" />
                </svg>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-white/90">
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
              <path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
            </svg>
            <span className="text-m font-semibold">{distanceKm ?? 0} km</span>
          </div>
        </div>

      </div>
    </div >
  );
}
