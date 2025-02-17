import type {Metadata, Viewport} from "next";
import "./globals.css";
import {Providers} from "@/app/providers";
import {IRANSansX} from "@/lib/font";


export const metadata: Metadata = {
    title: "ربات اددر کلوزفرند",
};

export const viewport: Viewport = {
    themeColor: [
        {media: "(prefers-color-scheme: light)", color: "#FF921F"},
        {media: "(prefers-color-scheme: dark)", color: "#FF921F"},
    ],
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
}


export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="fa" dir="rtl">
        <body
            className={`${IRANSansX.className} antialiased`}
        >
        <Providers>
            {children}
        </Providers>
        </body>
        </html>
    );
}
