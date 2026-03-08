import { formatDistanceToNow, isToday, isYesterday, format } from 'date-fns';

export function formatMessageTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  // Less than 1 minute
  if (diffMins < 1) {
    return 'Just now';
  }

  // Less than 1 hour
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }

  // Same day, older than 1 hour
  if (isToday(date)) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  // Yesterday
  if (isYesterday(date)) {
    return 'Yesterday';
  }

  // Older messages - show date
  return format(date, 'MMM d');
}