import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
    async rewrites() {
        return [
            {
                source: "/api/backend/:path*",
                destination: `${process.env.API_BASE_URL}/:path*`,
            },
        ];
    },
};

export default nextConfig;
