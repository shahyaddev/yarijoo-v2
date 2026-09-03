"use client";
import React from "react";
import { motion } from "framer-motion";

const items = [
  {
    id: 1,
    name: "تجربه کاری",
    shortDesc: "ده ها سال تجربه",
    desc: "تجربه کاری بالا و سابقه کاری ده ساله",
    icon: "fi fi-rr-corporate-alt",
  },
  {
    id: 2,
    name: "پشتیبانی ۲۴ ساعته",
    shortDesc: "+۱۰ پشتیبان",
    desc: "پشتیبان های ما در تمام روز ها در خدمت شما هستند",
    icon: "fi fi-rr-user-headset",
  },
  {
    id: 3,
    name: "محصولات",
    shortDesc: "+۱۰۰۰ محصول",
    desc: "بهترین محصولات با بهترین کیفیت",
    icon: "fi fi-rr-treasure-chest",
  },
  {
    id: 4,
    name: "تخفیف ویژه",
    shortDesc: "دریافت تخفیف تا ۹۰%",
    desc: "برای خرید از سایت یاریجو تا ۹۰% تخفیف دریافت کنید.",
    icon: "fi fi-rr-badge-percent",
  },
];

export default function AboutContent({ settings }) {
  return (
    <div className="w-full max-w-[1280px] flex flex-col gap-6">
      {/* hero about */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.35 }}
        className="w-full rounded-2xl p-6 lg:p-8 border border-borderColor/60 bg-gradient-to-b from-[#222529] to-[#1c1e21] flex flex-col lg:flex-row gap-6 items-center"
      >
        <div className="flex-1 flex flex-col gap-4">
          <h2 className="text-2xl lg:text-3xl font-black text-primaryTextColor">
            ما چه کاری انجام می‌دهیم؟
          </h2>
          <p className="text-secondaryTextColor leading-7">
            یاریجو پلتفرمی برای دسترسی راحت به تست‌های معتبر روان‌شناسی،
            پکیج‌های آموزشی و محتوای تخصصی سلامت روان است. رسالت ما ایجاد
            تجربه‌ای ساده، قابل اعتماد و کاربرمحور برای رشد فردی و بهبود کیفیت
            زندگی شماست.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs p-2 rounded-lg bg-primaryThemeColor/15 text-primaryThemeColor">
              #تست‌های معتبر
            </span>
            <span className="text-xs p-2 rounded-lg bg-primaryThemeColor/15 text-primaryThemeColor">
              #آموزش کاربردی
            </span>
            <span className="text-xs p-2 rounded-lg bg-primaryThemeColor/15 text-primaryThemeColor">
              #سلامت روان
            </span>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-3">
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: item.id * 0.05 }}
              className="rounded-2xl p-4 border border-borderColor/60 bg-darkThemeColor flex flex-col gap-2 items-center"
            >
              <div className="size-12 rounded-xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20">
                <i className={`${item.icon} text-xl h-5`}></i>
              </div>
              <span className="text-sm font-black text-primaryTextColor">
                {item.name}
              </span>
              <span className="text-xs text-primaryThemeColor bg-primaryThemeColor/15 rounded-full px-2 py-1">
                {item.shortDesc}
              </span>
              <p className="text-xs text-secondaryTextColor text-center">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* values */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35 }}
          className="rounded-2xl p-5 border border-borderColor/60 bg-gradient-to-b from-[#222529] to-[#1c1e21]"
        >
          <h3 className="text-lg font-black text-primaryTextColor mb-2">
            ارزش‌های ما
          </h3>
          <ul className="text-secondaryTextColor text-sm leading-7 list-disc pr-4">
            <li>صداقت و شفافیت در ارائه خدمات</li>
            <li>تکیه بر دانش علمی و منابع معتبر</li>
            <li>تجربه کاربری ساده و سریع</li>
          </ul>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="rounded-2xl p-5 border border-borderColor/60 bg-gradient-to-b from-[#222529] to-[#1c1e21]"
        >
          <h3 className="text-lg font-black text-primaryTextColor mb-2">
            ماموریت ما
          </h3>
          <p className="text-secondaryTextColor text-sm leading-7">
            همراهی شما در مسیر خودشناسی، رشد فردی و دستیابی به آرامش ذهن با
            استفاده از ابزارهای دقیق و راهکارهای کاربردی.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="rounded-2xl p-5 border border-borderColor/60 bg-gradient-to-b from-[#222529] to-[#1c1e21]"
        >
          <h3 className="text-lg font-black text-primaryTextColor mb-2">
            چرا یاریجو؟
          </h3>
          <p className="text-secondaryTextColor text-sm leading-7">
            ترکیب تخصص روان‌شناسی و تکنولوژی برای ارائه تجربه‌ای متفاوت، دقیق و
            لذت‌بخش.
          </p>
        </motion.div>
      </div>

      {/* contact & socials */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35 }}
        className="w-full rounded-2xl p-6 border border-borderColor/60 bg-gradient-to-b from-[#222529] to-[#1c1e21] flex flex-col gap-4"
      >
        <h3 className="text-lg font-black text-primaryTextColor">
          راه‌های ارتباطی
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl p-4 border border-borderColor/60 bg-darkThemeColor flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20">
              <i className="fi fi-rr-phone-call h-5"></i>
            </div>
            <div className="flex flex-col">
              <span className="text-secondaryTextColor text-xs">تلفن</span>
              <span className="text-primaryTextColor text-sm">
                {settings?.site_phone || "021-00000000"}
              </span>
            </div>
          </div>

          <div className="rounded-2xl p-4 border border-borderColor/60 bg-darkThemeColor flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20">
              <i className="fi fi-rr-envelope h-5"></i>
            </div>
            <div className="flex flex-col">
              <span className="text-secondaryTextColor text-xs">ایمیل</span>
              <span className="text-primaryTextColor text-sm">
                {settings?.site_email || "info@yarijoo.ir"}
              </span>
            </div>
          </div>

          <div className="rounded-2xl p-4 border border-borderColor/60 bg-darkThemeColor flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20">
              <i className="fi fi-rr-marker h-5"></i>
            </div>
            <div className="flex flex-col">
              <span className="text-secondaryTextColor text-xs">آدرس</span>
              <span className="text-primaryTextColor text-sm">
                {settings?.site_address || "تهران، ایران"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2">
          {settings?.site_instagram && (
            <a
              href={settings.site_instagram}
              target="_blank"
              className="size-10 rounded-xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20"
            >
              <i className="fi fi-brands-instagram h-5"></i>
            </a>
          )}
          {settings?.site_telegram && (
            <a
              href={settings.site_telegram}
              target="_blank"
              className="size-10 rounded-xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20"
            >
              <i className="fi fi-brands-telegram h-5"></i>
            </a>
          )}
          {settings?.site_whatsapp && (
            <a
              href={settings.site_whatsapp}
              target="_blank"
              className="size-10 rounded-xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20"
            >
              <i className="fi fi-brands-whatsapp h-5"></i>
            </a>
          )}
        </div>
      </motion.div>
    </div>
  );
}
