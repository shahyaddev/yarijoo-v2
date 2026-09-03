import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const NotFound = () => {
  return (
    <div className="w-full flex flex-col gap-10 items-center">
      <Header />
      <MobileHeader />

      <div className="w-full max-w-[1280px] flex flex-col items-center gap-5 px-4 lg:mt-28">
        <Image src={"/assets/404.svg"} width={700} height={500} />

        <span className="text-xl md:text-4xl font-black text-primaryTextColor">
          متاسفانه صفحه مورد نظر شما پیدا نشد
        </span>

        <Link
          href={"/"}
          className="w-fit px-6 h-11 bg-primaryThemeColor rounded-full font-semibold text-darkThemeColor flex items-center gap-3 hover:opacity-70 transition-all duration-300"
        >
          <i className="fi fi-sr-home h-4"></i>
          <span>بازگشت به صفحه اصلی</span>
        </Link>
      </div>

      <Footer />
    </div>
  );
};

export default NotFound;
