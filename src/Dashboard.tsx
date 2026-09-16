import { useEffect, useState, type MouseEvent } from "react";
import { Box, Button, Checkbox, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import TrackChangesRoundedIcon from "@mui/icons-material/TrackChangesRounded";
import { useAuth } from "./auth/useAuth";
import { checkIn, undoCheckIn } from "./api/checkins";
import { createHabit, deleteHabit, listHabits, updateHabit, type Habit, type HabitRequest } from "./api/habits";
import { fetchAllStats, type HabitStats } from "./api/stats";
import { AppDialog, EmptyState, ListRow, PageHeader, PageLayout, StreakBadge } from "./components";
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
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

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

  async function handleUpdate(request: HabitRequest) {
    if (!token || !editingHabit) {
      return;
    }
    await updateHabit(token, editingHabit.id, request);
    setEditingHabit(null);
    await load();
  }

  async function handleDelete(habit: Habit) {
    if (!token) {
      return;
    }
    if (!window.confirm(`Slette vanen "${habit.name}"? Dette kan ikke angres.`)) {
      return;
    }
    await deleteHabit(token, habit.id);
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
                <Checkbox
                  checked={stats?.completedToday ?? false}
                  onChange={() => handleToggleToday(habit)}
                  aria-label={`Kryss av "${habit.name}" for i dag`}
                />
              </Box>
            }
            primary={habit.name}
            secondary={habit.description}
            actions={
              <Box onClick={stopRowClick} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <StreakBadge streak={stats?.currentStreak ?? 0} />
                <IconButton aria-label="Rediger" onClick={() => setEditingHabit(habit)}>
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
                <IconButton aria-label="Slett" onClick={() => handleDelete(habit)}>
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            }
          />
        );
      })}

      <Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => setFormOpen(true)}>
        Ny vane
      </Button>

      <AppDialog open={formOpen} title="Ny vane" onClose={() => setFormOpen(false)}>
        <HabitForm onSubmit={handleCreate} onCancel={() => setFormOpen(false)} />
      </AppDialog>

      <AppDialog open={editingHabit !== null} title="Rediger vane" onClose={() => setEditingHabit(null)}>
        {editingHabit && (
          <HabitForm
            initial={{ name: editingHabit.name, description: editingHabit.description }}
            onSubmit={handleUpdate}
            onCancel={() => setEditingHabit(null)}
          />
        )}
      </AppDialog>
    </PageLayout>
  );
}
