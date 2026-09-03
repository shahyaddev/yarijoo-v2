"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectFade, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import { toFarsiNumber } from "@/helper/helper";
import Link from "next/link";
import { FaChalkboardTeacher } from "react-icons/fa";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { getData, postData } from "@/services/API";
import { Spinner } from "@nextui-org/react";
import useClickOutside from "@/hooks/useClickOutside";

const HeaderSlider = () => {
  const slides = [
    "/assets/slide-1.jpg",
    "/assets/slide-2.jpg",
    "/assets/slide-3.jpg",
    "/assets/slide-4.jpg",
    "/assets/slide-5.jpg",
    "/assets/slide-6.jpg",
    "/assets/slide-7.jpg",
    "/assets/slide-8.jpg",
    "/assets/slide-9.jpg",
    "/assets/slide-10.jpg",
  ];
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ products: [], posts: [] });
  const debounceRef = useRef();
  const dropdownRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const hasResults =
    (results.products.length > 0 || results.posts.length > 0) &&
    query.trim().length >= 2;

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.trim().length < 2) {
      setResults({ products: [], posts: [] });
      setLoading(false);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const [productsRes, postsRes] = await Promise.all([
          postData("/shop/product/sort", { search: query }, undefined, false),
          postData("/blog/filter", { search: query }, undefined, false),
        ]);

        setResults({
          products: productsRes?.data?.data || [],
          posts: postsRes?.data?.data || [],
        });
        setShowDropdown(true);
      } catch (e) {
        setResults({ products: [], posts: [] });
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  useClickOutside(dropdownRef, () => setShowDropdown(false));

  return (
    <div className="w-full relative md:h-[700px] lg:bg-gray-700 flex flex-col md:gap-4 mt-4 lg:mt-20">
      <div className="absolute z-10 opacity-40 md:opacity-100 overly-header-1 w-full h-full"></div>
      <div className="absolute z-10 opacity-40 md:opacity-100 overly-header-2 w-full h-full"></div>

      <div className="w-full h-full relative px-4 lg:px-0">
        <Swiper
          className="mySwiper lg:col-span-6 header-slider"
          effect={"fade"}
          pagination={{
            dynamicBullets: true,
          }}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          loop={true}
          modules={[Autoplay, EffectFade]}
        >
          {slides.map((slide) => (
            <SwiperSlide className="lg:!h-full xl:min-h-[482px]">
              <Image
                width={1600}
                height={900}
                src={slide}
                className="object-cover w-full h-full rounded-2xl lg:rounded-none"
                alt="slider"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="md:absolute md:bottom-16 px-4 pt-4 lg:pt-10 pb-5 md:p-0  md:bg-transparent w-full z-20 left-0 md:left-1/2 md:-translate-x-1/2 flex flex-col items-center gap-4 justify-center">
        <h1 className="text-gray-200 text-2xl md:text-5xl font-bold">
          <strong className="text-primaryThemeColor font-black">یاریجو</strong>؛
          راهی به‌سوی آرامش ذهن و شناخت خود
        </h1>

        <div className="flex flex-col lg:flex-row items-center gap-6 mt-3 mb-6">
          {/* text 1 */}
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-[#1cb5613d] rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.7"
                stroke="currentColor"
                class="w-4 h-4 stroke-green-600"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
            </div>

            <span className="text-gray-100 text-sm">
              دسترسی سریع به انواع تست‌های روانشناسی معتبر
            </span>
          </div>

          {/* text 2 */}
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-[#1cb5613d] rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.7"
                stroke="currentColor"
                class="w-4 h-4 stroke-green-600"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
            </div>

            <span className="text-gray-100 text-sm">
              ارائه پکیج‌های آموزشی و روانشناسی برای یادگیری بهتر
            </span>
          </div>

          {/* text 3 */}
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-[#1cb5613d] rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.7"
                stroke="currentColor"
                class="w-4 h-4 stroke-green-600"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
            </div>

            <span className="text-gray-100 text-sm">
              امکان خرید و مطالعه کتاب‌های روانشناسی آنلاین
            </span>
          </div>
        </div>

        {/* search */}
        <div className="max-w-6xl w-full flex flex-col gap-2">
          <div className="w-full p-3 md:p-6 relative h-14 md:h-24 rounded-2xl md:rounded-3xl bg-secondaryThemeColor border border-gray-200/5">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              className="w-full h-full outline-none bg-transparent text-primaryTextColor text-base md:text-2xl font-light placeholder:text-secondaryTextColor focus:placeholder:text-primaryThemeColor/50 transition-all pr-10 md:pr-14"
              placeholder="جست و جو پکیج، مقاله، تست روانشناسی..."
            />

            {loading ? (
              <div className="absolute top-2/4 -translate-y-2/4 text-secondaryTextColor left-2 md:left-4 lg:left-6">
                <Spinner
                  classNames={{
                    circle1: "border-b-primaryThemeColor",
                    circle2: "border-b-primaryThemeColor",
                  }}
                  size="sm"
                />
              </div>
            ) : hasResults ? (
              <button
                type="button"
                onClick={() => setShowDropdown((v) => !v)}
                className="absolute top-2/4 -translate-y-2/4 left-2 md:left-4 lg:left-6 size-8 md:size-10 rounded-lg md:rounded-xl flex items-center justify-center text-secondaryTextColor hover:text-primaryThemeColor transition-colors"
                aria-label={showDropdown ? "بستن نتایج جستجو" : "نمایش نتایج جستجو"}
              >
                <Icon icon="solar:magnifer-linear" className="w-5 h-5 md:w-10 md:h-10" />
              </button>
            ) : (
              <Icon
                icon="solar:magnifer-linear"
                className="absolute top-2/4 -translate-y-2/4 text-secondaryTextColor left-2 md:left-4 lg:left-6 w-5 h-5 md:w-10 md:h-10"
              />
            )}
            {showDropdown && (results.products.length > 0 || results.posts.length > 0) && !loading && query.trim().length >= 2 && (
              <div ref={dropdownRef} className="absolute left-0 right-0 top-full mt-2 z-[999] rounded-xl md:rounded-2xl border border-borderColor/60 bg-darkThemeColor/95 backdrop-blur p-3 md:p-4 pt-8 md:pt-10 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 shadow-xl animate-[fadeIn_0.2s_ease-out] max-h-[60vh] md:max-h-none overflow-y-auto">
                <button onClick={() => setShowDropdown(false)} aria-label="close search results" className="absolute top-2 md:top-3 left-2 md:left-3 size-7 md:size-8 rounded-lg bg-secondaryThemeColor text-secondaryTextColor hover:text-danger flex items-center justify-center border border-borderColor transition-colors">
                  <i className="fi fi-rr-cross-small text-lg md:text-xl h-4 md:h-5"></i>
                </button>
                <div className="flex flex-col gap-2">
                  <div className="text-primaryTextColor font-bold text-sm md:text-base">محصولات</div>
                  {results.products.slice(0, 6).map((item) => (
                    <Link
                      key={item.id}
                      href={`/shop/${item.slug}`}
                      className="text-secondaryTextColor hover:text-primaryThemeColor text-xs md:text-sm line-clamp-1"
                    >
                      {item.title}
                    </Link>
                  ))}
                  {results.products.length === 0 && (
                    <span className="text-secondaryTextColor text-xs">یافت نشد</span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <div className="text-primaryTextColor font-bold text-sm md:text-base">مقالات</div>
                  {results.posts.slice(0, 6).map((item) => (
                    <Link
                      key={item.id}
                      href={`/blog/${item.slug}`}
                      className="text-secondaryTextColor hover:text-primaryThemeColor text-xs md:text-sm line-clamp-1"
                    >
                      {item.title}
                    </Link>
                  ))}
                  {results.posts.length === 0 && (
                    <span className="text-secondaryTextColor text-xs">یافت نشد</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center text-primaryTextColor font-light text-xs md:text-sm gap-2">
            <p className="flex items-center gap-1 whitespace-nowrap">
              <Icon
                icon="solar:fire-line-duotone"
                className="w-4 h-4 md:w-5 md:h-5 text-orange-600"
              />
              بیشترین جست و جو ها :
            </p>

            <span className="text-xs p-1 rounded-lg bg-primaryThemeColor/15 text-primaryThemeColor whitespace-nowrap">
              #تست هوش هیجانی
            </span>
            <span className="text-xs p-1 rounded-lg bg-primaryThemeColor/15 text-primaryThemeColor whitespace-nowrap">
              #پکیج کنترل خشم
            </span>
            <span className="text-xs p-1 rounded-lg bg-primaryThemeColor/15 text-primaryThemeColor whitespace-nowrap">
              #تست دیسک
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderSlider;
