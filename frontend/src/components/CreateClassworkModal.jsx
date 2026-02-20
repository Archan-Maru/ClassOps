import { useState } from "react";
import api from "../api/api";

function CreateClassworkModal({ isOpen, onClose, onSuccess, classId }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
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
      await api.post(`/classes/${classId}/classwork`, {
        title: title.trim(),
        description: description.trim(),
        resource_url: resourceUrl.trim(),
      });
      setTitle("");
      setDescription("");
      setResourceUrl("");
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
            <label htmlFor="classwork-title" className="block text-sm font-medium text-slate-400">
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
            <label htmlFor="classwork-description" className="block text-sm font-medium text-slate-400">
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
            <label htmlFor="classwork-url" className="block text-sm font-medium text-slate-400">
              File/URL
            </label>
            <input
              id="classwork-url"
              type="text"
              value={resourceUrl}
              onChange={(event) => setResourceUrl(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100"
            />
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
