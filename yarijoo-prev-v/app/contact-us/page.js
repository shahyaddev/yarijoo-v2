import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import SectionTitle from "@/components/shared/SectionTitle";
import React from "react";
import ContactUsMap from "./ContactUsMap";
import ContactUsForm from "./ContactUsForm";
import Link from "next/link";

const Page = () => {
  const items = [
    {
      id: 1,
      name: "آدرس",
      shortDesc: "۱۰ تا ۱۳ - ۱۶:۳۰ تا ۲۰:۳۰",
      desc: "کرج میدان آزادگان برج میلاد طبقه همکف",
      icon: "fi fi-rr-land-layer-location",
    },
    {
      id: 2,
      name: "تماس با ما",
      shortDesc: "۰۲۶۳۲۵۷۰۰۱۳ - ۰۲۶۳۲۵۷۰۰۱۴",
      desc: "با کارشناسان ما در تماس باشید",
      icon: "fi fi-rr-group-call",
    },
    {
      id: 3,
      name: "ایمیل",
      shortDesc: "info@khaneyesekeh.com",
      desc: "با ما در تماس باشید",
      icon: "fi fi-rr-open-mail-clip",
    },
  ];

  return (
    <div className="w-full flex flex-col items-center">
      <Header />
      <MobileHeader />

      <div className="w-full max-w-[1280px] flex flex-col gap-4 mt-4 lg:mt-24 px-4">
        <div className="w-full flex justify-between items-center">
          <SectionTitle
            text1="تماس با"
            text2={"یاریـــجـــو"}
            icon={"fi fi-sr-info"}
          />
        </div>

        {/* items */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="w-full h-auto relative rounded-2xl bg-secondaryThemeColor p-5 pr-7 flex items-center overflow-hidden gap-3"
            >
              <div className="w-3 h-[70%] rounded-full absolute bg-primaryThemeColor -right-[6px]"></div>

              <div className="min-w-14 size-14 rounded-2xl flex justify-center items-center bg-darkThemeColor">
                <i className={`${item.icon} text-2xl h-[24px] text-primaryTextColor`}></i>
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-black text-primaryTextColor">
                  {item.name}
                </span>

                <span className="p-2 px-4 w-fit text-sm text-primaryThemeColor bg-primaryThemeColor bg-opacity-15 rounded-full">
                  {item.shortDesc}
                </span>

                <p className="text-sm text-secondaryTextColor">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* map and form */}
        <div className="w-full flex flex-col lg:flex-row items-center lg:gap-0 gap-4 h-fit mb-80 xl:mb-5 mt-20 xl:mt-0 xl:pr-32 2xl:pr-28">
          <div className="w-full flex flex-col gap-6 relative xl:max-w-[400px] xl:min-w-[400px] p-5 bg-secondaryThemeColor rounded-2xl">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-black text-primaryTextColor">
                با ما در ارتباط باشید
              </h2>

              <span className="text-sm text-secondaryTextColor">
                نظرات انتقادات و پیشنهادات خود را با ما به اشتراک بگذارید
              </span>
            </div>

            <ContactUsForm />

            <div className="xl:w-28 xl:h-[500px] h-20 w-[80%] bg-[#2f3136] -top-20 left-2/4 -translate-x-2/4 xl:-right-28 xl:left-auto xl:translate-x-0 absolute xl:rounded-tl-none xl:rounded-r-2xl rounded-t-2xl xl:top-2/4 xl:-translate-y-2/4 flex xl:flex-col justify-evenly items-center">
              <Link href={"https://t.me/goldenartkhani"} target="_blank" className="size-[50px] rounded-2xl bg-secondaryThemeColor flex justify-center items-center">
                <i className="fi fi-brands-telegram text-xl h-[20px] text-primaryThemeColor"></i>
              </Link>

              <Link href={"https://www.instagram.com/goldenartkaraj/"} target="_blank" className="size-[50px] rounded-2xl bg-secondaryThemeColor flex justify-center items-center">
                <i className="fi fi-brands-instagram text-xl h-[20px] text-primaryThemeColor"></i>
              </Link>

              <div className="size-[50px] rounded-2xl bg-secondaryThemeColor flex justify-center items-center">
                <i className="fi fi-brands-twitter-alt text-xl h-[20px] text-primaryThemeColor"></i>
              </div>

              <div className="size-[50px] rounded-2xl bg-secondaryThemeColor flex justify-center items-center">
                <i className="fi fi-brands-linkedin text-xl h-[20px] text-primaryThemeColor"></i>
              </div>
            </div>
          </div>

          {/* map */}
          <ContactUsMap />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Page;
