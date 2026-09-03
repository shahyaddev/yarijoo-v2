"use client";

import { limitString } from "@/helper/helper";
import { useUser } from "@/lib/useUser";
import { postData } from "@/services/API";
import React from "react";

const MessageItem = ({ message }) => {
  const user = useUser();

  // const closeModal = () => {
  //   setOpen(false);
  // };

  // const openModal = (msg) => {
  //   setOpen(true);
  //   setData(msg);

  //   const newUserMessage = user?.messages?.filter((m) => m.id !== msg.id);

  //   if (user.messages.length > 0) {
  //     postData("/user/seen-message", { message_id: msg.id })
  //       .then((res) => {
  //         setUser({
  //           ...user,
  //           messages: newUserMessage,
  //         });
  //       })
  //       .catch((err) => {});
  //   }
  // };

  return (
    <div
      className="w-full bg-darkThemeColor relative h-auto px-6 rounded-2xl"
    >
      <div className="w-full relative flex flex-col gap-3 h-full p-6 pt-8 sm:pt-6 ">
        <div className="w-2 h-[60%] bg-primaryThemeColor absolute rounded-l-2xl top-2/4 -translate-y-2/4 -right-6"></div>
        {/* title */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3 md:text-lg font-bold text-primaryTextColor transition-all duration-300">
            <div className="min-w-[28px] min-h-[28px] flex justify-center items-center rounded-full bg-gradient-to-tl from-success to-success-800 shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5 stroke-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
            </div>

            <h2>{message.title}</h2>

            {user?.messages.filter((m) => m.id === message.id).length > 0 && (
              <span className="text-xs py-1 px-2 rounded-lg bg-red-600 bg-opacity-15 text-red-600">
                خوانده نشده
              </span>
            )}
          </div>

          <span className="block absolute top-5 left-5 min-w-fit text-sm text-secondaryTextColor">
            {new Intl.DateTimeFormat("fa-IR", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }).format(new Date(message.created_at))}
          </span>
        </div>

        {/* message */}
        <p className="text-secondaryTextColor line-clamp-1">{message.message}</p>
      </div>
    </div>
  );
};

export default MessageItem;
