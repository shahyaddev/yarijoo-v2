"use client";
import { toFarsiNumber } from "@/helper/helper";
import { siteURL } from "@/services/API";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";

const ProductCard = ({ data }) => {
  // محاسبه درصد تخفیف
  const hasDiscount = data.discount_price && data.discount_price < data.price;
  const discountPercent = hasDiscount 
    ? Math.round(((data.price - data.discount_price) / data.price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="w-full flex flex-col gap-3 relative rounded-2xl border border-borderColor/60 bg-gradient-to-b from-[#222529] to-[#1c1e21] overflow-hidden hover:border-primaryThemeColor/40 hover:shadow-[0_0_0_2px_rgba(23,201,100,0.08)] transition-all duration-300 group"
    >
      {/* Image Container */}
      <Link href={`/shop/${data.slug}`} className="relative w-full block overflow-hidden">
        {data?.image?.length ? (
          <>
            <Image
              src={`${siteURL}/${data.image[0].image}`}
              width={500}
              height={250}
              className="w-full aspect-video object-top object-cover transition-transform duration-500 group-hover:scale-110"
              alt={data.title}
            />
            {/* Discount Badge */}
            {hasDiscount && (
              <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                {toFarsiNumber(discountPercent)}٪ تخفیف
              </div>
            )}
            {/* New Badge */}
            {data.is_new && (
              <div className="absolute top-3 right-3 bg-primaryThemeColor text-darkThemeColor text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                جدید
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-56 bg-darkThemeColor/50 flex items-center justify-center rounded-xl">
            <i className="fi fi-rr-picture text-4xl text-secondaryTextColor h-10"></i>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col gap-3 p-4 pt-0">
        {/* Category */}
        {data.category && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-secondaryTextColor bg-darkThemeColor/50 px-2 py-1 rounded-lg">
              <i className="fi fi-rr-apps text-xs h-3 ml-1"></i>
              {data.category.name}
            </span>
          </div>
        )}

        {/* Title */}
        <Link href={`/shop/${data.slug}`} className="block">
          <h2 className="text-base text-primaryTextColor font-bold group-hover:text-primaryThemeColor transition-colors truncate" title={data.title}>
            {data.title}
          </h2>
        </Link>

        {/* Price & Button */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-borderColor/40">
          <div className="flex flex-col gap-1">
            {hasDiscount ? (
              <>
                <span className="text-xs text-secondaryTextColor line-through">
                  {toFarsiNumber(data.price?.toLocaleString())} تومان
                </span>
                <span className="text-lg font-black text-primaryThemeColor">
                  {toFarsiNumber(data.discount_price?.toLocaleString())} تومان
                </span>
              </>
            ) : (
              <span className="text-lg font-black text-primaryTextColor">
                {data.price ? `${toFarsiNumber(data.price?.toLocaleString())} تومان` : 'رایگان'}
              </span>
            )}
          </div>

          <Link
            href={`/shop/${data.slug}`}
            className="h-10 px-4 rounded-xl bg-primaryThemeColor/15 text-primaryThemeColor text-sm font-semibold flex items-center gap-2 hover:bg-primaryThemeColor hover:text-darkThemeColor transition-all"
          >
            <span className="hidden sm:inline">مشاهده</span>
            <i className="fi fi-rr-arrow-left h-4"></i>
          </Link>
        </div>

        {/* Rating & Sales */}
        <div className="flex items-center justify-between text-xs text-secondaryTextColor">
          <div className="flex items-center gap-1">
            <i className="fi fi-rr-star text-yellow-500 text-xs block h-3 mb-0.5"></i>
            <span>{data.rating ? toFarsiNumber(data.rating) : '۵.۰'}</span>
          </div>
          <div className="flex items-center gap-1">
            <i className="fi fi-rr-shopping-cart h-3"></i>
            <span>{data.sales ? `${toFarsiNumber(data.sales)} فروش` : 'فروش جدید'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
