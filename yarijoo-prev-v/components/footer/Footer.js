"use client";

import React from "react";
import { menus } from "../header/Header";
import Link from "next/link";
import Image from "next/image";

const Footer = ({ home }) => {
  const scrollToTop = () => {
    window.scrollTo({ behavior: "smooth", top: 0 });
  };

  const socialLinks = [
    {
      id: 1,
      name: "تلگرام",
      href: "https://t.me/goldenartkhani",
      icon: "fi fi-brands-telegram",
      color: "hover:bg-[#0088cc]",
    },
    {
      id: 2,
      name: "اینستاگرام",
      href: "https://www.instagram.com/goldenartkaraj/",
      icon: "fi fi-brands-instagram",
      color: "hover:bg-gradient-to-br hover:from-[#f09433] hover:via-[#e6683c] hover:to-[#dc2743]",
    },
    {
      id: 3,
      name: "توییتر",
      href: "#",
      icon: "fi fi-brands-twitter-alt",
      color: "hover:bg-[#1DA1F2]",
    },
    {
      id: 4,
      name: "لینکدین",
      href: "#",
      icon: "fi fi-brands-linkedin",
      color: "hover:bg-[#0077b5]",
    },
  ];

  const usefulLinks = [
    { id: 1, name: "قوانین و مقررات", link: "/terms" },
    { id: 2, name: "حریم خصوصی", link: "/privacy" },
    { id: 3, name: "سوالات متداول", link: "/faq" },
    { id: 4, name: "درباره ما", link: "/about-us" },
  ];

  const contactInfo = [
    {
      id: 1,
      icon: "fi fi-rr-phone-call",
      text: "021-12345678",
      link: "tel:02112345678",
    },
    {
      id: 2,
      icon: "fi fi-rr-envelope",
      text: "info@yarijoo.ir",
      link: "mailto:info@yarijoo.ir",
    },
    {
      id: 3,
      icon: "fi fi-rr-marker",
      text: "تهران، ایران",
      link: "#",
    },
  ];

  return (
    <footer className="w-full relative bg-secondaryThemeColor mt-24 overflow-hidden">
      {/* Decorative Glow Effects */}
      <div className="pointer-events-none absolute opacity-animate -left-16 top-1/4 -translate-y-1/2 z-0">
        <div
          className="w-72 h-72 rounded-full opacity-30 blur-3xl mix-blend-screen"
          style={{
            background:
              "radial-gradient(closest-side, rgba(23, 201, 100, 0.6), rgba(23, 201, 100, 0.4) 60%, transparent 75%)",
            boxShadow: "0 0 120px 60px rgba(23, 201, 100, 0.15)",
          }}
        />
      </div>
      <div className="pointer-events-none absolute opacity-animate -right-16 top-3/4 -translate-y-1/2 z-0">
        <div
          className="w-72 h-72 rounded-full opacity-30 blur-3xl mix-blend-screen"
          style={{
            background:
              "radial-gradient(closest-side, rgba(23, 201, 100, 0.6), rgba(23, 201, 100, 0.4) 60%, transparent 75%)",
            boxShadow: "0 0 120px 60px rgba(23, 201, 100, 0.15)",
          }}
        />
      </div>

      {/* Scroll to top button */}
      <div className="w-full flex justify-center relative mt-4 mb-8 z-20">
        <button
          onClick={scrollToTop}
          className="group relative size-14 md:size-16 bg-primaryThemeColor shadow-lg shadow-primaryThemeColor/50 flex justify-center items-center rounded-full hover:scale-110 hover:shadow-primaryThemeColor/70 transition-all duration-300 z-10 before:absolute before:inset-0 before:rounded-full before:bg-primaryThemeColor/20 before:scale-150 before:opacity-0 hover:before:opacity-100 hover:before:scale-125 before:transition-all before:duration-500"
          aria-label="بازگشت به بالا"
        >
          <i className="fi fi-sr-down text-xl md:text-2xl h-[20px] md:h-[24px] rotate-180 text-white transition-transform duration-300 group-hover:-translate-y-1"></i>
        </button>
      </div>

      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-6 pb-10 relative z-10">
        {/* Main Footer Content */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          {/* Logo & About */}
          <div className="flex flex-col gap-5 items-center sm:items-start relative pb-6 sm:pb-0 border-b sm:border-b-0 border-borderColor/20">
            <Link href={"/"} className="flex items-center gap-3 group">
              <div className="size-14 rounded-xl bg-primaryThemeColor/15 border border-primaryThemeColor/30 flex items-center justify-center group-hover:bg-primaryThemeColor/25 group-hover:border-primaryThemeColor/50 transition-all duration-300">
                <Image
                  src={"/assets/yariend.png"}
                  width={32}
                  height={32}
                  alt="یاریجو"
                  className="rounded-lg"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-secondaryTextColor/70 font-normal">پلتفرم سلامت و روان</span>
                <h2 className="text-lg font-black text-primaryTextColor group-hover:text-primaryThemeColor transition-colors duration-300">یاریجو</h2>
              </div>
            </Link>
            <p className="text-sm text-secondaryTextColor leading-7 text-center sm:text-right">
              یاریجو با هدف ایجاد بستری امن، علمی و کاربردی برای بهبود سلامت روان و روابط عاطفی شکل گرفته است.
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.id}
                  href={social.href}
                  target={social.href !== "#" ? "_blank" : undefined}
                  className={`size-11 rounded-xl bg-darkThemeColor border border-borderColor/50 flex justify-center items-center text-primaryThemeColor hover:text-white transition-all duration-300 hover:scale-110 hover:border-primaryThemeColor/50 ${social.color}`}
                  aria-label={social.name}
                >
                  <i className={`${social.icon} text-lg h-[18px]`}></i>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-5 items-center sm:items-start relative pb-6 sm:pb-0 border-b sm:border-b-0 border-borderColor/20">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <div className="size-10 rounded-xl bg-primaryThemeColor/15 border border-primaryThemeColor/30 flex items-center justify-center">
                <i className="fi fi-rr-menu-burger block h-[18px] text-lg text-primaryThemeColor"></i>
              </div>
              <h3 className="text-base font-black text-primaryTextColor">دسترسی سریع</h3>
            </div>
            <ul className="flex flex-col gap-3 w-full items-center sm:items-start">
              {menus.map((menu) => (
                <li key={menu.id} className="w-full">
                  <Link
                    href={menu.link}
                    className="flex items-center justify-center sm:justify-start gap-2 text-sm text-secondaryTextColor hover:text-primaryThemeColor transition-all duration-300 group"
                  >
                    <i className="fi fi-rr-angle-left text-xs text-primaryThemeColor opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300"></i>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{menu.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Useful Links */}
          <div className="flex flex-col gap-5 items-center sm:items-start relative pb-6 sm:pb-0 border-b sm:border-b-0 border-borderColor/20">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <div className="size-10 rounded-xl bg-primaryThemeColor/15 border border-primaryThemeColor/30 flex items-center justify-center">
                <i className="fi fi-rr-link block h-[18px] text-lg text-primaryThemeColor"></i>
              </div>
              <h3 className="text-base font-black text-primaryTextColor">لینک‌های مفید</h3>
            </div>
            <ul className="flex flex-col gap-3 w-full items-center sm:items-start">
              {usefulLinks.map((link) => (
                <li key={link.id} className="w-full">
                  <Link
                    href={link.link}
                    className="flex items-center justify-center sm:justify-start gap-2 text-sm text-secondaryTextColor hover:text-primaryThemeColor transition-all duration-300 group"
                  >
                    <i className="fi fi-rr-angle-left block h-3 text-xs text-primaryThemeColor opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300"></i>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-5 items-center sm:items-start relative pb-6 sm:pb-0 border-b sm:border-b-0 border-borderColor/20">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <div className="size-10 rounded-xl bg-primaryThemeColor/15 border border-primaryThemeColor/30 flex items-center justify-center">
                <i className="fi fi-rr-phone-call block h-[18px] text-lg text-primaryThemeColor"></i>
              </div>
              <h3 className="text-base font-black text-primaryTextColor">تماس با ما</h3>
            </div>
            <ul className="flex flex-col gap-4 w-full items-center sm:items-start">
              {contactInfo.map((contact) => (
                <li key={contact.id} className="w-full">
                  <Link
                    href={contact.link}
                    className="flex items-center justify-center sm:justify-start gap-3 text-sm text-secondaryTextColor hover:text-primaryThemeColor transition-all duration-300 group"
                  >
                    <div className="size-9 rounded-lg bg-primaryThemeColor/10 border border-primaryThemeColor/20 flex items-center justify-center group-hover:bg-primaryThemeColor/20 group-hover:border-primaryThemeColor/40 transition-all duration-300">
                      <i className={`${contact.icon} block h-4 text-base text-primaryThemeColor`}></i>
                    </div>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{contact.text}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-col gap-5 items-center sm:items-start">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <div className="size-10 rounded-xl bg-primaryThemeColor/15 border border-primaryThemeColor/30 flex items-center justify-center">
                <i className="fi fi-rr-shield-check block h-[18px] text-lg text-primaryThemeColor"></i>
              </div>
              <h3 className="text-base font-black text-primaryTextColor">نمادهای اعتماد</h3>
            </div>
            <div className="flex gap-3 items-center justify-center sm:justify-start">
              <Link
                referrerPolicy="origin"
                target="_blank"
                href="https://trustseal.enamad.ir/?id=614229&Code=12hXVcLaL7rcZcQLfmWrB6McXx9BsvBN"
                className="group hover:scale-105 transition-all duration-300"
              >
                <div className="rounded-xl border border-borderColor/50 bg-darkThemeColor p-3 hover:border-primaryThemeColor/50 hover:bg-darkThemeColor/80 transition-all duration-300">
                  <Image
                    width={100}
                    height={55}
                    referrerPolicy="origin"
                    src="https://trustseal.enamad.ir/logo.aspx?id=614229&Code=12hXVcLaL7rcZcQLfmWrB6McXx9BsvBN"
                    code="12hXVcLaL7rcZcQLfmWrB6McXx9BsvBN"
                    alt="نماد اعتماد الکترونیک"
                    className="group-hover:drop-shadow-lg transition-all duration-300"
                  />
                </div>
              </Link>
              <div className="group hover:scale-105 transition-all duration-300">
                <div className="rounded-xl border border-borderColor/50 bg-darkThemeColor p-3 hover:border-primaryThemeColor/50 hover:bg-darkThemeColor/80 transition-all duration-300">
                  <Image
                    src={"/assets/samandehi.png"}
                    width={100}
                    height={55}
                    alt="نماد ساماندهی"
                    className="group-hover:drop-shadow-lg transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="w-full pt-6 border-t border-borderColor/20">
          <div className="flex flex-col md:flex-row gap-4 md:justify-between items-center text-sm text-secondaryTextColor">
            <div className="flex items-center gap-2">
              <i className="fi fi-sr-copyright text-primaryThemeColor"></i>
              <span>
                کلیه حقوق متعلق به{" "}
                <Link href={"/"} className="text-primaryThemeColor font-bold hover:underline transition-all duration-300">
                  یاریجو
                </Link>{" "}
                می باشد © {new Date().getFullYear()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fi fi-sr-heart text-red-400 animate-pulse"></i>
              <span>
                طراحی و توسعه توسط{" "}
                <Link
                  href={"https://webfarda.com"}
                  className="text-primaryThemeColor font-bold hover:underline transition-all duration-300"
                  target="_blank"
                >
                  وب فردا
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
