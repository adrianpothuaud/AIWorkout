"use client";

import { GeneratedExercise } from "@/lib/gemini";

interface ExerciseListProps {
  title: string;
  exercises: GeneratedExercise[];
  accentColor?: string;
}

export default function ExerciseList({ title, exercises, accentColor = "indigo" }: ExerciseListProps) {
  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-50 border-indigo-100 text-indigo-700",
    green: "bg-emerald-50 border-emerald-100 text-emerald-700",
    amber: "bg-amber-50 border-amber-100 text-amber-700",
  };

  const badgeMap: Record<string, string> = {
    indigo: "bg-indigo-100 text-indigo-600",
    green: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600",
  };

  const headerClass = colorMap[accentColor] || colorMap.indigo;
  const badgeClass = badgeMap[accentColor] || badgeMap.indigo;

  if (!exercises || exercises.length === 0) return null;

  return (
    <div className="mb-6">
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-semibold mb-3 ${headerClass}`}>
        {title}
        <span className={`text-xs px-2 py-0.5 rounded-full ${badgeClass}`}>
          {exercises.length} exercises
        </span>
      </div>
      <div className="space-y-2">
        {exercises.map((exercise, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow transition-shadow"
            data-testid={`exercise-item`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm">{exercise.name}</h4>
                <p className="text-gray-400 text-xs mt-0.5">{exercise.muscleGroup}</p>
                <p className="text-gray-600 text-sm mt-2">{exercise.instructions}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="text-gray-900 font-semibold text-sm">
                  {exercise.sets} × {exercise.reps}
                </div>
                <div className="text-gray-400 text-xs mt-1">
                  Rest: {exercise.restSeconds}s
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
