import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useAppTheme } from "./useAppTheme";
import { AuthProvider } from "./auth/AuthContext";
import { useAuth } from "./auth/useAuth";
import LoginScreen from "./LoginScreen";
import Dashboard from "./Dashboard";
import { HabitDetailPage } from "./HabitDetailPage";

function AppShell() {
  const { token } = useAuth();
  if (!token) {
    return <LoginScreen />;
  }
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/habits/:id" element={<HabitDetailPage />} />
    </Routes>
  );
}

export default function App() {
  const theme = useAppTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
