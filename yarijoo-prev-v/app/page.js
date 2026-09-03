import BlogPostSlider from "@/components/blog/BlogPostSlider";
import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import AnimatedBoxes from "@/components/home/AnimatedBoxes";
import Girl from "@/components/home/animations/Girl";
import Personal from "@/components/home/animations/Personal";
import CategoriesSlider from "@/components/home/CategoriesSlider";
import CounterNumber from "@/components/home/CounterNumber";
import ConsultationChat from "@/components/home/ConsultationChat";
import HeaderSlider from "@/components/home/HeaderSlider";
import ImageSlider from "@/components/home/ImageSlider";
import TestsSlider from "@/components/home/TestsSlider";
import VerticalSlider from "@/components/home/VerticalSlider";
import ProductSlider from "@/components/product/ProductSlider";
import Accordion from "@/components/shared/Accordion";
import CustomButton from "@/components/shared/CustomButton";
import SectionTitle from "@/components/shared/SectionTitle";
import { toFarsiNumber } from "@/helper/helper";
import { baseURL } from "@/services/API";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import CountUp from "react-countup";
import FreeConsForm from "@/components/home/FreeConsForm";

export const metadata = {
  title: "یاریجو",
  description: "",

  openGraph: {
    title: "یاریجو",
    description: "",
    url: `https://yarijoo.ir`,
    metadataBase: new URL(`https://yarijoo.ir`),
    siteName: "یاریجو",
    images: [
      {
        url: `/assets/yarijoo-logo.png`,
        alt: "یاریجو - صفحه اصلی",
        width: 300,
        hieght: 300,
      },
    ],
    locale: "fa_IR",
    type: "website",
  },
};

