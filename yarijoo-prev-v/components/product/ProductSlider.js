"use client";

import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import ProductCard from "./ProductCard";
import BookCard from "../book/BookCard";
import StoryCard from "../stories/StoryCard";

const ProductSlider = ({ products, type = "product", slidesPerView = 4 }) => {
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
        className="mySwiper !pt-4"
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        spaceBetween={type === "story" ? 16 : 20}
        breakpoints={{
          640: {
            // sm
            slidesPerView: 1,
            spaceBetween: type === "story" ? 16 : 20,
          },
          768: {
            // md
            slidesPerView: type === "story" ? 2 : 2,
            spaceBetween: type === "story" ? 16 : 20,
          },
          1024: {
            // lg
            slidesPerView: type === "story" ? 3 : 3,
            spaceBetween: type === "story" ? 16 : 20,
          },
          1280: {
            // xl
            slidesPerView: type === "story" ? 4 : 4,
            spaceBetween: type === "story" ? 16 : 20,
          },
          1536: {
            // 2xl
            slidesPerView: slidesPerView,
            spaceBetween: type === "story" ? 16 : 20,
          },
        }}
      >
        {products.map((product) => (
          <SwiperSlide>
            {type === "product" ? (
              <ProductCard data={product} />
            ) : type === "story" ? (
              <StoryCard data={product} />
            ) : type === "book" ? (
              <BookCard data={product} />
            ) : null}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ProductSlider;
