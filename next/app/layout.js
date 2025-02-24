// app/layout.js
import { Mona_Sans } from "next/font/google";
import "./styles/globals.css";

const font = Mona_Sans({
  variable: "--font",
  subsets: ["latin"],
});

export const metadata = {
  title: "GitTown",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={`${font.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
