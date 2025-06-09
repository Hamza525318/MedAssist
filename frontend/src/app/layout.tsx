import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MedAssist - Healthcare Assistant Dashboard",
  description: "A modern healthcare assistant dashboard for doctors",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} font-inter antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
