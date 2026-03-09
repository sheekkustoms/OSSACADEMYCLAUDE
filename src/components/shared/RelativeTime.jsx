import moment from "moment";

export default function RelativeTime({ date }) {
  if (!date) return null;

  // Ensure the date is parsed as UTC then converted to local
  const localTime = moment.utc(date).local();

  return (
    <span title={localTime.format("YYYY-MM-DD HH:mm:ss")}>
      {localTime.fromNow()}
    </span>
  );
}