//composant MUI pour construire le tableau:
//table :conteneur principal du tableau
//TableHead : section des en-tetes 
//TableRow : une ligne du tableau 
//TableCell: colonne
//TableBody: section des données
//Box:conteneur avec styles inline 
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
} from "@mui/material";
//Hook RTK Query pour recuperer les documents traités depuis le backend 
import { useGetResultsQuery } from "../../services/api";

export default function ResultsTable() {
  //Appel API tableau vide par defaut si pas encore chargé 
  const { data = [] } = useGetResultsQuery();

  return (
    <Box sx={{ bgcolor: "#111827", p: 2, borderRadius: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: "white", borderColor: "#1f2937" }}>File</TableCell>
            <TableCell sx={{ color: "white", borderColor: "#1f2937" }}>Status</TableCell>
            <TableCell sx={{ color: "white", borderColor: "#1f2937" }}>Extracted Text</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {data.map((doc: any) => (
            <TableRow key={doc.id}>
              <TableCell sx={{ color: "white", borderColor: "#1f2937" }}>{doc.name}</TableCell>
              <TableCell sx={{ color: "white", borderColor: "#1f2937" }}>{doc.status}</TableCell>
              <TableCell sx={{ color: "white", borderColor: "#1f2937" }}>{doc.text}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}