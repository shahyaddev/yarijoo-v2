import React from "react";
import { toFarsiNumber } from "@/helper/helper";

const StoriesHero = ({ totalStories }) => {
  const stats = [
    { icon: "fi fi-rr-book-open-cover", label: "داستان‌های موجود", value: totalStories || 0 },
    { icon: "fi fi-rr-heart", label: "محبوب‌ترین‌ها", value: 25 },
    { icon: "fi fi-rr-users-alt", label: "نویسندگان", value: 8 },
  ];

  return (
    <div className="w-full bg-gradient-to-br from-secondaryThemeColor via-secondaryThemeColor/80 to-primaryThemeColor/5 rounded-3xl p-4 md:p-12 border border-borderColor/40 overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primaryThemeColor rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primaryThemeColor rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Title & Description */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primaryThemeColor/10 text-primaryThemeColor px-4 py-2 rounded-full text-sm font-bold mb-4 border border-primaryThemeColor/20">
            <i className="fi fi-rr-book-open-cover h-4"></i>
            <span>داستان‌های الهام‌بخش یاریجو</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black text-primaryTextColor mb-4 leading-tight">
            سفر به دنیای
            <span className="text-primaryThemeColor"> احساسات و تجربیات</span>
          </h1>
          
          <p className="text-secondaryTextColor text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
            داستان‌های واقعی و الهام‌بخش از افرادی که با چالش‌های روانی و عاطفی روبرو شدند و پیروز شدند
          </p>
        </div>

        {/* Search Box */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="جستجوی داستان... (موضوع، نویسنده، احساس)"
              className="w-full h-14 rounded-2xl bg-darkThemeColor/50 border border-borderColor/60 
                       text-primaryTextColor pr-14 pl-5 outline-none 
                       focus:border-primaryThemeColor/50 transition-all
                       placeholder:text-secondaryTextColor/60"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 
                       w-10 h-10 rounded-xl bg-primaryThemeColor/20 text-primaryThemeColor
                       hover:bg-primaryThemeColor hover:text-white
                       flex items-center justify-center transition-all"
            >
              <i className="fi fi-rr-search h-5"></i>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-6 rounded-2xl bg-darkThemeColor/30 border border-borderColor/30 backdrop-blur-sm"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primaryThemeColor/20 to-primaryThemeColor/20 text-primaryThemeColor flex items-center justify-center">
                <i className={`${stat.icon} text-3xl h-8`}></i>
              </div>
              <div>
                <div className="text-3xl font-black text-primaryTextColor">
                  {toFarsiNumber(stat.value)}
                </div>
                <div className="text-sm text-secondaryTextColor">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoriesHero;


