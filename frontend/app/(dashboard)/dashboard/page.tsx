"use client";

import { useEffect, useState } from "react";
import StatsCard from "@/components/dashboard/StatsCard";
import { getCurrentUser } from "@/services/userService";

type User = {
  id: number;
  name: string;
  email: string;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getCurrentUser();
        setUser(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">
          Welcome Back{user ? `, ${user.name}` : ""} 👋
        </h1>

        <p className="text-muted-foreground mt-2">
          Ready for your next interview?
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Interviews" value="0" />

        <StatsCard title="Average Score" value="--" />

        <StatsCard title="Strongest Skill" value="--" />

        <StatsCard title="Weakest Skill" value="--" />
      </div>
    </div>
  );
}