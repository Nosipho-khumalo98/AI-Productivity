import { createFileRoute } from "@tanstack/react-router";
import { HistoryView } from "./history";

export const Route = createFileRoute("/saved")({
  component: () => <HistoryView title="Saved Documents" subtitle="Your bookmarked items" savedOnly />,
});
