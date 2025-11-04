"use client";

interface ReservationStep2Props {
  formData: {
    paymentMethod: "card" | "paypal" | "google_pay" | "";
  };
  onFormDataChange: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function ReservationStep2({
  formData,
  onFormDataChange,
  onNext,
  onBack,
}: ReservationStep2Props) {
  const paymentMethods = [
    {
      id: "card",
      name: "Carte bancaire",
      description: "Cartes bancaires, Visa, Mastercard, Maestro",
    },
    {
      id: "paypal",
      name: "Paypal",
      description: "Payer avec votre compte PayPal",
    },
    {
      id: "google_pay",
      name: "Google Pay",
      description: "Payer avec Google Pay",
    },
  ];

  const canProceed = formData.paymentMethod !== "";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Sélectionnez votre mode de paiement
      </h1>

      <div className="space-y-3">
        {paymentMethods.map((method) => {
          const isSelected = formData.paymentMethod === method.id;

          return (
            <div
              key={method.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                isSelected
                  ? "border-blue-900 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() =>
                onFormDataChange({ ...formData, paymentMethod: method.id })
              }
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected
                      ? "border-blue-900 bg-blue-900"
                      : "border-gray-300"
                  }`}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{method.name}</p>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
              </div>
            </div>
          );
        })}
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
          onClick={onNext}
          disabled={!canProceed}
          className={`flex-1 py-4 rounded-lg font-semibold text-white transition-all ${
            canProceed
              ? "bg-blue-900 hover:bg-blue-800"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Suivant
        </button>
      </div>
    </div>
  );
}

