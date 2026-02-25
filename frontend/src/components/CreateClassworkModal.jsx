import { useState, useRef } from "react";
import api from "../api/api";

function CreateClassworkModal({ isOpen, onClose, onSuccess, classId }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (attachedFile) {
        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("description", description.trim());
        formData.append("file", attachedFile);

        await api.post(`/classes/${classId}/classwork`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post(`/classes/${classId}/classwork`, {
          title: title.trim(),
          description: description.trim(),
        });
      }
      setTitle("");
      setDescription("");
      setAttachedFile(null);
      onClose();
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add material");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl border border-slate-700/60 bg-slate-900 p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-slate-100">Add Material</h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="classwork-title"
              className="block text-sm font-medium text-slate-400"
            >
              Title
            </label>
            <input
              id="classwork-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="classwork-description"
              className="block text-sm font-medium text-slate-400"
            >
              Description
            </label>
            <textarea
              id="classwork-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows="3"
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="classwork-file"
              className="block text-sm font-medium text-slate-400"
            >
              Attach material (optional)
            </label>
            <div className="mt-1">
              <input
                id="classwork-file"
                ref={fileInputRef}
                type="file"
                onChange={(e) => setAttachedFile(e.target.files?.[0] || null)}
                className="hidden"
              />

              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) =>
                  e.key === "Enter" && fileInputRef.current?.click()
                }
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer?.files?.[0];
                  if (f) setAttachedFile(f);
                }}
                className="mt-1 w-full cursor-pointer rounded-lg border-2 border-dashed border-slate-600 bg-slate-800/40 px-3 py-4 text-sm text-slate-300 hover:border-indigo-500"
              >
                <div className="flex items-center justify-between">
                  <span>Click to attach a file or drag it here (optional)</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="rounded bg-indigo-600 px-3 py-1 text-white text-sm"
                  >
                    Attach
                  </button>
                </div>
              </div>

              {attachedFile && (
                <div className="mt-2 flex items-center gap-2 rounded-md bg-slate-800 px-3 py-1 text-sm text-slate-100">
                  <span className="truncate max-w-xs">{attachedFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setAttachedFile(null)}
                    className="ml-2 rounded px-2 py-1 text-xs text-slate-300 hover:bg-slate-700 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
            >
              {loading ? "Saving..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateClassworkModal;
