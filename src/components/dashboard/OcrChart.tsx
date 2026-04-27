//Box : contnur avc styles inline 
import { Box, Typography } from "@mui/material";
//Hokk RTK Query pour recuperer les données d'activites OCR depuis le backend 
import { useGetActivityQuery } from "../../services/api";
//Composants de labiblitheque Recharts pour creer le graphique 
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function OcrChart() {
  //Appel API / recupre les données d'activité , tableau vide par defaut si pas encor chargé 
  const { data = [] } = useGetActivityQuery();

  return (
    <Box sx={{ background: "#111827", p: 2, borderRadius: 2, mt: 2 }}>
      <Typography mb={2} color="white">
        OCR Activity (Documents processed)
      </Typography>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="documents" stroke="#60a5fa" />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}