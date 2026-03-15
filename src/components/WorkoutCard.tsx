"use client";

import Link from "next/link";

interface WorkoutCardProps {
  id?: string;
  title: string;
  description: string;
  totalDurationMinutes: number;
  fitnessLevel?: string;
  goals?: string[];
  exerciseCount?: number;
  createdAt?: string;
  onDelete?: (id: string) => void;
}

export default function WorkoutCard({
  id,
  title,
  description,
  totalDurationMinutes,
  fitnessLevel,
  goals,
  exerciseCount,
  createdAt,
  onDelete,
}: WorkoutCardProps) {
  const levelColors: Record<string, string> = {
    beginner: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    intermediate: "bg-amber-50 text-amber-700 border border-amber-100",
    advanced: "bg-red-50 text-red-600 border border-red-100",
  };

  const levelClass = fitnessLevel ? levelColors[fitnessLevel] || "bg-gray-100 text-gray-600" : "";

  return (
    <div
      className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
      data-testid="workout-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base text-gray-900 truncate">{title}</h3>
          <p className="text-gray-500 text-sm mt-1 line-clamp-2">{description}</p>
        </div>
        {onDelete && id && (
          <button
            onClick={() => onDelete(id)}
            className="flex-shrink-0 text-gray-400 hover:text-red-400 transition-colors p-1 rounded"
            aria-label="Delete workout plan"
            data-testid="delete-plan-btn"
          >
            🗑️
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">
          ⏱️ {totalDurationMinutes} min
        </span>
        {fitnessLevel && (
          <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full capitalize ${levelClass}`}>
            🎯 {fitnessLevel}
          </span>
        )}
        {exerciseCount !== undefined && (
          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">
            💪 {exerciseCount} exercises
          </span>
        )}
      </div>

      {goals && goals.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {goals.map((goal, i) => (
            <span
              key={i}
              className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full"
            >
              {goal}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        {createdAt && (
          <span className="text-gray-400 text-xs">
            {new Date(createdAt).toLocaleDateString()}
          </span>
        )}
        {id && (
          <Link
            href={`/plan/${id}`}
            className="ml-auto text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors"
            data-testid="view-plan-link"
          >
            View Plan →
          </Link>
        )}
      </div>
    </div>
  );
}
