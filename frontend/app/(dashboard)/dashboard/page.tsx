import StatsCard from "@/components/dashboard/StatsCard";

export default function DashboardPage() {
  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-4xl font-bold">
          Welcome Back 👋
        </h1>

        <p className="text-muted-foreground mt-2">
          Ready for your next interview?
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <StatsCard
          title="Interviews"
          value="0"
        />

        <StatsCard
          title="Average Score"
          value="--"
        />

        <StatsCard
          title="Strongest Skill"
          value="--"
        />

        <StatsCard
          title="Weakest Skill"
          value="--"
        />

      </div>

    </div>
  );
}