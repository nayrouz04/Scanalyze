//Grid :grille responsive pour alligner les 4 cartes
//Card: carte avec fond et ombre
//CardContent : zone de contenu interieure de la carte
//Typography: texte stylisé
import { Grid, Card, CardContent, Typography } from "@mui/material";
//Hook RTK Query pour recuperer les statistiques depuis le backend
import { useGetStatsQuery } from "../../services/api";
//composant KpiCard :composant local qui reçoit 2 props
//title : le label de la étrique (ex:Documnt Uploadés)
//value: la valeur à afficher
//
function KpiCard({ title, value }: any) {
  return (
    <Card sx={{ background: "#111827", color: "white" }}>
      <CardContent>
        <Typography variant="body2" color="gray">
          {title}
        </Typography>
        <Typography variant="h5">{value}</Typography>
      </CardContent>
    </Card>
  );
}

export default function KpiSection() {
  //Appel API : recupere les stats , data contient les valeurs du backend 
  const { data } = useGetStatsQuery();

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={3}>
        <KpiCard title="Documents Uploadés" value={data?.uploaded || 120} />
      </Grid>

      <Grid item xs={12} md={3}>
        <KpiCard title="Documents Traités" value={data?.processed || 98} />
      </Grid>

      <Grid item xs={12} md={3}>
        <KpiCard title="En cours OCR" value={data?.pending || 10} />
      </Grid>

      <Grid item xs={12} md={3}>
        <KpiCard title="Erreurs" value={data?.errors || 2} />
      </Grid>
    </Grid>
  );
}