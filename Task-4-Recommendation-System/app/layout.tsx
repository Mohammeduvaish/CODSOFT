import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={title:"Curio — Explainable Recommendations",description:"Discover personalized movies, books, and products with a private content-based recommendation engine."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
