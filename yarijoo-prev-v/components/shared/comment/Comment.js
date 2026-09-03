"use client";

import React, { useState } from "react";
import { BsFillReplyFill } from "react-icons/bs";
import Image from "next/image";
import ReplyComment from "./ReplyComment";
import SendComment from "./SendComment";
import { siteURL } from "@/services/API";

const Comment = ({ data, id, type = "product", className, replyClassName }) => {
  const [open, setOpen] = useState(false);

  const token = localStorage.getItem("token");

  const openReply = () => {
    token && setOpen(!open);
  };

  return (
    <div
      className={`w-full flex gap-5 h-auto bg-darkThemeColor p-4 rounded-xl ${className}`}
    >
      <div className="hidden flex-col lg:flex items-center gap-2">
        <Image
          width={100}
          height={100}
          src={data.avatar ? `${siteURL}/${data.avatar}` : "/assets/avatar.png"}
          className="min-w-[40px] max-w-[40px] h-10 md:min-w-14 md:max-w-14 md:h-14 rounded-full object-cover"
          alt="avatar"
        />
        <span className="text-xs bg-gray-700 text-primaryTextColor px-4 py-1 text-center rounded-lg">
          {data.user.role === 2 ? "ادمین" : "کاربر"}
        </span>
      </div>

      <div className="w-full flex flex-col gap-6">
        {/* name */}

        <div className="flex items-center gap-2">
          <div className="flex flex-col lg:hidden items-center gap-2">
            <Image
              width={100}
              height={100}
              src={
                data.avatar ? `${siteURL}/${data.avatar}` : "/assets/avatar.png"
              }
              className="min-w-[40px] max-w-[40px] h-10 md:min-w-14 md:max-w-14 md:h-14 rounded-full object-cover"
              alt=""
            />
          </div>

          <div className="w-full flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-lg text-primaryTextColor">
                {data.user.name + " " + data.user.family_name}
              </span>

              <div className="flex items-center gap-2">
                <span className="text-[11px] lg:hidden bg-gray-500 text-primaryTextColor px-3 py-1 text-center rounded-lg">
                  {data.user.role === 2 ? "ادمین" : "کاربر"}
                </span>
                <span className="text-gray-400 text-xs">
                  {new Intl.DateTimeFormat("fa-IR", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }).format(new Date(data.date))}
                </span>
              </div>
            </div>

            <button onClick={openReply}>
              <BsFillReplyFill className="text-4xl text-gray-600" />
            </button>
          </div>
        </div>

        {/* message */}
        <p className="text-gray-600 leading-7 break-words">{data.message || data.body}</p>

        {open && (
          <SendComment
            reply={true}
            id={id}
            userReplyInfo={data.user}
            comment_id={data.id}
            setOpen={setOpen}
            type={type}
          />
        )}

        {/* reply comments */}
        {data.replies &&
          data.replies.map((rep) => (
            <ReplyComment data={rep} className={replyClassName} />
          ))}
      </div>
    </div>
  );
};

export default Comment;
