import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tactix — Unbeatable Tic-Tac-Toe AI",
  description: "Play Tic-Tac-Toe against four levels of AI, including Minimax with alpha-beta pruning.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
