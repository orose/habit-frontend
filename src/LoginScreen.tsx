import { useState } from "react";
import { Box, Button, Card, Stack, Typography } from "@mui/material";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import { useAllowRegistration } from "./useAllowRegistration";
import RegisterUserForm from "./RegisterUserForm";
import LoginForm from "./LoginForm";
import { AppDialog, PageLayout } from "./components";

export default function LoginScreen() {
  const allowRegistration = useAllowRegistration();
  const [registrationOpen, setRegistrationOpen] = useState(false);

  return (
    <>
      <PageLayout maxWidth="xs" align="center" spacing={4}>
        <Stack spacing={1} sx={{ alignItems: "center" }}>
          <LocalFireDepartmentRoundedIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h4" component="h1">
            Habit
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hold styr på vanene dine
          </Typography>
        </Stack>
        <Card sx={{ width: "100%", p: 3, boxShadow: 3 }}>
          <LoginForm />
        </Card>
        {allowRegistration && (
          <Box>
            <Button variant="text" onClick={() => setRegistrationOpen(true)}>
              Registrer bruker
            </Button>
          </Box>
        )}
      </PageLayout>

      <AppDialog open={registrationOpen} title="Registrer bruker" onClose={() => setRegistrationOpen(false)}>
        <RegisterUserForm />
      </AppDialog>
    </>
  );
}
