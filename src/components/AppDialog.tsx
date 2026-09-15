import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogTitle, type Breakpoint } from "@mui/material";

interface Props {
  open: boolean;
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: Breakpoint;
}

/**
 * The app's modal shell - used for every form dialog (create/edit habit).
 */
export default function AppDialog({ open, title, onClose, children, maxWidth = "xs" }: Props) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={maxWidth}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
}
