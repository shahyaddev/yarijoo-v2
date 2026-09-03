"use client";
import React from "react";
import { motion } from "framer-motion";
import { siteURL } from "@/services/API";
import { toFarsiNumber } from "@/helper/helper";
import Image from "next/image";
import Link from "next/link";

const BlogCard = ({ data }) => {
  // محاسبه زمان مطالعه (تخمینی)
  const calculateReadingTime = (content) => {
    if (!content) return 0;
    const wordsPerMinute = 200; // برای فارسی
    const text = content.replace(/<[^>]*>/g, ''); // حذف HTML tags
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const readingTime = calculateReadingTime(data.content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      className="xl:w-full h-auto flex flex-col gap-3 rounded-2xl group transition-all duration-300 border border-borderColor/60 bg-gradient-to-b from-[#222529] to-[#1c1e21] hover:border-primaryThemeColor/40 hover:shadow-[0_0_0_2px_rgba(23,201,100,0.08)]"
    >
      {/* post image */}
      <Link
        href={`/blog/${data.slug}`}
        className="w-full relative overflow-hidden rounded-t-2xl"
      >
        <Image
          src={`${siteURL}/${data.image}`}
          className={`w-full h-52 rounded-t-2xl object-cover transition-all duration-300`}
          width={300}
          height={150}
          alt={data.title}
        />
      </Link>

      <div className="w-full flex flex-col gap-3 p-4 pt-0">
        {/* post title */}
        <Link href={`/blog/${data.slug}`} className="relative flex items-center gap-2 group/title">
          <span className="block min-w-2 h-2 rounded-full bg-primaryThemeColor"></span>
          <h3 className="text-base font-bold text-primaryTextColor group-hover/title:text-primaryThemeColor transition-all duration-300 truncate flex-1">
            {data.title}
          </h3>
        </Link>

        {/* post details */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-secondaryTextColor border-t border-borderColor pt-3">
          {/* date */}
          <div className="flex items-center gap-1.5">
            <i className="fi fi-rr-calendar text-sm h-3.5"></i>
            <span>
              {new Intl.DateTimeFormat("fa-IR", {
                year: "numeric",
                month: "short",
                day: "numeric",
              }).format(new Date(data.created_at || data.updated_at))}
            </span>
          </div>

          {/* reading time */}
          {readingTime > 0 && (
            <div className="flex items-center gap-1.5">
              <i className="fi fi-rr-clock text-sm h-3.5"></i>
              <span>{toFarsiNumber(readingTime)} دقیقه</span>
            </div>
          )}

          {/* comments count */}
          {data.comments > 0 && (
            <div className="flex items-center gap-1.5">
              <i className="fi fi-rr-comment-dots text-sm h-3.5"></i>
              <span>{toFarsiNumber(data.comments)} نظر</span>
            </div>
          )}
        </div>

        <div className="w-full flex justify-end items-center pt-2">
          <Link
            href={`/blog/${data.slug}`}
            className="px-3 h-9 rounded-lg bg-primaryThemeColor/15 text-primaryThemeColor text-xs font-semibold flex items-center gap-2 hover:bg-primaryThemeColor hover:text-darkThemeColor transition-all"
          >
            <span>مطالعه</span>
            <i className="fi fi-rr-arrow-up-right-from-square h-[14px] -scale-x-100"></i>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default BlogCard;
