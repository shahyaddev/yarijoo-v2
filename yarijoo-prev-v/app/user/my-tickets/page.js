import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React from "react";
import Sidebar from "../Sidebar";
import Footer from "@/components/footer/Footer";
import { cookies } from "next/headers";
import { baseURL } from "@/services/API";
import TicketItem from "./TicketItem";

const Page = async () => {
  const token = cookies().get("token")?.value;

  const userTicketsRes = await fetch(`${baseURL}/ticket/view-tickets`, {
    method: "GET",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  let userTickets = [];
  
  if (userTicketsRes.ok) {
    const ticketsData = await userTicketsRes.json();
    userTickets = Array.isArray(ticketsData) ? ticketsData : ticketsData.data || [];
  }

  return (
    <div className="w-full flex flex-col items-center">
      <Header />
      <MobileHeader />

      <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
        <Sidebar />

        <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-4 md:p-6">
          <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-borderColor/30">
            <div className="flex flex-col gap-2">
              <span className="text-2xl md:text-3xl font-black text-primaryTextColor">
                تیکت‌های من
              </span>
              <p className="text-sm text-secondaryTextColor">
                مدیریت و پیگیری تیکت‌های پشتیبانی
              </p>
            </div>
          </div>

          {userTickets && userTickets.length > 0 ? (
            <div className="w-full flex flex-col gap-4">
              {userTickets.map((ticket) => (
                <TicketItem key={ticket.id} data={ticket} />
              ))}
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center gap-6 py-12 md:py-16">
              <div className="w-24 h-24 rounded-full bg-darkThemeColor flex items-center justify-center">
                <i className="fi fi-rr-ticket text-4xl text-secondaryTextColor"></i>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="text-lg font-semibold text-primaryTextColor">
                  هیچ تیکتی یافت نشد
                </span>
                <p className="text-sm text-secondaryTextColor max-w-md">
                  شما هنوز تیکتی ایجاد نکرده‌اید. برای دریافت پشتیبانی می‌توانید تیکت جدید ایجاد کنید.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Page;
