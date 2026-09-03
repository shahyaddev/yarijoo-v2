"use client";
import React from "react";
import { motion } from "framer-motion";
import { toFarsiNumber } from "@/helper/helper";
import Link from "next/link";

const PackageCard = ({ data }) => {
  // محاسبه تعداد پیام‌ها
  const messageCount = data.messages?.length || 0;
  const durationDays = Math.ceil(messageCount / (data.dispatch_rate || 1));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="w-full flex flex-col gap-4 relative rounded-2xl border border-borderColor/60 bg-gradient-to-b from-[#222529] to-[#1c1e21] overflow-hidden hover:border-primaryThemeColor/50 hover:shadow-[0_0_20px_rgba(23,201,100,0.1)] transition-all duration-300 group"
    >
      {/* Header with Icon */}
      <div className="relative bg-gradient-to-br from-primaryThemeColor/20 to-primaryThemeColor/5 p-6 border-b border-borderColor/40">
        <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-primaryThemeColor/20 flex items-center justify-center">
          <i className="fi fi-rr-envelope-open-text text-3xl text-primaryThemeColor h-7"></i>
        </div>



        <div className="pr-20">
          <h3 className="text-xl font-black text-primaryTextColor mb-2 group-hover:text-primaryThemeColor transition-colors">
            {data.title}
          </h3>
          <p className="text-sm text-secondaryTextColor line-clamp-2 leading-6">
            {data.description}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 px-6 pb-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-3 bg-darkThemeColor/50 rounded-xl">
            <i className="fi fi-rr-comment-sms text-primaryThemeColor text-lg h-4"></i>
            <div className="flex-1">
              <div className="text-xs text-secondaryTextColor">تعداد پیام</div>
              <div className="text-base font-bold text-primaryTextColor">
                {toFarsiNumber(messageCount)} پیام
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-darkThemeColor/50 rounded-xl">
            <i className="fi fi-rr-calendar text-primaryThemeColor text-lg h-4"></i>
            <div className="flex-1">
              <div className="text-xs text-secondaryTextColor">مدت زمان</div>
              <div className="text-base font-bold text-primaryTextColor">
                {toFarsiNumber(durationDays)} روز
              </div>
            </div>
          </div>
        </div>

        {/* Dispatch Rate */}
        <div className="flex items-center gap-4 p-4 bg-primaryThemeColor/5 rounded-xl border border-primaryThemeColor/20">
          <div className="w-10 h-10 rounded-full bg-primaryThemeColor/20 flex items-center justify-center">
            <i className="fi fi-rr-clock text-primaryThemeColor text-lg h-4"></i>
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-primaryTextColor">
              {toFarsiNumber(data.dispatch_rate || 1)} پیام در روز
            </div>
            <div className="text-xs text-secondaryTextColor">
              ارسال {data.dispatch_rate === 1 ? 'روزانه' : `${toFarsiNumber(data.dispatch_rate)} بار در روز`}
            </div>
          </div>
          {data.is_active === 1 && (
            <div className="px-3 py-1 bg-green-500 text-xs font-bold text-white rounded-full shadow-lg shadow-green-500/15">
              فعال
            </div>
          )}
        </div>

        {/* Price & Button */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-borderColor/40">
          <div className="flex flex-col gap-1">
            {data.discount_price && data.discount_price < data.price ? (
              <>
                <span className="text-xs text-secondaryTextColor line-through">
                  {toFarsiNumber(data.price?.toLocaleString())} تومان
                </span>
                <span className="text-xl font-black text-primaryThemeColor">
                  {toFarsiNumber(data.discount_price?.toLocaleString())} تومان
                </span>
              </>
            ) : (
              <span className="text-xl font-black text-primaryTextColor">
                {data.price ? `${toFarsiNumber(data.price?.toLocaleString())} تومان` : 'رایگان'}
              </span>
            )}
          </div>

          <Link
            href={`/payammooz/${data.slug}`}
            className="h-12 px-6 rounded-xl bg-primaryThemeColor text-darkThemeColor text-sm font-bold flex items-center gap-2 hover:bg-primaryThemeColor/90 transition-all shadow-lg shadow-primaryThemeColor/20"
          >
            <span>مشاهده و خرید</span>
            <i className="fi fi-rr-arrow-left h-4"></i>
          </Link>
        </div>

      </div>
    </motion.div>
  );
};

export default PackageCard;


