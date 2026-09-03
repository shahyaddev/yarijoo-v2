"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { siteURL } from "@/services/API";
import { toFarsiNumber } from "@/helper/helper";

const FeaturedPosts = ({ posts }) => {
  if (!posts || posts.length === 0) return null;

  return (
    <div className="w-full mb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 mb-4"
      >
        <div className="w-1 h-8 bg-gradient-to-b from-primaryThemeColor to-primaryThemeColor/40 rounded-full"></div>
        <h2 className="text-2xl font-black text-primaryTextColor">مقالات ویژه</h2>
        <div className="flex-1 h-px bg-gradient-to-l from-borderColor to-transparent"></div>
      </motion.div>

      <Swiper
        modules={[Navigation, Autoplay, Pagination]}
        spaceBetween={20}
        slidesPerView={1}
        navigation={{
          nextEl: ".featured-next",
          prevEl: ".featured-prev",
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        breakpoints={{
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="featured-posts-swiper"
      >
        {posts.slice(0, 6).map((post) => (
          <SwiperSlide key={post.id}>
            <FeaturedPostCard post={post} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation */}
      <div className="flex justify-center gap-3 mt-6">
        <button className="featured-prev w-10 h-10 rounded-full bg-secondaryThemeColor border border-borderColor/60 text-primaryThemeColor hover:bg-primaryThemeColor hover:text-darkThemeColor hover:border-primaryThemeColor transition-all flex items-center justify-center">
          <i className="fi fi-rr-angle-right h-4"></i>
        </button>
        <button className="featured-next w-10 h-10 rounded-full bg-secondaryThemeColor border border-borderColor/60 text-primaryThemeColor hover:bg-primaryThemeColor hover:text-darkThemeColor hover:border-primaryThemeColor transition-all flex items-center justify-center">
          <i className="fi fi-rr-angle-left h-4"></i>
        </button>
      </div>
    </div>
  );
};

const FeaturedPostCard = ({ post }) => {
  return (
    <Link href={`/blog/${post.slug}`}>
      <div className="group relative h-80 rounded-2xl overflow-hidden border border-borderColor/60 hover:border-primaryThemeColor/50 transition-all cursor-pointer">
        {/* Image */}
        <Image
          src={`${siteURL}/${post.image}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          alt={post.title}
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-darkThemeColor via-darkThemeColor/50 to-transparent"></div>

        {/* Badge */}
        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primaryThemeColor text-darkThemeColor text-xs font-bold">
          ویژه
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-lg font-bold text-white mb-3 group-hover:text-primaryThemeColor transition-colors truncate" title={post.title}>
            {post.title}
          </h3>

          <div className="flex items-center gap-4 text-xs text-gray-400">
            {post.author && (
              <div className="flex items-center gap-1.5">
                <i className="fi fi-rr-user h-3"></i>
                <span>{post.author.name} {post.author.family_name}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <i className="fi fi-rr-calendar h-3"></i>
              <span>
                {new Intl.DateTimeFormat("fa-IR", {
                  month: "short",
                  day: "numeric",
                }).format(new Date(post.created_at || post.updated_at))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default FeaturedPosts;

