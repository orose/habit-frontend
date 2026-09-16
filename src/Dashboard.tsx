import { useEffect, useState, type MouseEvent } from "react";
import { Box, Button, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import TrackChangesRoundedIcon from "@mui/icons-material/TrackChangesRounded";
import { useAuth } from "./auth/useAuth";
import { useRefreshOnVisible } from "./useRefreshOnVisible";
import { checkIn, undoCheckIn } from "./api/checkins";
import { createHabit, listHabits, type Habit, type HabitRequest } from "./api/habits";
import { fetchAllStats, type HabitStats } from "./api/stats";
import { AppDialog, EmptyState, HabitCompletionToggle, ListRow, PageHeader, PageLayout, StreakBadge } from "./components";
import HabitForm from "./HabitForm";

function stopRowClick(event: MouseEvent) {
  event.stopPropagation();
}

export default function Dashboard() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [statsByHabitId, setStatsByHabitId] = useState<Map<number, HabitStats>>(new Map());
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }
    let cancelled = false;
    Promise.all([listHabits(token), fetchAllStats(token)])
      .then(([habitList, stats]) => {
        if (!cancelled) {
          setHabits(habitList);
          setStatsByHabitId(new Map(stats.map((s) => [s.habitId, s])));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function load() {
    if (!token) {
      return;
    }
    const [habitList, stats] = await Promise.all([listHabits(token), fetchAllStats(token)]);
    setHabits(habitList);
    setStatsByHabitId(new Map(stats.map((s) => [s.habitId, s])));
  }

  useRefreshOnVisible(load);

  async function handleToggleToday(habit: Habit) {
    if (!token) {
      return;
    }
    const stats = statsByHabitId.get(habit.id);
    const today = new Date().toISOString().slice(0, 10);
    if (stats?.completedToday) {
      await undoCheckIn(token, habit.id, today);
    } else {
      await checkIn(token, habit.id);
    }
    await load();
  }

  async function handleCreate(request: HabitRequest) {
    if (!token) {
      return;
    }
    await createHabit(token, request);
    setFormOpen(false);
    await load();
  }

  return (
    <PageLayout>
      <PageHeader
        title="Vanene dine"
        action={
          <IconButton aria-label="Logg ut" onClick={logout}>
            <LogoutRoundedIcon />
          </IconButton>
        }
      />

      {!loading && habits.length === 0 && (
        <EmptyState
          icon={<TrackChangesRoundedIcon sx={{ fontSize: 48 }} />}
          title="Ingen vaner ennå"
          description="Legg til den første vanen du vil følge opp."
        />
      )}

      {habits.map((habit) => {
        const stats = statsByHabitId.get(habit.id);
        return (
          <ListRow
            key={habit.id}
            onClick={() => navigate(`/habits/${habit.id}`)}
            avatar={
              <Box onClick={stopRowClick}>
                <HabitCompletionToggle
                  completed={stats?.completedToday ?? false}
                  onToggle={() => handleToggleToday(habit)}
                  habitName={habit.name}
                />
              </Box>
            }
            primary={habit.name}
            secondary={habit.description}
            actions={<StreakBadge streak={stats?.currentStreak ?? 0} />}
          />
        );
      })}

      <Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => setFormOpen(true)}>
        Ny vane
      </Button>

      <AppDialog open={formOpen} title="Ny vane" onClose={() => setFormOpen(false)}>
        <HabitForm onSubmit={handleCreate} onCancel={() => setFormOpen(false)} />
      </AppDialog>
    </PageLayout>
  );
}
