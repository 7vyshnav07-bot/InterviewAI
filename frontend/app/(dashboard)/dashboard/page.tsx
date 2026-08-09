"use client";

import { useEffect, useState } from "react";

import StatsCard from "@/components/dashboard/StatsCard";

import { getCurrentUser } from "@/services/userService";

import {
  getInterviewDashboard,
  DashboardStats,
} from "@/services/interviewService";


type User = {
  id: number;
  name: string;
  email: string;
};


export default function DashboardPage() {

  const [user, setUser] =
    useState<User | null>(null);

  const [stats, setStats] =
    useState<DashboardStats | null>(null);

  const [loading, setLoading] =
    useState(true);


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


  return (
    <div className="space-y-8">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div>

        <h1 className="text-3xl font-bold">
          Welcome Back
          {user ? `, ${user.name}` : ""} 👋
        </h1>

        <p className="mt-2 text-muted-foreground">
          Ready for your next interview?
        </p>

      </div>


      {/* ======================================================
          STATS CARDS
      ====================================================== */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <StatsCard
          title="Interviews"
          value={
            stats
              ? String(stats.total_interviews)
              : "0"
          }
        />

        <StatsCard
          title="Average Score"
          value={
            stats?.average_score !== null &&
            stats?.average_score !== undefined
              ? `${stats.average_score.toFixed(1)}/10`
              : "--"
          }
        />

        <StatsCard
          title="Strongest Skill"
          value={
            stats?.strongest_skill
              ? stats.strongest_skill
              : "--"
          }
        />

        <StatsCard
          title="Weakest Skill"
          value={
            stats?.weakest_skill
              ? stats.weakest_skill
              : "--"
          }
        />

      </div>


      {/* ======================================================
          INTERVIEW STATISTICS
      ====================================================== */}

      <div className="grid gap-6 lg:grid-cols-2">

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
                {stats?.total_questions ?? 0}
              </p>
            </div>


            <div>
              <p className="text-sm text-muted-foreground">
                Answered
              </p>

              <p className="mt-1 text-2xl font-bold">
                {stats?.answered_questions ?? 0}
              </p>
            </div>


            <div>
              <p className="text-sm text-muted-foreground">
                Evaluated
              </p>

              <p className="mt-1 text-2xl font-bold">
                {stats?.evaluated_questions ?? 0}
              </p>
            </div>


            <div>
              <p className="text-sm text-muted-foreground">
                Completed Interviews
              </p>

              <p className="mt-1 text-2xl font-bold">
                {stats?.total_interviews ?? 0}
              </p>
            </div>

          </div>

        </div>


        {/* ====================================================
            SKILL PERFORMANCE
        ==================================================== */}

        <div className="rounded-xl border bg-card p-6">

          <h2 className="text-xl font-bold">
            Skill Performance
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Your average score by question type.
          </p>


          <div className="mt-6 space-y-5">

            {stats?.skill_scores &&
            stats.skill_scores.length > 0 ? (

              stats.skill_scores
                .slice(0, 5)
                .map((skill) => (

                  <div key={skill.skill}>

                    <div className="mb-2 flex items-center justify-between">

                      <span className="font-medium">
                        {skill.skill}
                      </span>

                      <span className="font-semibold">
                        {skill.score.toFixed(1)}/10
                      </span>

                    </div>


                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">

                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{
                          width: `${Math.min(
                            skill.score * 10,
                            100
                          )}%`,
                        }}
                      />

                    </div>

                  </div>

                ))

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
        stats.score_history.length > 0 ? (

          <div className="mt-6 space-y-4">

            {stats.score_history.map(
              (item, index) => (

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
                        {item.score.toFixed(1)}/10
                      </p>

                    </div>


                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">

                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{
                          width: `${Math.min(
                            item.score * 10,
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
          stats.recent_interviews.length > 0 ? (

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

                      {interview.score !== null
                        ? `${interview.score.toFixed(1)}/10`
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