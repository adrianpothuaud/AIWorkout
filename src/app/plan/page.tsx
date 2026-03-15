"use client";

import { useState } from "react";
import ExerciseList from "@/components/ExerciseList";
import { GeneratedWorkoutPlan } from "@/lib/gemini";

const FITNESS_LEVELS = ["beginner", "intermediate", "advanced"] as const;
const GOALS = ["Weight Loss", "Muscle Gain", "Endurance", "Flexibility", "Strength", "General Fitness"];
const EQUIPMENT = ["No Equipment", "Dumbbells", "Barbell", "Resistance Bands", "Pull-up Bar", "Kettlebell", "Full Gym"];
const MUSCLE_GROUPS = ["Full Body", "Upper Body", "Lower Body", "Core", "Chest", "Back", "Shoulders", "Arms", "Legs", "Glutes"];

export default function PlanPage() {
  const [fitnessLevel, setFitnessLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([]);
  const [duration, setDuration] = useState(45);
  const [restrictions, setRestrictions] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<GeneratedWorkoutPlan | null>(null);
  const [personalized, setPersonalized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Generate Workout Plan</h1>
        <p className="text-slate-400 mt-1">Let AI craft the perfect workout for you</p>
      </div>

      <form onSubmit={handleGenerate} className="space-y-6" data-testid="generate-form">
        {/* Fitness Level */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Fitness Level</label>
          <div className="flex gap-3">
            {FITNESS_LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setFitnessLevel(level)}
                data-testid={`level-${level}`}
                className={`flex-1 py-2 px-4 rounded-xl border text-sm font-medium capitalize transition-colors ${
                  fitnessLevel === level
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Goals <span className="text-slate-500">(select all that apply)</span>
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
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600"
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>

        {/* Equipment */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Available Equipment <span className="text-slate-500">(select all that apply)</span>
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
                    ? "bg-green-700 border-green-600 text-white"
                    : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600"
                }`}
              >
                {eq}
              </button>
            ))}
          </div>
        </div>

        {/* Muscle Groups */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Target Muscle Groups <span className="text-slate-500">(optional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {MUSCLE_GROUPS.map((mg) => (
              <button
                key={mg}
                type="button"
                onClick={() => setSelectedMuscleGroups((prev) => toggle(prev, mg))}
                className={`py-1.5 px-4 rounded-full border text-sm font-medium transition-colors ${
                  selectedMuscleGroups.includes(mg)
                    ? "bg-purple-700 border-purple-600 text-white"
                    : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600"
                }`}
              >
                {mg}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Duration: <span className="text-indigo-400">{duration} minutes</span>
          </label>
          <input
            type="range"
            min={15}
            max={90}
            step={5}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            data-testid="duration-slider"
            className="w-full accent-indigo-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>15 min</span>
            <span>90 min</span>
          </div>
        </div>

        {/* Restrictions */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Restrictions / Notes <span className="text-slate-500">(optional)</span>
          </label>
          <textarea
            value={restrictions}
            onChange={(e) => setRestrictions(e.target.value)}
            placeholder="e.g. bad knees, avoid jumping exercises..."
            rows={3}
            data-testid="restrictions-input"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 rounded-xl p-3 text-sm" data-testid="error-message">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          data-testid="generate-btn"
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-2xl text-lg transition-colors"
        >
          {loading ? "✨ Generating..." : "✨ Generate Workout Plan"}
        </button>
      </form>

      {/* Generated Plan */}
      {plan && (
        <div className="mt-10" data-testid="generated-plan">
          <div className="flex items-start justify-between mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">{plan.title}</h2>
              <p className="text-slate-400 mt-1">{plan.description}</p>
              <span className="inline-flex items-center gap-1 bg-slate-700 text-slate-300 text-xs px-2.5 py-1 rounded-full mt-2">
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
                  ? "bg-green-800 text-green-200 cursor-default"
                  : "bg-green-600 hover:bg-green-500 disabled:bg-slate-700 text-white"
              }`}
            >
              {saved ? "✅ Saved!" : saving ? "Saving..." : "💾 Save Plan"}
            </button>
          </div>

          <ExerciseList title="🔥 Warm-up" exercises={plan.warmup} accentColor="amber" />
          <ExerciseList title="💪 Main Workout" exercises={plan.mainWorkout} accentColor="indigo" />
          <ExerciseList title="🧘 Cool-down" exercises={plan.cooldown} accentColor="green" />

          {plan.tips && plan.tips.length > 0 && (
            <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 mt-4">
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
      )}
    </div>
  );
}
