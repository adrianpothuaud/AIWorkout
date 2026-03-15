"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ExerciseLog {
  name: string;
  setsCompleted: number;
  repsCompleted: string;
  notes: string;
  muscleGroup: string;
}

const DEFAULT_EXERCISE: ExerciseLog = {
  name: "",
  setsCompleted: 3,
  repsCompleted: "10",
  notes: "",
  muscleGroup: "",
};

export default function LogPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [overallNotes, setOverallNotes] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [exercises, setExercises] = useState<ExerciseLog[]>([{ ...DEFAULT_EXERCISE }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function addExercise() {
    setExercises((prev) => [...prev, { ...DEFAULT_EXERCISE }]);
  }

  function removeExercise(index: number) {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }

  function updateExercise(index: number, field: keyof ExerciseLog, value: string | number) {
    setExercises((prev) =>
      prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a workout title.");
      return;
    }
    if (exercises.some((ex) => !ex.name.trim())) {
      setError("Please fill in all exercise names.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          date,
          durationMinutes,
          exercises,
          overallNotes: overallNotes || undefined,
          rating: rating || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to log session");

      router.push("/history");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Log Workout Session</h1>
        <p className="text-slate-400 mt-1">Record your completed workout</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" data-testid="log-form">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Workout Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Morning Upper Body"
            required
            data-testid="session-title-input"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Date & Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              data-testid="session-date-input"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Duration: <span className="text-indigo-400">{durationMinutes} min</span>
            </label>
            <input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              min={1}
              max={300}
              data-testid="session-duration-input"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            How was your workout?
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(rating === star ? null : star)}
                data-testid={`rating-${star}`}
                className={`text-2xl transition-transform hover:scale-110 ${
                  rating !== null && star <= rating ? "opacity-100" : "opacity-30"
                }`}
              >
                ⭐
              </button>
            ))}
          </div>
        </div>

        {/* Exercises */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-slate-300">Exercises</label>
            <button
              type="button"
              onClick={addExercise}
              data-testid="add-exercise-btn"
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              + Add Exercise
            </button>
          </div>

          <div className="space-y-4">
            {exercises.map((exercise, index) => (
              <div
                key={index}
                className="bg-slate-800 rounded-xl p-4 border border-slate-700"
                data-testid="exercise-log-item"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-400 text-sm font-medium">Exercise {index + 1}</span>
                  {exercises.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExercise(index)}
                      className="text-slate-500 hover:text-red-400 transition-colors text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={exercise.name}
                    onChange={(e) => updateExercise(index, "name", e.target.value)}
                    placeholder="Exercise name"
                    data-testid="exercise-name-input"
                    className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                  />
                  <input
                    type="text"
                    value={exercise.muscleGroup}
                    onChange={(e) => updateExercise(index, "muscleGroup", e.target.value)}
                    placeholder="Muscle group"
                    className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={exercise.setsCompleted}
                      onChange={(e) => updateExercise(index, "setsCompleted", Number(e.target.value))}
                      min={1}
                      placeholder="Sets"
                      className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
                    />
                    <input
                      type="text"
                      value={exercise.repsCompleted}
                      onChange={(e) => updateExercise(index, "repsCompleted", e.target.value)}
                      placeholder="Reps"
                      className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                    />
                  </div>
                  <input
                    type="text"
                    value={exercise.notes}
                    onChange={(e) => updateExercise(index, "notes", e.target.value)}
                    placeholder="Notes (optional)"
                    className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overall Notes */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Overall Notes <span className="text-slate-500">(optional)</span>
          </label>
          <textarea
            value={overallNotes}
            onChange={(e) => setOverallNotes(e.target.value)}
            placeholder="How did the workout feel? Any PRs?"
            rows={3}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 rounded-xl p-3 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          data-testid="submit-log-btn"
          className="w-full py-4 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-2xl text-lg transition-colors"
        >
          {submitting ? "Saving..." : "📝 Log Workout"}
        </button>
      </form>
    </div>
  );
}
