import { siteURL } from "@/services/API";
import React from "react";

const ProductReplyComment = ({ data, className }) => {
  return (
    <div
      className={`w-full flex gap-5 h-auto bg-secondaryThemeColor p-4 rounded-xl ${className}`}
    >
      <div className="hidden flex-col lg:flex items-center gap-2">
        <img
          src={data.avatar ? `${siteURL}/${data.avatar}` : "/assets/avatar.png"}
          className="min-w-[40px] h-10 md:min-w-14 md:max-w-14 md:h-14 rounded-full object-cover"
          alt=""
        />
        <span className="text-xs bg-gray-700 text-primaryTextColor px-4 py-1 text-center rounded-lg">
          {data.user.role === 2 ? "ادمین" : "کاربر"}
        </span>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <div className="flex flex-col lg:hidden items-center gap-2">
            <img
              src={
                data.avatar ? `${siteURL}/${data.avatar}` : "/assets/avatar.png"
              }
              className="min-w-[40px] h-10 md:min-w-14 md:max-w-14 md:h-14 rounded-full object-cover"
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
          </div>
        </div>

        {/* message */}
        <p className="text-gray-600 leading-7 break-words">{data.message}</p>
      </div>
    </div>
  );
};

export default ProductReplyComment;
