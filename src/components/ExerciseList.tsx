"use client";

import { GeneratedExercise } from "@/lib/gemini";

interface ExerciseListProps {
  title: string;
  exercises: GeneratedExercise[];
  accentColor?: string;
}

export default function ExerciseList({ title, exercises, accentColor = "indigo" }: ExerciseListProps) {
  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-900/40 border-indigo-700/50 text-indigo-400",
    green: "bg-green-900/40 border-green-700/50 text-green-400",
    amber: "bg-amber-900/40 border-amber-700/50 text-amber-400",
  };

  const badgeMap: Record<string, string> = {
    indigo: "bg-indigo-700 text-indigo-100",
    green: "bg-green-700 text-green-100",
    amber: "bg-amber-700 text-amber-100",
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
      <div className="space-y-3">
        {exercises.map((exercise, index) => (
          <div
            key={index}
            className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-colors"
            data-testid={`exercise-item`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-semibold text-white">{exercise.name}</h4>
                <p className="text-slate-400 text-xs mt-0.5">{exercise.muscleGroup}</p>
                <p className="text-slate-300 text-sm mt-2">{exercise.instructions}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="text-white font-bold">
                  {exercise.sets} × {exercise.reps}
                </div>
                <div className="text-slate-400 text-xs mt-1">
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
