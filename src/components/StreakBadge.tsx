import { Box } from "@mui/material";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";

interface Props {
  streak: number;
  size?: "md" | "lg";
}

/** A habit's current streak as a small flame-and-count pill. */
export default function StreakBadge({ streak, size = "md" }: Props) {
  const big = size === "lg";
  return (
    <Box
      sx={(t) => ({
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px: big ? 1.5 : 1,
        py: big ? 0.75 : 0.5,
        borderRadius: 999,
        backgroundColor: t.palette.primary.main,
        color: t.palette.primary.contrastText,
        fontWeight: 700,
        fontSize: big ? t.typography.h6.fontSize : t.typography.body2.fontSize,
        lineHeight: 1,
      })}
    >
      <LocalFireDepartmentRoundedIcon sx={{ fontSize: big ? 22 : 16 }} />
      <Box component="span">{streak}</Box>
    </Box>
  );
}
