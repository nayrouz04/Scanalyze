//composant wrapper son role est d'ajouter un padding uniforme de 24 px autour de toutes les pages pour que le contenu ne colle pas aux bord 

import { Box } from "@mui/material";

type Props = { children: React.ReactNode };

export default function PageContainer({ children }: Props) {
  return <Box p={3}>{children}</Box>;
}