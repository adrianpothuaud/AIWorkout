import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import WorkoutPlan from "@/models/WorkoutPlan";
import mongoose from "mongoose";

interface RouteParams {
  params: { id: string };
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json({ error: "Invalid workout plan ID" }, { status: 400 });
    }

    await connectDB();
    const plan = await WorkoutPlan.findById(params.id).lean();

    if (!plan) {
      return NextResponse.json({ error: "Workout plan not found" }, { status: 404 });
    }

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("GET /api/workouts/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch workout plan" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json({ error: "Invalid workout plan ID" }, { status: 400 });
    }

    await connectDB();
    const plan = await WorkoutPlan.findByIdAndDelete(params.id);

    if (!plan) {
      return NextResponse.json({ error: "Workout plan not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Workout plan deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/workouts/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete workout plan" }, { status: 500 });
  }
}
