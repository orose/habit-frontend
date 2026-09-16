import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IconButton, Stack, Typography } from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useAuth } from "./auth/useAuth";
import { useRefreshOnVisible } from "./useRefreshOnVisible";
import { listCheckins } from "./api/checkins";
import { deleteHabit, listHabits, updateHabit, type Habit, type HabitRequest } from "./api/habits";
import { fetchAllStats, type HabitStats } from "./api/stats";
import { AppDialog, EmptyState, HabitCalendar, PageHeader, PageLayout, StreakBadge } from "./components";
import HabitForm from "./HabitForm";

export function HabitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const habitId = Number(id);
  const navigate = useNavigate();
  const { token } = useAuth();
  const [habit, setHabit] = useState<Habit | null | undefined>(undefined);
  const [stats, setStats] = useState<HabitStats | undefined>(undefined);
  const [checkinDates, setCheckinDates] = useState<string[]>([]);
  const [editOpen, setEditOpen] = useState(false);

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

  async function load() {
    if (!token) {
      return;
    }
    const [habits, allStats] = await Promise.all([listHabits(token), fetchAllStats(token)]);
    const found = habits.find((h) => h.id === habitId) ?? null;
    setHabit(found);
    setStats(allStats.find((s) => s.habitId === habitId));
    if (found) {
      const checkins = await listCheckins(token, habitId);
      setCheckinDates(checkins.map((c) => c.date));
    }
  }

  useRefreshOnVisible(load);

  function goBack() {
    navigate("/");
  }

  async function handleUpdate(request: HabitRequest) {
    if (!token || !habit) {
      return;
    }
    await updateHabit(token, habit.id, request);
    setEditOpen(false);
    await load();
  }

  async function handleDelete() {
    if (!token || !habit) {
      return;
    }
    if (!window.confirm(`Slette vanen "${habit.name}"? Dette kan ikke angres.`)) {
      return;
    }
    await deleteHabit(token, habit.id);
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
      <PageHeader
        title={habit.name}
        onBack={goBack}
        action={
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <StreakBadge streak={stats?.currentStreak ?? 0} />
            <IconButton aria-label="Rediger" onClick={() => setEditOpen(true)}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
            <IconButton aria-label="Slett" onClick={handleDelete}>
              <DeleteOutlineRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        }
      />
      {habit.description && (
        <Typography variant="body2" color="text.secondary">
          {habit.description}
        </Typography>
      )}
      <HabitCalendar checkins={checkinDates} createdAt={habit.createdAt} />

      <AppDialog open={editOpen} title="Rediger vane" onClose={() => setEditOpen(false)}>
        <HabitForm
          initial={{ name: habit.name, description: habit.description }}
          onSubmit={handleUpdate}
          onCancel={() => setEditOpen(false)}
        />
      </AppDialog>
    </PageLayout>
  );
}
