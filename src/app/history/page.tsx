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
            <h1 className="text-3xl font-bold text-white">Workout History</h1>
            <p className="text-slate-400 mt-1">All your logged sessions</p>
          </div>
          <Link
            href="/log"
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-medium rounded-xl transition-colors"
          >
            + Log Session
          </Link>
        </div>
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-4xl animate-spin">⚙️</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Workout History</h1>
          <p className="text-slate-400 mt-1">All your logged sessions</p>
        </div>
        <Link
          href="/log"
          className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-medium rounded-xl transition-colors"
        >
          + Log Session
        </Link>
      </div>

      {/* Stats Banner */}
      {sessions.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 text-center">
            <div className="text-2xl font-bold text-white">{sessions.length}</div>
            <div className="text-slate-400 text-sm">Sessions</div>
          </div>
          <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 text-center">
            <div className="text-2xl font-bold text-white">
              {totalHours > 0 ? `${totalHours}h ${remainingMinutes}m` : `${totalMinutes}m`}
            </div>
            <div className="text-slate-400 text-sm">Total Time</div>
          </div>
          <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 text-center">
            <div className="text-2xl font-bold text-white">
              {(sessions.reduce((sum, s) => sum + s.exercises.length, 0))}
            </div>
            <div className="text-slate-400 text-sm">Total Exercises</div>
          </div>
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="bg-slate-800 rounded-2xl p-12 border border-slate-700 text-center">
          <div className="text-5xl mb-4">📅</div>
          <h2 className="text-xl font-bold text-white mb-2">No sessions yet</h2>
          <p className="text-slate-400 mb-6">Start logging your workouts to track your progress.</p>
          <Link
            href="/log"
            className="inline-block px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-2xl transition-colors"
          >
            Log Your First Session
          </Link>
        </div>
      ) : (
        <div className="space-y-4" data-testid="sessions-list">
          {sessions.map((session) => {
            const isExpanded = expandedId === session._id;
            return (
              <div
                key={session._id}
                className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden"
                data-testid="history-session-item"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : session._id)}
                  className="w-full p-5 text-left hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-white">{session.title}</h3>
                      <p className="text-slate-400 text-sm mt-1">
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
                          <span className="text-amber-400 text-sm">
                            {"⭐".repeat(session.rating)}
                          </span>
                        )}
                        <span className="text-slate-400 text-sm">{isExpanded ? "▲" : "▼"}</span>
                      </div>
                      <div className="flex gap-3 mt-1 justify-end">
                        <span className="text-slate-400 text-xs">⏱️ {session.durationMinutes} min</span>
                        <span className="text-slate-400 text-xs">💪 {session.exercises.length} exercises</span>
                      </div>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-slate-700 pt-4">
                    <div className="space-y-2 mb-4">
                      {session.exercises.map((ex, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div>
                            <span className="text-white font-medium">{ex.name}</span>
                            {ex.muscleGroup && (
                              <span className="text-slate-500 ml-2">· {ex.muscleGroup}</span>
                            )}
                          </div>
                          <span className="text-slate-400">
                            {ex.setsCompleted} × {ex.repsCompleted}
                          </span>
                        </div>
                      ))}
                    </div>
                    {session.overallNotes && (
                      <div className="bg-slate-700 rounded-lg p-3 text-slate-300 text-sm">
                        <span className="text-slate-400">Notes: </span>
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
