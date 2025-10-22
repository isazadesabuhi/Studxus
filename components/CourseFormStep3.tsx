import ProgressBar from "./ProgressBar";

interface Props {
  data: any;
  onPrev: () => void;
  onNext: () => void;
  onUpdate: (updates: any) => void;
}

export default function CourseFormStep3({ data, onPrev, onNext, onUpdate }: Props) {
  return (
    <div>
            {/* Barre de progression */}
      <ProgressBar step={3} />
      <h2 className="text-xl font-bold mb-4 text-blue-900">
        Choisissez votre tarif
      </h2>

      <label className="block text-sm font-semibold mb-2">Niveau</label>
      <select
        value={data.level}
        onChange={(e) => onUpdate({ level: e.target.value })}
        className="w-full border rounded-lg p-2 mb-4"
      >
        <option>Tous niveaux</option>
        <option>Débutant</option>
        <option>Intermédiaire</option>
        <option>Avancé</option>
      </select>

      <label className="block text-sm font-semibold mb-2">Prix par heure (€)</label>
      <div className="flex items-center justify-center gap-4 mb-4">
        <button
          onClick={() => onUpdate({ price: Math.max(1, data.price - 1) })}
          className="px-3 py-1 border rounded-lg"
        >
          -
        </button>
        <span className="text-2xl font-bold text-blue-900">{data.price}€</span>
        <button
          onClick={() => onUpdate({ price: data.price + 1 })}
          className="px-3 py-1 border rounded-lg"
        >
          +
        </button>
      </div>

      <p className="text-sm text-green-700 bg-green-100 p-2 rounded-lg text-center">
        Prix conseillé : 8 € - 12 €
      </p>

      <button
        onClick={onPrev}
        className="w-full py-3 rounded-xl border border-blue-900 text-blue-900 mt-4 mb-2"
      >
        Retour
      </button>
      <button
        onClick={onNext}
        className="w-full bg-yellow-400 text-blue-900 py-3 rounded-xl font-semibold"
      >
        Proposer ce cours
      </button>
    </div>
  );
}
