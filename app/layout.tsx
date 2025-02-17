import type {Metadata} from "next";
import "./globals.css";
import {Providers} from "@/app/providers";
import {IRANSansX} from "@/lib/font";


export const metadata: Metadata = {
    title: "Instagram Bot",
};

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
