import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const userId = verifySessionToken(token);
    if (!userId) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    await connectDB();
    const user = await User.findById(userId).lean();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
