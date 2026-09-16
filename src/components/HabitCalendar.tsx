import "dayjs/locale/nb";
import dayjs from "dayjs";
import type { ElementType } from "react";
import { Box, Tooltip } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickerDay, type PickerDayProps } from "@mui/x-date-pickers/PickerDay";
import { nbNO } from "@mui/x-date-pickers/locales";
import { dayStatus, parseIsoDate, type DayStatus } from "./HabitCalendar.helpers";

interface Props {
  checkins: readonly string[];
  createdAt: string;
  today?: Date;
}

interface HabitDayProps extends PickerDayProps {
  doneDates: ReadonlySet<string>;
  createdDate: Date;
  referenceToday: Date;
}

function statusLabel(status: DayStatus): string | null {
  if (status === "done") {
    return "Gjort";
  }
  if (status === "not-done") {
    return "Ikke gjort";
  }
  return null;
}

function HabitDay(props: HabitDayProps) {
  const { doneDates, createdDate, referenceToday, day, ...pickerDayProps } = props;
  const status = dayStatus(dayjs(day).toDate(), doneDates, createdDate, referenceToday);
  const label = statusLabel(status);

  return (
    <Tooltip title={label ?? ""}>
      <span>
        <PickerDay
          {...pickerDayProps}
          day={day}
          disabled={status === "before-created" || status === "future"}
          sx={(theme) => ({
            ...(status === "done" && {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              "&:hover, &:focus": { backgroundColor: theme.palette.primary.dark },
            }),
          })}
        />
      </span>
    </Tooltip>
  );
}

/** A navigable month calendar showing which days a habit was checked off. */
export function HabitCalendar({ checkins, createdAt, today = new Date() }: Props) {
  const doneDates = new Set(checkins.map((date) => date.slice(0, 10)));
  const createdDate = parseIsoDate(createdAt);

  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <LocalizationProvider
        dateAdapter={AdapterDayjs}
        adapterLocale="nb"
        localeText={nbNO.components.MuiLocalizationProvider.defaultProps.localeText}
      >
        <DateCalendar
          referenceDate={dayjs(today)}
          minDate={dayjs(createdDate)}
          maxDate={dayjs(today)}
          slots={{ day: HabitDay as unknown as ElementType<PickerDayProps> }}
          slotProps={{
            // MUI's documented pattern for passing extra data to a custom day
            // slot: slotProps.day isn't typed for arbitrary extra fields.
            day: { doneDates, createdDate, referenceToday: today } as never,
          }}
        />
      </LocalizationProvider>
    </Box>
  );
}
