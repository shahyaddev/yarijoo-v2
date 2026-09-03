"use client";

import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import BlogCard from "./BlogCard";

const BlogPostSlider = ({ posts }) => {
  const swiperRef = useRef();

  return (
    <div className="w-full relative">
      <button
        onClick={() => swiperRef.current.slidePrev()}
        className="size-12 flex justify-center items-center rounded-full bg-gray-200/5 text-lightTextColor absolute top-2/4 -translate-y-2/4 z-30 bg-opacity-45 backdrop-blur-sm 2xl:-right-6 right-0"
      >
        <i className="fi fi-rr-angle-small-right text-2xl h-6"></i>
      </button>

      <button
        onClick={() => swiperRef.current.slideNext()}
        className="size-12 flex justify-center items-center rounded-full bg-gray-200/5 text-lightTextColor absolute top-2/4 -translate-y-2/4 z-30 bg-opacity-45 backdrop-blur-sm 2xl:-left-6 left-0"
      >
        <i className="fi fi-rr-angle-small-left text-2xl h-6"></i>
      </button>

      <Swiper
        className="mySwiper"
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        spaceBetween={20}
        breakpoints={{
          640: {
            // sm
            slidesPerView: 1,
            spaceBetween: 20,
          },
          768: {
            // md
            slidesPerView: 2,
            spaceBetween: 20,
          },
          1024: {
            // lg
            slidesPerView: 3,
            spaceBetween: 20,
          },
          1280: {
            // xl
            slidesPerView: 4,
            spaceBetween: 20,
          },
          1536: {
            // 2xl
            slidesPerView: 4,
            spaceBetween: 20,
          },
        }}
      >
        {posts.map((post) => (
          <SwiperSlide>
            <BlogCard data={post} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default BlogPostSlider;
