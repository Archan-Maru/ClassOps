import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

function normalizeCloudinaryUrl(inputUrl) {
  if (!inputUrl?.includes("cloudinary.com")) return inputUrl;

  const secureUrl = inputUrl.replace("http://", "https://");
  const parsedUrl = new URL(secureUrl);

  ["download", "dl", "fl_attachment", "response-content-disposition"].forEach(
    (param) => parsedUrl.searchParams.delete(param),
  );

  const [prefix, suffix] = parsedUrl.toString().split("/upload/");

  if (!suffix) return secureUrl;

  const cleanedSegments = suffix
    .split("/")
    .map((segment) =>
      segment
        .split(",")
        .filter((token) => token && !token.startsWith("fl_attachment"))
        .join(","),
    )
    .filter((segment) => segment);

  return `${prefix}/upload/${cleanedSegments.join("/")}`;
}

function DocumentViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [url, setUrl] = useState(null);
  const [rawUrl, setRawUrl] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [pdfPreviewLoading, setPdfPreviewLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
    };
  }, [pdfPreviewUrl]);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/documents/${id}`);
        const docUrl = normalizeCloudinaryUrl(res.data.url);
        const rawUrl = normalizeCloudinaryUrl(res.data.url);
        const isDocumentPdf = rawUrl
          ?.toLowerCase()
          .split("?")[0]
          .endsWith(".pdf");

        setUrl(docUrl);
        setRawUrl(rawUrl);

        if (isDocumentPdf) {
          setPdfPreviewLoading(true);
          try {
            const pdfResponse = await api.get(`/documents/${id}/content`, {
              responseType: "blob",
            });

            const pdfBlob = pdfResponse.data;
            const typedPdfBlob =
              pdfBlob.type === "application/pdf"
                ? pdfBlob
                : new Blob([pdfBlob], { type: "application/pdf" });

            const objectUrl = URL.createObjectURL(typedPdfBlob);
            setPdfPreviewUrl((previousUrl) => {
              if (previousUrl) URL.revokeObjectURL(previousUrl);
              return objectUrl;
            });
          } catch (previewErr) {
            console.error("PDF preview fetch error:", previewErr);
            setPdfPreviewUrl((previousUrl) => {
              if (previousUrl) URL.revokeObjectURL(previousUrl);
              return null;
            });
          } finally {
            setPdfPreviewLoading(false);
          }
        } else {
          setPdfPreviewUrl((previousUrl) => {
            if (previousUrl) URL.revokeObjectURL(previousUrl);
            return null;
          });
          setPdfPreviewLoading(false);
        }
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
  const isImage = url
    ?.toLowerCase()
    .match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)(\?|$)/i);
  const fileName = url ? url.split("/").pop().split("?")[0] : "Document";

  return (
    <div className="flex h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 shadow-sm">
        {/* Left: back + filename */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                clipRule="evenodd"
              />
            </svg>
            Back
          </button>
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 shrink-0" />
          <span className="truncate text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {fileName}
          </span>
        </div>

        {/* Right: actions */}
        {!loading && !error && rawUrl && (
          <div className="flex shrink-0 items-center gap-1">
            <a
              href={rawUrl}
              download
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Download"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
              </svg>
              Download
            </a>
            <a
              href={rawUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Open in new tab"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
                  clipRule="evenodd"
                />
              </svg>
              Open
            </a>
          </div>
        )}
      </header>

      {/* Viewer area */}
      <main className="flex flex-1 flex-col items-center overflow-hidden bg-zinc-100 dark:bg-zinc-900 px-4 py-6">
        {/* Loading */}
        {loading && (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <svg
                className="h-4 w-4 animate-spin text-violet-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              Loading documentâ€¦
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-xl border border-red-200 dark:border-red-800 bg-white dark:bg-zinc-800 px-6 py-5 shadow-sm">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                {error}
              </p>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        )}

        {/* Document */}
        {!loading && !error && url && (
          <div className="flex w-full max-w-5xl flex-1 flex-col overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm">
            {isPdf && pdfPreviewLoading && (
              <div className="flex flex-1 items-center justify-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                <svg
                  className="h-4 w-4 animate-spin text-violet-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Preparing previewâ€¦
              </div>
            )}
            {isPdf && !pdfPreviewLoading && pdfPreviewUrl && (
              <object
                data={`${pdfPreviewUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                type="application/pdf"
                className="h-full w-full flex-1"
              >
                <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    PDF preview is not supported in this browser.
                  </p>
                  <a
                    href={rawUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
                  >
                    Open PDF in new tab
                  </a>
                </div>
              </object>
            )}
            {isPdf && !pdfPreviewLoading && !pdfPreviewUrl && (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Could not prepare inline preview for this PDF.
                </p>
                <a
                  href={rawUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
                >
                  Open PDF in new tab
                </a>
              </div>
            )}
            {!isPdf && isImage && (
              <div className="flex flex-1 items-center justify-center overflow-auto bg-zinc-50 dark:bg-zinc-900 p-6">
                <img
                  src={url}
                  alt="Document"
                  className="max-h-full max-w-full rounded object-contain shadow-sm"
                />
              </div>
            )}
            {!isPdf && !isImage && (
              <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(rawUrl)}`}
                title="Document Viewer"
                className="h-full w-full flex-1 border-0"
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default DocumentViewer;
