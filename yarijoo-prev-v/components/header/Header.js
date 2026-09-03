"use client";

import { toFarsiNumber } from "@/helper/helper";
import useClickOutside from "@/hooks/useClickOutside";
import { removeSession } from "@/lib/storage";
import { UserContext } from "@/lib/UserProvider";
import { useUser } from "@/lib/useUser";
import { postData, siteURL } from "@/services/API";
import { Button, Spinner } from "@nextui-org/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useContext, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export const menus = [
  {
    id: 1,
    name: "صفحه اصلی",
    link: "/",
    icon: "solar:home-angle-2-linear",
  },
  {
    id: 2,
    name: "فروشگاه",
    link: "/shop",
    icon: "solar:shop-linear",
    sub: [
      { id: 21, name: "پکیج های رشد و درمان", link: "/shop" },
      { id: 22, name: "کارگاه های آنلاین", link: "#", disabled: true, comingSoon: true },
      { id: 23, name: "پیام آموز", link: "/payammooz" },
      { id: 24, name: "کتاب ها", link: "/books" },
    ],
  },
  {
    id: 3,
    name: "آموزشگاه",
    link: "/academy",
    icon: "solar:square-academic-cap-linear",
    sub: [
      { id: 31, name: "مجله یاریجو", link: "/blog" },
      { id: 32, name: "داستان ها", link: "/stories" },
      { id: 33, name: "دوره های مایند فولنس", link: "#", disabled: true, comingSoon: true },
      { id: 34, name: "کارگاه های آموزشــی", link: "#", disabled: true, comingSoon: true },
      { id: 35, name: "آزمون های روانشناســی", link: "/psychological-tests" },
    ],
  },
  {
    id: 6,
    name: "ارتباط با ما",
    link: "/about-us",
    icon: "solar:info-circle-linear",
  },
];

