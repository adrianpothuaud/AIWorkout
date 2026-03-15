import { connectDB } from "@/lib/mongodb";
import WorkoutSession from "@/models/WorkoutSession";
import WorkoutPlan from "@/models/WorkoutPlan";

export interface WorkoutContext {
  recentSessions: Array<{
    title: string;
    date: string;
    durationMinutes: number;
    muscleGroups: string[];
    exerciseNames: string[];
    rating?: number;
  }>;
  recentPlans: Array<{
    fitnessLevel: string;
    goals: string[];
    equipment: string[];
  }>;
  preferredMuscleGroups: string[];
  frequentlyUsedEquipment: string[];
  averageDurationMinutes: number;
  totalSessionsCount: number;
}

export async function buildWorkoutContext(limit = 10): Promise<WorkoutContext> {
  await connectDB();

  const [sessions, plans] = await Promise.all([
    WorkoutSession.find({}).sort({ date: -1 }).limit(limit).lean(),
    WorkoutPlan.find({}).sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  const recentSessions = sessions.map((s) => ({
    title: s.title,
    date: new Date(s.date).toLocaleDateString(),
    durationMinutes: s.durationMinutes,
    muscleGroups: [
      ...new Set(
        s.exercises
          .map((e: { muscleGroup: string }) => e.muscleGroup)
          .filter(Boolean)
      ),
    ] as string[],
    exerciseNames: s.exercises.map((e: { name: string }) => e.name),
    rating: s.rating,
  }));

  const recentPlans = plans.map((p) => ({
    fitnessLevel: p.fitnessLevel,
    goals: p.goals,
    equipment: p.availableEquipment,
  }));

  // Count muscle group frequency across recent sessions
  const muscleGroupCounts: Record<string, number> = {};
  for (const session of recentSessions) {
    for (const mg of session.muscleGroups) {
      muscleGroupCounts[mg] = (muscleGroupCounts[mg] || 0) + 1;
    }
  }
  const preferredMuscleGroups = Object.entries(muscleGroupCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([mg]) => mg);

  // Count equipment frequency across recent plans
  const equipmentCounts: Record<string, number> = {};
  for (const plan of recentPlans) {
    for (const eq of plan.equipment) {
      equipmentCounts[eq] = (equipmentCounts[eq] || 0) + 1;
    }
  }
  const frequentlyUsedEquipment = Object.entries(equipmentCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([eq]) => eq);

  const averageDurationMinutes =
    sessions.length > 0
      ? Math.round(
          sessions.reduce((sum, s) => sum + s.durationMinutes, 0) /
            sessions.length
        )
      : 0;

  return {
    recentSessions,
    recentPlans,
    preferredMuscleGroups,
    frequentlyUsedEquipment,
    averageDurationMinutes,
    totalSessionsCount: sessions.length,
  };
}

export function formatContextForPrompt(context: WorkoutContext): string {
  if (
    context.totalSessionsCount === 0 &&
    context.recentPlans.length === 0
  ) {
    return "";
  }

  const lines: string[] = [
    "## User Workout History & Preferences (use this to personalise the plan):",
  ];

  if (context.totalSessionsCount > 0) {
    lines.push(
      `- Sessions on record: ${context.totalSessionsCount}`,
      `- Average workout duration: ${context.averageDurationMinutes} minutes`
    );
  }

  if (context.preferredMuscleGroups.length > 0) {
    lines.push(
      `- Most frequently trained muscle groups: ${context.preferredMuscleGroups.join(", ")}`
    );
  }

  if (context.frequentlyUsedEquipment.length > 0) {
    lines.push(
      `- Preferred equipment (from history): ${context.frequentlyUsedEquipment.join(", ")}`
    );
  }

  if (context.recentSessions.length > 0) {
    lines.push("\nRecent sessions (newest first):");
    for (const session of context.recentSessions.slice(0, 5)) {
      const ratingStr = session.rating ? ` | rated ${session.rating}/5` : "";
      const mgStr =
        session.muscleGroups.length > 0
          ? ` | muscles: ${session.muscleGroups.join(", ")}`
          : "";
      lines.push(
        `  • ${session.date}: "${session.title}" – ${session.durationMinutes} min${mgStr}${ratingStr}`
      );
      if (session.exerciseNames.length > 0) {
        lines.push(
          `    Exercises: ${session.exerciseNames.slice(0, 6).join(", ")}`
        );
      }
    }
  }

  lines.push(
    "\nInstructions for using this context:",
    "- Vary exercises to avoid repeating the same ones from recent sessions",
    "- Promote muscle group balance considering what was recently trained",
    "- Build progressive difficulty when similar sessions received high ratings",
    "- Align equipment choices with what the user already uses regularly"
  );

  return lines.join("\n");
}
