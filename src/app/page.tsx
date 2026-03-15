import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      {/* Hero */}
      <div className="mb-8">
        <div className="text-7xl mb-4">💪</div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
          AI-Powered{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Workout Planner
          </span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
          Generate personalised workout plans with Google Gemini, track your progress, and reach
          your fitness goals faster than ever.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-16">
        <Link
          href="/plan"
          data-testid="cta-generate"
          className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/30"
        >
          ✨ Generate Workout
        </Link>
        <Link
          href="/dashboard"
          data-testid="cta-dashboard"
          className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-lg transition-all border border-slate-700 hover:border-slate-600"
        >
          📊 View Dashboard
        </Link>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl w-full">
        {[
          {
            icon: "🤖",
            title: "AI-Powered Planning",
            desc: "Google Gemini creates personalised plans based on your goals, equipment, and fitness level.",
          },
          {
            icon: "📊",
            title: "Progress Tracking",
            desc: "Log every session and visualise your improvement over time with detailed history.",
          },
          {
            icon: "📱",
            title: "Works Offline",
            desc: "Installed as a PWA, AIWorkout works seamlessly even without an internet connection.",
          },
          {
            icon: "🎯",
            title: "Goal-Oriented",
            desc: "Whether it is weight loss, muscle gain, or endurance — we tailor every workout to your goals.",
          },
          {
            icon: "🏋️",
            title: "Any Equipment",
            desc: "From bodyweight to full gym setups — generate effective workouts for your situation.",
          },
          {
            icon: "⚡",
            title: "Quick and Easy",
            desc: "Generate a complete workout in seconds and start training immediately.",
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 text-left hover:border-indigo-700 transition-colors"
          >
            <div className="text-3xl mb-3">{feature.icon}</div>
            <h3 className="font-bold text-white mb-1">{feature.title}</h3>
            <p className="text-slate-400 text-sm">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
