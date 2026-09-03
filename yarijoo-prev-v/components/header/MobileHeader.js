"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { menus } from "./Header";
import { toFarsiNumber } from "@/helper/helper";
import { useUser } from "@/lib/useUser";
import { siteURL } from "@/services/API";

const MobileHeader = ({ home }) => {
  const route = usePathname();
  const [openSidebar, setOpenSidebar] = useState(false);
  const [options, setOptions] = useState(false);
  const [menuInfo, setMenuInfo] = useState({});
  const [savedCount, setSavedCount] = useState(0);
  const user = useUser();

  useEffect(() => {
    setOpenSidebar(false);
  }, [route]);

  // Calculate saved items count
  useEffect(() => {
    const calculateSavedCount = () => {
      try {
        const savedBlogs = JSON.parse(localStorage.getItem("savedBlogs") || "[]");
        const savedStories = JSON.parse(localStorage.getItem("savedStories") || "[]");
        const savedBooks = JSON.parse(localStorage.getItem("savedBooks") || "[]");
        setSavedCount(savedBlogs.length + savedStories.length + savedBooks.length);
      } catch (error) {
        console.error("Error calculating saved count:", error);
      }
    };

    calculateSavedCount();
    
    const handleStorageChange = () => {
      calculateSavedCount();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("bookmarkUpdated", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("bookmarkUpdated", handleStorageChange);
    };
  }, []);

  const openMenuHandler = (menu) => {
    if (menuInfo.id === menu.id) {
      setMenuInfo({});
    } else {
      setMenuInfo(menu);
    }
  };

  return (
    <div className="w-full xl:hidden flex justify-center relative">
      {/* sidabar */}
      <div
        onClick={() => setOpenSidebar(false)}
        className={`${openSidebar ? "opacity-100 visible" : "opacity-0 invisible"
          } bg-black bg-opacity-60 fixed top-0 left-0 w-full h-full z-[999] transition-all duration-300`}
      ></div>

      <div
        className={`${openSidebar ? "right-0" : "-right-full"
          } fixed w-72 flex flex-col gap-4 bg-darkThemeColor h-full z-[999] bottom-0 p-4 transition-all duration-300`}
      >
        {/* logo & close & dark mode */}
        <div className="w-full flex items-center justify-between border-b border-borderColor pb-4">
          <Link href={"/"} className="flex items-center gap-2">
            <Image
              src={"/assets/yariend.png"}
              width={45}
              height={45}
              alt="یاریجو"
            />

            <div className="flex flex-col">
              <span className="text-sm text-primaryTextColor font-semibold">
                پـــلتفرم
              </span>

              <h1 className="text-xl font-black text-primaryThemeColor">
                یاریـــجو
              </h1>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpenSidebar(false)}
              className="size-10 text-danger bg-danger bg-opacity-15 rounded-2xl flex items-center justify-center"
            >
              <i className="fi fi-sr-cross-small text-2xl h-6"></i>
            </button>
          </div>
        </div>

        {/* search */}
        <div className="relative">
          <input
            type="text"
            className="w-full h-12 rounded-2xl bg-secondaryThemeColor outline-none text-sm px-4 text-primaryTextColor"
            placeholder="دنبال چی میگردی ؟"
          />

          <i className="fi fi-rr-search text-2xl h-6 absolute text-primaryGrayColor top-2/4 -translate-y-2/4 left-4"></i>
        </div>

        {/* menus */}
        <div className="flex flex-col gap-2 mt-2">
          {menus.map((menu) => (
            <div
              key={menu.id}
              className={`text-sm font-bold flex flex-col gap-2 p-2 pr-3`}
            >
              <div
                className={`flex items-center justify-between ${menu.link === route || menuInfo.id === menu.id
                  ? "text-primaryThemeColor"
                  : "text-primaryTextColor"
                  } hover:text-primaryThemeColor transition-all duration-300`}
              >
                <Link
                  href={`${menu.link}`}
                  className="relative w-full block h-full"
                >
                  <span>{menu.name}</span>

                  {menu.link === route && (
                    <span className="absolute block size-2 bg-primaryThemeColor rounded-full top-2/4 -translate-y-2/4 -right-4"></span>
                  )}
                </Link>

                {menu.sub && (
                  <button
                    onClick={() => openMenuHandler(menu)}
                    className="w-16 h-full flex justify-end"
                  >
                    <i className={`fi fi-rr-angle-down text-xs h-[12px]`}></i>
                  </button>
                )}
              </div>

              {menu.sub && menuInfo.id === menu.id && (
                <div className="flex flex-col bg-secondaryThemeColor rounded-2xl p-3 gap-3">
                  {menu.sub.map((subMenu) => (
                    subMenu.disabled ? (
                      <div
                        key={subMenu.id}
                        className="w-full flex items-center justify-between text-secondaryTextColor/50 px-2 py-2 cursor-not-allowed"
                      >
                        <span>{subMenu.name}</span>
                        <span className="text-xs bg-primaryThemeColor/20 text-primaryThemeColor px-2 py-0.5 rounded">
                          به زودی
                        </span>
                      </div>
                    ) : (
                      <Link
                        key={subMenu.id}
                        href={`${subMenu.link}`}
                        className="w-full text-primaryTextColor hover:text-primaryThemeColor block h-full px-2 py-2"
                      >
                        {subMenu.name}
                      </Link>
                    )
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[1280px] w-full flex flex-col px-4 pt-4">
        <div className="w-full h-[63px] rounded-2xl bg-secondaryThemeColor relative flex items-center justify-between px-3 pr-4">
          {/* humberger menu */}
          <button
            onClick={() => setOpenSidebar(true)}
            className="size-11 flex items-center justify-center rounded-full bg-darkThemeColor"
          >
            <i className="fi fi-rr-menu-burger h-4 text-primaryThemeColor"></i>
          </button>

          {/* logo */}
          <Link href={"/"} className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-primaryThemeColor/30 blur-lg rounded-full animate-pulse-slow"></div>
              <div className="relative">
                <Image
                  src={"/assets/yariend.png"}
                  width={35}
                  height={35}
                  alt="یاریجو"
                  className="drop-shadow-[0_0_12px_rgba(23,201,100,0.5)]"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-xs text-secondaryTextColor/70 font-normal">
                پـــلتفرم سلامت و روان
              </span>

              <h1 className="text-lg font-black text-primaryThemeColor">
                یاریـــجو
              </h1>
            </div>
          </Link>

          {/* login & saved & cart */}
          <div className="flex items-center gap-3">
            {/* saved items */}
            <Link
              href={"/saved"}
              className="size-11 rounded-full bg-darkThemeColor text-primaryTextColor flex justify-center items-center relative hover:bg-primaryThemeColor/10 hover:text-primaryThemeColor transition-all"
            >
              <i className="fi fi-rr-bookmark h-4"></i>

              {savedCount > 0 && (
                <span className="absolute -top-[6px] -left-1 flex h-5 w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primaryThemeColor opacity-75"></span>
                  <span className="relative flex items-center justify-center rounded-full h-5 w-5 bg-primaryThemeColor text-white font-bold text-xs">
                    {toFarsiNumber(savedCount)}
                  </span>
                </span>
              )}
            </Link>

            {user?.user?.name ? (
              <div className="relative">
                <button
                  onClick={() => setOptions(!options)}
                  className="size-11 rounded-full bg-darkThemeColor text-primaryTextColor flex justify-center items-center relative"
                >
                  <i className="fi fi-rr-user h-4"></i>
                </button>

                <div
                  className={`${options
                    ? "opacity-100 visible scale-100"
                    : "opacity-0 invisible scale-50"
                    } w-[250px] h-auto bg-darkThemeColor border border-borderColor rounded-2xl shadow-lg absolute left-0 top-12 p-2 flex flex-col gap-3 transition-all duration-300 z-50`}
                >
                  <div className="w-full flex items-center gap-2 p-2 pb-3 border-b border-borderColor">
                    <Image
                      src={
                        user?.info?.avatar
                          ? `${siteURL}/${user?.info?.avatar}`
                          : "/assets/avatar.png"
                      }
                      width={100}
                      height={100}
                      className="w-14 h-14 rounded-full border-2 border-borderColor"
                      alt={user?.info?.name || "کاربر"}
                    />

                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-primaryTextColor">
                        {user?.user?.name + " " + user?.user?.family_name}
                      </span>
                      <span className="text-xs text-primaryTextColor">
                        {toFarsiNumber(user?.user?.phone_number)}
                      </span>
                    </div>
                  </div>

                  <div className="w-full flex flex-col gap-5 pb-3 pt-1">
                    <Link
                      href={"/user"}
                      className="w-full px-4 text-xs font-semibold text-primaryTextColor flex items-center gap-2 hover:text-primaryThemeColor transition-all duration-300"
                    >
                      <i className="fi fi-rr-house-user text-base h-4"></i>
                      <span>حساب کاربری</span>
                    </Link>

                    <Link
                      href={"/user"}
                      className="w-full px-4 text-xs font-semibold text-primaryTextColor flex items-center gap-2 hover:text-primaryThemeColor transition-all duration-300"
                    >
                      <i className="fi fi-rr-shopping-cart-buyer text-base h-4"></i>
                      <span>سفارش های من</span>
                    </Link>

                    <button className="w-full px-4 text-xs font-semibold text-primaryTextColor flex items-center gap-2 hover:text-danger transition-all duration-300">
                      <i className="fi fi-rr-leave text-base h-4"></i>
                      <span>خروج</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href={"/auth"}
                className="size-11 rounded-full bg-darkThemeColor text-primaryTextColor flex justify-center items-center relative"
              >
                <i className="fi fi-rr-user h-4"></i>
              </Link>
            )}

            {/* cart */}
            <Link
              href={"/cart"}
              className="size-11 rounded-full bg-darkThemeColor text-primaryTextColor flex justify-center items-center relative"
            >
              <i className="fi fi-rr-shopping-cart h-4"></i>

              <span className="absolute -top-[6px] -left-1 flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primaryThemeColor opacity-75"></span>
                <span className="relative flex items-center justify-center rounded-full h-5 w-5 bg-primaryThemeColor text-primaryTextColor font-bold text-xs">
                  {toFarsiNumber(0)}
                </span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;
