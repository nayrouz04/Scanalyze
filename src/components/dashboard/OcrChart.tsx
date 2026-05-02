// ResultsTable — displays a table of processed documents with their OCR results
// Fetches data from the backend via RTK Query
import {
  Table, TableHead, TableRow,
  TableCell, TableBody, Box,
} from "@mui/material";
import { useGetResultsQuery } from "@services";
import { colors } from "@theme";

// Shared cell styles — white text on dark background with subtle border
const cellSx = { color: colors.textWhite, borderColor: colors.border };

export default function ResultsTable() {
  // Fetch processed documents; default to empty array while loading
  const { data = [] } = useGetResultsQuery();

  return (
    <Box sx={{ bgcolor: colors.bgCard, p: 2, borderRadius: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={cellSx}>File</TableCell>
            <TableCell sx={cellSx}>Status</TableCell>
            <TableCell sx={cellSx}>Extracted Text</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {data.map((doc: any) => (
            <TableRow key={doc.id}>
              <TableCell sx={cellSx}>{doc.name}</TableCell>
              <TableCell sx={cellSx}>{doc.status}</TableCell>
              <TableCell sx={cellSx}>{doc.text}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
