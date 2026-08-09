"use client";

import { useEffect, useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { getCurrentUser } from "@/services/userService";

import {
  getInterviewDashboard,
  getPerformanceInsights,
  DashboardStats,
  PerformanceInsights,
} from "@/services/interviewService";

type User = {
  id: number;
  name: string;
  email: string;
};

export default function DashboardPage() {
  // ============================================================
  // USER
  // ============================================================

  const [user, setUser] =
    useState<User | null>(null);

  // ============================================================
  // DASHBOARD DATA
  // ============================================================

  const [stats, setStats] =
    useState<DashboardStats | null>(null);

  const [loading, setLoading] =
    useState(true);

  // ============================================================
  // AI INSIGHTS
  // ============================================================

  const [aiInsights, setAiInsights] =
    useState<PerformanceInsights | null>(null);

  const [insightsLoading, setInsightsLoading] =
    useState(false);

  const [insightsError, setInsightsError] =
    useState<string | null>(null);

  // ============================================================
  // LOAD DASHBOARD
  // ============================================================

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [
          userData,
          dashboardData,
        ] = await Promise.all([
          getCurrentUser(),
          getInterviewDashboard(),
        ]);

        setUser(userData);
        setStats(dashboardData);
      } catch (error) {
        console.error(
          "Failed to load dashboard:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // ============================================================
  // AI ASSISTANCE
  // ============================================================

  const handleAIAssistance = async () => {
    try {
      setInsightsLoading(true);
      setInsightsError(null);

      const insights =
        await getPerformanceInsights();

      setAiInsights(insights);
    } catch (error) {
      console.error(
        "Failed to generate AI assistance:",
        error
      );

      setAiInsights(null);

      setInsightsError(
        "Unable to generate AI insights right now. Please try again."
      );
    } finally {
      setInsightsLoading(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="space-y-8">

        <div>
          <h1 className="text-3xl font-bold">
            Loading Dashboard...
          </h1>

          <p className="mt-2 text-muted-foreground">
            Fetching your interview performance.
          </p>
        </div>

      </div>
    );
  }

  // ============================================================
  // SCORE CHART DATA
  // ============================================================

  const scoreChartData =
    stats?.score_history
      ?.slice()
      .reverse()
      .map((item, index) => ({
        interview: `Interview ${index + 1}`,
        role: item.role,
        difficulty: item.difficulty,
        score: Number(
          item.score.toFixed(1)
        ),
      })) ?? [];

  // ============================================================
  // PERFORMANCE TREND
  // ============================================================

  const scoreHistory =
    stats?.score_history ?? [];

  const recentScores =
    scoreHistory
      .slice(0, 3)
      .map(
        (item) => item.score
      );

  const recentAverage =
    recentScores.length > 0
      ? recentScores.reduce(
          (sum, score) =>
            sum + score,
          0
        ) /
        recentScores.length
      : null;

  const previousScores =
    scoreHistory
      .slice(3, 6)
      .map(
        (item) => item.score
      );

  const previousAverage =
    previousScores.length > 0
      ? previousScores.reduce(
          (sum, score) =>
            sum + score,
          0
        ) /
        previousScores.length
      : null;

  let performanceTrend:
    | "improving"
    | "declining"
    | "stable"
    | "new" =
    "new";

  let trendDifference = 0;

  if (
    recentAverage !== null &&
    previousAverage !== null
  ) {
    trendDifference =
      recentAverage -
      previousAverage;

    if (
      trendDifference >= 0.3
    ) {
      performanceTrend =
        "improving";
    } else if (
      trendDifference <= -0.3
    ) {
      performanceTrend =
        "declining";
    } else {
      performanceTrend =
        "stable";
    }
  }

  // ============================================================
  // PERFORMANCE LEVEL
  // ============================================================

  const averageScore =
    stats?.average_score ?? null;

  let performanceLevel =
    "Getting Started";

  if (
    averageScore !== null
  ) {
    if (
      averageScore >= 9
    ) {
      performanceLevel =
        "Excellent";
    } else if (
      averageScore >= 8
    ) {
      performanceLevel =
        "Very Strong";
    } else if (
      averageScore >= 7
    ) {
      performanceLevel =
        "Good";
    } else if (
      averageScore >= 5
    ) {
      performanceLevel =
        "Developing";
    } else {
      performanceLevel =
        "Needs Improvement";
    }
  }

  // ============================================================
  // TREND MESSAGE
  // ============================================================

  let trendMessage =
    "Complete more interviews to unlock detailed performance trends.";

  if (
    performanceTrend ===
    "improving"
  ) {
    trendMessage =
      `Your recent performance is improving by approximately ${Math.abs(
        trendDifference
      ).toFixed(
        1
      )} points compared with your previous interviews.`;
  } else if (
    performanceTrend ===
    "declining"
  ) {
    trendMessage =
      `Your recent average is ${Math.abs(
        trendDifference
      ).toFixed(
        1
      )} points lower than your previous interviews. Focus on your weaker areas and keep practicing.`;
  } else if (
    performanceTrend ===
    "stable"
  ) {
    trendMessage =
      "Your performance is currently stable. Consistent practice can help you push your score higher.";
  }

  // ============================================================
  // MAIN DASHBOARD
  // ============================================================

  return (
    <div className="space-y-8">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div>

        <h1 className="text-3xl font-bold">
          Welcome Back
          {user
            ? `, ${user.name}`
            : ""}{" "}
          👋
        </h1>

        <p className="mt-2 text-muted-foreground">
          Ready for your next interview?
        </p>

      </div>

      {/* ======================================================
          STATS CARDS
      ====================================================== */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        {/* INTERVIEWS */}

        <div className="rounded-xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-sm font-medium text-muted-foreground">
                Interviews
              </p>

              <p className="mt-2 text-3xl font-bold">
                {stats?.total_interviews ?? 0}
              </p>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-100 text-xl">
              🎤
            </div>

          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Completed interview sessions
          </p>

        </div>

        {/* AVERAGE SCORE */}

        <div className="rounded-xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-sm font-medium text-muted-foreground">
                Average Score
              </p>

              <p className="mt-2 text-3xl font-bold">

                {averageScore !== null
                  ? averageScore.toFixed(1)
                  : "--"}

                {averageScore !== null && (
                  <span className="ml-1 text-base font-medium text-muted-foreground">
                    /10
                  </span>
                )}

              </p>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-100 text-xl">
              ⭐
            </div>

          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Overall interview performance
          </p>

        </div>

        {/* STRONGEST SKILL */}

        <div className="rounded-xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-start justify-between">

            <div className="min-w-0">

              <p className="text-sm font-medium text-muted-foreground">
                Strongest Skill
              </p>

              <p className="mt-2 truncate text-xl font-bold">
                {stats?.strongest_skill ??
                  "--"}
              </p>

            </div>

            <div className="ml-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-yellow-100 text-xl">
              🏆
            </div>

          </div>

          <p className="mt-4 text-xs text-muted-foreground">

            {stats?.strongest_score !==
              null &&
            stats?.strongest_score !==
              undefined
              ? `Average score: ${stats.strongest_score.toFixed(
                  1
                )}/10`
              : "Complete more interviews to identify this."}

          </p>

        </div>

        {/* FOCUS AREA */}

        <div className="rounded-xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-start justify-between">

            <div className="min-w-0">

              <p className="text-sm font-medium text-muted-foreground">
                Focus Area
              </p>

              <p className="mt-2 truncate text-xl font-bold">
                {stats?.weakest_skill ??
                  "--"}
              </p>

            </div>

            <div className="ml-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-xl">
              🎯
            </div>

          </div>

          <p className="mt-4 text-xs text-muted-foreground">

            {stats?.weakest_score !==
              null &&
            stats?.weakest_score !==
              undefined
              ? `Current average: ${stats.weakest_score.toFixed(
                  1
                )}/10`
              : "Complete more interviews to identify this."}

          </p>

        </div>

      </div>

      {/* ======================================================
          INTERVIEW STATISTICS + SKILL PERFORMANCE
      ====================================================== */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* INTERVIEW STATISTICS */}

        <div className="rounded-xl border bg-card p-6">

          <h2 className="text-xl font-bold">
            Interview Statistics
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Your overall interview activity.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-6">

            <div>

              <p className="text-sm text-muted-foreground">
                Total Questions
              </p>

              <p className="mt-1 text-2xl font-bold">
                {stats?.total_questions ??
                  0}
              </p>

            </div>

            <div>

              <p className="text-sm text-muted-foreground">
                Answered
              </p>

              <p className="mt-1 text-2xl font-bold">
                {stats?.answered_questions ??
                  0}
              </p>

            </div>

            <div>

              <p className="text-sm text-muted-foreground">
                Evaluated
              </p>

              <p className="mt-1 text-2xl font-bold">
                {stats?.evaluated_questions ??
                  0}
              </p>

            </div>

            <div>

              <p className="text-sm text-muted-foreground">
                Completed Interviews
              </p>

              <p className="mt-1 text-2xl font-bold">
                {stats?.total_interviews ??
                  0}
              </p>

            </div>

          </div>

        </div>

        {/* SKILL PERFORMANCE */}

        <div className="rounded-xl border bg-card p-6">

          <h2 className="text-xl font-bold">
            Skill Performance
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Your average score by question type.
          </p>

          <div className="mt-6 space-y-5">

            {stats?.skill_scores &&
            stats.skill_scores.length >
              0 ? (

              stats.skill_scores
                .slice(0, 5)
                .map(
                  (skill) => (

                    <div
                      key={
                        skill.skill
                      }
                    >

                      <div className="mb-2 flex items-center justify-between">

                        <span className="font-medium">
                          {skill.skill}
                        </span>

                        <span className="font-semibold">
                          {skill.score.toFixed(
                            1
                          )}
                          /10
                        </span>

                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-200">

                        <div
                          className="h-full rounded-full bg-blue-600 transition-all"
                          style={{
                            width: `${Math.min(
                              skill.score *
                                10,
                              100
                            )}%`,
                          }}
                        />

                      </div>

                    </div>

                  )
                )

            ) : (

              <p className="text-sm text-muted-foreground">
                Complete an interview to see your
                skill performance.
              </p>

            )}

          </div>

        </div>

      </div>

      {/* ======================================================
          SCORE TREND
      ====================================================== */}

      <div className="rounded-xl border bg-card p-6">

        <h2 className="text-xl font-bold">
          Score Trend
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Track how your interview performance changes over time.
        </p>

        {scoreChartData.length > 0 ? (

          <div className="mt-8 h-80 w-full">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <LineChart
                data={scoreChartData}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 10,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="interview"
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  domain={[0, 10]}
                  ticks={[
                    0,
                    2,
                    4,
                    6,
                    8,
                    10,
                  ]}
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip
                  formatter={(value) => [
                    typeof value === "number"
                      ? `${value}/10`
                      : "--",
                    "Score",
                  ]}
                  labelFormatter={(label) =>
                    String(label)
                  }
                  contentStyle={{
                    borderRadius: "10px",
                    border:
                      "1px solid #e5e7eb",
                    backgroundColor:
                      "white",
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="currentColor"
                  strokeWidth={3}
                  dot={{
                    r: 5,
                  }}
                  activeDot={{
                    r: 7,
                  }}
                  className="text-blue-600"
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        ) : (

          <div className="mt-8 flex h-70 items-center justify-center rounded-lg bg-slate-50">

            <div className="text-center">

              <p className="font-medium">
                No score history yet.
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Complete an interview to start
                tracking your progress.
              </p>

            </div>

          </div>

        )}

      </div>

      {/* ======================================================
          AI PERFORMANCE INSIGHTS
      ====================================================== */}

      <div className="rounded-xl border bg-card p-6">

        {/* HEADER */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-xl">
              🧠
            </div>

            <div>

              <h2 className="text-xl font-bold">
                AI Interview Coach
              </h2>

              <p className="text-sm text-muted-foreground">
                Personalized coaching based on your interview performance.
              </p>

            </div>

          </div>

          <button
            onClick={
              handleAIAssistance
            }
            disabled={
              insightsLoading
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >

            {insightsLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Analyzing...
              </>
            ) : (
              <>
                🤖
                {aiInsights
                  ? "Refresh AI Analysis"
                  : "Get AI Assistance"}
              </>
            )}

          </button>

        </div>

        {/* ERROR */}

        {insightsError && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">

            <p className="font-medium text-red-700">
              AI Assistance Error
            </p>

            <p className="mt-1 text-sm text-red-600">
              {insightsError}
            </p>

          </div>
        )}

        {/* ====================================================
            BASIC INSIGHTS
        ==================================================== */}

        <div className="mt-6 grid gap-4 md:grid-cols-2">

          {/* OVERALL */}

          <div className="rounded-lg border p-5">

            <div className="flex items-center gap-3">

              <span className="text-xl">
                📊
              </span>

              <h3 className="font-semibold">
                Overall Performance
              </h3>

            </div>

            <p className="mt-3 text-2xl font-bold">

              {averageScore !== null
                ? `${averageScore.toFixed(
                    1
                  )}/10`
                : "--"}

            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {performanceLevel}
            </p>

          </div>

          {/* TREND */}

          <div className="rounded-lg border p-5">

            <div className="flex items-center gap-3">

              <span className="text-xl">

                {performanceTrend ===
                "improving"
                  ? "📈"
                  : performanceTrend ===
                    "declining"
                    ? "📉"
                    : "➡️"}

              </span>

              <h3 className="font-semibold">
                Recent Trend
              </h3>

            </div>

            <p className="mt-3 font-semibold">

              {performanceTrend ===
              "improving"
                ? "You're improving!"
                : performanceTrend ===
                  "declining"
                    ? "Performance is declining"
                    : performanceTrend ===
                      "stable"
                        ? "Performance is stable"
                        : "Keep practicing"}

            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {trendMessage}
            </p>

          </div>

          {/* STRONGEST */}

          <div className="rounded-lg border p-5">

            <div className="flex items-center gap-3">

              <span className="text-xl">
                🏆
              </span>

              <h3 className="font-semibold">
                Strongest Area
              </h3>

            </div>

            <p className="mt-3 text-xl font-bold">
              {stats?.strongest_skill ??
                "--"}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">

              {stats?.strongest_score !==
                null &&
              stats?.strongest_score !==
                undefined
                ? `Average score: ${stats.strongest_score.toFixed(
                    1
                  )}/10`
                : "Complete more evaluated questions to identify your strongest area."}

            </p>

          </div>

          {/* WEAKEST */}

          <div className="rounded-lg border p-5">

            <div className="flex items-center gap-3">

              <span className="text-xl">
                🎯
              </span>

              <h3 className="font-semibold">
                Focus Area
              </h3>

            </div>

            <p className="mt-3 text-xl font-bold">
              {stats?.weakest_skill ??
                "--"}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">

              {stats?.weakest_score !==
                null &&
              stats?.weakest_score !==
                undefined
                ? `Current average: ${stats.weakest_score.toFixed(
                    1
                  )}/10`
                : "Complete more evaluated questions to identify areas for improvement."}

            </p>

          </div>

        </div>

        {/* ====================================================
            AI COACH RESULT
        ==================================================== */}

        <div className="mt-6 rounded-xl bg-slate-50 p-6">

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl">
              🤖
            </div>

            <div className="flex-1">

              <h3 className="text-lg font-semibold">
                AI Interview Coach
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
                Personalized analysis generated from your interview performance.
              </p>

              {/* LOADING */}

              {insightsLoading ? (

                <div className="mt-5 space-y-3">

                  <div className="h-4 w-full animate-pulse rounded bg-slate-200" />

                  <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />

                  <div className="h-4 w-4/6 animate-pulse rounded bg-slate-200" />

                  <div className="mt-4 h-20 w-full animate-pulse rounded bg-slate-200" />

                </div>

              ) : aiInsights ? (

                <div className="mt-5 space-y-6">

                  {/* SUMMARY */}

                  <div className="rounded-lg border bg-white p-5">

                    <h4 className="font-semibold">
                      📋 Overall Assessment
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {
                        aiInsights.insights.summary
                      }
                    </p>

                  </div>

                  {/* AI METRICS */}

                  <div className="grid gap-3 sm:grid-cols-3">

                    <div className="rounded-lg border bg-white p-4">

                      <p className="text-xs text-muted-foreground">
                        AI Average
                      </p>

                      <p className="mt-1 text-lg font-bold">
                        {aiInsights.average_score.toFixed(
                          1
                        )}
                        /10
                      </p>

                    </div>

                    <div className="rounded-lg border bg-white p-4">

                      <p className="text-xs text-muted-foreground">
                        Strongest
                      </p>

                      <p className="mt-1 font-bold">
                        {aiInsights.strongest_skill ??
                          "--"}
                      </p>

                    </div>

                    <div className="rounded-lg border bg-white p-4">

                      <p className="text-xs text-muted-foreground">
                        Focus
                      </p>

                      <p className="mt-1 font-bold">
                        {aiInsights.weakest_skill ??
                          "--"}
                      </p>

                    </div>

                  </div>

                  {/* BIGGEST STRENGTH */}

                  <div>

                    <h4 className="font-semibold">
                      💪 Biggest Strength
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {
                        aiInsights.insights.biggest_strength
                      }
                    </p>

                  </div>

                  {/* BIGGEST WEAKNESS */}

                  <div>

                    <h4 className="font-semibold">
                      ⚠️ Biggest Weakness
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {
                        aiInsights.insights.biggest_weakness
                      }
                    </p>

                  </div>

                  {/* ANSWER PATTERN */}

                  <div>

                    <h4 className="font-semibold">
                      🔍 Answer Pattern
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {
                        aiInsights.insights.answer_pattern
                      }
                    </p>

                  </div>

                  {/* PRACTICE FOCUS */}

                  <div>

                    <h4 className="font-semibold">
                      🎯 Practice Focus
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {
                        aiInsights.insights.practice_focus
                      }
                    </p>

                  </div>

                  {/* ANSWER IMPROVEMENT */}

                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-5">

                    <h4 className="font-semibold text-blue-900">
                      💡 How to Improve Your Answers
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-blue-800">
                      {
                        aiInsights.insights.answer_improvement
                      }
                    </p>

                  </div>

                  {/* ACTION PLAN */}

                  <div>

                    <h4 className="font-semibold">
                      🚀 Action Plan
                    </h4>

                    <div className="mt-3 space-y-2">

                      {aiInsights.insights.action_plan.map(
                        (
                          action,
                          index
                        ) => (

                          <div
                            key={
                              index
                            }
                            className="flex items-start gap-3 rounded-lg border bg-white p-3"
                          >

                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                              {index + 1}
                            </span>

                            <p className="text-sm leading-6 text-muted-foreground">
                              {action}
                            </p>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                  {/* ==================================================
                      RECOMMENDED QUESTIONS
                  ================================================== */}

                  <div>

                    <h4 className="font-semibold">
                      📝 Recommended Practice Questions
                    </h4>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Practice these questions to improve your weaker areas.
                    </p>

                    <div className="mt-3 space-y-3">

                      {aiInsights.insights
                        .recommended_questions
                        .map(
                          (
                            question,
                            index
                          ) => (

                            <div
                              key={
                                index
                              }
                              className="flex items-start gap-3 rounded-lg border bg-white p-4"
                            >

                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                                {index + 1}
                              </span>

                              <p className="text-sm leading-6">
                                {question}
                              </p>

                            </div>

                          )
                        )}

                    </div>

                  </div>

                </div>

              ) : (

                <div className="mt-5 rounded-lg border bg-white p-5">

                  <p className="text-sm text-muted-foreground">
                    Click{" "}
                    <span className="font-semibold text-foreground">
                      Get AI Assistance
                    </span>{" "}
                    above to analyze your interview performance and receive personalized coaching.
                  </p>

                </div>

              )}

            </div>

          </div>

        </div>

      </div>

      {/* ======================================================
          PERFORMANCE HISTORY
      ====================================================== */}

      <div className="rounded-xl border bg-card p-6">

        <h2 className="text-xl font-bold">
          Performance Overview
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Your interview scores over time.
        </p>

        {stats?.score_history &&
        stats.score_history.length >
          0 ? (

          <div className="mt-6 space-y-4">

            {stats.score_history.map(
              (
                item,
                index
              ) => (

                <div
                  key={`${item.interview_id}-${index}`}
                  className="flex items-center gap-4"
                >

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">

                    <div className="flex items-center justify-between gap-4">

                      <div className="min-w-0">

                        <p className="truncate font-semibold">
                          {item.role}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          {item.difficulty}
                        </p>

                      </div>

                      <p className="font-bold">
                        {item.score.toFixed(
                          1
                        )}
                        /10
                      </p>

                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">

                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{
                          width: `${Math.min(
                            item.score *
                              10,
                            100
                          )}%`,
                        }}
                      />

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        ) : (

          <div className="mt-6 rounded-lg bg-slate-50 p-8 text-center">

            <p className="font-medium">
              No interview performance yet.
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Complete your first interview to
              start tracking your progress.
            </p>

          </div>

        )}

      </div>

      {/* ======================================================
          RECENT INTERVIEWS
      ====================================================== */}

      <div className="rounded-xl border bg-card p-6">

        <h2 className="text-xl font-bold">
          Recent Interviews
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Your latest completed interviews.
        </p>

        <div className="mt-6 space-y-3">

          {stats?.recent_interviews &&
          stats.recent_interviews.length >
            0 ? (

            stats.recent_interviews.map(
              (interview) => (

                <div
                  key={interview.id}
                  className="flex flex-col gap-4 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                >

                  <div>

                    <p className="font-semibold">
                      {interview.role}
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">

                      {interview.difficulty}

                      {" • "}

                      {interview.total_questions}

                      {" questions"}

                    </p>

                  </div>

                  <div className="text-left md:text-right">

                    <p className="text-lg font-bold">

                      {interview.score !==
                        null
                        ? `${interview.score.toFixed(
                            1
                          )}/10`
                        : "--"}

                    </p>

                    <p className="text-sm text-muted-foreground">

                      {interview.completed_at
                        ? new Date(
                            interview.completed_at
                          ).toLocaleDateString()
                        : ""}

                    </p>

                  </div>

                </div>

              )
            )

          ) : (

            <p className="py-6 text-center text-sm text-muted-foreground">
              No completed interviews yet.
            </p>

          )}

        </div>

      </div>

    </div>
  );
}