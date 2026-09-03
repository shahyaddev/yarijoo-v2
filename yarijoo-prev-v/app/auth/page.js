import Image from "next/image";
import React from "react";
import LoginForm from "./LoginForm";
import Link from "next/link";

const Page = () => {
  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-darkThemeColor overflow-x-hidden">
      <Link
        href={"/"}
        className="text-xs md:text-sm text-primaryThemeColor absolute top-5 left-5 md:left-10 md:top-10"
      >
        بازگشت به وبسایت
      </Link>

      <div className="max-w-[432px] w-full relative px-4">
        <Image
          src={"/assets/login-bg-1.svg"}
          width={238}
          height={233}
          className="absolute -top-[70px] -left-[40px]"
          alt="logo-bg"
        />

        <Image
          src={"/assets/login-bg-2.svg"}
          width={180}
          height={180}
          className="absolute -bottom-[54px] -right-[56px]"
          alt="logo-bg"
        />

        <div className="w-full flex flex-col p-6 pt-10 items-center gap-5 h-auto rounded-2xl bg-secondaryThemeColor shadow-lg relative z-10">
          <Link href={"/"} className="flex items-center gap-3">
            <Image
              src={"/assets/yarijoo-logo.png"}
              width={60}
              height={60}
              alt="یاریجو"
            />

            <div className="flex flex-col">
              <span className="text-lg text-secondaryTextColor/70 font-normal">
                پـــلتفرم سلامت و روان
              </span>

              <h1 className="text-3xl font-black text-primaryThemeColor">
                یاریـــجو
              </h1>
            </div>
          </Link>

          <div className="flex flex-col gap-2 items-center">
            <span className="text-2xl font-black text-primaryTextColor">
              ورود به پنل کاربری
            </span>
            <span className="text-secondaryTextColor text-sm">
              به یاریجو خوش آمدید👋
            </span>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Page;
