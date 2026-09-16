import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "./auth/useAuth";
import { listCheckins } from "./api/checkins";
import { listHabits, type Habit } from "./api/habits";
import { fetchAllStats, type HabitStats } from "./api/stats";
import { EmptyState, HabitCalendar, PageHeader, PageLayout, StreakBadge } from "./components";

export function HabitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const habitId = Number(id);
  const navigate = useNavigate();
  const { token } = useAuth();
  const [habit, setHabit] = useState<Habit | null | undefined>(undefined);
  const [stats, setStats] = useState<HabitStats | undefined>(undefined);
  const [checkinDates, setCheckinDates] = useState<string[]>([]);

  useEffect(() => {
    if (!token) {
      return;
    }
    let cancelled = false;
    Promise.all([listHabits(token), fetchAllStats(token)]).then(([habits, allStats]) => {
      if (cancelled) {
        return;
      }
      const found = habits.find((h) => h.id === habitId) ?? null;
      setHabit(found);
      setStats(allStats.find((s) => s.habitId === habitId));
      if (found) {
        listCheckins(token, habitId).then((checkins) => {
          if (!cancelled) {
            setCheckinDates(checkins.map((c) => c.date));
          }
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [token, habitId]);

  function goBack() {
    navigate("/");
  }

  if (habit === undefined) {
    return null;
  }

  if (habit === null) {
    return (
      <PageLayout>
        <PageHeader title="Vane" onBack={goBack} />
        <EmptyState title="Fant ikke vanen" />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader title={habit.name} onBack={goBack} action={<StreakBadge streak={stats?.currentStreak ?? 0} />} />
      <HabitCalendar checkins={checkinDates} createdAt={habit.createdAt} />
    </PageLayout>
  );
}
