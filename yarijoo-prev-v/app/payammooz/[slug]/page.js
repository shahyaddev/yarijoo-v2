import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import BreadCrumb from "@/components/shared/BreadCrumb";
import { baseURL } from "@/services/API";
import React from "react";
import Footer from "@/components/footer/Footer";
import { toFarsiNumber } from "@/helper/helper";
import PackageDetails from "@/components/payammooz/PackageDetails";
import MessagesList from "@/components/payammooz/MessagesList";
import { cookies } from "next/headers";

export async function generateMetadata({ params }) {
  const slug = await params.slug;
  
  return {
    title: "پکیج پیام‌آموز - یاریجو",
    description: "دریافت پیام‌های آموزشی روزانه برای رشد فردی و سلامت روان",
    openGraph: {
      title: "پکیج پیام‌آموز - یاریجو",
      description: "دریافت پیام‌های آموزشی روزانه",
      url: `https://yarijoo.ir/payammooz/${slug}`,
      siteName: "یاریجو",
      locale: "fa_IR",
      type: "website",
    },
  };
}

const PackagePage = async ({ params: paramsPromise }) => {
  const params = await paramsPromise;
  const token = cookies().get("token")?.value;
  
  // بررسی خرید پکیج و دریافت پیام‌های SMS شده برای کاربر (اگر لاگین باشد)
  let sentMessages = [];
  let hasPurchased = false;
  if (token) {
    try {
      const messagesRes = await fetch(`${baseURL}/package/message/user-sent/${params.slug}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });
      
      if (messagesRes.ok) {
        const messagesData = await messagesRes.json();
        if (messagesData.status === 'success') {
          sentMessages = messagesData.messages || [];
          hasPurchased = true; // اگر API موفق بود یعنی خرید ثبت شده
        }
      } else if (messagesRes.status === 403) {
        // اگر 403 بود یعنی پکیج یافت شد اما کاربر نخریده
        hasPurchased = false;
      } else if (messagesRes.status === 404) {
        // اگر 404 بود یعنی پکیج یافت نشد
        hasPurchased = false;
      }
    } catch (error) {
      console.error("Error fetching sent messages:", error);
      hasPurchased = false;
    }
  }

  // دریافت آمار پکیج
  let packageStats = null;
  try {
    const statsRes = await fetch(`${baseURL}/package/${params.slug}/stats`, {
      cache: "no-store",
    });
    
    if (statsRes.ok) {
      const statsData = await statsRes.json();
      if (statsData.status === 'success') {
        packageStats = statsData.stats;
      }
    }
  } catch (error) {
    console.error("Error fetching package stats:", error);
  }
  
  // محتوای پیام‌ها
  const messagesContent = {
    "70-views": [
      "زبان احساسات: زنان احساسی هستند و نیاز دارند احساساتشان شنیده شود.",
      "گوش دادن فعال: یادگیری مهارت شنیدن بدون قضاوت و راه‌حل دادن.",
      "زبان بدن: درک علائم غیرکلامی و نشانه‌های احساسی.",
      "تمجید و قدردانی: قدرت کلمات مثبت در تقویت رابطه.",
      "کیفیت زمان: اهمیت گذراندن زمان باکیفیت با همسر.",
    ],
    "self-awareness": [
      "شناخت ارزش‌های اصلی: ارزش‌های زندگی خود را شناسایی کنید.",
      "الگوهای فکری: افکار خودکار منفی را کشف کنید.",
      "نقاط قوت: استعدادها و توانایی‌های خود را بشناسید.",
      "نقاط ضعف: با صداقت، محدودیت‌های خود را بپذیرید.",
      "اهداف زندگی: آنچه واقعاً برایتان مهم است را مشخص کنید.",
    ],
    "stress": [
      "تنفس عمیق: تمرین تنفس ۴-۷-۸ برای آرامش فوری.",
      "آگاهی از بدن: اسکن بدن برای کاهش تنش عضلانی.",
      "مدیتیشن کوتاه: ۵ دقیقه تمرکز روی نفس.",
      "شناخت استرس: منابع اصلی استرس خود را شناسایی کنید.",
      "تفکر مثبت: جایگزینی افکار منفی با مثبت.",
    ]
  };

  // داده‌های پکیج‌ها
  const packagesData = {
    "70-days-70-views": {
      id: 1,
      title: "۷۰ روز، ۷۰ نگاه: راهنمای پیامکی مردان برای فهم عمیق زنان",
      slug: "70-days-70-views",
      description: "دریافت روزانه پیام‌های آموزشی برای درک بهتر دنیای زنان، بهبود ارتباط و ایجاد رابطه‌ای عمیق‌تر",
      long_description: `این پکیج شامل 70 پیام آموزشی است که هر روز در ساعت 9 صبح برای شما ارسال می‌شود.

محتوای این پکیج توسط روانشناسان متخصص در حوزه روابط زناشویی تهیه شده است و به شما کمک می‌کند تا:
• دنیای احساسی زنان را بهتر درک کنید
• مهارت‌های ارتباطی خود را تقویت کنید  
• رابطه‌ای عمیق‌تر و صمیمانه‌تر ایجاد کنید
• نیازهای عاطفی همسرتان را بهتر بشناسید`,
      price: 150000,
      discount_price: 120000,
      dispatch_rate: 1,
      is_active: 1,
      messages: Array.from({ length: 70 }, (_, i) => ({
        id: i + 1,
        order: i + 1,
        day: i + 1,
        time: "09:00",
        message: `روز ${i + 1}: ${messagesContent["70-views"][(i) % messagesContent["70-views"].length]}`,
        sms: true,
        package_id: 1
      }))
    },
    "30-days-self-awareness": {
      id: 2,
      title: "30 روز خودشناسی: مسیر درونی رشد",
      slug: "30-days-self-awareness",
      description: "30 پیام روزانه برای شناخت بهتر خود، کشف نقاط قوت و ضعف و رشد فردی",
      long_description: `پکیج 30 روزه خودشناسی به شما کمک می‌کند تا در یک مسیر ساختارمند، خود واقعی خود را بشناسید.

در این مسیر شما:
• الگوهای رفتاری خود را کشف می‌کنید
• باورهای محدودکننده را شناسایی می‌کنید
• نقاط قوت و ضعف خود را می‌شناسید
• برنامه عملی برای رشد شخصی می‌سازید`,
      price: 80000,
      dispatch_rate: 1,
      is_active: 1,
      messages: Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        order: i + 1,
        day: i + 1,
        time: "08:00",
        message: `روز ${i + 1}: ${messagesContent["self-awareness"][(i) % messagesContent["self-awareness"].length]}`,
        sms: true,
        package_id: 2
      }))
    },
    "40-days-stress-management": {
      id: 3,
      title: "40 روز مدیریت استرس: آرامش درونی",
      slug: "40-days-stress-management",
      description: "تکنیک‌های روزانه برای کاهش استرس، افزایش آرامش و بهبود سلامت روان",
      long_description: `پکیج مدیریت استرس با 80 پیام در 40 روز (2 پیام در روز)، به شما تکنیک‌های عملی برای کنترل استرس می‌آموزد.

محتوای این پکیج:
• تکنیک‌های تنفس و آرام‌سازی
• مدیتیشن و ذهن‌آگاهی
• شناخت منابع استرس
• ایجاد عادات سالم`,
      price: 100000,
      dispatch_rate: 2,
      is_active: 1,
      messages: Array.from({ length: 80 }, (_, i) => ({
        id: i + 1,
        order: i + 1,
        day: Math.ceil((i + 1) / 2),
        time: i % 2 === 0 ? "08:00" : "20:00",
        message: `پیام ${i + 1}: ${messagesContent["stress"][(i) % messagesContent["stress"].length]}`,
        sms: true,
        package_id: 3
      }))
    }
  };

  const pkg = packagesData[params.slug] || null;

  // اگر پکیج پیدا نشد
  if (!pkg) {
    return (
      <div className="w-full flex flex-col gap-4 items-center">
        <Header />
        <MobileHeader />
        
        <div className="w-full max-w-[1280px] flex flex-col items-center gap-5 px-4 lg:mt-24 py-20">
          <div className="w-20 h-20 rounded-full bg-secondaryThemeColor mx-auto mb-4 flex items-center justify-center">
            <i className="fi fi-rr-envelope text-3xl text-secondaryTextColor h-8"></i>
          </div>
          <h2 className="text-2xl font-black text-primaryTextColor">پکیج مورد نظر یافت نشد!</h2>
          <p className="text-secondaryTextColor">لطفاً از لیست پکیج‌ها انتخاب کنید.</p>
          <a 
            href="/payammooz"
            className="px-6 py-3 bg-primaryThemeColor text-darkThemeColor rounded-xl font-bold hover:bg-primaryThemeColor/90 transition-all"
          >
            بازگشت به لیست پکیج‌ها
          </a>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4 items-center">
      <Header />
      <MobileHeader />

      <div className="w-full max-w-[1280px] flex flex-col gap-6 px-4 lg:mt-24">
        {/* Breadcrumb */}
        <div className="w-full rounded-2xl h-14 bg-secondaryThemeColor flex items-center gap-3 px-4 overflow-x-auto scrollbar-none">
          <BreadCrumb link={"/"}>صفحه اصلی</BreadCrumb>
          <BreadCrumb link={"/payammooz"}>پیام‌آموز</BreadCrumb>
          <BreadCrumb link={""} active>
            {pkg.title}
          </BreadCrumb>
        </div>

        {/* Package Details */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <PackageDetails package={pkg} stats={packageStats} />
            <MessagesList 
              messages={token && hasPurchased ? sentMessages : []} 
              isAuthenticated={!!token}
              hasPurchased={hasPurchased}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <PurchaseSidebar package={pkg} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

// Purchase Sidebar Component
const PurchaseSidebar = ({ package: pkg }) => {
  const messageCount = pkg?.messages?.length || 0;
  const durationDays = Math.ceil(messageCount / (pkg?.dispatch_rate || 1));

  return (
    <div className="sticky top-24 w-full bg-secondaryThemeColor rounded-2xl border border-borderColor/60 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-primaryThemeColor/20 to-primaryThemeColor/5 p-6 border-b border-borderColor/40">
        <h3 className="text-lg font-black text-primaryTextColor mb-2">
          خرید پکیج
        </h3>
        <p className="text-sm text-secondaryTextColor">
          دسترسی فوری پس از خرید
        </p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Price */}
        <div className="flex items-center justify-between p-4 bg-darkThemeColor/50 rounded-xl">
          <span className="text-sm text-secondaryTextColor">قیمت:</span>
          <span className="text-2xl font-black text-primaryThemeColor">
            {pkg?.price ? `${toFarsiNumber(pkg.price.toLocaleString())} تومان` : 'رایگان'}
          </span>
        </div>

        {/* Info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-secondaryTextColor">تعداد پیام‌ها:</span>
            <span className="font-bold text-primaryTextColor">{toFarsiNumber(messageCount)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-secondaryTextColor">مدت زمان:</span>
            <span className="font-bold text-primaryTextColor">{toFarsiNumber(durationDays)} روز</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-secondaryTextColor">ارسال روزانه:</span>
            <span className="font-bold text-primaryTextColor">
              {toFarsiNumber(pkg?.dispatch_rate || 1)} پیام
            </span>
          </div>
        </div>

        {/* Buy Button */}
        <button className="w-full h-14 bg-primaryThemeColor text-darkThemeColor rounded-xl font-bold text-base hover:bg-primaryThemeColor/90 transition-all shadow-lg shadow-primaryThemeColor/20 flex items-center justify-center gap-2">
          <i className="fi fi-rr-shopping-cart h-5"></i>
          <span>خرید و فعال‌سازی</span>
        </button>

        {/* Features */}
        <div className="space-y-2 pt-4 border-t border-borderColor/40">
          {[
            "دسترسی فوری پس از خرید",
            "ارسال خودکار پیام‌ها",
            "قابلیت توقف و ادامه",
            "پشتیبانی ۲۴/۷"
          ].map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-secondaryTextColor">
              <i className="fi fi-rr-check-circle text-primaryThemeColor h-4"></i>
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PackagePage;

