"use client";
import dynamic from "next/dynamic";

const CaliforniaEquityTracker = dynamic(
  () => import("@/components/CaliforniaEquityTracker"),
  { ssr: false }
);

export default function Home() {
  return <CaliforniaEquityTracker />;
}
