"use client";

import { CreditCard } from "lucide-react";

interface CourseDetail {
  id: string;
  title: string;
  pricePerHour: number;
}

interface CourseSession {
  id: string;
  session_date: string; // ← snake_case
  start_time: string; // ← snake_case
  end_time: string; // ← snake_case
}

interface ReservationStep3Props {
  course: CourseDetail;
  selectedSession: CourseSession;
  formData: {
    cardNumber: string;
    cardExpiry: string;
    cardCvv: string;
    cardholderName: string;
    saveCard: boolean;
  };
  onFormDataChange: (data: any) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export default function ReservationStep3({
  course,
  selectedSession,
  formData,
  onFormDataChange,
  onSubmit,
  onBack,
}: ReservationStep3Props) {
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(" ").substring(0, 19);
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };

  const formatCvv = (value: string) => {
    return value.replace(/\D/g, "").substring(0, 3);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    onFormDataChange({ ...formData, cardNumber: formatted });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    onFormDataChange({ ...formData, cardExpiry: formatted });
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCvv(e.target.value);
    onFormDataChange({ ...formData, cardCvv: formatted });
  };

  const isFormValid =
    formData.cardNumber.replace(/\s/g, "").length === 16 &&
    formData.cardExpiry.length === 5 &&
    formData.cardCvv.length === 3 &&
    formData.cardholderName.length > 0;

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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Entrez les informations de votre carte bancaire
      </h1>

      {/* Card Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Numéro de carte
        </label>
        <div className="relative">
          <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={formData.cardNumber}
            onChange={handleCardNumberChange}
            placeholder="XXXX XXXX XXXX XXXX"
            maxLength={19}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Expiry and CVV */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date d'expiration
          </label>
          <input
            type="text"
            value={formData.cardExpiry}
            onChange={handleExpiryChange}
            placeholder="MM/AA"
            maxLength={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CVV
          </label>
          <input
            type="text"
            value={formData.cardCvv}
            onChange={handleCvvChange}
            placeholder="XXX"
            maxLength={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Cardholder Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nom du titulaire de la carte
        </label>
        <input
          type="text"
          value={formData.cardholderName}
          onChange={(e) =>
            onFormDataChange({ ...formData, cardholderName: e.target.value })
          }
          placeholder="Nom complet"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Save Card Checkbox */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="saveCard"
          checked={formData.saveCard}
          onChange={(e) =>
            onFormDataChange({ ...formData, saveCard: e.target.checked })
          }
          className="w-5 h-5 text-blue-900 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="saveCard" className="text-sm text-gray-700">
          Enregistrer cette carte bancaire
        </label>
      </div>

      {/* Legal Information */}
      <div className="bg-gray-50 p-4 rounded-lg text-xs text-gray-600 space-y-2">
        <p>
          En effectuant cette réservation, vous acceptez nos conditions
          générales d'utilisation et notre politique de confidentialité.
        </p>
        <p>
          Vous disposez d'un droit de rétractation de 14 jours à compter de la
          date de réservation.
        </p>
        <p>
          Vos données de paiement sont sécurisées et cryptées. Nous ne stockons
          pas vos informations de carte bancaire complètes.
        </p>
      </div>

      {/* Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Cours:</span>
          <span className="font-medium text-gray-900">{course.title}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Date:</span>
          <span className="font-medium text-gray-900">
            {formatDate(selectedSession.session_date)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Horaires:</span>
          <span className="font-medium text-gray-900">
            {formatTime(selectedSession.start_time)} -{" "}
            {formatTime(selectedSession.end_time)}
          </span>
        </div>
        <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
          <span className="font-semibold text-gray-900">Total:</span>
          <span className="text-xl font-bold text-blue-900">
            {course.pricePerHour.toFixed(2)}€
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-4 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
        >
          Retour
        </button>
        <button
          onClick={onSubmit}
          disabled={!isFormValid}
          className={`flex-1 py-4 rounded-lg font-semibold text-white transition-all ${
            isFormValid
              ? "bg-blue-900 hover:bg-blue-800"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Payer {course.pricePerHour.toFixed(2)}€
        </button>
      </div>
    </div>
  );
}
