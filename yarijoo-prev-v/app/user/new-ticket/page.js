import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React from "react";
import Sidebar from "../Sidebar";
import NewTicketForm from "./NewTicketForm";
import Footer from "@/components/footer/Footer";

const Page = () => {
  return (
    <div className="w-full flex flex-col items-center">
      <Header />
      <MobileHeader />

      <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
        <Sidebar />

        <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-4 md:p-6">
          <div className="w-full flex flex-col gap-2 pb-4 border-b border-borderColor/30">
            <span className="text-2xl md:text-3xl font-black text-primaryTextColor">
              تیکت جدید
            </span>
            <p className="text-sm text-secondaryTextColor">
              برای دریافت پشتیبانی، تیکت جدید ایجاد کنید
            </p>
          </div>

          <NewTicketForm />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Page;
