"use client";
import React from "react";
import { motion } from "framer-motion";
import { toFarsiNumber } from "@/helper/helper";
import { FiSearch, FiShoppingBag, FiTrendingUp, FiAward } from "react-icons/fi";

const ShopHero = ({ totalProducts, onSearch }) => {
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const features = [
    { icon: <FiShoppingBag size={24} />, label: "محصولات", value: totalProducts || 0 },
    { icon: <FiTrendingUp size={24} />, label: "پرفروش‌ترین", value: 50 },
    { icon: <FiAward size={24} />, label: "با تخفیف", value: 25 },
  ];

  return (
    <div className="w-full bg-gradient-to-br from-secondaryThemeColor to-secondaryThemeColor/50 rounded-3xl p-4 md:p-12 border border-borderColor/40 overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primaryThemeColor rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primaryThemeColor rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Title & Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-black text-primaryTextColor mb-3">
            فروشگاه یاریجو
          </h1>
          <p className="text-secondaryTextColor text-sm md:text-base max-w-2xl mx-auto">
            کتاب‌ها، دوره‌های آموزشی، پکیج‌های مشاوره و محصولات تخصصی روانشناسی
          </p>
        </motion.div>

        {/* Search Box */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onSubmit={handleSearch}
          className="max-w-2xl mx-auto mb-8"
        >
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی محصولات... (نام، دسته‌بندی، کلمات کلیدی)"
              className="w-full h-14 rounded-2xl bg-darkThemeColor/50 border border-borderColor/60 
                       text-primaryTextColor pr-14 pl-5 outline-none 
                       focus:border-primaryThemeColor transition-all
                       placeholder:text-secondaryTextColor/60"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 
                       w-10 h-10 rounded-xl bg-primaryThemeColor/20 text-primaryThemeColor
                       hover:bg-primaryThemeColor hover:text-darkThemeColor
                       flex items-center justify-center transition-all"
            >
              <FiSearch size={20} />
            </button>
          </div>
        </motion.form>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 rounded-2xl bg-darkThemeColor/30 
                       border border-borderColor/30 backdrop-blur-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-primaryThemeColor/20 text-primaryThemeColor 
                           flex items-center justify-center">
                {feature.icon}
              </div>
              <div>
                <div className="text-2xl font-black text-primaryTextColor">
                  {toFarsiNumber(feature.value)}
                </div>
                <div className="text-xs text-secondaryTextColor">{feature.label}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ShopHero;


