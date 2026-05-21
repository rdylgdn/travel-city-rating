import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Specific known hosts
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "dwqqijmwfchxeffhcjwv.supabase.co" },
      // Allow any HTTPS host for admin-added city images
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
