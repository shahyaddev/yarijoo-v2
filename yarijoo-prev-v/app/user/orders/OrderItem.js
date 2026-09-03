"use client";

import { toFarsiNumber } from "@/helper/helper";
import { useUser } from "@/lib/useUser";
import { siteURL } from "@/services/API";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

const OrderItem = ({ data }) => {
  const user = useUser();
  const [open, setOpen] = useState(false);
  
  return (
    <div className="w-full flex flex-col bg-darkThemeColor border border-borderColor/30 rounded-xl overflow-hidden hover:border-primaryThemeColor/50 transition-all duration-300">
      <button
        onClick={() => setOpen(!open)}
        className="w-full h-auto relative p-4 md:p-5"
      >
        <div className={`absolute left-4 top-2/4 -translate-y-2/4 size-10 flex justify-center items-center bg-secondaryThemeColor rounded-lg transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>
          <i className="fi fi-rr-angle-down text-lg text-primaryTextColor"></i>
        </div>

        {/* info */}
        <div className="grid xl:grid-cols-5 2xl:grid-cols-5 grid-cols-2 gap-2">
          {/* order date */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-3 h-3 fill-primaryThemeColor rotate-180"
              >
                <path
                  fillRule="evenodd"
                  d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                  clipRule="evenodd"
                />
              </svg>

              <span className="text-secondaryTextColor text-xs md:text-sm">
                تاریخ ثبت سفارش:
              </span>
            </div>

            <div className="max-w-fit text-primaryTextColor font-semibold bg-secondaryThemeColor rounded-lg p-2 text-xs md:text-sm">
              {new Intl.DateTimeFormat("fa-IR", {
                year: "numeric",
                month: "short",
                day: "numeric",
              }).format(new Date(data.updated_at))}
            </div>
          </div>

          {/* order code */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-3 h-3 fill-primaryThemeColor rotate-180"
              >
                <path
                  fillRule="evenodd"
                  d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                  clipRule="evenodd"
                />
              </svg>

              <span className="text-secondaryTextColor text-xs md:text-sm">
                کد سفارش:
              </span>
            </div>

            <div className="max-w-fit text-primaryTextColor font-semibold bg-secondaryThemeColor rounded-lg p-2 text-xs md:text-sm">
              {data.id}
            </div>
          </div>

          {/* order price */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-3 h-3 fill-primaryThemeColor rotate-180"
              >
                <path
                  fillRule="evenodd"
                  d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                  clipRule="evenodd"
                />
              </svg>

              <span className="text-secondaryTextColor text-xs md:text-sm">
                مبلغ سفارش:
              </span>
            </div>

            <div className="max-w-fit text-primaryTextColor font-semibold bg-secondaryThemeColor rounded-lg p-2 text-xs md:text-sm">
              {toFarsiNumber(data.cost)} تومان
            </div>
          </div>

          {/* order status */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-3 h-3 fill-primaryThemeColor rotate-180"
              >
                <path
                  fillRule="evenodd"
                  d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                  clipRule="evenodd"
                />
              </svg>

              <span className="text-secondaryTextColor text-xs md:text-sm">
                وضعیت سفارش:
              </span>
            </div>

            <div className="max-w-fit text-primaryTextColor font-semibold bg-secondaryThemeColor rounded-lg p-2 text-xs md:text-sm">
              {data.status === "done" || data.tracking_code
                ? "ارسال شده"
                : data.status === "canceled"
                ? "لغو شده"
                : data.status === "failed"
                ? "خطا در سفارش"
                : data.status === "paid"
                ? "آماده ارسال"
                : data.status === "paying"
                ? "درحال پرداخت"
                : "در انتظار پرداخت"}
            </div>
          </div>
        </div>
      </button>

      {open && (
        <div className="w-full flex flex-col gap-4 h-auto border-t border-borderColor/30 bg-darkThemeColor/50 xl:p-6 p-4">
          {/* user info */}
          <div className="w-full h-auto rounded-xl bg-secondaryThemeColor grid xl:grid-cols-3 2xl:grid-cols-4 grid-cols-1 gap-y-4 p-4">
            {/* deliver to */}
            <div className="flex flex-col justify-center border-r-2 border-[#339963] pr-2">
              <span className="text-sm text-secondaryTextColor">تحویل گیرنده:</span>
              <span className="text-sm text-primaryTextColor font-semibold">
                {data.address?.name + " " + data.address?.family_name}
              </span>
            </div>

            {/* phone number */}
            <div className="flex flex-col justify-center border-r-2 border-[#339963] pr-2">
              <span className="text-sm text-secondaryTextColor">موبایل:</span>
              <span className="text-sm text-primaryTextColor font-semibold">
                {toFarsiNumber(user.user.phone_number)}
              </span>
            </div>

            {/* address */}
            <div className="flex flex-col justify-center border-r-2 border-[#339963] pr-2 col-span-2">
              <span className="text-sm text-secondaryTextColor">آدرس:</span>
              <span className="text-sm text-primaryTextColor font-semibold">
                {data.address?.province?.name}, {data.address?.city?.name},{" "}
                {data.address?.address}
              </span>
            </div>
          </div>

          {/* products & prices */}
          <div className="w-full border rounded-xl p-3 pt-0">
            {/* product 1 */}
            {data.products_list.map((product) => (
              <div className="border-b py-2 flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
                {/* product */}
                <Link
                  href={`/shop/${product.slug}`}
                  target="_blank"
                  className="flex items-center gap-2"
                >
                  <Image
                    src={`${siteURL}/${product.image[0].image}`}
                    className="w-20 rounded-lg object-cover"
                    alt={product.title}
                    width={100}
                    height={100}
                  />
                  <div className="flex flex-col gap-1">
                    <span className="text-primaryTextColor font-semibold text-sm">
                      {product.title}
                    </span>

                    <div className="flex items-center gap-1 text-gray-500 text-[13px]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                          clipRule="evenodd"
                        />
                      </svg>

                      <span>ضمانت سلامت کالا</span>
                    </div>
                  </div>
                </Link>

                {/* prices */}
                <div className="w-full max-w-80 grid grid-cols-3">
                  {/* one product price */}
                  <div className="flex flex-col gap-1">
                    <span className="text-secondaryTextColor text-xs">قیمت واحد:</span>
                    <div className="font-semibold text-sm">
                      {toFarsiNumber(product.b_price)}
                    </div>
                  </div>

                  {/* product quantity */}
                  <div className="flex flex-col gap-1">
                    <span className="text-secondaryTextColor text-xs">تعداد:</span>
                    <div className="font-semibold text-sm">
                      {toFarsiNumber(product.user_qty)}
                    </div>
                  </div>

                  {/* total price */}
                  <div className="flex flex-col gap-1">
                    <span className="text-secondaryTextColor text-xs">قیمت نهایی:</span>
                    <div className="font-semibold text-sm">
                      {toFarsiNumber(product.b_price * product.user_qty)}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* all orders price */}
            {/* <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between py-3 border-b">
              <span className="text-sm text-primaryTextColor">مجموع سفارشات</span>
              <div className="w-full max-w-80 grid grid-cols-3 font-semibold text-sm">
                <div className=""></div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-secondaryTextColor text-xs">تعداد:</span>
                  <div className="font-semibold text-sm">
                    {toFarsiNumber(data.products_list.length)}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-secondaryTextColor text-xs">قیمت نهایی:</span>
                  <div className="font-semibold text-sm">
                    {toFarsiNumber(data.cost)}
                  </div>
                </div>
              </div>
            </div> */}

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between py-3 border-b">
              <span className="text-sm text-primaryTextColor">مبلغ کل کالاها</span>
              <div className="w-full max-w-80 grid grid-cols-3 font-semibold text-sm">
                <div></div>
                <div></div>
                {/* product quantity */}
                <div className="flex flex-col gap-1">
                  <span className="text-secondaryTextColor text-xs">کل کالاها:</span>
                  <div className="font-semibold text-sm">
                    {toFarsiNumber(data.cost)}
                  </div>
                </div>
              </div>
            </div>

            {/* delivery price */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between py-3 border-b">
              <span className="text-sm text-primaryTextColor">+ هزینه پست</span>
              <div className="w-full max-w-80 grid grid-cols-3 font-semibold text-sm">
                <div></div>
                <div></div>
                {/* product quantity */}
                <div className="flex flex-col gap-1">
                  <span className="text-secondaryTextColor text-xs">هزینه پست:</span>
                  <div className="font-semibold text-sm">
                    {toFarsiNumber(Number(data.post_cost))}
                  </div>
                </div>
              </div>
            </div>

            {/* tax */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between py-3 border-b">
              <span className="text-sm text-primaryTextColor">+ ارزش افزوده</span>
              <div className="w-full max-w-80 grid grid-cols-3 font-semibold text-sm">
                <div></div>
                <div></div>
                {/* product quantity */}
                <div className="flex flex-col gap-1">
                  <span className="text-secondaryTextColor text-xs">ارزش افزوده:</span>
                  <div className="font-semibold text-sm">
                    {toFarsiNumber(Number(data.tax))}
                  </div>
                </div>
              </div>
            </div>

            {/* total orders price */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between py-3 pb-0">
              <span className="text-sm text-primaryTextColor">مبلغ کل سفارش شما</span>
              <div className="w-full max-w-80 grid grid-cols-3 font-semibold text-sm">
                <div></div>
                <div></div>
                {/* product quantity */}
                <div className="flex flex-col gap-1">
                  <span className="text-secondaryTextColor text-xs">کل سفارش:</span>
                  <div className="font-semibold text-sm">
                    {toFarsiNumber(
                      data.cost + Number(data.tax) + Number(data.post_cost)
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* delivery info */}
          <div className="flex items-center 2xl:gap-14 gap-4 flex-wrap border rounded-xl p-3">
            {/* pay status */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-3 h-3 fill-primaryThemeColor rotate-180"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                    clipRule="evenodd"
                  />
                </svg>

                <span className="text-secondaryTextColor text-sm"> وضعیت پرداخت:</span>
              </div>

              <div className="max-w-fit text-green-600 font-semibold bg-secondaryThemeColor rounded-lg p-2 text-sm">
                پرداخت شده
              </div>
            </div>

            {/* pay code */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-3 h-3 fill-primaryThemeColor rotate-180"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                    clipRule="evenodd"
                  />
                </svg>

                <span className="text-secondaryTextColor text-sm">
                  {" "}
                  کد رهگیری پرداخت:
                </span>
              </div>

              <div className="max-w-fit text-primaryTextColor font-semibold bg-secondaryThemeColor rounded-lg p-2 text-sm">
                {data.transaction?.trace &&
                  toFarsiNumber(data.transaction?.trace)}
              </div>
            </div>

            {/* order price */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-3 h-3 fill-primaryThemeColor rotate-180"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                    clipRule="evenodd"
                  />
                </svg>

                <span className="text-secondaryTextColor text-sm">وضعیت ارسال:</span>
              </div>

              <div className="max-w-fit font-semibold bg-secondaryThemeColor rounded-lg p-2 text-sm">
                {data.status === "done" || data.tracking_code
                  ? "ارسال شده"
                  : data.status === "canceled"
                  ? "لغو شده"
                  : data.status === "failed"
                  ? "خطا در سفارش"
                  : data.status === "paid"
                  ? "آماده ارسال"
                  : data.status === "paying"
                  ? "درحال پرداخت"
                  : "در انتظار پرداخت"}
              </div>
            </div>

            {/* delivery method */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-3 h-3 fill-primaryThemeColor rotate-180"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                    clipRule="evenodd"
                  />
                </svg>

                <span className="text-secondaryTextColor text-sm">روش ارسال:</span>
              </div>

              <div className="max-w-fit text-primaryTextColor font-semibold bg-secondaryThemeColor rounded-lg p-2 text-sm">
                ارسال با پست
              </div>
            </div>

            {/* delivery code */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-3 h-3 fill-primaryThemeColor rotate-180"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                    clipRule="evenodd"
                  />
                </svg>

                <span className="text-secondaryTextColor text-sm">کد رهگیری ارسال:</span>
              </div>

              <div className="max-w-fit text-primaryTextColor font-semibold bg-secondaryThemeColor rounded-lg p-2 text-sm">
                {data.tracking_code ? data.tracking_code : "ثبت نشده"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderItem;
