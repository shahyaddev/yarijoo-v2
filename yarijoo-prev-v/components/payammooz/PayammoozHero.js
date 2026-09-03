"use client";
import React from "react";
import { motion } from "framer-motion";
import { toFarsiNumber } from "@/helper/helper";
import { FiMessageCircle, FiUsers, FiCalendar } from "react-icons/fi";

const PayammoozHero = ({ totalPackages }) => {
  const stats = [
    { icon: <FiMessageCircle size={28} />, label: "پکیج‌های فعال", value: totalPackages || 0 },
    { icon: <FiUsers size={28} />, label: "کاربران فعال", value: 250 },
    { icon: <FiCalendar size={28} />, label: "پیام‌های ارسالی", value: "12K" },
  ];

  return (
    <div className="w-full bg-gradient-to-br from-secondaryThemeColor via-secondaryThemeColor/80 to-primaryThemeColor/5 rounded-3xl p-8 md:p-12 border border-borderColor/40 overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primaryThemeColor rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primaryThemeColor rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Title & Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-primaryThemeColor/10 text-primaryThemeColor px-4 py-2 rounded-full text-sm font-bold mb-4 border border-primaryThemeColor/20">
            <i className="fi fi-rr-envelope h-4"></i>
            <span>پیام‌آموز یاریجو</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black text-primaryTextColor mb-4 leading-tight">
            هر روز، یک قدم به سوی
            <span className="text-primaryThemeColor"> بهتر شدن</span>
          </h1>
          
          <p className="text-secondaryTextColor text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
            با پکیج‌های پیامکی یاریجو، هر روز پیام‌های آموزشی، انگیزشی و روان‌شناختی دریافت کنید
            و در مسیر رشد فردی، سلامت روان و بهبود روابط گام بردارید
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-6 rounded-2xl bg-darkThemeColor/30 border border-borderColor/30 backdrop-blur-sm"
            >
              <div className="w-16 h-16 rounded-2xl bg-primaryThemeColor/20 text-primaryThemeColor flex items-center justify-center">
                {stat.icon}
              </div>
              <div>
                <div className="text-3xl font-black text-primaryTextColor">
                  {typeof stat.value === 'number' ? toFarsiNumber(stat.value) : stat.value}
                </div>
                <div className="text-sm text-secondaryTextColor">{stat.label}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-8"
        >
          <a
            href="#packages"
            className="inline-flex items-center gap-2 bg-primaryThemeColor text-darkThemeColor px-8 py-4 rounded-xl font-bold text-base hover:bg-primaryThemeColor/90 transition-all shadow-lg shadow-primaryThemeColor/20"
          >
            <span>مشاهده پکیج‌ها</span>
            <i className="fi fi-rr-arrow-down h-4"></i>
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default PayammoozHero;


