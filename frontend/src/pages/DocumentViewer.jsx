import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import api from "../api/api";

function normalizeCloudinaryUrl(url) {
  if (!url) return url;
  if (url.includes("/image/upload/")) {
    return url.replace(/\/image\/upload\//, "/image/upload/fl_attachment/");
  }
  if (url.includes("/raw/upload/")) {
    return url.replace(/\/raw\/upload\//, "/raw/upload/fl_attachment/");
  }
  return url;
}

function DocumentViewer() {
  const { id: documentId } = useParams();
  const navigate = useNavigate();
  const [documentData, setDocumentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const blobUrlRef = useRef(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/documents/${documentId}`);
        const doc = { file_url: res.data.url };
        setDocumentData(doc);

        if (doc.file_url) {
          const ext = doc.file_url.split(".").pop()?.toLowerCase();
          if (ext === "pdf") {
            try {
              const pdfRes = await api.get(`/documents/${documentId}/content`, {
                responseType: "blob",
              });
              const blobUrl = URL.createObjectURL(pdfRes.data);
              setPdfBlobUrl(blobUrl);
              blobUrlRef.current = blobUrl;
            } catch (pdfErr) {
              console.error("Error fetching PDF:", pdfErr);
            }
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load document");
        console.error("Document fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();

    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, [documentId]);

  const getFileExtension = (url) => {
    if (!url) return "";
    return url.split(".").pop()?.toLowerCase() || "";
  };

  const isPDF = (url) => getFileExtension(url) === "pdf";

  const isImage = (url) => {
    const ext = getFileExtension(url);
    return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext);
  };

  const getOriginalFilename = () => {
    if (documentData?.original_filename) return documentData.original_filename;
    if (documentData?.file_url) {
      const parts = documentData.file_url.split("/");
      return parts[parts.length - 1];
    }
    return "Document";
  };

  const getDownloadUrl = () => {
    if (!documentData?.file_url) return "#";
    return normalizeCloudinaryUrl(documentData.file_url);
  };

  const getOfficeViewerUrl = (fileUrl) => {
    const encodedUrl = encodeURIComponent(fileUrl);
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
  };

  const headerBarSx = {
    display: "flex",
    alignItems: "center",
    height: 56,
    px: 2,
    gap: 1,
    borderBottom: 1,
    borderColor: "divider",
    bgcolor: "background.paper",
    flexShrink: 0,
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* Header bar */}
      <Box sx={headerBarSx}>
        <IconButton size="small" onClick={() => navigate(-1)}>
          <ArrowBackIcon fontSize="small" />
        </IconButton>

        <Typography
          variant="body2"
          fontWeight={500}
          noWrap
          sx={{ flex: 1, minWidth: 0 }}
        >
          {getOriginalFilename()}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Button
            component="a"
            href={getDownloadUrl()}
            download
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
            sx={{ color: "text.secondary", textTransform: "none" }}
          >
            Download
          </Button>
          <Button
            component="a"
            href={documentData?.file_url}
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            startIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
            sx={{ color: "text.secondary", textTransform: "none" }}
          >
            Open
          </Button>
        </Box>
      </Box>

      {/* Viewer area */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        {loading && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <CircularProgress size={32} />
          </Box>
        )}

        {error && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography color="error" fontWeight={500}>
                {error}
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate(-1)}
                sx={{ mt: 2 }}
              >
                Go Back
              </Button>
            </Paper>
          </Box>
        )}

        {!loading && !error && documentData && (
          <Box sx={{ height: "100%" }}>
            {isPDF(documentData.file_url) ? (
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {pdfBlobUrl ? (
                  <Box
                    component="object"
                    data={`${pdfBlobUrl}#toolbar=0`}
                    type="application/pdf"
                    sx={{ flex: 1, width: "100%", border: "none" }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                      }}
                    >
                      <Paper sx={{ p: 4, textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                          Unable to display PDF in browser.
                        </Typography>
                        <Button
                          component="a"
                          href={pdfBlobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="contained"
                          sx={{ mt: 2 }}
                        >
                          Open PDF in new tab
                        </Button>
                      </Paper>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                    }}
                  >
                    <Paper sx={{ p: 4, textAlign: "center" }}>
                      <Typography variant="body2" color="text.secondary">
                        Unable to display PDF preview.
                      </Typography>
                      <Button
                        component="a"
                        href={documentData.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="contained"
                        sx={{ mt: 2 }}
                      >
                        Open PDF in new tab
                      </Button>
                    </Paper>
                  </Box>
                )}
              </Box>
            ) : isImage(documentData.file_url) ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  p: 4,
                }}
              >
                <Box
                  component="img"
                  src={documentData.file_url}
                  alt={getOriginalFilename()}
                  sx={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              </Box>
            ) : (
              <Box
                component="iframe"
                src={getOfficeViewerUrl(documentData.file_url)}
                title={getOriginalFilename()}
                sx={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
              />
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default DocumentViewer;
