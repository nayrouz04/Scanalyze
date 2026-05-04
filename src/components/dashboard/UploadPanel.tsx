// UploadPanel — allows users to select and upload a document for OCR processing
// Sends the file to the backend via RTK Query mutation
import { useState } from "react";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import { useUploadDocumentMutation } from "@services";
import { colors } from "@theme";

export default function UploadPanel() {
  // Stores the currently selected file (null when none is selected)
  const [file, setFile] = useState<File | null>(null);

  // uploadDocument — sends the file to the backend
  // isLoading     — true while the request is in flight
  // isSuccess     — true after a successful upload
  const [uploadDocument, { isLoading, isSuccess }] = useUploadDocumentMutation();

  const handleUpload = async () => {
    // Guard: do nothing if no file has been selected
    if (!file) return;

    // Wrap the file in FormData — standard format for HTTP file uploads
    const formData = new FormData();
    formData.append("file", file);

    try {
      // .unwrap() re-throws any server error so it can be caught below
      await uploadDocument(formData).unwrap();
      // Reset the file input after a successful upload
      setFile(null);
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  return (
    <Box sx={{ background: colors.bgCard, p: 3, borderRadius: 2, color: colors.textWhite }}>
      <Typography variant="h6" mb={2}>
        Upload Document (OCR)
      </Typography>

      {/* Native file input — triggers file picker dialog */}
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      {/* Upload button — disabled while loading or when no file is selected */}
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

      {/* Success message shown after a successful upload */}
      {isSuccess && (
        <Typography mt={2} color="success.main">
          ✔ File uploaded successfully
        </Typography>
      )}
    </Box>
  );
}
