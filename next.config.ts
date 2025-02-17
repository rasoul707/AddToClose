import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdninstagram.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
};

export default nextConfig;
