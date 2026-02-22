import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { ToastContainer } from "@/components/ui/Toast";
import { InitializeApp } from "@/components/InitializeApp";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Expense & Budget Manager",
  description: "Professional expense tracking and budget management application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ToastProvider>
            <InitializeApp>
              {children}
            </InitializeApp>
            <ToastContainer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
