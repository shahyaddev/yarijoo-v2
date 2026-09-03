"use client";

import { siteURL } from "@/services/API";
import { toFarsiNumber } from "@/helper/helper";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { saveBook, removeBook, isBookSaved } from "@/helper/bookmarkHelper";
import { useUser } from "@/lib/useUser";
import toast from "react-hot-toast";

const BookCard = ({ data }) => {
  const hasDiscount = data.discount_price && data.discount_price < data.price;
  const discountPercent = hasDiscount 
    ? Math.round(((data.price - data.discount_price) / data.price) * 100)
    : 0;
  
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const user = useUser();

  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!user?.user?.id || !data?.id) return;
      try {
        const saved = await isBookSaved(data.id);
        setIsBookmarked(saved);
      } catch (error) {
        console.error("Error checking bookmark:", error);
      }
    };
    checkBookmarkStatus();
  }, [data?.id, user?.user?.id]);

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user?.user?.id) {
      toast.error("ابتدا وارد حساب خود شوید");
      return;
    }

    setLoading(true);
    try {
      if (isBookmarked) {
        const success = await removeBook(data.id);
        if (success) {
          setIsBookmarked(false);
          toast.success("کتاب از ذخیره شده‌ها حذف شد");
        }
      } else {
        const success = await saveBook(data);
        if (success) {
          setIsBookmarked(true);
          toast.success("کتاب به ذخیره شده‌ها اضافه شد");
        }
      }
    } catch (error) {
      console.error("Error handling bookmark:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-3 group p-4 rounded-2xl bg-gradient-to-br from-[#1a1c1f] to-[#161616] border border-borderColor/30 hover:border-primaryThemeColor/30 transition-all duration-300 hover:shadow-xl hover:shadow-primaryThemeColor/10">
      <div className="relative">
        <Link href={`/books/${data.id}/${data.slug}`} className="relative block overflow-hidden rounded-xl">
          {/* Book Cover */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-borderColor/30 bg-gradient-to-br from-[#222529] to-[#1c1e21] shadow-lg shadow-black/30 group-hover:shadow-xl group-hover:shadow-primaryThemeColor/20 transition-all duration-500 group-hover:border-primaryThemeColor/50">
            <Image
              src={`${siteURL}/${data.cover}`}
              width={300}
              height={600}
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
              alt={data.title}
            />
            
            {/* Gradient Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-darkThemeColor/90 via-primaryThemeColor/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Discount Badge */}
            {hasDiscount && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg z-10">
                {toFarsiNumber(discountPercent)}٪
              </div>
            )}
            
            {/* New Badge */}
            {data.is_new && (
              <div className="absolute top-2 right-2 bg-primaryThemeColor text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg z-10">
                جدید
              </div>
            )}
          </div>
        </Link>

        {/* Bookmark Button */}
        <button
          onClick={handleBookmark}
          disabled={loading}
          className={`absolute top-2 right-2 w-9 h-9 rounded-lg backdrop-blur-sm border flex items-center justify-center transition-all z-20 ${
            isBookmarked
              ? "bg-primaryThemeColor/20 text-primaryThemeColor border-primaryThemeColor/40"
              : "bg-darkThemeColor/60 text-secondaryTextColor border-borderColor/40 hover:bg-primaryThemeColor/10 hover:text-primaryThemeColor hover:border-primaryThemeColor/40"
          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading ? (
            <i className="fi fi-rr-spinner animate-spin h-4"></i>
          ) : (
            <i className={`fi ${isBookmarked ? "fi-sr-bookmark" : "fi-rr-bookmark"} h-4`}></i>
          )}
        </button>
      </div>

      {/* Book Info */}
      <div className="w-full flex flex-col gap-2.5">
        <Link href={`/books/${data.id}/${data.slug}`} className="group/title">
          <h2 className="text-base font-bold text-primaryTextColor line-clamp-1 leading-6 group-hover/title:text-primaryThemeColor transition-colors duration-300" title={data.title}>
            {data.title}
          </h2>
        </Link>

        {/* Author */}
        {data.author && (
          <div className="flex items-center gap-1.5 text-sm text-secondaryTextColor/70">
            <i className="fi fi-rr-user-pen h-3.5 text-primaryThemeColor/60"></i>
            <span className="truncate">{data.author}</span>
          </div>
        )}

        {/* Meta Info: Rating, Pages, Date */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-secondaryTextColor/60">
          {/* Rating */}
          <div className="flex items-center gap-1">
            <i className="fi fi-rr-star text-yellow-500 h-3 fill-yellow-500"></i>
            <span>{data.rating ? toFarsiNumber(data.rating) : '۵.۰'}</span>
          </div>

          {/* Pages */}
          {data.pages && data.pages.length > 0 && (
            <div className="flex items-center gap-1">
              <i className="fi fi-rr-file text-primaryThemeColor/70 h-3"></i>
              <span>{toFarsiNumber(data.pages.length)} صفحه</span>
            </div>
          )}

          {/* Date */}
          {(data.created_at || data.updated_at) && (
            <div className="flex items-center gap-1">
              <i className="fi fi-rr-calendar text-secondaryTextColor/50 h-3"></i>
              <span>
                {new Intl.DateTimeFormat("fa-IR", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }).format(new Date(data.created_at || data.updated_at))}
              </span>
            </div>
          )}
        </div>

        {/* Price Section */}
        <div className="flex items-center justify-between pt-2 border-t border-borderColor/20">
          <div className="flex flex-col gap-0.5">
            {hasDiscount ? (
              <>
                <span className="text-xs text-secondaryTextColor/50 line-through">
                  {toFarsiNumber(data.price?.toLocaleString())} تومان
                </span>
                <span className="text-lg font-black text-primaryThemeColor">
                  {toFarsiNumber(data.discount_price?.toLocaleString())} تومان
                </span>
              </>
            ) : (
              <span className="text-lg font-black text-primaryTextColor">
                {data.price && data.price > 0 ? `${toFarsiNumber(data.price?.toLocaleString())} تومان` : (
                  <span className="text-primaryThemeColor">رایگان</span>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
