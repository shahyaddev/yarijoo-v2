import { siteURL } from "@/services/API";
import { toFarsiNumber } from "@/helper/helper";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const StoryCard = ({ data }) => {
  console.log(data);
  return (
    <div className="w-full max-w-[240px] mx-auto flex flex-col gap-2.5 group">
      <Link
        href={`/stories/${data.slug}`}
        className="relative overflow-hidden rounded-xl"
      >
        {/* Story Image */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-borderColor/60 bg-gradient-to-br from-[#222529] to-[#1c1e21]">
          <Image
            src={`${siteURL}/${data.image || data.cover}`}
            width={240}
            height={320}
            className="aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-110 w-full"
            alt={data.title}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-darkThemeColor via-darkThemeColor/60 to-transparent"></div>

          {/* Category Badge */}
          {data.category && (
            <div className="absolute top-2.5 right-2.5 bg-primaryThemeColor text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg backdrop-blur-sm">
              {data.category}
            </div>
          )}

          {/* Reading Time */}
          <div className="absolute top-10 right-2.5 bg-darkThemeColor/80 text-primaryTextColor text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm border border-borderColor/40 flex items-center gap-1">
            <i className="fi fi-rr-clock h-3"></i>
            <span>{data.readTime || "۵"} دقیقه</span>
          </div>

          {/* Title at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h2
              className="text-sm font-black text-white line-clamp-2 leading-5 group-hover:text-primaryThemeColor transition-colors"
              title={data.title}
            >
              {data.title}
            </h2>
          </div>
        </div>
      </Link>

      {/* Story Info */}
      <div className="flex flex-col gap-2 px-1">
        {/* Description */}
        {data.description && (
          <p className="text-xs text-secondaryTextColor leading-5 line-clamp-2">
            {data.description}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[10px] text-secondaryTextColor border-t border-borderColor pt-2">
          {/* Date */}
          {data.date && (
            <div className="flex items-center gap-1">
              <i className="fi fi-rr-calendar text-primaryThemeColor h-3"></i>
              <span>{toFarsiNumber(data.date)}</span>
            </div>
          )}

          {/* Views */}
          <div className="flex items-center gap-1">
            <i className="fi fi-rr-eye text-primaryThemeColor h-3"></i>
            <span>{toFarsiNumber(data.views || 234)} بازدید</span>
          </div>

          {/* Likes */}
          <div className="flex items-center gap-1">
            <i className="fi fi-rr-heart text-red-600 h-3"></i>
            <span>{toFarsiNumber(data.likes || 45)} پسند</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryCard;
