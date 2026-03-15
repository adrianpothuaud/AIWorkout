import { NextRequest, NextResponse } from "next/server";
import { generateWorkoutPlan, getWorkoutTips, WorkoutGenerationParams } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as WorkoutGenerationParams & { type?: "plan" | "tips"; workoutType?: string };

    if (body.type === "tips") {
      const tips = await getWorkoutTips(body.workoutType || "general", body.fitnessLevel || "beginner");
      return NextResponse.json({ tips });
    }

    if (!body.fitnessLevel || !body.goals || !body.availableEquipment || !body.durationMinutes) {
      return NextResponse.json(
        { error: "Missing required fields: fitnessLevel, goals, availableEquipment, durationMinutes" },
        { status: 400 }
      );
    }

    const plan = await generateWorkoutPlan(body);
    return NextResponse.json({ plan });
  } catch (error) {
    console.error("POST /api/generate error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate content";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
