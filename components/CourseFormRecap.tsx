import { useRouter } from "next/navigation";

export default function CourseFormRecap() {
  const router = useRouter();

  return (
    <div className="text-center py-10">
      <div className="mb-6 text-yellow-500 text-6xl">🎉</div>
      <h2 className="text-xl font-bold text-blue-900 mb-3">
        Bravo ! Tu as proposé ton premier cours !
      </h2>
      <p className="text-gray-600 text-sm mb-6 px-4">
        Ton cours a bien été créé. Tu recevras une alerte lorsqu’un élève sera
        inscrit. Il ne te reste plus qu’à le préparer !
      </p>

      <button
        onClick={() => router.push("/cours/enseignes")}
        className="w-full bg-primary text-white py-3 rounded-xl font-semibold"
      >
        Afficher mes cours
      </button>
    </div>
  );
}
