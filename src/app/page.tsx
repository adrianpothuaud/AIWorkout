import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      {/* Hero */}
      <div className="mb-10">
        <div className="text-7xl mb-5">💪</div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4 leading-tight">
          AI-Powered{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
            Workout Planner
          </span>
        </h1>
        <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto">
          Generate personalised workout plans with Google Gemini, track your progress, and reach
          your fitness goals faster than ever.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mb-16">
        <Link
          href="/plan"
          data-testid="cta-generate"
          className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-base transition-all hover:shadow-md hover:shadow-indigo-200"
        >
          ✨ Generate Workout
        </Link>
        <Link
          href="/dashboard"
          data-testid="cta-dashboard"
          className="px-8 py-3.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-base transition-all border border-gray-200 hover:border-gray-300 shadow-sm"
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
            className="bg-white border border-gray-200 rounded-2xl p-5 text-left hover:shadow-md transition-shadow"
          >
            <div className="text-3xl mb-3">{feature.icon}</div>
            <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
            <p className="text-gray-500 text-sm">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