const Header = ({ className }) => {
  const [options, setOptions] = useState(false);
  const route = usePathname();
  const router = useRouter();
  const user = useUser();
  const [loading, setLoading] = useState(false);
  const { cart } = useContext(UserContext);
  const [savedCount, setSavedCount] = useState(0);

  const menuOptions = useRef();

  useClickOutside(menuOptions, () => setOptions(false));

  // Calculate saved items count from API
  React.useEffect(() => {
    const fetchBookmarksCount = async () => {
      if (!user?.user?.id) {
        setSavedCount(0);
        return;
      }

      try {
        const { fetchBookmarks } = await import("@/helper/bookmarkHelper");
        const bookmarks = await fetchBookmarks();
        setSavedCount(bookmarks.length || 0);
      } catch (error) {
        console.error("Error fetching bookmarks count:", error);
        setSavedCount(0);
      }
    };

    fetchBookmarksCount();
    
    // Listen for bookmark updates
    const handleBookmarkUpdate = () => {
      fetchBookmarksCount();
    };

    window.addEventListener("bookmarkUpdated", handleBookmarkUpdate);
    
    return () => {
      window.removeEventListener("bookmarkUpdated", handleBookmarkUpdate);
    };
  }, [user?.user?.id]);

  const logoutHandler = () => {
    setLoading(true);

    postData("/user/logout", {})
      .then(() => {
        removeSession();
        localStorage.removeItem("token");
        router.refresh();

        toast.success("با موفقیت از حسابتان خارج شدید");
      })
      .catch((err) => {
        toast.error("خطا هنگام خروج از حساب");

        setLoading(false);
      });
  };

  return (
    <div
      className={`w-full fixed border-b border-borderColor/60 bg-darkThemeColor/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur-lg lg:flex hidden justify-center z-[99] ${className}`}
    >
      <Toaster />
      <div className="max-w-[1280px] h-20 w-full flex items-center justify-between px-4">
        {/* logo & navbar */}
        <div className="flex items-center gap-8">
          <Link href={"/"} className="flex items-center gap-2">
            {/* <i className="fi fi-sr-lightbulb-head text-primaryThemeColor text-3xl h-[30px]"></i> */}
            <div className="relative">
              <div className="absolute inset-0 bg-primaryThemeColor/30 blur-xl rounded-full animate-pulse-slow"></div>
              <div className="relative">
                <Image
                  src={"/assets/yariend.png"}
                  width={45}
                  height={45}
                  alt="یاریجو"
                  className="drop-shadow-[0_0_15px_rgba(23,201,100,0.5)]"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-secondaryTextColor/70 font-normal">
                پـــلتفرم
              </span>
              <span className="text-sm text-secondaryTextColor/70 font-normal">
                سلامت و روان
              </span>
              <h1 className="text-xl font-black text-primaryTextColor">
                یاریـــجو
              </h1>
            </div>
          </Link>

          <nav className="navbar">
            <ul className="flex items-center gap-5">
              {menus.map((menu) => (
                <li key={menu.id} className="relative group">
                  <Link
                    href={menu.link}
                    className={`${menu.link === route
                      ? "text-primaryThemeColor"
                      : "text-primaryTextColor"
                      }  group flex items-center gap-2 h-10 relative font-semibold text-sm px-3 rounded-xl hover:bg-secondaryThemeColor/40 transition-colors`}
                  >
                    <span className="group-hover:text-primaryThemeColor transition-all duration-300">
                      {menu.name}
                    </span>

                    {menu.sub && (
                      <i className="fi fi-rr-angle-down text-xs h-[12px] group-hover:text-primaryThemeColor group-hover:rotate-180 transition-all duration-300"></i>
                    )}
                  </Link>

                  {menu.sub && (
                    <div className="w-56 opacity-0 invisible translate-y-3 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 h-auto bg-darkThemeColor/95 backdrop-blur border border-borderColor shadow-xl p-3 flex flex-col gap-2 absolute top-10 rounded-2xl transition-all duration-300">
                      {menu.sub.map((subMenu) => (
                        subMenu.disabled ? (
                          <div
                            key={subMenu.id}
                            className="text-secondaryTextColor/50 flex items-center relative font-semibold text-sm px-2 py-2 rounded-xl cursor-not-allowed group/item"
                          >
                            <span>{subMenu.name}</span>
                            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-200 pointer-events-none">
                              <div className="bg-primaryThemeColor text-darkThemeColor text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                                به زودی
                                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-primaryThemeColor"></div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Link
                            href={subMenu.link}
                            key={subMenu.id}
                            className={`text-primaryTextColor hover:text-primaryThemeColor flex items-center gap-2 relative font-semibold text-sm px-2 py-2 rounded-xl hover:bg-secondaryThemeColor/40 transition-all duration-300`}
                          >
                            <span>{subMenu.name}</span>
                          </Link>
                        )
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* buttons */}
        <div ref={menuOptions} className="flex items-center gap-4">
          {/* saved items */}
          <Link
            href={"/saved"}
            className="size-10 rounded-xl bg-secondaryThemeColor text-primaryTextColor flex justify-center items-center relative hover:bg-primaryThemeColor/10 hover:text-primaryThemeColor transition-all"
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

          {/* cart */}
          <Link
            href={"/cart"}
            className="size-10 rounded-xl bg-secondaryThemeColor text-primaryTextColor flex justify-center items-center relative"
          >
            <i className="fi fi-rr-shopping-cart h-4"></i>

            <span className="absolute -top-[6px] -left-1 flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primaryThemeColor opacity-75"></span>
              <span className="relative flex items-center justify-center rounded-full h-5 w-5 bg-primaryThemeColor text-primaryTextColor font-bold text-xs">
                {toFarsiNumber(cart?.items.length || 0)}
              </span>
            </span>
          </Link>

          {/* login */}
          {user?.user?.name ? (
            <div className="relative">
              <button
                onClick={() => setOptions(!options)}
                className="flex items-center gap-3"
              >
                <div className="size-10 rounded-xl bg-secondaryThemeColor text-primaryTextColor flex justify-center items-center">
                  <i className="fi fi-rr-user h-4"></i>
                </div>

                <div className="flex flex-col gap-[2px]">
                  <span className="text-xs text-primaryTextColor font-semibold">
                    {user?.user?.name + " " + user?.user?.family_name}
                  </span>
                  <span className="text-xs text-primaryTextColor">
                    خـــوش آمـــدید
                  </span>
                </div>

                <i
                  className={`fi fi-rr-angle-down text- h-4 text-primaryTextColor ${options ? "rotate-180" : "rotate-0"
                    } transition-all duration-300`}
                ></i>
              </button>

              <div
                className={`${options
                  ? "opacity-100 visible translate-y-0"
                  : "opacity-0 invisible translate-y-10"
                  } w-[260px] h-auto bg-darkThemeColor/95 backdrop-blur border border-borderColor rounded-2xl shadow-xl absolute left-0 top-12 p-2 flex flex-col gap-3 transition-all duration-300 z-50`}
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
                    <span>پروفایل</span>
                  </Link>

                  <Link
                    href={"/user"}
                    className="w-full px-4 text-xs font-semibold text-primaryTextColor flex items-center gap-2 hover:text-primaryThemeColor transition-all duration-300"
                  >
                    <i className="fi fi-rr-shopping-cart-buyer text-base h-4"></i>
                    <span>سفارش های من</span>
                  </Link>

                  <button
                    onClick={logoutHandler}
                    className="w-full px-4 text-xs font-semibold flex items-center gap-2 text-danger transition-all duration-300"
                  >
                    {loading ? (
                      <Spinner size="sm" color="danger" />
                    ) : (
                      <i className="fi fi-rr-leave text-base h-4"></i>
                    )}
                    <span>خروج</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link href={"/auth"} className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-secondaryThemeColor text-white flex justify-center items-center">
                <i className="fi fi-rr-user h-4"></i>
              </div>

              <div className="flex flex-col gap-[2px]">
                <span className="text-xs text-primaryTextColor font-semibold">
                  حســاب کاربری
                </span>
                <span className="text-xs text-primaryTextColor">
                  ورود یا ثـبت نام
                </span>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
