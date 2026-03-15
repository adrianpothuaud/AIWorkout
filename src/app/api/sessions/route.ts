import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import WorkoutSession from "@/models/WorkoutSession";

export async function GET() {
  try {
    await connectDB();
    const sessions = await WorkoutSession.find({})
      .sort({ date: -1 })
      .populate("workoutPlanId", "title")
      .lean();
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("GET /api/sessions error:", error);
    return NextResponse.json({ error: "Failed to fetch workout sessions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || !body.durationMinutes || !body.exercises) {
      return NextResponse.json(
        { error: "Missing required fields: title, durationMinutes, exercises" },
        { status: 400 }
      );
    }

    await connectDB();
    const session = new WorkoutSession({
      ...body,
      date: body.date ? new Date(body.date) : new Date(),
    });
    await session.save();

    return NextResponse.json({ session: session.toObject() }, { status: 201 });
  } catch (error) {
    console.error("POST /api/sessions error:", error);
    return NextResponse.json({ error: "Failed to log workout session" }, { status: 500 });
  }
}