const Home = async () => {
  // products
  let products = { data: [] };
  try {
    const productRes = await fetch(`${baseURL}/shop/product/view-all`, {
      cache: "no-store",
    });
    if (productRes.ok) {
      products = await productRes.json();
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    products = { data: [] };
  }

  // categories
  let categories = { data: [] };
  try {
    const categoriesRes = await fetch(`${baseURL}/shop/category/index`, {
      cache: "no-store",
    });
    if (categoriesRes.ok) {
      categories = await categoriesRes.json();
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    categories = { data: [] };
  }

  // blog posts
  let posts = { data: [] };
  try {
    const postsRes = await fetch(`${baseURL}/blog/index`, {
      cache: "no-store",
    });
    if (postsRes.ok) {
      posts = await postsRes.json();
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
    posts = { data: [] };
  }

  const fetchBooks = async () => {
    try {
      const booksRes = await fetch(`${baseURL}/book/books`, {
        method: "GET",
        cache: "no-store",
      });

      return { books: await booksRes.json() };
    } catch (error) {
      console.error("Error fetching books:", error);
      return { books: [], booksError: error };
    }
  };

  const { books, booksError } = await fetchBooks();

  const fetchStories = async () => {
    try {
      const storiesRes = await fetch(`${baseURL}/story/stories`, {
        method: "GET",
        cache: "no-store",
      });

      return { stories: await storiesRes.json() };
    } catch (error) {
      console.error("Error fetching stories:", error);
      return { stories: [], storiesError: error };
    }
  };

  const { stories, storiesError } = await fetchStories();

  const statistics = [
    {
      id: 1,
      name: "+۲۵۰۰ کاربر",
      desc: "کاربران فعال",
      icon: "fi fi-sr-users",
      number: 2500,
    },
    {
      id: 2,
      name: "+۱۵۰ مشاور",
      desc: "مشاوران متخصص",
      icon: "fi fi-sr-user-md",
      number: 150,
    },
    {
      id: 3,
      name: "+۵۰۰۰ جلسه",
      desc: "جلسات مشاوره",
      icon: "fi fi-sr-calendar-check",
      number: 5000,
    },
    {
      id: 4,
      name: "+۱۰۰۰۰ تست",
      desc: "تست انجام شده",
      icon: "fi fi-sr-clipboard-check",
      number: 10000,
    },
  ];

  const whyYarijoo = [
    { name: "تعداد آزمون ها", number: 4 },
    { name: "تعداد پکیج ها", number: 52 },
    { name: "تعداد تست های مجهز", number: 123 },
    { name: "تعداد مشاوره ها", number: 36 },
  ];

  const faqs = [
    {
      question: "یاریجو چیست و چه خدماتی ارائه می‌دهد؟",
      answer:
        "یاریجو یک پلتفرم تخصصی در حوزه روان‌شناسی است که خدماتی مانند مشاوره آنلاین، آزمون‌های روان‌شناسی معتبر، و محتوای علمی و کاربردی برای بهبود سلامت روان ارائه می‌دهد.",
    },
    {
      question: "آیا تست‌های روان‌شناسی یاریجو معتبر هستند؟",
      answer:
        "بله، تمامی تست‌های روان‌شناسی ارائه‌شده در یاریجو بر اساس منابع علمی معتبر طراحی شده‌اند و به‌صورت دوره‌ای توسط روانشناسان بررسی و به‌روزرسانی می‌شوند.",
    },
    {
      question: "چطور می‌توانم با یک مشاور صحبت کنم؟",
      answer:
        "کافیست وارد حساب کاربری خود شوید و از بخش مشاوره آنلاین، مشاور موردنظر را انتخاب کرده و زمان مناسب برای جلسه را رزرو کنید.",
    },
    {
      question: "آیا اطلاعات من در یاریجو محرمانه باقی می‌ماند؟",
      answer:
        "کاملاً. اطلاعات شخصی و نتایج تست‌ها به‌صورت محرمانه نگهداری می‌شوند و فقط خود کاربر و مشاور مربوطه به آن‌ها دسترسی دارند.",
    },
    {
      question: "آیا برای استفاده از خدمات یاریجو باید ثبت‌نام کنم؟",
      answer:
        "برای استفاده کامل از خدمات مانند مشاوره آنلاین و مشاهده نتایج تست‌های پیشرفته، لازم است ثبت‌نام کرده و وارد حساب کاربری خود شوید.",
    },
    {
      question: "چگونه می‌توانم نتیجه تست‌های روان‌شناسی خود را ببینم؟",
      answer:
        "پس از تکمیل هر تست، نتیجه بلافاصله نمایش داده می‌شود و در بخش پروفایل شما نیز ذخیره خواهد شد تا هر زمان بخواهید دوباره آن را مشاهده کنید.",
    },
  ];

  return (
    <div className="w-full flex flex-col items-center overflow-x-hidden">
      {/* header */}
      <div className="w-full relative flex flex-col items-center overflow-x-hidden">
        <Header home />
        <MobileHeader />

        <HeaderSlider />

        {/* categories */}
        <div className="w-full flex flex-col items-center relative mt-4 sm:mt-6 pb-4 sm:pb-6 lg:pb-10">
          <div className="w-full max-w-[1280px] grid grid-cols-1 md:grid-cols-6 gap-4 sm:gap-5 md:gap-6 px-3 sm:px-4 mb-4 sm:mb-6 md:mb-10 relative z-10">
            {/* <Image
              src={"/assets/rectangle.png"}
              alt="categories"
              width={1280}
              height={60}
              className="absolute top-2/4 -translate-y-2/4"
            /> */}

            <div className="w-full md:col-span-1 flex flex-col justify-center gap-2 sm:gap-3 md:gap-4 pt-0 md:pt-4 items-center md:items-start">
              <div className="flex flex-col gap-0.5">
                <span className="text-xl sm:text-2xl md:text-3xl font-black first-letter:text-primaryThemeColor">
                  دسته بندی
                </span>
                <span className="text-xl sm:text-2xl md:text-3xl font-black first-letter:text-primaryThemeColor">
                  پکیج ها
                </span>
              </div>

              <Link
                href="/shop"
                className="w-full md:w-fit hover:hover-accent relative bg-secondaryThemeColor rounded-full rounded-tr-md font-light text-primaryTextColor py-2 px-4 sm:px-5 text-center md:text-right text-sm sm:text-base"
              >
                <span>همه دسته بندی ها</span>
                {/* <div className="category-box-overlay absolute w-full h-full top-0 left-0 z-10"></div> */}
              </Link>
            </div>

            <div className="w-full md:col-span-5">
              {/* categories */}
              <CategoriesSlider categories={categories?.data || []} />
            </div>
          </div>
        </div>

        {/* up wave */}
        <div className="w-full -mb-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 60.3">
            <path
              className="fill-secondaryThemeColor"
              d="M0,0l80,10.7C160,21,320,43,480,42.7C640,43,800,21,960,16s320,5,400,10.7l80,5.3v64h-80c-80,0-240,0-400,0s-320,0-480,0
	s-320,0-400,0H0V0z"
            />
          </svg>
        </div>

        {/* packages */}
        <div className="w-full relative brain-bg flex flex-col items-center h-auto bg-secondaryThemeColor lg:pb-8 py-4 sm:py-6 overflow-hidden">
          {/* soft themed glow - decorative */}
          <div className="pointer-events-none absolute opacity-animate -left-16 top-2/4 -translate-y-1/2 hidden md:block">
            <div
              className="w-72 h-72 rounded-full opacity-70 blur-3xl mix-blend-screen"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(0, 151, 118, 1), rgba(0, 151, 118, 1) 60%, rgb(0, 151, 118) 75%)",
                boxShadow: "0 0 120px 60px rgba(0,151,118,0.22)",
              }}
            />
          </div>

          <div className="w-full max-w-[1280px] flex flex-col gap-4 sm:gap-5 md:gap-6 px-3 sm:px-4">
            {/* last packages */}
            <div className="w-full flex flex-col items-center gap-2 sm:gap-3 md:gap-4">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-primaryTextColor text-center">
                پکیج های یاریجو
              </h2>

              <p className="text-xs sm:text-sm md:text-base max-w-[800px] text-center text-secondaryTextColor px-2 sm:px-4">
                در اینجا تست هایی را خواهید دید که امکانات تحلیل با هوش مصنوعی
                به آن ها اضافه شده است.
              </p>

              <CustomButton
                className="w-full sm:w-fit text-sm sm:text-base"
                link="/shop"
              >
                <span>همه پکیج های یاریجو</span>
              </CustomButton>
            </div>

            <ProductSlider products={products.data} slidesPerView={4} />

            {/* statistics of numbers */}
            <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6 mt-6 sm:mt-8 md:mt-12">
              {statistics.map((stat, index) => (
                <div
                  key={stat.id}
                  className="group relative flex flex-col items-center gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 md:p-6 rounded-2xl bg-gradient-to-br from-darkThemeColor via-darkThemeColor to-secondaryThemeColor/30 border border-borderColor/40 hover:border-primaryThemeColor/50 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-primaryThemeColor/20"
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${
                      index * 0.1 + 0.3
                    }s both`,
                  }}
                >
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primaryThemeColor/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>

                  {/* Icon container with enhanced design */}
                  <div className="relative size-12 sm:size-14 md:size-16 lg:size-20 rounded-2xl bg-gradient-to-br from-primaryThemeColor/20 via-primaryThemeColor/15 to-primaryThemeColor/10 border-2 border-primaryThemeColor/30 flex justify-center items-center group-hover:border-primaryThemeColor/60 group-hover:scale-110 transition-all duration-500 shadow-lg shadow-primaryThemeColor/20 group-hover:shadow-primaryThemeColor/40">
                    {/* Inner glow */}
                    <div className="absolute inset-0 rounded-2xl bg-primaryThemeColor/10 blur-md group-hover:bg-primaryThemeColor/20 transition-all duration-500"></div>
                    <i
                      className={`${stat.icon} text-lg block h-[18px] sm:h-5 sm:text-xl lg:h-[30px] lg:text-3xl text-primaryThemeColor relative z-10 group-hover:scale-110 transition-transform duration-500`}
                    ></i>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col items-center gap-1 sm:gap-1.5 md:gap-2 text-center relative z-10">
                    <div className="flex items-baseline gap-0.5 sm:gap-1">
                      <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-primaryThemeColor group-hover:text-white transition-colors duration-500">
                        <CounterNumber target={stat.number} duration={2000} />
                      </span>
                      <span className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-primaryThemeColor/70 group-hover:text-primaryThemeColor/90 transition-colors duration-500">
                        +
                      </span>
                    </div>
                    <p className="text-xs md:text-sm lg:text-base font-semibold text-primaryTextColor group-hover:text-white transition-colors duration-500 leading-tight">
                      {stat.desc}
                    </p>
                  </div>

                  {/* Decorative corner elements */}
                  <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 size-1.5 sm:size-2 rounded-full bg-primaryThemeColor/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute bottom-1.5 sm:bottom-2 left-1.5 sm:left-2 size-1.5 sm:size-2 rounded-full bg-primaryThemeColor/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* down wave */}
        <div className="w-full -mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 71.9">
            <path
              className="fill-secondaryThemeColor"
              d="M0,27.4l80,10.7c80,10.3,240,32.3,400,32c160,0.3,320-21.7,480-26.7s320,5,400,10.7l80,5.3v-256h-80
	c-80,0-240,0-400,0s-320,0-480,0s-320,0-400,0H0V27.4z"
            />
          </svg>
        </div>

        {/* books */}
        <div className="w-full flex justify-center relative overflow-hidden">
          {/* soft themed glow - decorative */}
          <div className="pointer-events-none absolute opacity-animate -right-16 top-2/4 -translate-y-1/2 hidden md:block">
            <div
              className="w-72 h-72 rounded-full opacity-70 blur-3xl mix-blend-screen"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(0, 151, 118, 1), rgba(0, 151, 118, 1) 60%, rgb(0, 151, 118) 75%)",
                boxShadow: "0 0 120px 60px rgba(0,151,118,0.22)",
              }}
            />
          </div>

          <Image
            src={"/assets/rectangle-2.png"}
            alt="books"
            width={100}
            height={310}
            className="absolute top-[65%] left-2/4 -translate-x-2/4 -translate-y-2/4 hidden md:block"
          />

          <Image
            src={"/assets/line.png"}
            alt="books"
            width={326}
            height={248}
            className="absolute top-1/4 -left-16 -translate-y-2/4 hidden md:block"
          />

          <div className="w-full max-w-[1280px] px-3 sm:px-4 my-4 sm:my-6 md:my-8 lg:my-10 flex flex-col items-center relative z-10 gap-3 sm:gap-4">
            {/* books */}
            <div className="w-full flex flex-col gap-3 sm:gap-4 md:gap-6 px-2 sm:px-4">
              {/* last books */}
              <div className="w-full flex flex-col items-center gap-2 sm:gap-3 md:gap-4">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-primaryTextColor text-center">
                  کتاب های یاریجو
                </h2>

                <p className="text-xs sm:text-sm md:text-base max-w-[800px] text-center text-secondaryTextColor px-2 sm:px-4 leading-relaxed">
                  در اینجا تست هایی را خواهید دید که امکانات تحلیل با هوش مصنوعی
                  به آن ها اضافه شده است.
                </p>

                <CustomButton
                  className="w-full sm:w-fit text-sm sm:text-base"
                  link="/shop"
                >
                  <span>همه کتاب های یاریجو</span>
                </CustomButton>
              </div>

              <ProductSlider type="book" products={books} />
            </div>
          </div>
        </div>

        {/* up wave */}
        <div className="w-full -mb-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 60.3">
            <path
              className="fill-secondaryThemeColor"
              d="M0,0l80,10.7C160,21,320,43,480,42.7C640,43,800,21,960,16s320,5,400,10.7l80,5.3v64h-80c-80,0-240,0-400,0s-320,0-480,0
	s-320,0-400,0H0V0z"
            />
          </svg>
        </div>

        {/* why yarijoo */}
        <div className="w-full flex flex-col items-center lg:py-12 pt-14 pb-16  md:py-8 bg-secondaryThemeColor">
          <div className="w-full max-w-[1280px] px-3 sm:px-4">
            <div className="w-full flex items-center justify-center">
              <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-0 lg:flex lg:items-center lg:justify-between">
                {whyYarijoo.map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-2 sm:gap-3 md:gap-4 group"
                  >
                    {/* Enhanced Circle with multiple glow layers - Larger */}
                    <div className="relative size-20 sm:size-24 md:size-32 lg:size-36 flex items-center justify-center">
                      {/* Outer glow ring */}
                      <div className="absolute inset-0 rounded-full bg-primaryThemeColor/25 blur-2xl group-hover:bg-primaryThemeColor/35 transition-all duration-500"></div>
                      {/* Middle glow ring */}
                      <div className="absolute inset-0 rounded-full bg-primaryThemeColor/20 blur-xl group-hover:bg-primaryThemeColor/30 transition-all duration-500 animate-pulse-slow"></div>
                      {/* Inner glow ring */}
                      <div className="absolute inset-0 rounded-full bg-primaryThemeColor/15 blur-lg group-hover:bg-primaryThemeColor/25 transition-all duration-500"></div>
                      {/* Main circle with gradient */}
                      <div className="relative size-20 sm:size-24 md:size-32 lg:size-36 flex items-center justify-center rounded-full bg-gradient-to-br from-primaryThemeColor/30 via-primaryThemeColor/20 to-primaryThemeColor/10 border-2 sm:border-[3px] border-primaryThemeColor/50 backdrop-blur-md group-hover:border-primaryThemeColor/70 group-hover:scale-110 transition-all duration-500 shadow-2xl shadow-primaryThemeColor/30 group-hover:shadow-primaryThemeColor/50">
                        {/* Inner glow */}
                        <div className="absolute inset-1.5 sm:inset-2 md:inset-3 rounded-full bg-primaryThemeColor/15 blur-lg group-hover:bg-primaryThemeColor/25 transition-all duration-500"></div>
                        {/* Inner shine */}
                        <div className="absolute inset-2 sm:inset-3 md:inset-4 rounded-full bg-white/10 blur-sm"></div>
                        {/* Number */}
                        <div
                          className="relative z-10 text-xl sm:text-2xl md:text-4xl lg:text-5xl font-black text-white drop-shadow-2xl"
                          style={{
                            textShadow:
                              "0 0 15px rgba(23, 201, 100, 0.8), 0 0 30px rgba(23, 201, 100, 0.6), 0 0 45px rgba(23, 201, 100, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)",
                          }}
                        >
                          <CounterNumber target={item.number} duration={2500} />
                        </div>
                        {/* Shine effect on hover */}
                        <div
                          className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-spin-slow transition-opacity duration-500"
                          style={{ animationDuration: "3s" }}
                        ></div>
                        {/* Floating particles effect */}
                        <div className="absolute inset-0 rounded-full">
                          {[...Array(6)].map((_, j) => (
                            <div
                              key={j}
                              className="absolute w-1 h-1 rounded-full bg-primaryThemeColor/40 blur-sm"
                              style={{
                                top: `${20 + j * 15}%`,
                                left: `${20 + j * 10}%`,
                                animation: `float 4s ease-in-out infinite`,
                                animationDelay: `${j * 0.5}s`,
                              }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <span className="font-medium text-primaryTextColor group-hover:text-primaryThemeColor transition-colors duration-300 text-xs md:text-sm lg:text-base xl:text-lg text-center leading-tight">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* down wave */}
        <div className="w-full -mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 71.9">
            <path
              className="fill-secondaryThemeColor"
              d="M0,27.4l80,10.7c80,10.3,240,32.3,400,32c160,0.3,320-21.7,480-26.7s320,5,400,10.7l80,5.3v-256h-80
	c-80,0-240,0-400,0s-320,0-480,0s-320,0-400,0H0V27.4z"
            />
          </svg>
        </div>

        {/* up wave */}
        <div className="w-full -mt-16">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 60.3">
            <path
              className="fill-darkThemeColor"
              d="M0,0l80,10.7C160,21,320,43,480,42.7C640,43,800,21,960,16s320,5,400,10.7l80,5.3v64h-80c-80,0-240,0-400,0s-320,0-480,0
	s-320,0-400,0H0V0z"
            />
          </svg>
        </div>

        {/* number & girl pictures */}
        <div className="w-full flex flex-col items-center lg:py-8 py-4 sm:py-5 md:py-6 bg-darkThemeColor">
          <div className="w-full max-w-[1280px] flex flex-col lg:flex-row gap-4 sm:gap-5 md:gap-7 justify-center items-center px-3 sm:px-4">
            <div className="w-full lg:w-auto flex justify-center order-2 lg:order-1">
              <Girl />
            </div>

            <div className="w-full lg:w-auto flex flex-col gap-3 sm:gap-4 md:gap-5 order-1 lg:order-2">
              <div className="flex flex-col gap-2 sm:gap-2.5 md:gap-3">
                <span className="text-xl sm:text-2xl md:text-3xl text-primaryTextColor font-black text-center lg:text-right">
                  چرا یاریجو را انتخاب کنیم؟
                </span>
                <p className="text-xs sm:text-sm md:text-base text-secondaryTextColor text-center lg:text-right max-w-full lg:max-w-[470px] leading-relaxed">
                  یاریجو با ارائه خدمات تخصصی و حرفه‌ای در حوزه سلامت روان،
                  همراهی مطمئن برای بهبود کیفیت زندگی شماست.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 md:gap-5 lg:gap-7">
                <div className="relative shrink-0 mx-auto sm:mx-0">
                  <Image
                    src={"/assets/back-number.png"}
                    width={85}
                    height={75}
                    alt="پس‌زمینه شماره"
                    className="w-14 h-12 sm:w-16 sm:h-14 md:w-20 md:h-18 lg:w-[85px] lg:h-[75px]"
                  />
                  <span className="text-3xl sm:text-4xl md:text-5xl lg:text-[60px] font-black text-primaryTextColor absolute top-2/4 -translate-y-2/4 -translate-x-2/4 left-2/4">
                    {toFarsiNumber("01")}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 sm:gap-2 md:gap-3 flex-1">
                  <h3 className="text-base sm:text-lg md:text-xl text-primaryTextColor font-black text-center sm:text-right">
                    مشاوره آنلاین با متخصصان مجرب
                  </h3>
                  <p className="text-xs sm:text-sm md:text-base text-secondaryTextColor text-center sm:text-right max-w-full lg:max-w-[470px] leading-relaxed">
                    دسترسی به تیم متخصص و با تجربه روانشناسی که آماده ارائه
                    مشاوره‌های تخصصی در زمینه‌های مختلف سلامت روان هستند.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 md:gap-5 lg:gap-7 sm:mr-0 lg:mr-7">
                <div className="relative shrink-0 mx-auto sm:mx-0">
                  <Image
                    src={"/assets/back-number.png"}
                    width={85}
                    height={75}
                    alt="پس‌زمینه شماره"
                    className="w-14 h-12 sm:w-16 sm:h-14 md:w-20 md:h-18 lg:w-[85px] lg:h-[75px]"
                  />
                  <span className="text-3xl sm:text-4xl md:text-5xl lg:text-[60px] font-black text-primaryTextColor absolute top-2/4 -translate-y-2/4 -translate-x-2/4 left-2/4">
                    {toFarsiNumber("02")}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 sm:gap-2 md:gap-3 flex-1">
                  <h3 className="text-base sm:text-lg md:text-xl text-primaryTextColor font-black text-center sm:text-right">
                    تست‌های روانشناسی معتبر و علمی
                  </h3>
                  <p className="text-xs sm:text-sm md:text-base text-secondaryTextColor text-center sm:text-right max-w-full lg:max-w-[470px] leading-relaxed">
                    مجموعه‌ای جامع از تست‌های روانشناسی استاندارد و معتبر که به
                    شما کمک می‌کند تا شناخت بهتری از خود داشته باشید.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 md:gap-5 lg:gap-7">
                <div className="relative shrink-0 mx-auto sm:mx-0">
                  <Image
                    src={"/assets/back-number.png"}
                    width={85}
                    height={75}
                    alt="پس‌زمینه شماره"
                    className="w-14 h-12 sm:w-16 sm:h-14 md:w-20 md:h-18 lg:w-[85px] lg:h-[75px]"
                  />
                  <span className="text-3xl sm:text-4xl md:text-5xl lg:text-[60px] font-black text-primaryTextColor absolute top-2/4 -translate-y-2/4 -translate-x-2/4 left-2/4">
                    {toFarsiNumber("03")}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 sm:gap-2 md:gap-3 flex-1">
                  <h3 className="text-base sm:text-lg md:text-xl text-primaryTextColor font-black text-center sm:text-right">
                    حریم خصوصی و امنیت اطلاعات
                  </h3>
                  <p className="text-xs sm:text-sm md:text-base text-secondaryTextColor text-center sm:text-right max-w-full lg:max-w-[470px] leading-relaxed">
                    تمامی اطلاعات و گفتگوهای شما به صورت کاملاً محرمانه نگهداری
                    می‌شود و فقط شما و مشاورتان به آن‌ها دسترسی دارید.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 md:gap-5 lg:gap-7 sm:mr-0 lg:mr-7">
                <div className="relative shrink-0 mx-auto sm:mx-0">
                  <Image
                    src={"/assets/back-number.png"}
                    width={85}
                    height={75}
                    alt="پس‌زمینه شماره"
                    className="w-14 h-12 sm:w-16 sm:h-14 md:w-20 md:h-18 lg:w-[85px] lg:h-[75px]"
                  />
                  <span className="text-3xl sm:text-4xl md:text-5xl lg:text-[60px] font-black text-primaryTextColor absolute top-2/4 -translate-y-2/4 -translate-x-2/4 left-2/4">
                    {toFarsiNumber("04")}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 sm:gap-2 md:gap-3 flex-1">
                  <h3 className="text-base sm:text-lg md:text-xl text-primaryTextColor font-black text-center sm:text-right">
                    دسترسی ۲۴ ساعته و بدون محدودیت
                  </h3>
                  <p className="text-xs sm:text-sm md:text-base text-secondaryTextColor text-center sm:text-right max-w-full lg:max-w-[470px] leading-relaxed">
                    در هر زمان و هر مکان که باشید، می‌توانید از خدمات یاریجو
                    استفاده کنید و به منابع آموزشی و مشاوره دسترسی داشته باشید.
                  </p>
                </div>
              </div>

              <CustomButton
                className="w-full sm:w-fit mt-2 sm:mt-3 text-sm sm:text-base"
                link="/shop"
              >
                <span>شروع سفر سلامت روان</span>
              </CustomButton>
            </div>
          </div>
        </div>

        {/* down wave */}
        <div className="w-full -mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 71.9">
            <path
              className="fill-darkThemeColor"
              d="M0,27.4l80,10.7c80,10.3,240,32.3,400,32c160,0.3,320-21.7,480-26.7s320,5,400,10.7l80,5.3v-256h-80
	c-80,0-240,0-400,0s-320,0-480,0s-320,0-400,0H0V27.4z"
            />
          </svg>
        </div>

        {/* up wave */}
        <div className="w-full -mt-[19px] lg:-mt-[47px]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 60.3">
            <path
              className="fill-primaryThemeColor/5"
              d="M0,0l80,10.7C160,21,320,43,480,42.7C640,43,800,21,960,16s320,5,400,10.7l80,5.3v64h-80c-80,0-240,0-400,0s-320,0-480,0
	s-320,0-400,0H0V0z"
            />
          </svg>
        </div>

        {/* tests slider */}
        <div className="w-full flex flex-col items-center overflow-x-hidden bg-primaryThemeColor/5">
          <div className="pointer-events-none absolute opacity-animate -left-16 top-2/4 -translate-y-1/2 hidden md:block">
            <div
              className="w-72 h-72 rounded-full opacity-70 blur-3xl mix-blend-screen"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(0, 151, 118, 1), rgba(0, 151, 118, 1) 60%, rgb(0, 151, 118) 75%)",
                boxShadow: "0 0 120px 60px rgba(0,151,118,0.22)",
              }}
            />
          </div>

          <Image
            src={"/assets/line.png"}
            alt="books"
            width={326}
            height={248}
            className="absolute -left-16 top-2/4 opacity-animate -translate-y-1/2 hidden md:block"
          />

          <div className="w-full max-w-[1280px] flex flex-col items-center gap-3 sm:gap-4 py-4 sm:py-6 md:py-8 pb-8 sm:pb-12 md:pb-16 px-3 sm:px-4">
            <div className="w-full flex flex-col items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-10">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-primaryThemeColor text-center">
                محبوب ترین تست های یاریجو
              </h2>

              <p className="text-xs sm:text-sm md:text-base max-w-[800px] text-center text-secondaryTextColor px-2 sm:px-4 leading-relaxed">
                در اینجا تست هایی را خواهید دید که امکانات تحلیل با هوش مصنوعی
                به آن ها اضافه شده است.
              </p>

              <CustomButton
                className="w-full sm:w-fit text-sm sm:text-base !bg-primaryThemeColor !text-primaryThemeColor !bg-opacity-15"
                iconClassName="!bg-prithtext-primaryThemeColor"
                link="/shop"
              >
                <span>همه تست های یاریجو</span>
              </CustomButton>
            </div>

            <TestsSlider />
          </div>
        </div>

        {/* down wave */}
        <div className="w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 71.9">
            <path
              className="fill-primaryThemeColor/5"
              d="M0,27.4l80,10.7c80,10.3,240,32.3,400,32c160,0.3,320-21.7,480-26.7s320,5,400,10.7l80,5.3v-256h-80
	c-80,0-240,0-400,0s-320,0-480,0s-320,0-400,0H0V27.4z"
            />
          </svg>
        </div>

        {/* up wave */}
        <div className="w-full -mt-4 lg:-mt-[59px]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 60.3">
            <path
              className="fill-darkThemeColor"
              d="M0,0l80,10.7C160,21,320,43,480,42.7C640,43,800,21,960,16s320,5,400,10.7l80,5.3v64h-80c-80,0-240,0-400,0s-320,0-480,0
	s-320,0-400,0H0V0z"
            />
          </svg>
        </div>

        {/* story slider */}
        <div className="w-full flex justify-center relative bg-darkThemeColor">
          <div className="pointer-events-none absolute opacity-animate -left-16 -top-2/4 z-10 hidden md:block">
            <div
              className="w-72 h-72 rounded-full opacity-70 blur-3xl mix-blend-screen"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(0, 151, 118, 1), rgba(0, 151, 118, 1) 60%, rgb(0, 151, 118) 75%)",
                boxShadow: "0 0 120px 60px rgba(0,151,118,0.22)",
              }}
            />
          </div>

          <div className="pointer-events-none absolute opacity-animate -right-16 top-3/4 z-10 hidden md:block">
            <div
              className="w-72 h-72 rounded-full opacity-70 blur-3xl mix-blend-screen"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(0, 151, 118, 1), rgba(0, 151, 118, 1) 60%, rgb(0, 151, 118) 75%)",
                boxShadow: "0 0 120px 60px rgba(0,151,118,0.22)",
              }}
            />
          </div>

          <div className="w-full max-w-[1280px] px-3 sm:px-4 pb-3 sm:pb-4 md:pb-5 xl:py-4 md:py-6 lg:py-8">
            {/* last books */}
            <div className="w-full flex flex-col items-center gap-2 sm:gap-3 md:gap-4">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-primaryTextColor text-center">
                داستان های یاریجو
              </h2>

              <p className="text-xs sm:text-sm md:text-base max-w-[800px] text-center text-secondaryTextColor px-2 sm:px-4 leading-relaxed">
                داستان های واقعی و الهام بخش از افرادی که با چالش های روانی و
                عاطفی روبرو شدند و پیروز شدند
              </p>

              <CustomButton
                className="w-full sm:w-fit text-sm sm:text-base"
                link="/stories"
              >
                <span>همه داستان های یاریجو</span>
              </CustomButton>
            </div>

            {/* sliders */}
            <div className="w-full">
              <ProductSlider
                type="story"
                products={stories}
                slidesPerView={5}
              />
            </div>
          </div>
        </div>

        {/* down wave */}
        <div className="w-full -mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 71.9">
            <path
              className="fill-darkThemeColor"
              d="M0,27.4l80,10.7c80,10.3,240,32.3,400,32c160,0.3,320-21.7,480-26.7s320,5,400,10.7l80,5.3v-256h-80
	c-80,0-240,0-400,0s-320,0-480,0s-320,0-400,0H0V27.4z"
            />
          </svg>
        </div>

        {/* up wave */}
        <div className="w-full -mt-4 lg:-mt-[59px]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 60.3">
            <path
              className="fill-secondaryThemeColor"
              d="M0,0l80,10.7C160,21,320,43,480,42.7C640,43,800,21,960,16s320,5,400,10.7l80,5.3v64h-80c-80,0-240,0-400,0s-320,0-480,0
	s-320,0-400,0H0V0z"
            />
          </svg>
        </div>

        {/* blog & free cons */}
        <div className="w-full relative overflow-hidden flex flex-col items-center lg:py-8 py-4 sm:py-5 md:py-6 bg-secondaryThemeColor">
          <div className="pointer-events-none absolute opacity-animate -left-16 top-2/4 -translate-y-1/2 hidden md:block">
            <div
              className="w-72 h-72 rounded-full opacity-70 blur-3xl mix-blend-screen"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(0, 151, 118, 1), rgba(0, 151, 118, 1) 60%, rgb(0, 151, 118) 75%)",
                boxShadow: "0 0 120px 60px rgba(0,151,118,0.22)",
              }}
            />
          </div>

          <Image
            src={"/assets/line.png"}
            alt="books"
            width={326}
            height={248}
            className="absolute top-2/4 opacity-animate -left-16 -translate-y-1/2 hidden md:block"
          />

          <div className="w-full max-w-[1280px] px-3 sm:px-4 mb-4 sm:mb-6 md:mb-10 flex flex-col items-center gap-3 sm:gap-4 md:gap-6">
            <div className="w-full flex flex-col items-center gap-2 sm:gap-3 md:gap-4">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white text-center">
                مقالات یاریجو
              </h2>

              <p className="text-xs sm:text-sm md:text-base max-w-[800px] text-center text-secondaryTextColor px-2 sm:px-4 leading-relaxed">
                در اینجا تست هایی را خواهید دید که امکانات تحلیل با هوش مصنوعی
                به آن ها اضافه شده است.
              </p>

              <CustomButton
                className="w-full sm:w-fit text-sm sm:text-base"
                link="/blog"
              >
                <span>همه مقالات یاریجو</span>
              </CustomButton>
            </div>

            <BlogPostSlider posts={posts.data} />

            <ConsultationChat />
          </div>
        </div>

        {/* down wave */}
        <div className="w-full -mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 71.9">
            <path
              className="fill-secondaryThemeColor"
              d="M0,27.4l80,10.7c80,10.3,240,32.3,400,32c160,0.3,320-21.7,480-26.7s320,5,400,10.7l80,5.3v-256h-80
	c-80,0-240,0-400,0s-320,0-480,0s-320,0-400,0H0V27.4z"
            />
          </svg>
        </div>

        {/* up wave */}
        <div className="w-full -mt-4 lg:-mt-[59px]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 60.3">
            <path
              className="fill-darkThemeColor"
              d="M0,0l80,10.7C160,21,320,43,480,42.7C640,43,800,21,960,16s320,5,400,10.7l80,5.3v64h-80c-80,0-240,0-400,0s-320,0-480,0
	s-320,0-400,0H0V0z"
            />
          </svg>
        </div>

        {/* faq */}
        <div className="w-full flex flex-col items-center lg:py-8 py-4 sm:py-5 md:py-6 bg-darkThemeColor lg:pb-16 pb-6 sm:pb-8 md:pb-12">
          <div className="w-full max-w-[1280px] flex flex-col items-center gap-3 sm:gap-4 md:gap-6 p-3 sm:p-4 md:p-6 h-auto relative overflow-hidden">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-primaryThemeColor text-center">
              سوالات متداول شما
            </h2>

            <p className="text-center max-w-[800px] text-xs sm:text-sm md:text-base lg:text-lg font-light text-primaryTextColor px-2 sm:px-4 leading-relaxed">
              در این بخش، شما می‌توانید به صورت رایگان و فوری، حس و حال فعلی خود
              را ارزیابی کنید. ما یک مشاور هوشمند در اختیار شما قرار داده‌ایم که
              آماده است به شما کمک کند.
            </p>

            <div className="w-full grid grid-cols-1 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
              <div className="w-full h-full lg:col-span-2 flex justify-center items-center order-2 lg:order-1">
                <Personal />
              </div>

              <div className="w-full flex flex-col lg:col-span-4 gap-2 sm:gap-3 md:gap-4 order-1 lg:order-2">
                {faqs.map((item, i) => (
                  <Accordion key={i} data={item} />
                ))}
              </div>
            </div>

            <FreeConsForm />
          </div>
        </div>
      </div>

      <Footer home />
    </div>
  );
};

export default Home;
