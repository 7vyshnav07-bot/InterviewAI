interface ResumeScoreProps {
  score: number;
  strengths: string[];
  improvements: string[];
}

export default function ResumeScore({
  score,
  strengths,
  improvements,
}: ResumeScoreProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">

      {/* Score */}

      <div className="rounded-xl border bg-card p-6">

        <h2 className="text-xl font-bold">
          Resume Score
        </h2>

        <div className="mt-6 text-center">

          <h1 className="text-6xl font-bold text-blue-600">
            {score}
          </h1>

          <p className="text-muted-foreground">
            out of 100
          </p>

        </div>

        <div className="mt-6 h-4 overflow-hidden rounded-full bg-slate-200">

          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500"
            style={{
              width: `${score}%`,
            }}
          />

        </div>

      </div>

      {/* Strengths */}

      <div className="rounded-xl border bg-green-50 p-6">

        <h2 className="mb-4 text-xl font-bold text-green-700">
          ✅ Strengths
        </h2>

        <div className="space-y-3">

          {strengths.map((item, index) => (

            <div
              key={index}
              className="rounded-lg bg-green-100 p-3"
            >
              {item}
            </div>

          ))}

        </div>

      </div>

      {/* Improvements */}

      <div className="rounded-xl border bg-orange-50 p-6">

        <h2 className="mb-4 text-xl font-bold text-orange-700">
          💡 Improvements
        </h2>

        <div className="space-y-3">

          {improvements.map((item, index) => (

            <div
              key={index}
              className="rounded-lg bg-orange-100 p-3"
            >
              {item}
            </div>

          ))}

        </div>

      </div>

    </div>
  );
}