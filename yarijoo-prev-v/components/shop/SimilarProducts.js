"use client";
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import ProductCard from "@/components/product/ProductCard";
import { motion } from "framer-motion";
import { baseURL } from "@/services/API";

const SimilarProducts = ({ categoryId, currentProductId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      try {
        // دریافت محصولات همان دسته‌بندی
        const response = await fetch(`${baseURL}/shop/product/view-all`);
        const data = await response.json();
        
        if (data.data) {
          // فیلتر محصولات مشابه (همان دسته‌بندی، به جز محصول فعلی)
          const similar = data.data
            .filter(p => p.id !== currentProductId)
            .slice(0, 8); // فقط 8 محصول
          
          setProducts(similar);
        }
      } catch (error) {
        console.error("Error fetching similar products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarProducts();
  }, [categoryId, currentProductId]);

  if (loading || products.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-secondaryThemeColor rounded-2xl p-6 border border-borderColor/60"
    >
      <div className="flex items-center gap-3 mb-6">
        <i className="fi fi-rr-apps text-primaryThemeColor text-xl h-5"></i>
        <h3 className="text-xl font-black text-primaryTextColor">
          محصولات مشابه
        </h3>
        <div className="flex-1 h-px bg-gradient-to-l from-borderColor to-transparent"></div>
      </div>

      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        navigation={{
          nextEl: ".similar-next",
          prevEl: ".similar-prev",
        }}
        autoplay={{
          delay: 3500,
          disableOnInteraction: false,
        }}
        breakpoints={{
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        }}
        className="similar-products-swiper"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <ProductCard data={product} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation Buttons */}
      {products.length > 3 && (
        <div className="flex justify-center gap-3 mt-6">
          <button className="similar-prev w-10 h-10 rounded-full bg-darkThemeColor border border-borderColor/60 text-primaryThemeColor hover:bg-primaryThemeColor hover:text-darkThemeColor hover:border-primaryThemeColor transition-all flex items-center justify-center">
            <i className="fi fi-rr-angle-right h-4"></i>
          </button>
          <button className="similar-next w-10 h-10 rounded-full bg-darkThemeColor border border-borderColor/60 text-primaryThemeColor hover:bg-primaryThemeColor hover:text-darkThemeColor hover:border-primaryThemeColor transition-all flex items-center justify-center">
            <i className="fi fi-rr-angle-left h-4"></i>
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default SimilarProducts;


