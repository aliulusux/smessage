import "./globals.css";

export const metadata = {
  title: "sMessage IRC Chat",
  description: "Next-generation real-time IRC experience",
  icons: { icon: "/favicon.svg" }, // use favicon.png if that's what you have
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* ⬇️ These classes were missing, so the page looked unstyled */}
      <body className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
