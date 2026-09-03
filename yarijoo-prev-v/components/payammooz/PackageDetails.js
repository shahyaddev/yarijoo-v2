"use client";
import React from "react";
import { toFarsiNumber } from "@/helper/helper";
import { motion } from "framer-motion";

const PackageDetails = ({ package: pkg, stats = null }) => {
  if (!pkg) return null;

  // استفاده از آمار واقعی از API یا محاسبه از داده‌های محلی
  const messageCount = stats?.message_count || pkg.messages?.length || 0;
  const durationDays = stats?.duration_days || Math.ceil(messageCount / (pkg.dispatch_rate || 1));
  const activeUsers = stats?.active_users || 0;

  return (
    <div className="w-full bg-secondaryThemeColor rounded-2xl border border-borderColor/60 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-primaryThemeColor/20 to-primaryThemeColor/5 p-6 border-b border-borderColor/40">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-2xl bg-primaryThemeColor/20 flex items-center justify-center border-2 border-primaryThemeColor/30 shrink-0">
            <i className="fi fi-rr-envelope-open-text text-4xl text-primaryThemeColor h-9"></i>
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-black text-primaryTextColor mb-3">
              {pkg.title}
            </h1>
            <p className="text-sm md:text-base text-secondaryTextColor leading-7">
              {pkg.description}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          icon="fi fi-rr-comment-sms"
          value={toFarsiNumber(messageCount)}
          label="تعداد پیام"
        />
        <StatCard 
          icon="fi fi-rr-calendar"
          value={`${toFarsiNumber(durationDays)} روز`}
          label="مدت زمان"
        />
        <StatCard 
          icon="fi fi-rr-clock"
          value={toFarsiNumber(pkg.dispatch_rate || 1)}
          label="پیام در روز"
        />
        <StatCard 
          icon="fi fi-rr-users"
          value={toFarsiNumber(activeUsers)}
          label="کاربر فعال"
        />
      </div>

      {/* Features */}
      <div className="p-6 border-t border-borderColor/40">
        <h3 className="text-lg font-bold text-primaryTextColor mb-4 flex items-center gap-2">
          <i className="fi fi-rr-check-circle text-primaryThemeColor h-5"></i>
          <span>ویژگی‌های این پکیج</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { icon: "fi fi-rr-smartphone", text: "ارسال خودکار پیام‌های روزانه" },
            { icon: "fi fi-rr-time-quarter-past", text: `${toFarsiNumber(pkg.dispatch_rate || 1)} پیام در روز` },
            { icon: "fi fi-rr-calendar-lines", text: `دوره ${toFarsiNumber(durationDays)} روزه` },
            { icon: "fi fi-rr-bulb", text: "محتوای آموزشی تخصصی" },
            { icon: "fi fi-rr-refresh", text: "قابلیت توقف و ادامه" },
            { icon: "fi fi-rr-headset", text: "پشتیبانی ۲۴ ساعته" }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex items-center gap-3 p-3 bg-darkThemeColor/30 rounded-lg"
            >
              <i className={`${feature.icon} text-lg text-primaryThemeColor h-4`}></i>
              <span className="text-sm text-primaryTextColor">{feature.text}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* How to Use */}
      <div className="p-6 border-t border-borderColor/40 bg-darkThemeColor/20">
        <h3 className="text-lg font-bold text-primaryTextColor mb-4 flex items-center gap-2">
          <i className="fi fi-rr-info text-primaryThemeColor h-5"></i>
          <span>نحوه استفاده</span>
        </h3>
        
        <ol className="space-y-3">
          {[
            "پس از خرید، پکیج به صورت خودکار فعال می‌شود",
            "پیام‌ها از فردای خرید شروع به ارسال می‌کنند",
            `هر روز ${toFarsiNumber(pkg.dispatch_rate || 1)} پیام در زمان مشخص دریافت می‌کنید`,
            "می‌توانید در پنل کاربری، وضعیت پیام‌ها را پیگیری کنید"
          ].map((step, index) => (
            <li key={index} className="flex items-start gap-3 text-sm text-secondaryTextColor">
              <div className="w-6 h-6 rounded-full bg-primaryThemeColor/20 text-primaryThemeColor flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {toFarsiNumber(index + 1)}
              </div>
              <span className="flex-1 leading-6">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

const StatCard = ({ icon, value, label }) => (
  <div className="flex flex-col items-center gap-2 p-4 bg-darkThemeColor/30 rounded-xl">
    <i className={`${icon} text-2xl text-primaryThemeColor h-6`}></i>
    <div className="text-xl md:text-2xl font-black text-primaryTextColor">
      {value}
    </div>
    <div className="text-xs text-secondaryTextColor text-center">{label}</div>
  </div>
);

export default PackageDetails;
