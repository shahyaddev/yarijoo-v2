"use client";

import { toFarsiNumber } from "@/helper/helper";
import { removeSession } from "@/lib/storage";
import { useUser } from "@/lib/useUser";
import { postData, siteURL } from "@/services/API";
import { Spinner } from "@nextui-org/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";

const Sidebar = () => {
  const user = useUser();
  const route = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [menuInfo, setMenuInfo] = useState({});

  const logOutHandler = () => {
    setLoading(true);

    postData("/user/logout", {})
      .then(() => {
        removeSession();
        localStorage.removeItem("token");
        router.push("/auth");
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  const openMenuHandler = (menu) => {
    if (menuInfo.id === menu.id) {
      setMenuInfo({});
    } else {
      setMenuInfo(menu);
    }
  };

  // ساخت منوها
  const menus = [
    { id: 1, name: "داشبورد", link: "/user", icon: "fi fi-rr-house-user" },
    {
      id: 2,
      name: "تست‌های من",
      icon: "fi fi-rr-clipboard-list-check",
      link: "/user/my-tests",
    },
    {
      id: 3,
      name: "آزمون های روانشناسی",
      icon: "fi fi-rr-head-side-thinking",
      link: "/user/tests",
    },
    {
      id: 4,
      name: "سفارشات من",
      link: "/user/orders",
      icon: "fi fi-rr-shopping-cart-buyer",
    },
    {
      id: 11,
      name: "آدرس‌های من",
      link: "/user/addresses",
      icon: "fi fi-rr-marker",
    },
    {
      id: 8,
      name: "خریدهای بسته‌های پیامکی",
      link: "/user/sms-packages",
      icon: "fi fi-rr-comment-sms",
    },
    {
      id: 9,
      name: "خریدهای پکیج‌های آموزشی",
      link: "/user/educational-packages",
      icon: "fi fi-rr-book",
    },
    {
      id: 5,
      name: "صندوق پیام",
      link: "/user/messages",
      icon: "fi fi-rr-envelopes",
    },
    {
      id: 6,
      name: "تیکت جدید",
      link: "/user/new-ticket",
      icon: "fi fi-rr-user-headset",
    },
    {
      id: 7,
      name: "تیکت های من",
      link: "/user/my-tickets",
      icon: "fi fi-rr-member-list",
    },
    {
      id: 10,
      name: "ویرایش پروفایل",
      link: "/user/edit-profile",
      icon: "fi fi-rr-user-pen",
    },
  ];

  return (
    <div className="w-full user-sidebar relative md:max-w-[320px] pt-24 bg-primaryThemeColor rounded-2xl overflow-hidden h-fit">
      <div className="w-full relative flex flex-col gap-4 bg-secondaryThemeColor rounded-t-3xl h-full pt-11">
        <div className="w-24 h-24 absolute left-2/4 -translate-x-2/4 -top-20 z-10 rounded-full bg-secondaryThemeColor flex justify-center items-center">
          <Image
            src={
              user?.info?.avatar
                ? `${siteURL}/${user?.info?.avatar}`
                : "/assets/avatar.png"
            }
            width={200}
            height={200}
            className="w-20 h-20 rounded-full border-4 border-primaryThemeColor"
            alt={user?.user?.name || "کاربر"}
          />
        </div>

        <Image
          src={"/assets/curve-down-yellow.png"}
          width={223}
          height={30}
          className="absolute top-0 left-2/4 -translate-x-2/4"
          alt="curve-down"
        />

        {/* user name & phone number */}
        <div className="w-full flex flex-col items-center gap-1">
          <span className="text-lg font-black text-primaryTextColor">
            {user.user.name + " " + user.user.family_name}
          </span>

          <span className="text-sm text-secondaryTextColor">
            {toFarsiNumber(user.user.phone_number)}
          </span>
        </div>

        {/* menus */}
        <div className="w-full flex flex-col px-4 pb-4 gap-3">
          {menus.map((menu) => (
            <div key={menu.id} className="w-full flex flex-col gap-2 px-4">
              <div
                className={`w-full h-10 relative flex items-center justify-between gap-2 transition-all duration-300 ${
                  menu.link === route ||
                  menu?.sub?.filter((item) => item.link === route).length > 0
                    ? "text-primaryThemeColor font-bold"
                    : "text-primaryTextColor"
                }`}
              >
                <span
                  className={`absolute block ${
                    menu.link === route
                      ? "opacity-100 visible scale-100"
                      : "opacity-0 invisible scale-0"
                  } -right-4 h-[70%] top-2/4 -translate-y-2/4 w-1 rounded-full bg-primaryThemeColor transition-all duration-300`}
                ></span>

                {menu.link ? (
                  <Link
                    href={menu.link}
                    className={`w-full flex items-center gap-2`}
                  >
                    <i className={`${menu.icon} text-lg h-[18px]`}></i>

                    <span>{menu.name}</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => openMenuHandler(menu)}
                    className="w-full flex justify-between items-center"
                  >
                    <div className={`w-full flex items-center gap-2`}>
                      <i className={`${menu.icon} text-lg h-[18px]`}></i>

                      <span>{menu.name}</span>
                    </div>

                    <div className="h-full min-w-10 flex justify-end items-center">
                      <i className={`fi fi-rr-angle-down text-xs h-[12px] transition-all duration-300 ${
                        menuInfo.id === menu.id ? 'rotate-180' : ''
                      }`}></i>
                    </div>
                  </button>
                )}
              </div>

              {menu.sub && (
                <div
                  className={`flex flex-col bg-darkThemeColor rounded-2xl py-3 px-6 gap-3 ${
                    menuInfo.id === menu.id ? "flex" : "hidden"
                  } transition-all duration-300 overflow-hidden`}
                >
                  {menu.sub.map((subMenu) => (
                    <Link
                      key={subMenu.id}
                      href={subMenu.link}
                      className={`w-full relative hover:text-primaryThemeColor block h-full ${
                        subMenu.link === route
                          ? "text-primaryThemeColor"
                          : "text-primaryTextColor"
                      }`}
                    >
                      {subMenu.link === route && (
                        <span className="block size-2 rounded-full bg-primaryThemeColor absolute -right-4 top-2/4 -translate-y-2/4"></span>
                      )}

                      <span>{subMenu.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <button
            onClick={logOutHandler}
            className="w-full h-10 relative px-4 pt-4 flex items-center text-danger gap-2 transition-all duration-300 border-t border-borderColor"
          >
            {loading ? (
              <Spinner color="danger" size="sm" />
            ) : (
              <i className="fi fi-rr-leave text-lg h-[18px]"></i>
            )}
            <span>خروج از حساب کاربری</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
