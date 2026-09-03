import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React from "react";
import Sidebar from "../../Sidebar";
import Footer from "@/components/footer/Footer";
import { baseURL } from "@/services/API";
import { cookies } from "next/headers";
import { toFarsiNumber } from "@/helper/helper";
import MessageItem from "./MessageItem";
import SendTicketMessage from "./SendTicketMessage";

const Page = async ({ params }) => {
  const token = cookies().get("token")?.value;

  const ticketRes = await fetch(`${baseURL}/ticket/view/${params.id}`, {
    method: "GET",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const ticket = await ticketRes.json();
  console.log(ticket);

  const priorityPersian = {
    low: "کم",
    medium: "متوسط",
    high: "زیاد",
  };

  const categories = {
    0: "پشتیبانی",
    1: "مدیریت",
    2: "فروش",
  };

  const statusPersian = {
    pending: "درحال بررسی",
    answered: "پاسخ داده شد",
  };

  return (
    <div className="w-full flex flex-col items-center">
      <Header />
      <MobileHeader />

      <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
        <Sidebar />

        <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-4">
          {/* my tickets */}
          <div className="w-full flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-primaryTextColor">
                {ticket.ticket.title}
              </span>

              <span className="font-black text-secondaryTextColor">
                #{toFarsiNumber(ticket.ticket.id)}
              </span>
            </div>
          </div>
          {/* info */}
          <div className="w-full flex flex-col md:flex-row flex-wrap md:items-center md:gap-6 gap-4 justify-between border-b border-borderColor pb-6">
            {/* created */}
            <div className="flex items-center gap-2">
              <div className="md:size-10 size-8 bg-darkThemeColor text-primaryThemeColor rounded-xl flex justify-center items-center">
                <i className="fi fi-rr-calendar-lines text-sm h-[14px] md:text-base md:h-4"></i>
              </div>
              <span className="text-secondaryTextColor text-sm font-bold">
                تاریخ ثبت{"  "}
                {new Intl.DateTimeFormat("fa-IR", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }).format(new Date(ticket.ticket.created_at))}
              </span>
            </div>

            {/* updated */}
            <div className="flex items-center gap-2">
              <div className="md:size-10 size-8 bg-darkThemeColor text-primaryThemeColor rounded-xl flex justify-center items-center">
                <i className="fi fi-rr-calendar-clock text-sm h-[14px] md:text-base md:h-4"></i>
              </div>
              <span className="text-secondaryTextColor text-sm font-bold">
                آخرین بروزرسانی{" "}
                {new Intl.DateTimeFormat("fa-IR", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }).format(new Date(ticket.ticket.updated_at))}
              </span>
            </div>

            {/* priority */}
            <div className="flex items-center gap-2">
              <div className="md:size-10 size-8 bg-darkThemeColor text-primaryThemeColor rounded-xl flex justify-center items-center">
                <i className="fi fi-rr-priority-arrow text-sm h-[14px] md:text-base md:h-4"></i>
              </div>
              <span className="text-secondaryTextColor text-sm font-bold">
                سطح اولویت {priorityPersian[ticket.ticket.priority]}
              </span>
            </div>

            {/* department */}
            <div className="flex items-center gap-2">
              <div className="md:size-10 size-8 bg-darkThemeColor text-primaryThemeColor rounded-xl flex justify-center items-center">
                <i className="fi fi-rr-user-headset text-sm h-[14px] md:text-base md:h-4"></i>
              </div>
              <span className="text-secondaryTextColor text-sm font-bold">
                بخش {categories[ticket.ticket.category_id]}
              </span>
            </div>
          </div>

          <div className="w-full flex flex-col gap-4">
            {/* messages */}
            <div className="w-full ticket-scroll flex flex-col overflow-y-auto overflow-x-hidden gap-4 h-96 px-3">
              {ticket.messages.map((message) => (
                <MessageItem data={message} />
              ))}
            </div>

            {/* send ticket */}
            <SendTicketMessage ticketId={ticket.ticket.id} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Page;
