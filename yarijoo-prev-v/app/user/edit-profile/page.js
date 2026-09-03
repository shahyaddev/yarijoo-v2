import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React from "react";
import Sidebar from "../Sidebar";
import Footer from "@/components/footer/Footer";
import EditProfileForm from "./EditProfileForm";
import ChangePassword from "./ChangePassword";

const Page = () => {
  return (
    <div className="w-full flex flex-col items-center">
      <Header />
      <MobileHeader />

      <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
        <Sidebar />

        <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-4">
          <div className="w-full flex flex-col gap-4">
            <span className="text-xl font-black text-primaryTextColor">
              ویرایش پروفایل
            </span>

            <EditProfileForm />
          </div>

          <div className="w-full flex flex-col gap-4">
            <span className="text-xl font-black text-primaryTextColor">
              تغییر رمز عبور
            </span>

            <ChangePassword />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Page;
