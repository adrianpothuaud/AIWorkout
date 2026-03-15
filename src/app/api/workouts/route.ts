import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import WorkoutPlan from "@/models/WorkoutPlan";
import { generateWorkoutPlan, WorkoutGenerationParams } from "@/lib/gemini";

export async function GET() {
  try {
    await connectDB();
    const plans = await WorkoutPlan.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ plans });
  } catch (error) {
    console.error("GET /api/workouts error:", error);
    return NextResponse.json({ error: "Failed to fetch workout plans" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as WorkoutGenerationParams & { save?: boolean };
    const { save, ...params } = body;

    // Validate required fields
    if (!params.fitnessLevel || !params.goals || !params.availableEquipment || !params.durationMinutes) {
      return NextResponse.json(
        { error: "Missing required fields: fitnessLevel, goals, availableEquipment, durationMinutes" },
        { status: 400 }
      );
    }

    // Generate using Gemini
    const generated = await generateWorkoutPlan(params);

    if (save) {
      await connectDB();
      const plan = new WorkoutPlan({
        ...generated,
        fitnessLevel: params.fitnessLevel,
        goals: params.goals,
        availableEquipment: params.availableEquipment,
      });
      await plan.save();
      return NextResponse.json({ plan: plan.toObject() }, { status: 201 });
    }

    return NextResponse.json({ plan: generated }, { status: 200 });
  } catch (error) {
    console.error("POST /api/workouts error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate workout plan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
