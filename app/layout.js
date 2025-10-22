"use client";

import "./globals.css";

export const metadata = {
  title: "sMessage IRC Chat",
  description: "Next-generation real-time IRC experience",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
