"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProgressBar from "@/components/ProgressBar";
import ReservationStep1 from "@/components/ReservationStep1";
import ReservationStep2 from "@/components/ReservationStep2";
import ReservationStep3 from "@/components/ReservationStep3";

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  level: string;
  pricePerHour: number;
  author: {
    id: string;
    name: string;
    surname: string;
    fullName: string;
    email: string;
  } | null;
}

interface CourseSession {
  id: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  location: string | null;
}

export default function ReservationPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = params.courseId as string;
  const sessionId = searchParams.get("sessionId") || undefined;

  const [step, setStep] = useState(1);
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [sessions, setSessions] = useState<CourseSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<CourseSession | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    messageToInstructor: "",
    paymentMethod: "" as "card" | "paypal" | "google_pay" | "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
    cardholderName: "",
    saveCard: false,
  });

  // Fetch course details and sessions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/");
          return;
        }

        // Fetch course details
        const courseResponse = await fetch(`/api/courses/${courseId}`);
        if (!courseResponse.ok) {
          throw new Error("Cours introuvable");
        }
        const courseData = await courseResponse.json();
        setCourse(courseData.course);

        // Fetch sessions
        const sessionsResponse = await fetch(
          `/api/courses/${courseId}/sessions`
        );
        if (!sessionsResponse.ok) {
          throw new Error("Erreur lors du chargement des sessions");
        }
        const sessionsData = await sessionsResponse.json();
        setSessions(sessionsData.sessions || []);

        // If sessionId is provided, select it
        if (sessionId && sessionsData.sessions) {
          const session = sessionsData.sessions.find(
            (s: any) => s.id === sessionId
          );
          if (session) {
            setSelectedSession({
              id: session.id,
              sessionDate: session.session_date,
              startTime: session.start_time,
              endTime: session.end_time,
              location: session.location,
            });
            console.log("Preselected session:", session);
            console.log("Preselected session:", selectedSession);
          }
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "Une erreur s'est produite");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchData();
    }
  }, [courseId, sessionId, router]);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    if (!selectedSession || !course) return;

    try {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        throw new Error("Session expirée");
      }

      // Calculate amount (assuming 1 hour for now)
      const amount = course.pricePerHour;

      // Prepare booking data
      const bookingData: any = {
        courseId: course.id,
        courseSessionId: selectedSession.id,
        amount: amount,
        messageToInstructor: formData.messageToInstructor || null,
      };

      if (formData.paymentMethod) {
        bookingData.paymentMethod = formData.paymentMethod;

        if (formData.paymentMethod === "card") {
          bookingData.cardLastFour = formData.cardNumber.slice(-4);
          bookingData.cardBrand = "visa"; // In real app, detect from card number
        }
      }

      // Create booking
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la réservation");
      }

      const data = await response.json();

      // Confirm payment if card was used
      if (formData.paymentMethod === "card") {
        const confirmResponse = await fetch(
          `/api/bookings/${data.booking.id}/confirm`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${sessionData.session.access_token}`,
            },
          }
        );

        if (!confirmResponse.ok) {
          console.error("Failed to confirm payment");
        }
      }

      // Redirect to confirmation page
      router.push(`/cours/reserver/confirmation?bookingId=${data.booking.id}`);
    } catch (err: any) {
      alert(err.message || "Erreur lors de la réservation");
    }
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

  if (error || !course) {
    return (
      <main className="mx-auto max-w-screen-sm bg-white min-h-screen">
        <div className="p-6 text-center">
          <p className="text-red-600 mb-4">{error || "Cours introuvable"}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            Retour
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-screen-sm bg-white min-h-screen">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={handleBack}
          className="text-blue-900 font-semibold mb-3"
        >
          ← Retour
        </button>
        <ProgressBar step={step} totalSteps={3} />
      </div>

      {/* Step Content */}
      <div className="p-4">
        {step === 1 && (
          <ReservationStep1
            course={course}
            sessions={sessions}
            selectedSession={selectedSession}
            onSessionSelect={setSelectedSession}
            formData={formData}
            onFormDataChange={setFormData}
            onNext={handleNext}
          />
        )}

        {step === 2 && (
          <ReservationStep2
            formData={formData}
            onFormDataChange={setFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {step === 3 && (
          <ReservationStep3
            course={course}
            selectedSession={selectedSession!}
            formData={formData}
            onFormDataChange={setFormData}
            onSubmit={handleSubmit}
            onBack={handleBack}
          />
        )}
      </div>
    </main>
  );
}
