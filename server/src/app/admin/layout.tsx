import type { ReactNode } from "react";

// Admin pages intentionally do NOT render the global <Nav />
// (RootLayout is still applied, but this layout becomes the segment wrapper).
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen">{children}</div>;
}
