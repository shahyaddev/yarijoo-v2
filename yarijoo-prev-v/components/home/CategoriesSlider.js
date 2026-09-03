"use client";

import { siteURL } from "@/services/API";
import Image from "next/image";
import Link from "next/link";
import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

const CategoriesSlider = ({ categories }) => {
  const swiperRef = useRef();

  // {/* image */}
  // <div className="w-fit flex items-center relative">
  // <Image
  //   src={"/assets/cat-bg.png"}
  //   className="group-hover:scale-110 transition-all duration-500"
  //   width={149}
  //   height={150}
  //   alt="category-bg"
  // />

  // {category.image ? (
  //   <Image
  //     src={`${siteURL}/${category.image}`}
  //     className={`absolute top-2/4 -translate-y-2/4 left-2/4 -translate-x-2/4 z-10`}
  //     width={75}
  //     height={75}
  //     alt={category.name}
  //   />
  // ) : (
  //   ""
  // )}

  // <Image
  //   src={"/assets/cat-hover.png"}
  //   className="opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-700 absolute top-2/4 -translate-y-2/4 left-2/4 -translate-x-2/4"
  //   width={149}
  //   height={150}
  //   alt="category-hover"
  // />

  // <Image
  //   src={"/assets/cat-border.png"}
  //   className="opacity-0 group-hover:opacity-100 transition-all duration-500 absolute top-2/4 -translate-y-2/4 left-2/4 -translate-x-2/4"
  //   width={149}
  //   height={150}
  //   alt="category-border"
  // />
  // </div>

  // {/* text */}
  // <span className="text-xl font-black text-primaryTextColor">
  // {category.name}
  // </span>

  return (
    <div className="w-full relative">
      {/* <button
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
      </button> */}

      <Swiper
        className="!pt-4"
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        spaceBetween={20}
        slidesPerView={2}
        breakpoints={{
          640: {
            // sm
            slidesPerView: 2,
            spaceBetween: 20,
          },
          768: {
            // md
            slidesPerView: 2,
            spaceBetween: 20,
          },
          1024: {
            // lg
            slidesPerView: 4,
            spaceBetween: 20,
          },
          1280: {
            // xl
            slidesPerView: 5,
            spaceBetween: 20,
          },
          1536: {
            // 2xl
            slidesPerView: 5,
            spaceBetween: 20,
          },
        }}
      >
        {categories.map(
          (category) =>
            category?.image && (
              <SwiperSlide>
                <Link
                  href={`/shop?category=${category.slug}`}
                  className="w-full category-box group relative p-4 pb-0 bg-secondaryThemeColor overflow-hidden rounded-[28px] rounded-tr-lg size-44 flex flex-col justify-between"
                >
                  <div className="category-box-overlay absolute w-full h-full top-0 left-0 z-10"></div>

                  <div className="flex flex-col gap-1 relative z-20 transition-colors duration-300">
                    <span className="text-sm font-light text-primaryThemeColor group-hover:text-primaryThemeColor/90 transition-colors duration-300">
                      پکیج های
                    </span>

                    <h2 className="text-lg font-bold text-primaryTextColor group-hover:text-primaryThemeColor transition-colors duration-300">
                      {category.name}
                    </h2>
                  </div>

                  <div className="w-full flex justify-center relative z-20">
                    {category.image ? (
                      <Image
                        src={`${siteURL}/${category.image}`}
                        className={`w-[90px] transition-all duration-300`}
                        width={135}
                        height={135}
                        alt={category.name}
                      />
                    ) : (
                      ""
                    )}
                  </div>
                </Link>
              </SwiperSlide>
            )
        )}
      </Swiper>
    </div>
  );
};

export default CategoriesSlider;
