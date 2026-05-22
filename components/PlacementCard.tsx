import Image from "next/image";
import { ExternalLink } from "lucide-react";

export type PlacementRow = {
  id: string;
  title: string;
  subtitle: string | null;
  body_text: string | null;
  cta_label: string | null;
  cta_url: string;
  image_url: string | null;
  video_url: string | null;
  type: string;
  badge_text: string | null;
  grid_position: number;
  opens_in_new_tab: boolean;
};

export default function PlacementCard({ placement }: { placement: PlacementRow }) {
  const target = placement.opens_in_new_tab ? "_blank" : "_self";

  return (
    <a
      href={placement.cta_url}
      target={target}
      rel={placement.opens_in_new_tab ? "noopener noreferrer" : undefined}
      className="group block rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
    >
      {/* Media */}
      <div className="relative h-52 w-full overflow-hidden bg-gray-100">
        {placement.type === "video" && placement.video_url ? (
          <iframe
            src={placement.video_url}
            className="w-full h-full"
            allow="autoplay; muted"
            allowFullScreen
            title={placement.title}
          />
        ) : placement.image_url ? (
          <Image
            src={placement.image_url}
            alt={placement.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-50 to-orange-50">
            <span className="text-4xl">📢</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Badge */}
        {placement.badge_text && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-0.5">
            <span className="text-xs font-semibold text-orange-600">{placement.badge_text}</span>
          </div>
        )}

        {/* Title overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-bold text-lg leading-tight">{placement.title}</h3>
          {placement.subtitle && (
            <p className="text-white/80 text-xs mt-0.5">{placement.subtitle}</p>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-3 h-[116px] flex flex-col justify-between overflow-hidden">
        {placement.body_text ? (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{placement.body_text}</p>
        ) : (
          <div />
        )}

        {/* Spacer row (matches tag row height in CityCard) */}
        <div className="flex gap-1 overflow-hidden">
          <span className="text-xs px-2 py-0.5 bg-orange-50 text-orange-500 rounded-full font-medium whitespace-nowrap shrink-0">
            {placement.badge_text ?? "Sponsored"}
          </span>
        </div>

        {/* CTA row (matches footer row height in CityCard) */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Promotional</span>
          <span className="flex items-center gap-1 text-rose-500 font-medium group-hover:underline">
            {placement.cta_label ?? "Learn more"} <ExternalLink className="w-3 h-3" />
          </span>
        </div>

        {/* Social proof placeholder row (keeps height uniform with CityCard) */}
        <div className="invisible flex items-center gap-3 pt-1.5 border-t border-gray-50 text-xs">
          placeholder
        </div>
      </div>
    </a>
  );
}
