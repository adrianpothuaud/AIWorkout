"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface WorkoutSession {
  _id: string;
  title: string;
  date: string;
  durationMinutes: number;
  exercises: Array<{
    name: string;
    setsCompleted: number;
    repsCompleted: string;
    muscleGroup: string;
    notes?: string;
  }>;
  overallNotes?: string;
  rating?: number;
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch("/api/sessions");
        const data = await res.json();
        setSessions(data.sessions || []);
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, []);

  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Workout History</h1>
            <p className="text-gray-500 mt-1 text-sm">All your logged sessions</p>
          </div>
          <Link
            href="/log"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors text-sm"
          >
            + Log Session
          </Link>
        </div>
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workout History</h1>
          <p className="text-gray-500 mt-1 text-sm">All your logged sessions</p>
        </div>
        <Link
          href="/log"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors text-sm"
        >
          + Log Session
        </Link>
      </div>

      {/* Stats Banner */}
      {sessions.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm text-center">
            <div className="text-2xl font-bold text-gray-900">{sessions.length}</div>
            <div className="text-gray-500 text-sm">Sessions</div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm text-center">
            <div className="text-2xl font-bold text-gray-900">
              {totalHours > 0 ? `${totalHours}h ${remainingMinutes}m` : `${totalMinutes}m`}
            </div>
            <div className="text-gray-500 text-sm">Total Time</div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm text-center">
            <div className="text-2xl font-bold text-gray-900">
              {(sessions.reduce((sum, s) => sum + s.exercises.length, 0))}
            </div>
            <div className="text-gray-500 text-sm">Total Exercises</div>
          </div>
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-200 shadow-sm text-center">
          <div className="text-5xl mb-4">📅</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No sessions yet</h2>
          <p className="text-gray-500 mb-6 text-sm">Start logging your workouts to track your progress.</p>
          <Link
            href="/log"
            className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            Log Your First Session
          </Link>
        </div>
      ) : (
        <div className="space-y-3" data-testid="sessions-list">
          {sessions.map((session) => {
            const isExpanded = expandedId === session._id;
            return (
              <div
                key={session._id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                data-testid="history-session-item"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : session._id)}
                  className="w-full p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{session.title}</h3>
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(session.date).toLocaleDateString("en-GB", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-3">
                        {session.rating && (
                          <span className="text-amber-500 text-xs">
                            {"⭐".repeat(session.rating)}
                          </span>
                        )}
                        <span className="text-gray-400 text-xs">{isExpanded ? "▲" : "▼"}</span>
                      </div>
                      <div className="flex gap-3 mt-1 justify-end">
                        <span className="text-gray-400 text-xs">⏱️ {session.durationMinutes} min</span>
                        <span className="text-gray-400 text-xs">💪 {session.exercises.length} exercises</span>
                      </div>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                    <div className="space-y-2 mb-4">
                      {session.exercises.map((ex, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div>
                            <span className="text-gray-900 font-medium">{ex.name}</span>
                            {ex.muscleGroup && (
                              <span className="text-gray-400 ml-2">· {ex.muscleGroup}</span>
                            )}
                          </div>
                          <span className="text-gray-500 text-xs">
                            {ex.setsCompleted} × {ex.repsCompleted}
                          </span>
                        </div>
                      ))}
                    </div>
                    {session.overallNotes && (
                      <div className="bg-gray-50 rounded-lg p-3 text-gray-600 text-sm border border-gray-100">
                        <span className="text-gray-400">Notes: </span>
                        {session.overallNotes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
