import { NextRequest, NextResponse } from "next/server";
import { generateWorkoutPlan, getWorkoutTips, WorkoutGenerationParams } from "@/lib/gemini";
import { buildWorkoutContext, formatContextForPrompt } from "@/lib/rag";

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

    // Build RAG context from workout history – fail silently if DB is unavailable
    let ragContext: string | undefined;
    let personalized = false;
    try {
      const context = await buildWorkoutContext();
      ragContext = formatContextForPrompt(context);
      personalized = ragContext.length > 0;
    } catch {
      // RAG context is best-effort; generation proceeds without it
    }

    const plan = await generateWorkoutPlan(body, ragContext);
    return NextResponse.json({ plan, personalized });
  } catch (error) {
    console.error("POST /api/generate error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate content";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
