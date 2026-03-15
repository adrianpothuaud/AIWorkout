import mongoose, { Document, Schema, Model } from "mongoose";

export interface IExerciseLog {
  name: string;
  setsCompleted: number;
  repsCompleted: string;
  notes?: string;
  muscleGroup: string;
}

export interface IWorkoutSession extends Document {
  workoutPlanId?: mongoose.Types.ObjectId;
  title: string;
  date: Date;
  durationMinutes: number;
  exercises: IExerciseLog[];
  overallNotes?: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseLogSchema = new Schema<IExerciseLog>({
  name: { type: String, required: true },
  setsCompleted: { type: Number, required: true },
  repsCompleted: { type: String, required: true },
  notes: { type: String },
  muscleGroup: { type: String, required: true },
});

const WorkoutSessionSchema = new Schema<IWorkoutSession>(
  {
    workoutPlanId: { type: Schema.Types.ObjectId, ref: "WorkoutPlan" },
    title: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    durationMinutes: { type: Number, required: true },
    exercises: [ExerciseLogSchema],
    overallNotes: { type: String },
    rating: { type: Number, min: 1, max: 5 },
  },
  { timestamps: true }
);

const WorkoutSession: Model<IWorkoutSession> =
  mongoose.models.WorkoutSession ||
  mongoose.model<IWorkoutSession>("WorkoutSession", WorkoutSessionSchema);

export default WorkoutSession;
