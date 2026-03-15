import mongoose, { Document, Schema, Model } from "mongoose";

export interface IExercise {
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  instructions: string;
  muscleGroup: string;
}

export interface IWorkoutPlan extends Document {
  title: string;
  description: string;
  fitnessLevel: "beginner" | "intermediate" | "advanced";
  goals: string[];
  availableEquipment: string[];
  totalDurationMinutes: number;
  warmup: IExercise[];
  mainWorkout: IExercise[];
  cooldown: IExercise[];
  tips: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseSchema = new Schema<IExercise>({
  name: { type: String, required: true },
  sets: { type: Number, required: true },
  reps: { type: String, required: true },
  restSeconds: { type: Number, required: true },
  instructions: { type: String, required: true },
  muscleGroup: { type: String, required: true },
});

const WorkoutPlanSchema = new Schema<IWorkoutPlan>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    fitnessLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },
    goals: [{ type: String }],
    availableEquipment: [{ type: String }],
    totalDurationMinutes: { type: Number, required: true },
    warmup: [ExerciseSchema],
    mainWorkout: [ExerciseSchema],
    cooldown: [ExerciseSchema],
    tips: [{ type: String }],
  },
  { timestamps: true }
);

const WorkoutPlan: Model<IWorkoutPlan> =
  mongoose.models.WorkoutPlan ||
  mongoose.model<IWorkoutPlan>("WorkoutPlan", WorkoutPlanSchema);

export default WorkoutPlan;
