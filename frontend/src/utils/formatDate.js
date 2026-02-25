export function formatDate(dateString, { includeTime = false } = {}) {
  if (!dateString) return "—";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return String(dateString);

  const datePart = d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (!includeTime) return datePart;

  const timePart = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${datePart} · ${timePart}`;
}

export function relativeDeadline(dateString) {
  if (!dateString) return "";
  const now = new Date();
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";

  if (d < now) return "Overdue";

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const deadlineDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((deadlineDay - today) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays <= 7) return `Due in ${diffDays} days`;
  return formatDate(dateString);
}
