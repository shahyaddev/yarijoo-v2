import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React from "react";
import Sidebar from "../Sidebar";
import Footer from "@/components/footer/Footer";
import { baseURL } from "@/services/API";
import { cookies } from "next/headers";
import MessageItem from "./MessageItem";

const Page = async () => {
  const token = cookies().get("token")?.value;

  const userMessagesRes = await fetch(`${baseURL}/user/user-messages`, {
    method: "GET",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const userMessages = await userMessagesRes.json();

  return (
    <div className="w-full flex flex-col items-center">
      <Header />
      <MobileHeader />

      <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
        <Sidebar />

        <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-4">
          {/* my orders */}
          <div className="w-full flex flex-col gap-4">
            <span className="text-xl font-black text-primaryTextColor">
              پیام های من
            </span>

            <div className="w-full flex flex-col gap-2">
              {userMessages.map((message) => (
                <MessageItem message={message} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Page;
