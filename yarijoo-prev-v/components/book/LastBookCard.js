import { toFarsiNumber } from "@/helper/helper";
import { siteURL } from "@/services/API";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const BookCard = ({ data }) => {
  console.log(data);
  return (
    <div className="w-full pt-10 h-auto group blog-box flex flex-col gap-3">
      <div className="w-full relative h-[75px] grid grid-cols-2 gap-3 bg-[#121212] overflow-hidden rounded-xl">
        <div className="w-full h-full blog-box-overlay !bg-[#171717] group-hover:!bg-[#0efdc2] rounded-tl-[28px]"></div>
        <div className="w-full h-full blog-box-overlay !bg-[#171717] group-hover:!bg-[#0efdc2] rounded-tr-[28px]"></div>
      </div>

      <div className="w-full h-auto p-4 bg-[#121212] rounded-t-xl rounded-b-3xl flex flex-col pt-80 gap-2">
        <Link
          href={`/books/${data.id}/${data.slug}`}
          className="w-full absolute top-0 px-6 flex justify-center left-0 z-20"
        >
          <Image
            src={`${siteURL}/${data.cover}`}
            className={`w-full rounded-2xl object-cover object-top aspect-[9/16]`}
            width={300}
            height={600}
            alt={data.title}
          />
        </Link>

        <h3 className="text-sm text-primaryTextColor font-bold line-clamp-1 leading-6">
          {data.title}
        </h3>
        <p className="text-xs text-secondaryTextColor line-clamp-2">
          {data.description}
        </p>

        <div className="w-full flex items-center justify-between">
          <div className="flex items-center text-gray-300 text-xs gap-2">
            <Icon
              icon="solar:calendar-outline"
              width="16"
              height="16"
              className="text-primaryThemeColor"
            />

            <span className="">
              {new Intl.DateTimeFormat("fa-IR", {
                year: "numeric",
                month: "short",
                day: "numeric",
              }).format(new Date(data.updated_at))}
            </span>
          </div>

          <div className="flex items-center text-gray-300 text-xs gap-2">
            <Icon
              icon="solar:notebook-bookmark-outline"
              width="16"
              height="16"
              className="text-primaryThemeColor"
            />

            <span className="">{toFarsiNumber(data.pages.length)} صفحه</span>
          </div>
        </div>

        <Link
          href={`/books/${data.id}/${data.slug}`}
          className="text-sm group-hover:hover-accent relative text-primaryTextColor bg-secondaryThemeColor w-full h-10 flex items-center justify-center rounded-2xl rounded-tr-md mt-2 transition-all duration-300"
        >
          <span>خواندن</span>
        </Link>
      </div>
    </div>
  );
};

export default BookCard;
