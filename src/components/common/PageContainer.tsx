// PageContainer — layout wrapper component
// Adds uniform 24px padding around all page content
// so nothing sticks to the edges of the viewport
import { Box } from "@mui/material";
import type { ReactNode } from "react";

type Props = { children: ReactNode };

export default function PageContainer({ children }: Props) {
  return <Box p={3}>{children}</Box>;
}
