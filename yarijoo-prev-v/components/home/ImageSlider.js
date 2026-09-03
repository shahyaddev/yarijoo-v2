"use client";

import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import Image from "next/image";

const ImageSlider = ({ slidesPerView = 4 }) => {
  const swiperRef = useRef();

  return (
    <div className="w-full col-span-6 relative">
      <button
        onClick={() => swiperRef.current.slidePrev()}
        className="size-12 flex justify-center items-center rounded-full bg-primaryThemeColor text-lightTextColor absolute top-2/4 -translate-y-2/4 z-30 bg-opacity-45 backdrop-blur-sm 2xl:-right-6 right-0"
      >
        <i className="fi fi-rr-angle-small-right text-2xl h-6"></i>
      </button>

      <button
        onClick={() => swiperRef.current.slideNext()}
        className="size-12 flex justify-center items-center rounded-full bg-primaryThemeColor text-lightTextColor absolute top-2/4 -translate-y-2/4 z-30 bg-opacity-45 backdrop-blur-sm 2xl:-left-6 left-0"
      >
        <i className="fi fi-rr-angle-small-left text-2xl h-6"></i>
      </button>

      <Swiper
        className="mySwiper"
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        spaceBetween={20}
        slidesPerView={1}
      >
        {new Array(4).fill(true).map((image, index) => (
          <SwiperSlide key={index}>
            <Image
              src={"/assets/slider.webp"}
              width={1260}
              height={485}
              className="w-full rounded-2xl"
              alt={`اسلایدر ${index + 1}`}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ImageSlider;
