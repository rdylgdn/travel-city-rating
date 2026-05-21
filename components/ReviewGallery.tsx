"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Images } from "lucide-react";

export type GalleryImage = {
  url: string;
  authorName: string;
  travelStyle?: string;
  monthVisited?: string;
};

type Props = {
  images: GalleryImage[];
};

export default function ReviewGallery({ images }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  function prev() {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  }
  function next() {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % images.length));
  }

  const current = lightboxIndex !== null ? images[lightboxIndex] : null;

  return (
    <>
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Images className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-bold text-gray-800">
            Traveler photos
            <span className="text-sm text-gray-400 font-normal ml-2">({images.length})</span>
          </h2>
        </div>

        {/* Grid — first image large, rest smaller */}
        <div className="grid grid-cols-4 gap-2">
          {images.slice(0, 1).map((img, i) => (
            <button
              key={i}
              onClick={() => setLightboxIndex(i)}
              className="col-span-2 row-span-2 relative h-56 rounded-2xl overflow-hidden group"
            >
              <Image src={img.url} alt="Review photo" fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="50vw" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </button>
          ))}
          {images.slice(1, 5).map((img, i) => (
            <button
              key={i + 1}
              onClick={() => setLightboxIndex(i + 1)}
              className="relative h-[106px] rounded-xl overflow-hidden group"
            >
              <Image src={img.url} alt="Review photo" fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="25vw" />
              {i === 3 && images.length > 5 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">+{images.length - 5}</span>
                </div>
              )}
            </button>
          ))}
        </div>

        {images.length > 5 && (
          <button onClick={() => setLightboxIndex(5)}
            className="mt-2 text-sm text-rose-500 hover:underline">
            View all {images.length} photos
          </button>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && current && (
        <>
          <div className="fixed inset-0 bg-black/90 z-50 flex flex-col" onClick={() => setLightboxIndex(null)}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 shrink-0" onClick={(e) => e.stopPropagation()}>
              <div>
                <p className="text-white font-semibold text-sm">{current.authorName}</p>
                <p className="text-white/60 text-xs">
                  {[current.travelStyle, current.monthVisited].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white/60 text-sm">{lightboxIndex + 1} / {images.length}</span>
                <button onClick={() => setLightboxIndex(null)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center px-16 relative" onClick={(e) => e.stopPropagation()}>
              <div className="relative w-full max-w-4xl" style={{ height: "calc(100vh - 140px)" }}>
                <Image
                  src={current.url}
                  alt="Review photo"
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              </div>

              {/* Prev / Next */}
              {images.length > 1 && (
                <>
                  <button onClick={prev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  <button onClick={next}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 justify-center px-4 py-3 overflow-x-auto shrink-0" onClick={(e) => e.stopPropagation()}>
                {images.map((img, i) => (
                  <button key={i} onClick={() => setLightboxIndex(i)}
                    className={`relative w-12 h-12 rounded-lg overflow-hidden shrink-0 transition-all ${i === lightboxIndex ? "ring-2 ring-white" : "opacity-50 hover:opacity-80"}`}>
                    <Image src={img.url} alt="" fill className="object-cover" sizes="48px" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
