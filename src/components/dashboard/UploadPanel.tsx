//Hook pour gerer les etats locaux 
import { useState } from "react";
//Box : conteneur avec style inline 
//Button : bouton stylisé
//Typography : texte stylisé
//CircularProgress : spinner de chargement
import { Box, Button, Typography, CircularProgress } from "@mui/material";
//Hook RTK Query pour envoyer un fichier au backend 
import { useUploadDocumentMutation } from "../../services/api";

export default function UploadPanel() {
  //stockee le fichier selectionné
  const [file, setFile] = useState<File | null>(null);
  //uploadDocument: fonction pour envoyer le fichier
  //isLoading: true pendant l'envoie
  //is Success : true aprés un envoie reussi 
  const [uploadDocument, { isLoading, isSuccess }] =
    useUploadDocumentMutation();
  
  //Securité : si aucun fichier selectionné , ne fait rien   
  const handleUpload = async () => {
    if (!file) return;

    //crée un fichier FormData et y ajoute le fichier , C'est le format standart pour envoyer des fichiers HTTP 
    const formData = new FormData();
    formData.append("file", file);

    //.unwrap() : lance une exception si'lupload échoue 
    //setFile(null) réinitialise le fichier aprés succés
    //catch : affiche l'erreur dans la console si l'upload échoue 
    try {
      await uploadDocument(formData).unwrap();
      setFile(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ background: "#111827", p: 3, borderRadius: 2, color: "white" }}>
      <Typography variant="h6" mb={2}>
        Upload Document (OCR)
      </Typography>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <Button
        sx={{ mt: 2 }}
        variant="contained"
        onClick={handleUpload}
        disabled={!file || isLoading}
      >
        {isLoading ? (
          <>
            <CircularProgress size={18} sx={{ mr: 1 }} />
            Processing...
          </>
        ) : (
          "Upload & Analyze"
        )}
      </Button>

      {isSuccess && (
        <Typography mt={2} color="success.main">
          ✔ File uploaded successfully
        </Typography>
      )}
    </Box>
  );
}