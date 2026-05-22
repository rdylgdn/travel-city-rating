"use client";

import dynamic from "next/dynamic";
import type { GalleryImage } from "./ReviewGallery";

const ReviewGallery = dynamic(() => import("./ReviewGallery"), {
  ssr: false,
  loading: () => null,
});

export default function ReviewGalleryWrapper({ images }: { images: GalleryImage[] }) {
  return <ReviewGallery images={images} />;
}
