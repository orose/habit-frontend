import type { ReactNode } from "react";
import { Container, Stack, type ContainerProps } from "@mui/material";

interface Props {
  children: ReactNode;
  maxWidth?: ContainerProps["maxWidth"];
  /** Horizontal alignment of the stacked content. Defaults to stretch. */
  align?: "center" | "stretch";
  /** Vertical rhythm between direct children (MUI spacing units). */
  spacing?: number;
}

/**
 * The shared page frame: a centered, width-capped column with generous
 * vertical padding. Every top-level screen sits inside one of these.
 */
export default function PageLayout({ children, maxWidth = "sm", align = "stretch", spacing = 3 }: Props) {
  return (
    <Container maxWidth={maxWidth}>
      <Stack spacing={spacing} sx={{ py: { xs: 5, sm: 8 }, alignItems: align === "center" ? "center" : "stretch" }}>
        {children}
      </Stack>
    </Container>
  );
}
