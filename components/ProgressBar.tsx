interface ProgressBarProps {
  step: number;
  totalSteps?: number;
}

export default function ProgressBar({ step, totalSteps = 3 }: ProgressBarProps) {
  return (
    <div className="flex items-center justify-center mb-6 mt-2">
      {Array.from({ length: totalSteps }).map((_, i) => {
        const current = i + 1;
        const isActive = current === step;
        const isCompleted = current < step;

        return (
          <div key={i} className="flex items-center">
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold border-2
                ${
                  isCompleted
                    ? "bg-yellow-400 border-yellow-400 text-white"
                    : isActive
                    ? "bg-blue-900 border-blue-900 text-white"
                    : "bg-gray-200 border-gray-300 text-gray-500"
                }`}
            >
              {current}
            </div>

            {current < totalSteps && (
              <div
                className={`w-10 h-[2px] mx-2 ${
                  isCompleted ? "bg-yellow-400" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
