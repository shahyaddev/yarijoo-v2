"use client";

import Image from "next/image";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const VerticalSlider = () => {
  const items = [",", ",", ",", ",", ",", ",", ",", ",", ",", ","];

  return (
    <div className="w-full lg:col-span-2 flex gap-4 lg:max-h-[280px] max-h-[280px]">
      <Swiper
        modules={[Autoplay]}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        className="mySwiper lg:!hidden"
        spaceBetween={16}
        breakpoints={{
          640: {
            // sm
            direction: "horizontal",
            slidesPerView: 1,
          },
          768: {
            // md
            direction: "horizontal",
            slidesPerView: 1,
          },
          1024: {
            // lg
            direction: "vertical",
            slidesPerView: 3,
          },
          1280: {
            // xl
          },
          1536: {
            // 2xl
          },
        }}
      >
        {items.map((item) => (
          <SwiperSlide>
            <div className="w-full h-full p-4 flex flex-col gap-3 rounded-2xl bg-lightBgColor">
              <p className="text-sm text-gray-700 leading-7 text-justify">
                لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با
                استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله
                در ستون و سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی مورد
                نیاز و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد.
              </p>

              <div className="flex items-center gap-3">
                <Image
                  src={"/assets/avatar.png"}
                  width={100}
                  height={100}
                  className="size-16 rounded-full"
                  alt="user-profile"
                />
                <div className="flex text-gray-700 flex-col gap-1">
                  <span className="font-black text-primaryThemeColor">
                    شهیاد کریمی
                  </span>
                  <span className="text-sm">لورم ایپسوم</span>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <Swiper
        direction={"vertical"}
        modules={[Autoplay]}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        className="mySwiper !hidden lg:!block"
        slidesPerView={1}
        spaceBetween={16}
      >
        {items.map((item) => (
          <SwiperSlide>
            <div className="w-full p-4 flex flex-col gap-3 rounded-2xl bg-lightBgColor">
              <p className="text-sm text-gray-700 leading-7 text-justify">
                لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با
                استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله
                در ستون و سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی مورد
                نیاز و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد.
              </p>

              <div className="flex items-center gap-3">
                <Image
                  src={"/assets/avatar.png"}
                  width={100}
                  height={100}
                  className="size-16 rounded-full"
                  alt="user-profile"
                />
                <div className="flex text-gray-700 flex-col gap-1">
                  <span className="font-black text-primaryThemeColor">
                    شهیاد کریمی
                  </span>
                  <span className="text-sm">لورم ایپسوم</span>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <Swiper
        direction={"vertical"}
        modules={[Autoplay]}
        autoplay={{
          delay: 3500,
          disableOnInteraction: false,
        }}
        className="mySwiper !hidden lg:!block"
        slidesPerView={1}
        spaceBetween={16}
      >
        {items.map((item) => (
          <SwiperSlide>
            <div className="w-full p-4 flex flex-col gap-3 rounded-2xl bg-lightBgColor">
              <p className="text-sm text-gray-700 leading-7 text-justify">
                لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با
                استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله
                در ستون و سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی مورد
                نیاز و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد.
              </p>

              <div className="flex items-center gap-3">
                <Image
                  src={"/assets/avatar.png"}
                  width={100}
                  height={100}
                  className="size-16 rounded-full"
                  alt="user-profile"
                />

                <div className="flex text-gray-700 flex-col gap-1">
                  <span className="font-black text-primaryThemeColor">
                    شهیاد کریمی
                  </span>
                  <span className="text-sm">لورم ایپسوم</span>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default VerticalSlider;
