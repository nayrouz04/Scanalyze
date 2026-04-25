import { AppBar, Toolbar, Typography, Box, Avatar } from "@mui/material";
//pour savoir pour quelle page on est et afficher le bon titre 
import { useLocation } from "react-router-dom";
//l dictionnaire des titres : un objet clé valeur qui associe chaque route a son titre 
const pageTitles: Record<string, string> = {
  "/":             "Dashboard",
  "/upload":       "Upload",
  "/editor":       "Editor",
  "/verification": "Verification",
  "/users":        "User Management",
  "/export":       "Data Export",
};
//ls props  
type Props = { userName?: string };
//"admin"  valeur par defaut si aucun userName n'est passé 
export default function Topbar({ userName = "Admin" }: Props) {
  //location.pathname retourne le chemin actuel 
  const location = useLocation();
  //cherche le titre correspondant "||"dashboard" si le route n'existe pas dans le dictionnaire affiche dashboard par defaut 
  const title = pageTitles[location.pathname] || "Dashboard";
  
// Génère les initiales depuis le nom (ex: "John Doe" → "JD")
  const initials = userName
    ? userName.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "A";

  return (
    //la barre ne suit pas le scroll , elle reste en haut de son conteneur
    <AppBar position="static">   
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6">{title}</Typography>  
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>  
          <Typography variant="body2">{userName}</Typography>
          <Avatar sx={{ width: 35, height: 35, bgcolor: "primary.dark" }}>
            {initials}
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
}