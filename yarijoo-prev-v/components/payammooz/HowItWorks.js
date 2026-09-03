"use client";
import React from "react";
import { motion } from "framer-motion";

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      icon: "fi fi-rr-shopping-cart",
      title: "انتخاب پکیج",
      desc: "پکیج مناسب خود را انتخاب و خریداری کنید"
    },
    {
      number: 2,
      icon: "fi fi-rr-settings",
      title: "تنظیم زمان",
      desc: "ساعت دریافت پیام‌های روزانه را مشخص کنید"
    },
    {
      number: 3,
      icon: "fi fi-rr-comment-sms",
      title: "دریافت پیام",
      desc: "هر روز در ساعت مشخص، پیام آموزشی دریافت کنید"
    },
    {
      number: 4,
      icon: "fi fi-rr-chart-line-up",
      title: "رشد و پیشرفت",
      desc: "با تمرین روزانه، تغییرات مثبت را تجربه کنید"
    }
  ];

  return (
    <div className="w-full bg-secondaryThemeColor rounded-3xl p-8 md:p-10 border border-borderColor/40">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-8 bg-gradient-to-b from-primaryThemeColor to-primaryThemeColor/40 rounded-full"></div>
        <h2 className="text-2xl md:text-3xl font-black text-primaryTextColor">
          چگونه کار می‌کند؟
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, index) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative flex flex-col items-center text-center gap-4"
          >
            {/* Connection Line */}
            {index < steps.length - 1 && (
              <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-l from-primaryThemeColor/50 to-transparent -z-10"></div>
            )}

            {/* Number Badge */}
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primaryThemeColor/20 to-primaryThemeColor/5 flex items-center justify-center border-2 border-primaryThemeColor/30 group-hover:border-primaryThemeColor transition-all">
                <i className={`${step.icon} text-4xl text-primaryThemeColor h-9`}></i>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primaryThemeColor text-darkThemeColor flex items-center justify-center text-sm font-black">
                {step.number}
              </div>
            </div>

            {/* Content */}
            <div>
              <h3 className="text-lg font-bold text-primaryTextColor mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-secondaryTextColor leading-6">
                {step.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;


