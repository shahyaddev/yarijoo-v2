import { toFarsiNumber, calculateReadingTime } from "@/helper/helper";
import { siteURL } from "@/services/API";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import BookBookmarkButton from "@/components/book/BookBookmarkButton";

const Sidebar = ({ data }) => {
  const hasPrice = data?.book?.price && data.book.price > 0;
  
  return (
    <div className="w-full lg:w-[340px] shrink-0 flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
      {/* Book Cover */}
      <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border-2 border-borderColor/60 bg-gradient-to-br from-[#222529] to-[#1c1e21] shadow-2xl">
        <Image
          src={`${siteURL}/${data?.book?.cover}`}
          fill
          className="object-cover"
          alt={data?.book?.title || "کتاب"}
          priority
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-darkThemeColor/60 via-transparent to-transparent"></div>
      </div>

      {/* Price & Actions */}
      <div className="w-full bg-gradient-to-br from-secondaryThemeColor to-secondaryThemeColor/80 rounded-2xl p-5 border border-borderColor/60">
        {/* Price */}
        <div className="mb-4 pb-4 border-b border-borderColor/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-secondaryTextColor">قیمت کتاب:</span>
            {hasPrice ? (
              <div className="flex flex-col items-end">
                <span className="text-2xl font-black text-primaryThemeColor">
                  {toFarsiNumber(data.book.price.toLocaleString())} تومان
                </span>
              </div>
            ) : (
              <span className="text-2xl font-black text-primaryThemeColor">رایگان</span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <Link
          href={`/books/reader/${data?.book?.id}/${data?.book?.slug}`}
          className="w-full h-14 rounded-xl bg-gradient-to-r from-primaryThemeColor to-primaryThemeColor/90 text-white font-bold text-base flex items-center justify-center gap-2 hover:from-primaryThemeColor/90 hover:to-primaryThemeColor transition-all shadow-lg shadow-primaryThemeColor/30 hover:shadow-primaryThemeColor/50 hover:scale-105"
        >
          <i className="fi fi-rr-book-open-reader h-5"></i>
          <span>شروع مطالعه کتاب</span>
        </Link>
      </div>

      {/* Book Info */}
      <div className="w-full bg-secondaryThemeColor rounded-2xl p-5 border border-borderColor/60">
        <div className="flex items-center gap-2 mb-4">
          <i className="fi fi-rr-info text-primaryThemeColor h-4"></i>
          <h3 className="text-base font-bold text-primaryTextColor">اطلاعات کتاب</h3>
        </div>

        <div className="space-y-3">
          {/* Author */}
          {data?.book?.author && (
            <div className="flex items-center justify-between py-2 border-b border-borderColor/40">
              <span className="text-sm text-secondaryTextColor">نویسنده:</span>
              <span className="text-sm text-primaryTextColor font-semibold">{data.book.author}</span>
            </div>
          )}

          {/* Pages */}
          {data?.pages_count && (
            <div className="flex items-center justify-between py-2 border-b border-borderColor/40">
              <span className="text-sm text-secondaryTextColor">تعداد صفحات:</span>
              <span className="text-sm text-primaryTextColor font-semibold">{toFarsiNumber(data.pages_count)} صفحه</span>
            </div>
          )}

          {/* Reading Time */}
          {data?.total_content_length && (
            <div className="flex items-center justify-between py-2 border-b border-borderColor/40">
              <span className="text-sm text-secondaryTextColor">زمان مطالعه:</span>
              <span className="text-sm text-primaryTextColor font-semibold">
                {toFarsiNumber(calculateReadingTime(data.total_content_length))} دقیقه
              </span>
            </div>
          )}

          {/* Language */}
          <div className="flex items-center justify-between py-2 border-b border-borderColor/40">
            <span className="text-sm text-secondaryTextColor">زبان:</span>
            <span className="text-sm text-primaryTextColor font-semibold">فارسی</span>
          </div>

          {/* Format */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-secondaryTextColor">فرمت:</span>
            <span className="text-sm text-primaryTextColor font-semibold">PDF آنلاین</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="w-full bg-secondaryThemeColor rounded-2xl p-5 border border-borderColor/60">
        <div className="flex items-center gap-2 mb-4">
          <i className="fi fi-rr-apps text-primaryThemeColor h-4"></i>
          <h3 className="text-base font-bold text-primaryTextColor">عملیات سریع</h3>
        </div>

        <div className="space-y-2">
          <BookBookmarkButton bookData={data} />

          <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-darkThemeColor/30 hover:bg-darkThemeColor/50 text-secondaryTextColor hover:text-primaryTextColor transition-all group">
            <i className="fi fi-rr-share text-primaryThemeColor h-4 group-hover:scale-110 transition-transform"></i>
            <span className="text-sm font-semibold">اشتراک‌گذاری کتاب</span>
          </button>

          <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-darkThemeColor/30 hover:bg-darkThemeColor/50 text-secondaryTextColor hover:text-primaryTextColor transition-all group">
            <i className="fi fi-rr-comment text-primaryThemeColor h-4 group-hover:scale-110 transition-transform"></i>
            <span className="text-sm font-semibold">نظرات و دیدگاه‌ها</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      {/* <div className="w-full bg-secondaryThemeColor rounded-2xl p-5 border border-borderColor/60">
        <div className="flex items-center gap-2 mb-4">
          <i className="fi fi-rr-chart-histogram text-primaryThemeColor h-4"></i>
          <h3 className="text-base font-bold text-primaryTextColor">آمار کتاب</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-secondaryTextColor">بازدیدها:</span>
            <span className="text-sm font-bold text-primaryThemeColor">۱.۲ هزار</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-secondaryTextColor">امتیاز:</span>
            <div className="flex items-center gap-1">
              <i className="fi fi-sr-star text-yellow-500 text-xs h-3"></i>
              <span className="text-sm font-bold text-primaryThemeColor">۴.۸</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-secondaryTextColor">دانلودها:</span>
            <span className="text-sm font-bold text-primaryThemeColor">۵۴۲</span>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Sidebar;
