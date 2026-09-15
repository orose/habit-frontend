import { CssBaseline, ThemeProvider } from "@mui/material";
import { useAppTheme } from "./useAppTheme";
import { AuthProvider } from "./auth/AuthContext";
import { useAuth } from "./auth/useAuth";
import LoginScreen from "./LoginScreen";
import Dashboard from "./Dashboard";

function AppShell() {
  const { token } = useAuth();
  return token ? <Dashboard /> : <LoginScreen />;
}

export default function App() {
  const theme = useAppTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ThemeProvider>
  );
}
