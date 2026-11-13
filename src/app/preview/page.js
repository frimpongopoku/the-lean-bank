import { notFound } from "next/navigation";
import PreviewApp from "./PreviewApp";

// Dev-only: renders real screens against fixtures. 404 in production.
export default async function PreviewPage({ searchParams }) {
  if (process.env.NODE_ENV !== "development") notFound();
  const sp = await searchParams;
  return <PreviewApp screen={sp?.screen || "home"} data={sp?.data || "demo"} tab={sp?.tab} />;
}
