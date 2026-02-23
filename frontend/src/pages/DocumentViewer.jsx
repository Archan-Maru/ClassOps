import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import api from "../api/api";

function DocumentViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [url, setUrl] = useState(null);
  const [rawUrl, setRawUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/documents/${id}`);
        let docUrl = res.data.url;

        // If it's a Cloudinary URL, we might need to adjust it to remove fl_attachment
        // so it displays inline instead of downloading
        if (docUrl.includes("cloudinary.com")) {
          docUrl = docUrl.replace(/fl_attachment/g, "");
          // Also ensure it's using https
          docUrl = docUrl.replace("http://", "https://");

          // Add fl_attachment:false to ensure it doesn't download
          if (!docUrl.includes("fl_attachment:false")) {
            if (docUrl.includes("/upload/")) {
              docUrl = docUrl.replace(
                "/upload/",
                "/upload/fl_attachment:false/",
              );
            }
          }

          // Remove any existing attachment flags
          docUrl = docUrl.replace(/fl_attachment:[^/]+\//g, "");
        }

        // For Google Docs Viewer, we need the raw URL without fl_attachment:false
        const rawUrl = res.data.url
          .replace(/fl_attachment/g, "")
          .replace("http://", "https://");

        // For PDFs, we can use the Cloudinary URL directly, but we need to ensure it's not an attachment
        // We can also use Google Docs Viewer for PDFs if we want, but iframe is usually better

        setUrl(docUrl);
        setRawUrl(rawUrl);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load document");
        console.error("Document fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  const isPdf = url?.toLowerCase().split("?")[0].endsWith(".pdf");
  const isImage = url?.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)(\?|$)/i);

  return (
    <>
      <AppHeader />
      <div className="flex h-[calc(100vh-64px)] flex-col bg-slate-950">
        <div className="flex items-center border-b border-slate-700 bg-slate-900 px-4 py-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                clipRule="evenodd"
              />
            </svg>
            Back
          </button>
          <div className="ml-4 flex-1 truncate text-sm text-slate-300">
            {url ? url.split("/").pop().split("?")[0] : "Document Viewer"}
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-slate-950 p-4">
          {loading && (
            <div className="flex h-full items-center justify-center">
              <div className="text-slate-400">Loading document...</div>
            </div>
          )}

          {error && (
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <div className="text-red-400">{error}</div>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Go Back
              </button>
            </div>
          )}

          {!loading && !error && url && (
            <div className="h-full w-full overflow-hidden rounded-lg border border-slate-700 bg-white shadow-xl">
              {isPdf ? (
                <iframe
                  src={`${url}#toolbar=0`}
                  title="Document Viewer"
                  className="h-full w-full border-0"
                />
              ) : isImage ? (
                <div className="flex h-full w-full items-center justify-center bg-slate-900 p-4">
                  <img
                    src={url}
                    alt="Document"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ) : (
                <iframe
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(rawUrl)}`}
                  title="Document Viewer"
                  className="h-full w-full border-0"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default DocumentViewer;
