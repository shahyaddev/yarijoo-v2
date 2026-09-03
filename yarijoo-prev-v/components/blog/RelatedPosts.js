"use client";
import React from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import BlogCard from "./BlogCard";

const RelatedPosts = ({ posts, title = "مقالات مرتبط" }) => {
  if (!posts || posts.length === 0) return null;

  return (
    <div className="w-full bg-secondaryThemeColor rounded-2xl p-6 border border-borderColor/60">
      <div className="flex items-center gap-2 relative pb-4 mb-6 border-b border-borderColor">
        <i className="fi fi-rr-document text-xl h-5 text-primaryThemeColor"></i>
        <h3 className="text-xl font-black text-primaryTextColor">
          {title}
        </h3>
        <div className="absolute w-2 h-7 bg-primaryThemeColor rounded-full -right-6"></div>
      </div>
      
      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        navigation={{
          nextEl: '.swiper-button-next-custom',
          prevEl: '.swiper-button-prev-custom',
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 }
        }}
        className="related-posts-swiper"
      >
        {posts.map(post => (
          <SwiperSlide key={post.id}>
            <BlogCard data={post} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Buttons */}
      <div className="flex justify-center gap-4 mt-6">
        <button className="swiper-button-prev-custom w-10 h-10 rounded-full bg-primaryThemeColor/20 text-primaryThemeColor hover:bg-primaryThemeColor hover:text-darkThemeColor transition-all flex items-center justify-center">
          <i className="fi fi-rr-angle-right h-4"></i>
        </button>
        <button className="swiper-button-next-custom w-10 h-10 rounded-full bg-primaryThemeColor/20 text-primaryThemeColor hover:bg-primaryThemeColor hover:text-darkThemeColor transition-all flex items-center justify-center">
          <i className="fi fi-rr-angle-left h-4"></i>
        </button>
      </div>
    </div>
  );
};

export default RelatedPosts;


