import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React from "react";
import { baseURL } from "@/services/API";
import Footer from "@/components/footer/Footer";
import PayammoozHero from "@/components/payammooz/PayammoozHero";
import PackageCard from "@/components/payammooz/PackageCard";
import HowItWorks from "@/components/payammooz/HowItWorks";
import { toFarsiNumber } from "@/helper/helper";

export const metadata = {
  title: "یاریجو - پیام‌آموز | پکیج‌های پیامکی روزانه",
  description:
    "پکیج‌های پیامکی آموزشی و انگیزشی یاریجو - دریافت پیام‌های روزانه برای رشد فردی و سلامت روان",

  openGraph: {
    title: "یاریجو - پیام‌آموز",
    description: "پکیج‌های پیامکی آموزشی و انگیزشی",
    url: `https://yarijoo.ir/payammooz`,
    metadataBase: new URL(`https://yarijoo.ir/payammooz`),
    siteName: "یاریجو",
    images: [
      {
        url: `/assets/yariend.png`,
        alt: "یاریجو - پیام‌آموز",
        width: 300,
        height: 300,
      },
    ],
    locale: "fa_IR",
    type: "website",
  },
};

const PayammoozPage = async () => {
  // داده‌های نمونه تا Backend درست شود
  const samplePackages = [
    {
      id: 1,
      title: "۷۰ روز، ۷۰ نگاه: راهنمای پیامکی مردان برای فهم عمیق زنان",
      slug: "70-days-70-views",
      description:
        "دریافت روزانه پیام‌های آموزشی برای درک بهتر دنیای زنان، بهبود ارتباط و ایجاد رابطه‌ای عمیق‌تر",
      price: 150000,
      discount_price: 120000,
      dispatch_rate: 1,
      is_active: 1,
      messages: Array.from({ length: 70 }, (_, i) => ({
        id: i + 1,
        order: i + 1,
        day: i + 1,
        time: "09:00",
        message: `پیام روز ${i + 1}: محتوای آموزشی...`,
        sms: true,
      })),
    },
    {
      id: 2,
      title: "30 روز خودشناسی: مسیر درونی رشد",
      slug: "30-days-self-awareness",
      description:
        "30 پیام روزانه برای شناخت بهتر خود، کشف نقاط قوت و ضعف و رشد فردی",
      price: 80000,
      discount_price: null,
      dispatch_rate: 1,
      is_active: 1,
      messages: Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        order: i + 1,
        day: i + 1,
        time: "08:00",
        message: `پیام روز ${i + 1}: تمرین خودشناسی...`,
        sms: true,
      })),
    },
    {
      id: 3,
      title: "40 روز مدیریت استرس: آرامش درونی",
      slug: "40-days-stress-management",
      description:
        "تکنیک‌های روزانه برای کاهش استرس، افزایش آرامش و بهبود سلامت روان",
      price: 100000,
      dispatch_rate: 2,
      is_active: 1,
      messages: Array.from({ length: 80 }, (_, i) => ({
        id: i + 1,
        order: i + 1,
        day: Math.ceil((i + 1) / 2),
        time: i % 2 === 0 ? "08:00" : "20:00",
        message: `پیام ${i + 1}: تکنیک آرام‌سازی...`,
        sms: true,
      })),
    },
  ];

  const packages = samplePackages;

  return (
    <div className="w-full flex flex-col gap-4 items-center">
      <Header />
      <MobileHeader />

      <div className="w-full max-w-[1280px] flex flex-col gap-8 px-4 lg:mt-24">
        {/* Hero Section */}
        <PayammoozHero totalPackages={packages?.length || 0} />

        {/* How It Works */}
        <HowItWorks />

        {/* Packages Grid */}
        <div className="w-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-primaryThemeColor to-primaryThemeColor/40 rounded-full"></div>
            <h2 className="text-2xl font-black text-primaryTextColor">
              پکیج‌های پیام‌آموز
            </h2>
            <div className="flex-1 h-px bg-gradient-to-l from-borderColor to-transparent"></div>
            <span className="text-sm text-secondaryTextColor">
              {toFarsiNumber(packages?.length || 0)} پکیج
            </span>
          </div>

          {packages && packages.length > 0 ? (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg, index) => (
                <PackageCard key={pkg.id || pkg.slug || index} data={pkg} />
              ))}
            </div>
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="w-20 h-20 rounded-full bg-secondaryThemeColor mx-auto mb-4 flex items-center justify-center">
                <i className="fi fi-rr-envelope text-3xl text-secondaryTextColor h-8"></i>
              </div>
              <p className="text-secondaryTextColor">پکیجی موجود نیست!</p>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: "fi fi-rr-messages",
              title: "پیام‌های روزانه",
              desc: "دریافت پیام در ساعت مشخص",
            },
            {
              icon: "fi fi-rr-shield-check",
              title: "محتوای تخصصی",
              desc: "تولید شده توسط روانشناسان",
            },
            {
              icon: "fi fi-rr-chart-line-up",
              title: "رشد مستمر",
              desc: "بهبود تدریجی و پایدار",
            },
            {
              icon: "fi fi-rr-headset",
              title: "پشتیبانی",
              desc: "همراهی در مسیر رشد",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 items-center text-center p-6 bg-secondaryThemeColor rounded-2xl border border-borderColor/60 hover:border-primaryThemeColor/40 transition-all"
            >
              <div className="w-16 h-16 rounded-full bg-primaryThemeColor/10 flex items-center justify-center border-2 border-primaryThemeColor/20">
                <i
                  className={`${feature.icon} text-3xl text-primaryThemeColor h-7`}
                ></i>
              </div>
              <h3 className="text-base font-bold text-primaryTextColor">
                {feature.title}
              </h3>
              <p className="text-sm text-secondaryTextColor">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PayammoozPage;
