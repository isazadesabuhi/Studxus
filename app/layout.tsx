import "./globals.css";
import { Inter } from "next/font/google";
import MobileLayout from "@/components/MobileLayout";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MobileLayout title="Messagerie">
          {/* Your routed pages render here */}
          {children}
        </MobileLayout>
      </body>
    </html>
  );
}
