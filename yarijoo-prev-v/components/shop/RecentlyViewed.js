"use client";
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import ProductCard from "@/components/product/ProductCard";
import { motion } from "framer-motion";

const RecentlyViewed = ({ currentProductId }) => {
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    // دریافت محصولات مشاهده شده از localStorage
    const getRecentlyViewed = () => {
      try {
        const stored = localStorage.getItem("recentlyViewedProducts");
        if (stored) {
          const products = JSON.parse(stored);
          // حذف محصول فعلی از لیست
          const filtered = products.filter(p => p.id !== currentProductId);
          setRecentProducts(filtered);
        }
      } catch (error) {
        console.error("Error loading recently viewed:", error);
      }
    };

    getRecentlyViewed();
  }, [currentProductId]);

  if (recentProducts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-secondaryThemeColor rounded-2xl p-6 border border-borderColor/60"
    >
      <div className="flex items-center gap-3 mb-6">
        <i className="fi fi-rr-time-past text-primaryThemeColor text-xl h-5"></i>
        <h3 className="text-xl font-black text-primaryTextColor">
          محصولات مشاهده شده اخیر
        </h3>
        <div className="flex-1 h-px bg-gradient-to-l from-borderColor to-transparent"></div>
        <span className="text-sm text-secondaryTextColor">
          {recentProducts.length} محصول
        </span>
      </div>

      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        navigation={{
          nextEl: ".recent-next",
          prevEl: ".recent-prev",
        }}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        breakpoints={{
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        }}
        className="recently-viewed-swiper"
      >
        {recentProducts.map((product) => (
          <SwiperSlide key={product.id}>
            <ProductCard data={product} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation Buttons */}
      {recentProducts.length > 3 && (
        <div className="flex justify-center gap-3 mt-6">
          <button className="recent-prev w-10 h-10 rounded-full bg-darkThemeColor border border-borderColor/60 text-primaryThemeColor hover:bg-primaryThemeColor hover:text-darkThemeColor hover:border-primaryThemeColor transition-all flex items-center justify-center">
            <i className="fi fi-rr-angle-right h-4"></i>
          </button>
          <button className="recent-next w-10 h-10 rounded-full bg-darkThemeColor border border-borderColor/60 text-primaryThemeColor hover:bg-primaryThemeColor hover:text-darkThemeColor hover:border-primaryThemeColor transition-all flex items-center justify-center">
            <i className="fi fi-rr-angle-left h-4"></i>
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default RecentlyViewed;


