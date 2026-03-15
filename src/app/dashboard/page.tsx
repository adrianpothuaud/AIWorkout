"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import WorkoutCard from "@/components/WorkoutCard";

interface WorkoutPlan {
  _id: string;
  title: string;
  description: string;
  totalDurationMinutes: number;
  fitnessLevel: string;
  goals: string[];
  warmup: unknown[];
  mainWorkout: unknown[];
  cooldown: unknown[];
  createdAt: string;
}

interface WorkoutSession {
  _id: string;
  title: string;
  date: string;
  durationMinutes: number;
  exercises: unknown[];
  rating?: number;
}

export default function DashboardPage() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  async function fetchData() {
      try {
        const [plansRes, sessionsRes] = await Promise.all([
          fetch("/api/workouts"),
          fetch("/api/sessions"),
        ]);
        const plansData = await plansRes.json();
        const sessionsData = await sessionsRes.json();
        setPlans(plansData.plans || []);
        setSessions(sessionsData.sessions || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function deletePlan(id: string) {
    if (!confirm("Delete this workout plan?")) return;
    try {
      await fetch(`/api/workouts/${id}`, { method: "DELETE" });
      setPlans((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      console.error("Failed to delete plan:", error);
    }
  }

  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const ratedSessions = sessions.filter((s) => s.rating);
  const avgRating = ratedSessions.length > 0
    ? ratedSessions.reduce((sum, s) => sum + (s.rating || 0), 0) / ratedSessions.length
    : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm">Your workout overview</p>
        </div>
        <Link
          href="/plan"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors text-sm"
        >
          + New Plan
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-500 text-sm">Loading dashboard...</p>
          </div>
        </div>
      ) : (
      <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Saved Plans", value: plans.length, icon: "📋" },
          { label: "Sessions Logged", value: sessions.length, icon: "✅" },
          { label: "Total Minutes", value: totalMinutes, icon: "⏱️" },
          { label: "Avg. Rating", value: avgRating ? avgRating.toFixed(1) : "—", icon: "⭐" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm"
            data-testid="stat-card"
          >
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-gray-500 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Plans */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Saved Plans</h2>
          {plans.length > 3 && (
            <Link href="/history" className="text-indigo-600 text-sm hover:text-indigo-700">
              View all →
            </Link>
          )}
        </div>
        {plans.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center shadow-sm">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-gray-500 mb-4 text-sm">No workout plans yet.</p>
            <Link
              href="/plan"
              className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors text-sm"
            >
              Generate your first plan
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {plans.slice(0, 6).map((plan) => (
              <WorkoutCard
                key={plan._id}
                id={plan._id}
                title={plan.title}
                description={plan.description}
                totalDurationMinutes={plan.totalDurationMinutes}
                fitnessLevel={plan.fitnessLevel}
                goals={plan.goals}
                exerciseCount={
                  (plan.warmup?.length || 0) +
                  (plan.mainWorkout?.length || 0) +
                  (plan.cooldown?.length || 0)
                }
                createdAt={plan.createdAt}
                onDelete={deletePlan}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Sessions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Sessions</h2>
          {sessions.length > 5 && (
            <Link href="/history" className="text-indigo-600 text-sm hover:text-indigo-700">
              View all →
            </Link>
          )}
        </div>
        {sessions.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center shadow-sm">
            <div className="text-4xl mb-3">📅</div>
            <p className="text-gray-500 mb-4 text-sm">No workout sessions logged yet.</p>
            <Link
              href="/log"
              className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors text-sm"
            >
              Log your first session
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.slice(0, 5).map((session) => (
              <div
                key={session._id}
                className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-center justify-between"
                data-testid="session-item"
              >
                <div>
                  <p className="font-medium text-gray-900 text-sm">{session.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {new Date(session.date).toLocaleDateString()} · {session.durationMinutes} min ·{" "}
                    {session.exercises?.length || 0} exercises
                  </p>
                </div>
                {session.rating && (
                  <div className="text-amber-500 font-bold text-sm">
                    {"⭐".repeat(session.rating)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
}
