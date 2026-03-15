"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ExerciseList from "@/components/ExerciseList";
import { GeneratedWorkoutPlan } from "@/lib/gemini";

interface SavedPlan extends GeneratedWorkoutPlan {
  _id: string;
  fitnessLevel: string;
  goals: string[];
  availableEquipment: string[];
  createdAt: string;
}

export default function PlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [plan, setPlan] = useState<SavedPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPlan() {
      try {
        const res = await fetch(`/api/workouts/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load plan");
        setPlan(data.plan);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load plan");
      } finally {
        setLoading(false);
      }
    }
    fetchPlan();
  }, [id]);

  async function handleDelete() {
    if (!confirm("Delete this workout plan?")) return;
    try {
      await fetch(`/api/workouts/${id}`, { method: "DELETE" });
      router.push("/dashboard");
    } catch {
      setError("Failed to delete plan");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-4xl animate-spin">⚙️</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-4">⚠️</div>
        <p className="text-red-400 mb-4">{error}</p>
        <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="text-slate-400 hover:text-slate-200 transition-colors">
          ← Back
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white" data-testid="plan-title">{plan.title}</h1>
          <p className="text-slate-400 mt-1">{plan.description}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="bg-slate-700 text-slate-300 text-xs px-2.5 py-1 rounded-full">
              ⏱️ {plan.totalDurationMinutes} min
            </span>
            <span className="bg-slate-700 text-slate-300 text-xs px-2.5 py-1 rounded-full capitalize">
              🎯 {plan.fitnessLevel}
            </span>
          </div>
          {plan.goals && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {plan.goals.map((g, i) => (
                <span key={i} className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-full">
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Link
            href="/log"
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-medium rounded-xl transition-colors text-sm text-center"
          >
            📝 Log Session
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-slate-700 hover:bg-red-800 text-slate-300 hover:text-red-200 font-medium rounded-xl transition-colors text-sm"
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      <ExerciseList title="🔥 Warm-up" exercises={plan.warmup} accentColor="amber" />
      <ExerciseList title="💪 Main Workout" exercises={plan.mainWorkout} accentColor="indigo" />
      <ExerciseList title="🧘 Cool-down" exercises={plan.cooldown} accentColor="green" />

      {plan.tips && plan.tips.length > 0 && (
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
          <h3 className="font-bold text-white mb-3">💡 Training Tips</h3>
          <ul className="space-y-2">
            {plan.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                <span className="text-indigo-400 flex-shrink-0">→</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
