import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export interface WorkoutGenerationParams {
  fitnessLevel: "beginner" | "intermediate" | "advanced";
  goals: string[];
  availableEquipment: string[];
  durationMinutes: number;
  muscleGroups?: string[];
  restrictions?: string;
}

export interface GeneratedExercise {
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  instructions: string;
  muscleGroup: string;
}

export interface GeneratedWorkoutPlan {
  title: string;
  description: string;
  totalDurationMinutes: number;
  warmup: GeneratedExercise[];
  mainWorkout: GeneratedExercise[];
  cooldown: GeneratedExercise[];
  tips: string[];
}

export async function generateWorkoutPlan(
  params: WorkoutGenerationParams
): Promise<GeneratedWorkoutPlan> {
  const model = getGenAI().getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are an expert personal trainer. Generate a detailed workout plan in valid JSON format.

Parameters:
- Fitness Level: ${params.fitnessLevel}
- Goals: ${params.goals.join(", ")}
- Available Equipment: ${params.availableEquipment.join(", ")}
- Duration: ${params.durationMinutes} minutes
${params.muscleGroups ? `- Target Muscle Groups: ${params.muscleGroups.join(", ")}` : ""}
${params.restrictions ? `- Restrictions/Notes: ${params.restrictions}` : ""}

Return ONLY a JSON object with this exact structure (no markdown, no explanation):
{
  "title": "workout title",
  "description": "brief description",
  "totalDurationMinutes": number,
  "warmup": [
    {
      "name": "exercise name",
      "sets": number,
      "reps": "rep count or duration e.g. '10' or '30 seconds'",
      "restSeconds": number,
      "instructions": "step by step instructions",
      "muscleGroup": "primary muscle group"
    }
  ],
  "mainWorkout": [...same structure...],
  "cooldown": [...same structure...],
  "tips": ["tip1", "tip2"]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Strip potential markdown code fences
  const jsonText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    return JSON.parse(jsonText) as GeneratedWorkoutPlan;
  } catch {
    throw new Error(`Failed to parse Gemini response as JSON: ${jsonText.slice(0, 200)}`);
  }
}

export async function getWorkoutTips(workoutType: string, fitnessLevel: string): Promise<string[]> {
  const model = getGenAI().getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Give 5 concise, actionable tips for a ${fitnessLevel} person doing ${workoutType} workout. 
Return ONLY a JSON array of strings, e.g. ["tip1", "tip2", ...]`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    return JSON.parse(text) as string[];
  } catch {
    return [text];
  }
}
