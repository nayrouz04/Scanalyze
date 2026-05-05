// Loader — centered circular loading spinner
// Used inside page sections while async data is being fetched
import { CircularProgress, Box } from "@mui/material";

export default function Loader() {
  return (
    // Centers the spinner both horizontally and vertically within its container
    <Box display="flex" justifyContent="center" alignItems="center" p={3}>
      <CircularProgress />
    </Box>
  );
}
