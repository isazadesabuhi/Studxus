"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import mascotte from "@/public/mascotte_v1.png";
import { MapPin, BarChart3, Clock, CheckCircle2 } from "lucide-react";

interface BookingDetail {
  id: string;
  status: string;
  paymentStatus: string;
  amount: number;
  createdAt: string;
  paidAt: string | null;
  course: {
    id: string;
    title: string;
    level: string;
    author: {
      fullName: string;
    } | null;
  } | null;
  session: {
    sessionDate: string;
    startTime: string;
    endTime: string;
    location: string | null;
  } | null;
}

// Create a separate component that uses useSearchParams
function ConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get("bookingId");

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        setError("ID de réservation manquant");
        setLoading(false);
        return;
      }

      try {
        const { data: sessionData } = await supabase.auth.getSession();

        if (!sessionData.session) {
          router.push("/");
          return;
        }

        // Fetch booking details
        const response = await fetch("/api/bookings", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${sessionData.session.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erreur lors du chargement de la réservation");
        }

        const data = await response.json();
        const foundBooking = data.bookings.find(
          (b: BookingDetail) => b.id === bookingId
        );

        if (!foundBooking) {
          throw new Error("Réservation introuvable");
        }

        setBooking(foundBooking);
      } catch (err: any) {
        console.error("Error fetching booking:", err);
        setError(err.message || "Une erreur s'est produite");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const months = [
      "janvier",
      "février",
      "mars",
      "avril",
      "mai",
      "juin",
      "juillet",
      "août",
      "septembre",
      "octobre",
      "novembre",
      "décembre",
    ];
    return `${days[date.getDay()]} ${date.getDate()} ${
      months[date.getMonth()]
    } ${date.getFullYear()}`;
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    return `${hours}h${minutes}`;
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-screen-sm bg-white min-h-screen">
        <div className="p-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="mx-auto max-w-screen-sm bg-white min-h-screen">
        <div className="p-6 text-center">
          <p className="text-red-600 mb-4">
            {error || "Réservation introuvable"}
          </p>
          <button
            onClick={() => router.push("/cours/mes-cours")}
            className="px-4 py-2 bg-blue-900 text-white rounded-lg"
          >
            Retour aux cours
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-screen-sm bg-white min-h-screen">
      <div className="p-6">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <Image
              src={mascotte}
              alt="Mascotte"
              width={120}
              height={120}
              className="mx-auto"
            />
            <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="bg-yellow-100 rounded-lg p-4 mb-4">
            <p className="text-lg font-bold text-gray-900">
              Bravo! Tu as réservé ton premier cours!
            </p>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">
            Félicitations! Ton paiement a bien été validé. Tu recevras une
            confirmation par mail. Il ne te reste plus qu'à préparer ton cours.
          </p>
        </div>

        {/* Summary */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Récapitulatif
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Intitulé du cours:</span>
              <span className="font-medium text-gray-900">
                {booking.course?.title || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Niveau:</span>
              <span className="font-medium text-gray-900">
                {booking.course?.level || "N/A"}
              </span>
            </div>
            {booking.session && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(booking.session.sessionDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Horaires:</span>
                  <span className="font-medium text-gray-900">
                    {formatTime(booking.session.startTime)} -{" "}
                    {formatTime(booking.session.endTime)}
                  </span>
                </div>
                {booking.session.location && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lieu:</span>
                    <span className="font-medium text-gray-900 text-right">
                      {booking.session.location}
                    </span>
                  </div>
                )}
              </>
            )}
            <div className="flex justify-between pt-3 border-t border-gray-200">
              <span className="text-gray-600">Prix:</span>
              <span className="font-bold text-blue-900">
                {booking.amount.toFixed(2)}€
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Statut:</span>
              <span className="font-medium text-green-600">
                {booking.status === "paid" ? "Payé" : booking.status}
              </span>
            </div>
          </div>
        </div>

        {/* Course Info Card */}
        {booking.course && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">
                  {booking.course.title}
                </h3>
                <div className="space-y-1 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>{booking.course.level}</span>
                  </div>
                  {booking.session && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        {formatTime(booking.session.startTime)} -{" "}
                        {formatTime(booking.session.endTime)}
                      </span>
                    </div>
                  )}
                  {booking.session?.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{booking.session.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => router.push("/cours/mes-cours?tab=reserved")}
          className="w-full py-4 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-all"
        >
          Afficher mes cours
        </button>
      </div>
    </main>
  );
}

// Loading fallback component
function ConfirmationLoading() {
  return (
    <main className="mx-auto max-w-screen-sm bg-white min-h-screen">
      <div className="p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-4 text-gray-600">Chargement...</p>
      </div>
    </main>
  );
}

// Main exported component wrapped in Suspense
export default function ConfirmationPage() {
  return (
    <Suspense fallback={<ConfirmationLoading />}>
      <ConfirmationContent />
    </Suspense>
  );
}
