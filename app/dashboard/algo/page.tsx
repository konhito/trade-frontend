import { redirect } from "next/navigation";

export default function DashboardAlgoRedirectPage() {
  redirect("/dashboard/backtest");
}
