import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import SectionTitle from "@/components/shared/SectionTitle";
import AboutContent from "./AboutContent";
import { baseURL } from "@/services/API";
import React from "react";

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

const Page = async () => {
  const fetchData = async () => {
    try {
      const siteSettings = await fetch(`${baseURL}/settings/site-info`, {
        cache: "no-store",
      });

      return { settings: await siteSettings.json() };
    } catch (error) {
      return { settings: {}, error };
    }
  };

  const { settings } = await fetchData();

  console.log(settings);

  return (
    <div className="w-full flex flex-col items-center">
      <Header />
      <MobileHeader />

      <div className="w-full max-w-[1280px] flex flex-col gap-6 mt-4 lg:mt-24 px-4">
        <div className="w-full flex justify-between items-center">
          <SectionTitle text1="درباره" text2={"یاریـــجـــو"} icon={"fi fi-rr-info"} />
        </div>
        <AboutContent settings={settings?.data || settings} />
      </div>

      <Footer />
    </div>
  );
};

export default Page;
