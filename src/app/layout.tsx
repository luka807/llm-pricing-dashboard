import type { Metadata } from "next";
import localFont from "next/font/local";
import { Source_Serif_4, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const proximaNova = localFont({
  variable: "--font-proxima",
  display: "swap",
  src: [
    { path: "./fonts/ProximaNova-Light.ttf", weight: "300", style: "normal" },
    { path: "./fonts/ProximaNova-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/ProximaNova-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/ProximaNova-Semibold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/ProximaNova-Bold.ttf", weight: "700", style: "normal" },
    { path: "./fonts/ProximaNova-Extrabold.ttf", weight: "800 900", style: "normal" },
    { path: "./fonts/ProximaNova-LightItalic.ttf", weight: "300", style: "italic" },
    { path: "./fonts/ProximaNova-Italic.ttf", weight: "400", style: "italic" },
    { path: "./fonts/ProximaNova-MediumItalic.ttf", weight: "500", style: "italic" },
    { path: "./fonts/ProximaNova-SemiboldItalic.ttf", weight: "600", style: "italic" },
    { path: "./fonts/ProximaNova-BoldItalic.ttf", weight: "700", style: "italic" },
    { path: "./fonts/ProximaNova-ExtraboldItalic.ttf", weight: "800 900", style: "italic" },
  ],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "LLM Pricing Dashboard",
  description: "Compare pricing, estimate cost, and track changes across LLM providers",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${proximaNova.variable} ${sourceSerif.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
