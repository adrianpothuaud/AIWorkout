"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ExerciseList from "@/components/ExerciseList";
import { GeneratedWorkoutPlan } from "@/lib/gemini";

const FITNESS_LEVELS = ["beginner", "intermediate", "advanced"] as const;
const GOALS = ["Weight Loss", "Muscle Gain", "Endurance", "Flexibility", "Strength", "General Fitness"];
const EQUIPMENT = ["No Equipment", "Dumbbells", "Barbell", "Resistance Bands", "Pull-up Bar", "Kettlebell", "Full Gym"];
const MUSCLE_GROUPS = ["Full Body", "Upper Body", "Lower Body", "Core", "Chest", "Back", "Shoulders", "Arms", "Legs", "Glutes"];
const DISCIPLINES = ["Street Workout", "Musculation", "CrossFit", "Cardio", "Gym", "Yoga", "HIIT", "Running"];

export default function PlanPage() {
  const [fitnessLevel, setFitnessLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([]);
  const [discipline, setDiscipline] = useState<string | null>(null);
  const [duration, setDuration] = useState(45);
  const [restrictions, setRestrictions] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<GeneratedWorkoutPlan | null>(null);
  const [personalized, setPersonalized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setIsAuthenticated(!!data.user))
      .catch(() => setIsAuthenticated(false));
  }, []);

  function toggle<T>(arr: T[], item: T): T[] {
    return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (selectedGoals.length === 0) {
      setError("Please select at least one goal.");
      return;
    }
    if (selectedEquipment.length === 0) {
      setError("Please select at least one equipment option.");
      return;
    }

    setError("");
    setLoading(true);
    setPlan(null);
    setSaved(false);
    setPersonalized(false);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fitnessLevel,
          goals: selectedGoals,
          availableEquipment: selectedEquipment,
          durationMinutes: duration,
          discipline: discipline || undefined,
          muscleGroups: selectedMuscleGroups.length > 0 ? selectedMuscleGroups : undefined,
          restrictions: restrictions || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate workout");
      }

      setPlan(data.plan);
      setPersonalized(!!data.personalized);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!plan) return;
    setSaving(true);
    try {
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fitnessLevel,
          goals: selectedGoals,
          availableEquipment: selectedEquipment,
          durationMinutes: duration,
          save: true,
          ...plan,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to save");
      }
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save plan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Unauthenticated user banner */}
      {isAuthenticated === false && !bannerDismissed && (
        <div
          className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3"
          data-testid="guest-banner"
        >
          <span className="text-2xl flex-shrink-0">⚠️</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800 mb-1">
              Données stockées uniquement dans votre navigateur
            </p>
            <p className="text-sm text-amber-700 mb-3">
              Sans compte utilisateur, vos plans et sessions sont enregistrés localement dans votre
              navigateur et peuvent être perdus si vous videz votre cache ou changez d&apos;appareil.
              Créez un compte pour une sauvegarde sécurisée et persistante en base de données.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/register"
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors"
                data-testid="guest-banner-register"
              >
                Créer un compte
              </Link>
              <Link
                href="/login"
                className="px-4 py-1.5 bg-white hover:bg-amber-50 text-amber-700 text-sm font-semibold rounded-lg border border-amber-300 transition-colors"
                data-testid="guest-banner-login"
              >
                Se connecter
              </Link>
              <button
                onClick={() => setBannerDismissed(true)}
                className="px-4 py-1.5 text-amber-600 hover:text-amber-800 text-sm font-medium transition-colors"
                data-testid="guest-banner-dismiss"
              >
                Ignorer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Generate Workout Plan</h1>
        <p className="text-gray-500 mt-1 text-sm">Let AI craft the perfect workout for you</p>
      </div>

      <form onSubmit={handleGenerate} className="space-y-6" data-testid="generate-form">
        {/* Discipline */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Discipline <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {DISCIPLINES.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDiscipline((prev) => (prev === d ? null : d))}
                data-testid={`discipline-${d.replace(/\s+/g, "-").toLowerCase()}`}
                className={`py-1.5 px-4 rounded-full border text-sm font-medium transition-colors ${
                  discipline === d
                    ? "bg-violet-600 border-violet-600 text-white"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        {/* Fitness Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Fitness Level</label>
          <div className="flex gap-2">
            {FITNESS_LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setFitnessLevel(level)}
                data-testid={`level-${level}`}
                className={`flex-1 py-2 px-4 rounded-xl border text-sm font-medium capitalize transition-colors ${
                  fitnessLevel === level
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Goals <span className="text-gray-400 font-normal">(select all that apply)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {GOALS.map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => setSelectedGoals((prev) => toggle(prev, goal))}
                data-testid={`goal-${goal.replace(/\s+/g, "-").toLowerCase()}`}
                className={`py-1.5 px-4 rounded-full border text-sm font-medium transition-colors ${
                  selectedGoals.includes(goal)
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>

        {/* Equipment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Available Equipment <span className="text-gray-400 font-normal">(select all that apply)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT.map((eq) => (
              <button
                key={eq}
                type="button"
                onClick={() => setSelectedEquipment((prev) => toggle(prev, eq))}
                data-testid={`equipment-${eq.replace(/\s+/g, "-").toLowerCase()}`}
                className={`py-1.5 px-4 rounded-full border text-sm font-medium transition-colors ${
                  selectedEquipment.includes(eq)
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {eq}
              </button>
            ))}
          </div>
        </div>

        {/* Muscle Groups */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Muscle Groups <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {MUSCLE_GROUPS.map((mg) => (
              <button
                key={mg}
                type="button"
                onClick={() => setSelectedMuscleGroups((prev) => toggle(prev, mg))}
                className={`py-1.5 px-4 rounded-full border text-sm font-medium transition-colors ${
                  selectedMuscleGroups.includes(mg)
                    ? "bg-violet-600 border-violet-600 text-white"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {mg}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration: <span className="text-indigo-600 font-semibold">{duration} minutes</span>
          </label>
          <input
            type="range"
            min={15}
            max={90}
            step={5}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            data-testid="duration-slider"
            className="w-full accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>15 min</span>
            <span>90 min</span>
          </div>
        </div>

        {/* Restrictions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Restrictions / Notes <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={restrictions}
            onChange={(e) => setRestrictions(e.target.value)}
            placeholder="e.g. bad knees, avoid jumping exercises..."
            rows={3}
            data-testid="restrictions-input"
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm" data-testid="error-message">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          data-testid="generate-btn"
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-base transition-colors"
        >
          {loading ? "✨ Generating..." : "✨ Generate Workout Plan"}
        </button>
      </form>

      {/* Generated Plan */}
      {plan && (
        <div className="mt-10" data-testid="generated-plan">
          <div className="flex items-start justify-between mb-6 gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{plan.title}</h2>
              <p className="text-gray-500 mt-1 text-sm">{plan.description}</p>
              <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full mt-2">
                ⏱️ {plan.totalDurationMinutes} min
              </span>
              {personalized && (
                <span
                  className="inline-flex items-center gap-1 bg-indigo-900/60 border border-indigo-700 text-indigo-300 text-xs px-2.5 py-1 rounded-full mt-2 ml-2"
                  data-testid="personalized-badge"
                >
                  🎯 Personalized for you
                </span>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={saving || saved}
              data-testid="save-plan-btn"
              className={`flex-shrink-0 px-4 py-2 font-medium rounded-xl transition-colors text-sm ${
                saved
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                  : "bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-100 disabled:text-gray-400 text-white"
              }`}
            >
              {saved ? "✅ Saved!" : saving ? "Saving..." : "💾 Save Plan"}
            </button>
          </div>

          <ExerciseList title="🔥 Warm-up" exercises={plan.warmup} accentColor="amber" />
          <ExerciseList title="💪 Main Workout" exercises={plan.mainWorkout} accentColor="indigo" />
          <ExerciseList title="🧘 Cool-down" exercises={plan.cooldown} accentColor="green" />

          {plan.tips && plan.tips.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm mt-4">
              <h3 className="font-semibold text-gray-900 mb-3">💡 Training Tips</h3>
              <ul className="space-y-2">
                {plan.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                    <span className="text-indigo-500 flex-shrink-0">→</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
