import {
    FaAngry,
    FaApple,
    FaBaby,
    FaBalanceScale,
    FaBed,
    FaBolt,
    FaBook,
    FaBrain,
    FaBriefcase,
    FaChartLine,
    FaClock,
    FaCloudMeatball,
    FaComments,
    FaCrown,
    FaExclamationCircle,
    FaExclamationTriangle,
    FaEye,
    FaFire,
    FaFrown,
    FaFrownOpen,
    FaGraduationCap,
    FaHandsHelping,
    FaHandshake,
    FaHeart,
    FaHeartBroken,
    FaHeartbeat,
    FaHome,
    FaHospital,
    FaIdBadge,
    FaLaptop,
    FaLightbulb,
    FaMoon,
    FaPuzzlePiece,
    FaRegSadCry,
    FaRocket,
    FaRunning,
    FaSadTear,
    FaShieldAlt,
    FaSkullCrossbones,
    FaSmile,
    FaSmileBeam,
    FaStar,
    FaSync,
    FaSyncAlt,
    FaThermometerHalf,
    FaTicketAlt,
    FaUserCircle,
    FaUserFriends,
    FaUserSecret,
    FaUserTie,
    FaUsers,
    FaUtensils,
    FaWifi
} from "react-icons/fa";

export const psychologicalTests = [
    // تست‌های اضطراب و افسردگی
    {
        id: "bai",
        title: "مقیاس اضطراب بک (BAI)",
        icon: <FaSadTear className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/bai",
        category: "اضطراب و افسردگی",
        description: "ارزیابی شدت علائم اضطراب",
        details: `هدف ارزیابی: ارزیابی شدت علائم اضطراب
گروه هدف: افرادی که با علائم اضطراب یا افسردگی مواجه هستند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "gad7",
        title: "مقیاس اضطراب فراگیر (GAD-7)",
        icon: <FaFrownOpen className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/gad7",
        category: "اضطراب و افسردگی",
        description: "سنجش اضطراب فراگیر",
        details: `هدف ارزیابی: سنجش اضطراب فراگیر
گروه هدف: افرادی که با علائم اضطراب یا افسردگی مواجه هستند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "phq9",
        title: "پرسشنامه سلامت بیمار (PHQ-9)",
        icon: <FaFrown className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/phq9",
        category: "اضطراب و افسردگی",
        description: "ارزیابی افسردگی",
        details: `هدف ارزیابی: ارزیابی افسردگی
گروه هدف: افرادی که با علائم اضطراب یا افسردگی مواجه هستند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "dass21",
        title: "مقیاس افسردگی، اضطراب و استرس (DASS-21)",
        icon: <FaBalanceScale className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/dass21",
        category: "اضطراب و افسردگی",
        description: "سنجش افسردگی، اضطراب و استرس",
        details: `هدف ارزیابی: سنجش افسردگی، اضطراب و استرس
گروه هدف: افرادی که با علائم اضطراب یا افسردگی مواجه هستند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "hads",
        title: "مقیاس اضطراب و افسردگی بیمارستانی (HADS)",
        icon: <FaThermometerHalf className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/hads",
        category: "اضطراب و افسردگی",
        description: "ارزیابی اضطراب و افسردگی در بیماران",
        details: `هدف ارزیابی: ارزیابی اضطراب و افسردگی در بیماران
گروه هدف: افرادی که با علائم اضطراب یا افسردگی مواجه هستند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "stai",
        title: "مقیاس اضطراب صفت-حالت (STAI)",
        icon: <FaExclamationCircle className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/stai",
        category: "اضطراب و افسردگی",
        description: "سنجش اضطراب صفت و حالت",
        details: `هدف ارزیابی: سنجش اضطراب صفت و حالت
گروه هدف: افرادی که با علائم اضطراب یا افسردگی مواجه هستند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "bhs",
        title: "مقیاس ناامیدی بک (BHS)",
        icon: <FaRegSadCry className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/bhs",
        category: "اضطراب و افسردگی",
        description: "ارزیابی ناامیدی",
        details: `هدف ارزیابی: ارزیابی ناامیدی
گروه هدف: افرادی که با علائم اضطراب یا افسردگی مواجه هستند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "gds",
        title: "مقیاس افسردگی سالمندان (GDS-15)",
        icon: <FaThermometerHalf className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/gds",
        category: "اضطراب و افسردگی",
        description: "سنجش افسردگی در سالمندان",
        details: `هدف ارزیابی: سنجش افسردگی در سالمندان
گروه هدف: افرادی که با علائم اضطراب یا افسردگی مواجه هستند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "k10",
        title: "مقیاس پریشانی روانی کسلر (K10)",
        icon: <FaExclamationCircle className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/k10",
        category: "اضطراب و افسردگی",
        description: "ارزیابی پریشانی روانی",
        details: `هدف ارزیابی: ارزیابی پریشانی روانی
گروه هدف: افرادی که با علائم اضطراب یا افسردگی مواجه هستند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "who5",
        title: "شاخص رفاه WHO-5",
        icon: <FaSmileBeam className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/who5",
        category: "اضطراب و افسردگی",
        description: "سنجش رفاه روانی",
        details: `هدف ارزیابی: سنجش رفاه روانی
گروه هدف: افرادی که با علائم اضطراب یا افسردگی مواجه هستند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },

    // تست‌های شخصیت
    {
        id: "big5",
        title: "پنج عامل بزرگ شخصیت (Big5)",
        icon: <FaBrain className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/big5",
        category: "شخصیت",
        description: "ارزیابی پنج عامل اصلی شخصیت",
        details: `هدف ارزیابی: ارزیابی پنج عامل اصلی شخصیت
گروه هدف: افرادی که می‌خواهند ابعاد شخصیت و سبک رفتاری خود را بهتر بشناسند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "hexaco",
        title: "مدل شش عاملی شخصیت (HEXACO)",
        icon: <FaUserCircle className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/hexaco",
        category: "شخصیت",
        description: "سنجش شش بعد شخصیت",
        details: `هدف ارزیابی: سنجش شش بعد شخصیت
گروه هدف: افرادی که می‌خواهند ابعاد شخصیت و سبک رفتاری خود را بهتر بشناسند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "enneagram",
        title: "تست انیاگرام",
        icon: <FaPuzzlePiece className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/enneagram",
        category: "شخصیت",
        description: "شناسایی تیپ شخصیتی انیاگرام",
        details: `هدف ارزیابی: شناسایی تیپ شخصیتی انیاگرام
گروه هدف: افرادی که می‌خواهند ابعاد شخصیت و سبک رفتاری خود را بهتر بشناسند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "disc",
        title: "تست DISC",
        icon: <FaUsers className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/disc",
        category: "شخصیت",
        description: "ارزیابی سبک رفتاری DISC",
        details: `هدف ارزیابی: ارزیابی سبک رفتاری DISC
گروه هدف: افرادی که می‌خواهند ابعاد شخصیت و سبک رفتاری خود را بهتر بشناسند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "mbti",
        title: "تست شخصیت MBTI",
        icon: <FaIdBadge className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/mbti",
        category: "شخصیت",
        description: "شناسایی تیپ شخصیتی مایرز-بریگز",
        details: `هدف ارزیابی: شناسایی تیپ شخصیتی مایرز-بریگز
گروه هدف: افرادی که می‌خواهند ابعاد شخصیت و سبک رفتاری خود را بهتر بشناسند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },

    // تست‌های استرس و تاب‌آوری
    {
        id: "pss10",
        title: "مقیاس استرس ادراک شده (PSS-10)",
        icon: <FaCloudMeatball className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/pss10",
        category: "استرس و تاب‌آوری",
        description: "سنجش استرس ادراک شده",
        details: `هدف ارزیابی: سنجش استرس ادراک شده
گروه هدف: افرادی که به دنبال مدیریت استرس و افزایش تاب‌آوری هستند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "cdrisc",
        title: "مقیاس تاب‌آوری کونور-دیویدسون (CD-RISC-10)",
        icon: <FaShieldAlt className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/cdrisc",
        category: "استرس و تاب‌آوری",
        description: "ارزیابی تاب‌آوری",
        details: `هدف ارزیابی: ارزیابی تاب‌آوری
گروه هدف: افرادی که به دنبال مدیریت استرس و افزایش تاب‌آوری هستند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "burnout",
        title: "مقیاس فرسودگی شغلی",
        icon: <FaFire className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/burnout",
        category: "استرس و تاب‌آوری",
        description: "سنجش فرسودگی شغلی",
        details: `هدف ارزیابی: سنجش فرسودگی شغلی
گروه هدف: افرادی که به دنبال مدیریت استرس و افزایش تاب‌آوری هستند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },

    // تست‌های روابط و ازدواج
    {
        id: "enrich",
        title: "مقیاس رضایت زناشویی انریچ",
        icon: <FaHeart className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/enrich",
        category: "روابط و ازدواج",
        description: "ارزیابی رضایت زناشویی",
        details: `هدف ارزیابی: ارزیابی رضایت زناشویی
گروه هدف: زوج‌ها و افرادی که می‌خواهند کیفیت روابط خود را ارزیابی کنند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "ras",
        title: "مقیاس ارزیابی روابط (RAS)",
        icon: <FaHandshake className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/ras",
        category: "روابط و ازدواج",
        description: "سنجش کیفیت روابط",
        details: `هدف ارزیابی: سنجش کیفیت روابط
گروه هدف: زوج‌ها و افرادی که می‌خواهند کیفیت روابط خود را ارزیابی کنند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "love_language",
        title: "زبان عشق",
        icon: <FaHeart className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/love_language",
        category: "روابط و ازدواج",
        description: "شناسایی زبان عشق شما",
        details: `هدف ارزیابی: شناسایی زبان عشق شما
گروه هدف: زوج‌ها و افرادی که می‌خواهند کیفیت روابط خود را ارزیابی کنند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },

    // تست‌های هوش و شناخت
    {
        id: "iq_verbal",
        title: "تست هوش کلامی",
        icon: <FaComments className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/iq_verbal",
        category: "هوش و شناخت",
        description: "ارزیابی هوش کلامی",
        details: `هدف ارزیابی: ارزیابی هوش کلامی
گروه هدف: افرادی که علاقه‌مند به شناخت توانایی‌های شناختی و ذهنی خود هستند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "iq_nonverbal",
        title: "تست هوش غیرکلامی",
        icon: <FaPuzzlePiece className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/iq_nonverbal",
        category: "هوش و شناخت",
        description: "سنجش هوش غیرکلامی",
        details: `هدف ارزیابی: سنجش هوش غیرکلامی
گروه هدف: افرادی که علاقه‌مند به شناخت توانایی‌های شناختی و ذهنی خود هستند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "critical_thinking",
        title: "تفکر انتقادی",
        icon: <FaLightbulb className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/critical_thinking",
        category: "هوش و شناخت",
        description: "ارزیابی مهارت تفکر انتقادی",
        details: `هدف ارزیابی: ارزیابی مهارت تفکر انتقادی
گروه هدف: افرادی که علاقه‌مند به شناخت توانایی‌های شناختی و ذهنی خود هستند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },

    // تست‌های سلامت روان
    {
        id: "social_anxiety",
        title: "اضطراب اجتماعی (SPIN)",
        icon: <FaUserSecret className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/social_anxiety",
        category: "سلامت روان",
        description: "سنجش اضطراب اجتماعی",
        details: `هدف ارزیابی: سنجش اضطراب اجتماعی
گروه هدف: افرادی که به سلامت روان و رشد فردی خود اهمیت می‌دهند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "ocir",
        title: "مقیاس وسواس فکری-عملی (OCI-R)",
        icon: <FaSyncAlt className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/ocir",
        category: "سلامت روان",
        description: "ارزیابی علائم وسواس",
        details: `هدف ارزیابی: ارزیابی علائم وسواس
گروه هدف: افرادی که به سلامت روان و رشد فردی خود اهمیت می‌دهند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "iat",
        title: "تست اعتیاد به اینترنت (IAT)",
        icon: <FaWifi className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/iat",
        category: "سلامت روان",
        description: "سنجش اعتیاد به اینترنت",
        details: `هدف ارزیابی: سنجش اعتیاد به اینترنت
گروه هدف: افرادی که به سلامت روان و رشد فردی خود اهمیت می‌دهند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "sleep_quality",
        title: "کیفیت خواب (PSQI)",
        icon: <FaMoon className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/sleep_quality",
        category: "سلامت روان",
        description: "ارزیابی کیفیت خواب",
        details: `هدف ارزیابی: ارزیابی کیفیت خواب
گروه هدف: افرادی که به سلامت روان و رشد فردی خود اهمیت می‌دهند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "loneliness",
        title: "احساس تنهایی (UCLA)",
        icon: <FaUserCircle className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/loneliness",
        category: "سلامت روان",
        description: "سنجش احساس تنهایی",
        details: `هدف ارزیابی: سنجش احساس تنهایی
گروه هدف: افرادی که به سلامت روان و رشد فردی خود اهمیت می‌دهند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "social_support",
        title: "حمایت اجتماعی (MSPSS)",
        icon: <FaHandsHelping className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/social_support",
        category: "سلامت روان",
        description: "ارزیابی حمایت اجتماعی",
        details: `هدف ارزیابی: ارزیابی حمایت اجتماعی
گروه هدف: افرادی که به سلامت روان و رشد فردی خود اهمیت می‌دهند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },

    // تست‌های شغلی و تحصیلی
    {
        id: "career_interests",
        title: "علایق شغلی",
        icon: <FaBriefcase className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/career_interests",
        category: "شغلی و تحصیلی",
        description: "شناسایی علایق شغلی",
        details: `هدف ارزیابی: شناسایی علایق شغلی
گروه هدف: دانشجویان و شاغلانی که به دنبال پیشرفت تحصیلی یا شغلی هستند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "leadership_style",
        title: "سبک رهبری",
        icon: <FaUserTie className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/leadership_style",
        category: "شغلی و تحصیلی",
        description: "ارزیابی سبک رهبری",
        details: `هدف ارزیابی: ارزیابی سبک رهبری
گروه هدف: دانشجویان و شاغلانی که به دنبال پیشرفت تحصیلی یا شغلی هستند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "learning_style",
        title: "سبک یادگیری",
        icon: <FaGraduationCap className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/learning_style",
        category: "شغلی و تحصیلی",
        description: "شناسایی سبک یادگیری",
        details: `هدف ارزیابی: شناسایی سبک یادگیری
گروه هدف: دانشجویان و شاغلانی که به دنبال پیشرفت تحصیلی یا شغلی هستند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },

    // تست‌های تخصصی
    {
        id: "audit",
        title: "تست AUDIT",
        icon: <FaSkullCrossbones className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/audit",
        category: "تخصصی",
        description: "ارزیابی مصرف الکل",
        details: `هدف ارزیابی: ارزیابی مصرف الکل
گروه هدف: افرادی که نیاز به ارزیابی‌های تخصصی روان‌شناختی دارند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "panas",
        title: "مقیاس عاطفه مثبت و منفی (PANAS)",
        icon: <FaBalanceScale className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/panas",
        category: "تخصصی",
        description: "سنجش عواطف مثبت و منفی",
        details: `هدف ارزیابی: سنجش عواطف مثبت و منفی
گروه هدف: افرادی که نیاز به ارزیابی‌های تخصصی روان‌شناختی دارند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "pcl5",
        title: "چک‌لیست PTSD (PCL-5)",
        icon: <FaExclamationCircle className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/pcl5",
        category: "تخصصی",
        description: "ارزیابی علائم PTSD",
        details: `هدف ارزیابی: ارزیابی علائم PTSD
گروه هدف: افرادی که نیاز به ارزیابی‌های تخصصی روان‌شناختی دارند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "asrs",
        title: "مقیاس خودگزارشی ADHD (ASRS)",
        icon: <FaRunning className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/asrs",
        category: "تخصصی",
        description: "سنجش علائم ADHD",
        details: `هدف ارزیابی: سنجش علائم ADHD
گروه هدف: افرادی که نیاز به ارزیابی‌های تخصصی روان‌شناختی دارند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "ghq12",
        title: "پرسشنامه سلامت عمومی (GHQ-12)",
        icon: <FaThermometerHalf className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/ghq12",
        category: "تخصصی",
        description: "ارزیابی سلامت روانی عمومی",
        details: `هدف ارزیابی: ارزیابی سلامت روانی عمومی
گروه هدف: افرادی که نیاز به ارزیابی‌های تخصصی روان‌شناختی دارند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "spin",
        title: "مقیاس هراس اجتماعی (SPIN)",
        icon: <FaUserSecret className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/spin",
        category: "تخصصی",
        description: "سنجش هراس اجتماعی",
        details: `هدف ارزیابی: سنجش هراس اجتماعی
گروه هدف: افرادی که نیاز به ارزیابی‌های تخصصی روان‌شناختی دارند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "bsi18",
        title: "فهرست علائم مختصر (BSI-18)",
        icon: <FaChartLine className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/bsi18",
        category: "تخصصی",
        description: "ارزیابی علائم روانی",
        details: `هدف ارزیابی: ارزیابی علائم روانی
گروه هدف: افرادی که نیاز به ارزیابی‌های تخصصی روان‌شناختی دارند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "ders",
        title: "مقیاس دشواری‌های تنظیم هیجان (DERS)",
        icon: <FaBalanceScale className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/ders",
        category: "تخصصی",
        description: "سنجش تنظیم هیجان",
        details: `هدف ارزیابی: سنجش تنظیم هیجان
گروه هدف: افرادی که نیاز به ارزیابی‌های تخصصی روان‌شناختی دارند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "isi",
        title: "شاخص شدت بی‌خوابی (ISI)",
        icon: <FaMoon className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/isi",
        category: "تخصصی",
        description: "ارزیابی شدت بی‌خوابی",
        details: `هدف ارزیابی: ارزیابی شدت بی‌خوابی
گروه هدف: افرادی که نیاز به ارزیابی‌های تخصصی روان‌شناختی دارند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "aaq2",
        title: "پرسشنامه پذیرش و عمل (AAQ-II)",
        icon: <FaHandsHelping className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/aaq2",
        category: "تخصصی",
        description: "سنجش انعطاف‌پذیری روانی",
        details: `هدف ارزیابی: سنجش انعطاف‌پذیری روانی
گروه هدف: افرادی که نیاز به ارزیابی‌های تخصصی روان‌شناختی دارند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "eat26",
        title: "تست نگرش‌های خوردن (EAT-26)",
        icon: <FaApple className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/eat26",
        category: "تخصصی",
        description: "ارزیابی نگرش‌های خوردن",
        details: `هدف ارزیابی: ارزیابی نگرش‌های خوردن
گروه هدف: افرادی که نیاز به ارزیابی‌های تخصصی روان‌شناختی دارند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "lsas",
        title: "مقیاس اضطراب اجتماعی لیبوویتز (LSAS)",
        icon: <FaUserFriends className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/lsas",
        category: "تخصصی",
        description: "سنجش اضطراب اجتماعی",
        details: `هدف ارزیابی: سنجش اضطراب اجتماعی
گروه هدف: افرادی که نیاز به ارزیابی‌های تخصصی روان‌شناختی دارند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },

    // تست‌های اضافی
    {
        id: "swls",
        title: "مقیاس رضایت از زندگی (SWLS)",
        icon: <FaSmileBeam className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/swls",
        category: "رضایت و شادی",
        description: "ارزیابی رضایت از زندگی",
        details: `هدف ارزیابی: ارزیابی رضایت از زندگی
گروه هدف: افرادی که به دنبال افزایش رضایت و شادی در زندگی هستند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "pswq",
        title: "پرسشنامه نگرانی پن‌استیت (PSWQ)",
        icon: <FaFrownOpen className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/pswq",
        category: "اضطراب و افسردگی",
        description: "سنجش نگرانی",
        details: `هدف ارزیابی: سنجش نگرانی
گروه هدف: افرادی که با علائم اضطراب یا افسردگی مواجه هستند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "scs_sf",
        title: "مقیاس شفقت به خود (SCS-SF)",
        icon: <FaHeart className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/scs_sf",
        category: "سلامت روان",
        description: "ارزیابی شفقت به خود",
        details: `هدف ارزیابی: ارزیابی شفقت به خود
گروه هدف: افرادی که به سلامت روان و رشد فردی خود اهمیت می‌دهند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "ybocs",
        title: "مقیاس وسواس ییل-براون (Y-BOCS)",
        icon: <FaSyncAlt className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/ybocs",
        category: "سلامت روان",
        description: "سنجش وسواس فکری-عملی",
        details: `هدف ارزیابی: سنجش وسواس فکری-عملی
گروه هدف: افرادی که به سلامت روان و رشد فردی خود اهمیت می‌دهند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "sociopathy_traits",
        title: "ویژگی‌های جامعه‌ستیزی",
        icon: <FaSkullCrossbones className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/sociopathy_traits",
        category: "شخصیت",
        description: "ارزیابی ویژگی‌های جامعه‌ستیزی",
        details: `هدف ارزیابی: ارزیابی ویژگی‌های جامعه‌ستیزی
گروه هدف: افرادی که می‌خواهند ابعاد شخصیت و سبک رفتاری خود را بهتر بشناسند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "spas",
        title: "مقیاس اضطراب اجتماعی (SPAS)",
        icon: <FaUserSecret className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/spas",
        category: "سلامت روان",
        description: "سنجش اضطراب اجتماعی",
        details: `هدف ارزیابی: سنجش اضطراب اجتماعی
گروه هدف: افرادی که به سلامت روان و رشد فردی خود اهمیت می‌دهند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "spi",
        title: "مقیاس شخصیت اجتماعی (SPI)",
        icon: <FaUsers className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/spi",
        category: "شخصیت",
        description: "ارزیابی شخصیت اجتماعی",
        details: `هدف ارزیابی: ارزیابی شخصیت اجتماعی
گروه هدف: افرادی که می‌خواهند ابعاد شخصیت و سبک رفتاری خود را بهتر بشناسند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "spindineremotionalbalance",
        title: "تعادل عاطفی اسپین دینر",
        icon: <FaBalanceScale className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/spindineremotionalbalance",
        category: "سلامت روان",
        description: "سنجش تعادل عاطفی",
        details: `هدف ارزیابی: سنجش تعادل عاطفی
گروه هدف: افرادی که به سلامت روان و رشد فردی خود اهمیت می‌دهند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "steinmetz",
        title: "استرس شغلی استاینمتز",
        icon: <FaCloudMeatball className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/steinmetz",
        category: "استرس و تاب‌آوری",
        description: "ارزیابی استرس شغلی",
        details: `هدف ارزیابی: ارزیابی استرس شغلی
گروه هدف: افرادی که به دنبال مدیریت استرس و افزایش تاب‌آوری هستند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "steinmetz_job_stress",
        title: "استرس شغلی استاینمتز (تخصصی)",
        icon: <FaCloudMeatball className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/steinmetz_job_stress",
        category: "استرس و تاب‌آوری",
        description: "ارزیابی تخصصی استرس شغلی",
        details: `هدف ارزیابی: ارزیابی تخصصی استرس شغلی
گروه هدف: افرادی که به دنبال مدیریت استرس و افزایش تاب‌آوری هستند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "stress_level",
        title: "سطح استرس",
        icon: <FaExclamationTriangle className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/stress_level",
        category: "استرس و تاب‌آوری",
        description: "ارزیابی سطح استرس عمومی",
        details: `هدف ارزیابی: ارزیابی سطح استرس عمومی
گروه هدف: افرادی که به دنبال مدیریت استرس و افزایش تاب‌آوری هستند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "study_habits",
        title: "عادت‌های مطالعه",
        icon: <FaBook className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/study_habits",
        category: "آموزش و یادگیری",
        description: "ارزیابی عادت‌های مطالعه مؤثر",
        details: `هدف ارزیابی: ارزیابی عادت‌های مطالعه مؤثر
گروه هدف: افرادی که می‌خواهند سبک یادگیری و مهارت‌های آموزشی خود را بهبود دهند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "team_role",
        title: "نقش تیمی",
        icon: <FaUsers className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/team_role",
        category: "شغلی و تحصیلی",
        description: "ارزیابی نقش و عملکرد در تیم",
        details: `هدف ارزیابی: ارزیابی نقش و عملکرد در تیم
گروه هدف: دانشجویان و شاغلانی که به دنبال پیشرفت تحصیلی یا شغلی هستند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "ticket",
        title: "مهارت خرید بلیط",
        icon: <FaTicketAlt className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/ticket",
        category: "مهارت‌های زندگی",
        description: "ارزیابی مهارت خرید و مدیریت بلیط",
        details: `هدف ارزیابی: ارزیابی مهارت خرید و مدیریت بلیط
گروه هدف: افرادی که می‌خواهند مهارت‌های عملی و روزمره خود را تقویت کنند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "time_management",
        title: "مدیریت زمان",
        icon: <FaClock className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/time_management",
        category: "مهارت‌های زندگی",
        description: "ارزیابی مهارت مدیریت زمان و برنامه‌ریزی",
        details: `هدف ارزیابی: ارزیابی مهارت مدیریت زمان و برنامه‌ریزی
گروه هدف: افرادی که می‌خواهند مهارت‌های عملی و روزمره خود را تقویت کنند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "trauma_symptoms",
        title: "علائم تروما",
        icon: <FaHeartBroken className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/trauma_symptoms",
        category: "تخصصی",
        description: "ارزیابی علائم تروما و PTSD",
        details: `هدف ارزیابی: ارزیابی علائم تروما و PTSD
گروه هدف: افرادی که نیاز به ارزیابی‌های تخصصی روان‌شناختی دارند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "trust",
        title: "اعتماد",
        icon: <FaHandshake className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/trust",
        category: "روابط اجتماعی",
        description: "ارزیابی سطح اعتماد به دیگران",
        details: `هدف ارزیابی: ارزیابی سطح اعتماد به دیگران
گروه هدف: افرادی که می‌خواهند مهارت‌های تعامل و ارتباط اجتماعی خود را بهبود دهند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
    {
        id: "ttct",
        title: "تست خلاقیت تورنس",
        icon: <FaLightbulb className="size-6 text-primaryThemeColor" />,
        link: "/user/tests/ttct",
        category: "آموزش و یادگیری",
        description: "ارزیابی سطح خلاقیت و تفکر خلاقانه",
        details: `هدف ارزیابی: ارزیابی سطح خلاقیت و تفکر خلاقانه
گروه هدف: افرادی که می‌خواهند سبک یادگیری و مهارت‌های آموزشی خود را بهبود دهند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
  {
    id: "tyl",
    title: "تست انگیزه و محدودیت‌ها",
    icon: <FaRocket className="size-6 text-primaryThemeColor" />,
    link: "/user/tests/tyl",
    category: "انگیزه و موفقیت",
        description: "ارزیابی انگیزه و تمایل به رسیدن به اهداف",
        details: `هدف ارزیابی: ارزیابی انگیزه و تمایل به رسیدن به اهداف
گروه هدف: افرادی که به دنبال افزایش انگیزه و دستیابی به اهداف شخصی هستند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
  },
  {id:"16pf",title:"16 عامل شخصیتی",icon:<FaBrain className="size-6 text-primaryThemeColor"/>,link:"/user/tests/16pf",category: "شخصیت",
        description: "ارزیابی 16 عامل شخصیتی کتل",
        details: `هدف ارزیابی: ارزیابی 16 عامل شخصیتی کتل
گروه هدف: افرادی که می‌خواهند ابعاد شخصیت و سبک رفتاری خود را بهتر بشناسند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,},
  {id:"abs",title:"رفتار تطبیقی",icon:<FaBrain className="size-6 text-primaryThemeColor"/>,link:"/user/tests/abs",category: "تخصصی",
        description: "ارزیابی رفتار سازگارانه",
        details: `هدف ارزیابی: ارزیابی رفتار سازگارانه
گروه هدف: افرادی که نیاز به ارزیابی‌های تخصصی روان‌شناختی دارند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,},
  {id:"academic_motivation",title:"انگیزه تحصیلی",icon:<FaGraduationCap className="size-6 text-primaryThemeColor"/>,link:"/user/tests/academic_motivation",category: "آموزش و یادگیری",
        description: "سنجش انگیزه در تحصیل",
        details: `هدف ارزیابی: سنجش انگیزه در تحصیل
گروه هدف: افرادی که می‌خواهند سبک یادگیری و مهارت‌های آموزشی خود را بهبود دهند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,},
  {id:"acs",title:"سبک‌های مقابله",icon:<FaShieldAlt className="size-6 text-primaryThemeColor"/>,link:"/user/tests/acs",category: "استرس و تاب‌آوری",
        description: "ارزیابی روش‌های مقابله با استرس",
        details: `هدف ارزیابی: ارزیابی روش‌های مقابله با استرس
گروه هدف: افرادی که به دنبال مدیریت استرس و افزایش تاب‌آوری هستند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,},
  {id:"addiction_risk",title:"خطر اعتیاد",icon:<FaExclamationTriangle className="size-6 text-primaryThemeColor"/>,link:"/user/tests/addiction_risk",category: "تخصصی",
        description: "ارزیابی خطر وابستگی",
        details: `هدف ارزیابی: ارزیابی خطر وابستگی
گروه هدف: افرادی که نیاز به ارزیابی‌های تخصصی روان‌شناختی دارند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,},
  {id:"adhd_symptoms",title:"علائم ADHD",icon:<FaBolt className="size-6 text-primaryThemeColor"/>,link:"/user/tests/adhd_symptoms",category: "تخصصی",
        description: "غربالگری بیش‌فعالی و نقص توجه",
        details: `هدف ارزیابی: غربالگری بیش‌فعالی و نقص توجه
گروه هدف: افرادی که نیاز به ارزیابی‌های تخصصی روان‌شناختی دارند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,},
  {id:"aggression",title:"پرخاشگری",icon:<FaAngry className="size-6 text-primaryThemeColor"/>,link:"/user/tests/aggression",category: "سلامت روان",
        description: "سنجش سطح پرخاشگری",
        details: `هدف ارزیابی: سنجش سطح پرخاشگری
گروه هدف: افرادی که به سلامت روان و رشد فردی خود اهمیت می‌دهند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,},
  {id:"anger_management",title:"مدیریت خشم",icon:<FaAngry className="size-6 text-primaryThemeColor"/>,link:"/user/tests/anger_management",category: "سلامت روان",
        description: "ارزیابی کنترل خشم",
        details: `هدف ارزیابی: ارزیابی کنترل خشم
گروه هدف: افرادی که به سلامت روان و رشد فردی خود اهمیت می‌دهند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,},
  {id:"appq",title:"اضطراب بارداری",icon:<FaBaby className="size-6 text-primaryThemeColor"/>,link:"/user/tests/appq",category: "تخصصی",
        description: "سنجش اضطراب دوران بارداری",
        details: `هدف ارزیابی: سنجش اضطراب دوران بارداری
گروه هدف: افرادی که نیاز به ارزیابی‌های تخصصی روان‌شناختی دارند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,},
  {id:"aq",title:"طیف اتیسم",icon:<FaPuzzlePiece className="size-6 text-primaryThemeColor"/>,link:"/user/tests/aq",category: "تخصصی",
        description: "ارزیابی ویژگی‌های اتیستیک",
        details: `هدف ارزیابی: ارزیابی ویژگی‌های اتیستیک
گروه هدف: افرادی که نیاز به ارزیابی‌های تخصصی روان‌شناختی دارند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,},
  {id:"asrs",title:"ASRS",icon:<FaBolt className="size-6 text-primaryThemeColor"/>,link:"/user/tests/asrs",category: "تخصصی",
        description: "غربالگری ADHD بزرگسالان",
        details: `هدف ارزیابی: غربالگری ADHD بزرگسالان
گروه هدف: افرادی که نیاز به ارزیابی‌های تخصصی روان‌شناختی دارند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,},
  {id:"atq",title:"افکار خودکار",icon:<FaBrain className="size-6 text-primaryThemeColor"/>,link:"/user/tests/atq",category: "سلامت روان",
        description: "سنجش افکار خودکار منفی",
        details: `هدف ارزیابی: سنجش افکار خودکار منفی
گروه هدف: افرادی که به سلامت روان و رشد فردی خود اهمیت می‌دهند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,},
  {id:"attachment_style",title:"سبک دلبستگی",icon:<FaHeart className="size-6 text-primaryThemeColor"/>,link:"/user/tests/attachment_style",category: "روابط و ازدواج",
        description: "ارزیابی سبک دلبستگی",
        details: `هدف ارزیابی: ارزیابی سبک دلبستگی
گروه هدف: زوج‌ها و افرادی که می‌خواهند کیفیت روابط خود را ارزیابی کنند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,},
  {id:"attention_divided",title:"توجه تقسیم‌شده",icon:<FaEye className="size-6 text-primaryThemeColor"/>,link:"/user/tests/attention_divided",category: "هوش و شناخت",
        description: "سنجش توجه چندوظیفه‌ای",
        details: `هدف ارزیابی: سنجش توجه چندوظیفه‌ای
گروه هدف: افرادی که علاقه‌مند به شناخت توانایی‌های شناختی و ذهنی خود هستند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,},
  {id:"attention_sustained",title:"توجه پایدار",icon:<FaEye className="size-6 text-primaryThemeColor"/>,link:"/user/tests/attention_sustained",category: "هوش و شناخت",
        description: "سنجش تمرکز طولانی‌مدت",
        details: `هدف ارزیابی: سنجش تمرکز طولانی‌مدت
گروه هدف: افرادی که علاقه‌مند به شناخت توانایی‌های شناختی و ذهنی خود هستند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,},
  {id:"autism_spectrum",title:"طیف اتیسم",icon:<FaPuzzlePiece className="size-6 text-primaryThemeColor"/>,link:"/user/tests/autism_spectrum",category: "تخصصی",
        description: "غربالگری اختلال طیف اتیسم",
        details: `هدف ارزیابی: غربالگری اختلال طیف اتیسم
گروه هدف: افرادی که نیاز به ارزیابی‌های تخصصی روان‌شناختی دارند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,},
  {id:"beck_hopelessness",title:"ناامیدی بک",icon:<FaSadTear className="size-6 text-primaryThemeColor"/>,link:"/user/tests/beck_hopelessness",category: "اضطراب و افسردگی",
        description: "سنجش سطح ناامیدی",
        details: `هدف ارزیابی: سنجش سطح ناامیدی
گروه هدف: افرادی که با علائم اضطراب یا افسردگی مواجه هستند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,},
  {id:"bell",title:"بل",icon:<FaBrain className="size-6 text-primaryThemeColor"/>,link:"/user/tests/bell",category: "تخصصی",
        description: "ارزیابی تخصصی",
        details: `هدف ارزیابی: ارزیابی تخصصی
گروه هدف: افرادی که نیاز به ارزیابی‌های تخصصی روان‌شناختی دارند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,},
  {id:"berzonsky",title:"هویت برزونسکی",icon:<FaUserCircle className="size-6 text-primaryThemeColor"/>,link:"/user/tests/berzonsky",category: "شخصیت",
        description: "سبک‌های هویت",
        details: `هدف ارزیابی: سبک‌های هویت
گروه هدف: افرادی که می‌خواهند ابعاد شخصیت و سبک رفتاری خود را بهتر بشناسند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,},
  {id:"berzonsky_identity",title:"هویت",icon:<FaUserCircle className="size-6 text-primaryThemeColor"/>,link:"/user/tests/berzonsky_identity",category: "شخصیت",
        description: "ارزیابی هویت",
        details: `هدف ارزیابی: ارزیابی هویت
گروه هدف: افرادی که می‌خواهند ابعاد شخصیت و سبک رفتاری خود را بهتر بشناسند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,},
  {id:"bipolar_symptoms",title:"علائم دوقطبی",icon:<FaSyncAlt className="size-6 text-primaryThemeColor"/>,link:"/user/tests/bipolar_symptoms",category: "تخصصی",
        description: "غربالگری اختلال دوقطبی",
        details: `هدف ارزیابی: غربالگری اختلال دوقطبی
گروه هدف: افرادی که نیاز به ارزیابی‌های تخصصی روان‌شناختی دارند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,},
  {id:"borderline_personality",title:"شخصیت مرزی",icon:<FaUserSecret className="size-6 text-primaryThemeColor"/>,link:"/user/tests/borderline_personality",category: "تخصصی",
        description: "ارزیابی BPD",
        details: `هدف ارزیابی: ارزیابی BPD
گروه هدف: افرادی که نیاز به ارزیابی‌های تخصصی روان‌شناختی دارند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,},
  {id:"bsi18",title:"BSI-18",icon:<FaBrain className="size-6 text-primaryThemeColor"/>,link:"/user/tests/bsi18",category: "سلامت روان",
        description: "شاخص کوتاه علائم",
        details: `هدف ارزیابی: شاخص کوتاه علائم
گروه هدف: افرادی که به سلامت روان و رشد فردی خود اهمیت می‌دهند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,},
  {id:"burnout",title:"فرسودگی شغلی",icon:<FaFire className="size-6 text-primaryThemeColor"/>,link:"/user/tests/burnout",category: "شغلی و تحصیلی",
        description: "سنجش فرسودگی شغلی",
        details: `هدف ارزیابی: سنجش فرسودگی شغلی
گروه هدف: دانشجویان و شاغلانی که به دنبال پیشرفت تحصیلی یا شغلی هستند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,},
  {id:"capt",title:"CAPT",icon:<FaBrain className="size-6 text-primaryThemeColor"/>,link:"/user/tests/capt",category: "هوش و شناخت",
        description: "ارزیابی شناختی",
        details: `هدف ارزیابی: ارزیابی شناختی
گروه هدف: افرادی که علاقه‌مند به شناخت توانایی‌های شناختی و ذهنی خود هستند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,},
  {id:"caq",title:"CAQ",icon:<FaBrain className="size-6 text-primaryThemeColor"/>,link:"/user/tests/caq",category: "تخصصی",
        description: "پرسشنامه تخصصی",
        details: `هدف ارزیابی: پرسشنامه تخصصی
گروه هدف: افرادی که نیاز به ارزیابی‌های تخصصی روان‌شناختی دارند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,},
  {id:"career_interests",title:"علایق شغلی",icon:<FaBriefcase className="size-6 text-primaryThemeColor"/>,link:"/user/tests/career_interests",category: "شغلی و تحصیلی",
        description: "شناسایی علایق شغلی",
        details: `هدف ارزیابی: شناسایی علایق شغلی
گروه هدف: دانشجویان و شاغلانی که به دنبال پیشرفت تحصیلی یا شغلی هستند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,},
  {id:"career_skills",title:"مهارت‌های شغلی",icon:<FaBriefcase className="size-6 text-primaryThemeColor"/>,link:"/user/tests/career_skills",category: "شغلی و تحصیلی",
        description: "ارزیابی مهارت‌های شغلی",
        details: `هدف ارزیابی: ارزیابی مهارت‌های شغلی
گروه هدف: دانشجویان و شاغلانی که به دنبال پیشرفت تحصیلی یا شغلی هستند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,},
  {id:"career_values",title:"ارزش‌های شغلی",icon:<FaBriefcase className="size-6 text-primaryThemeColor"/>,link:"/user/tests/career_values",category: "شغلی و تحصیلی",
        description: "شناسایی ارزش‌های کاری",
        details: `هدف ارزیابی: شناسایی ارزش‌های کاری
گروه هدف: دانشجویان و شاغلانی که به دنبال پیشرفت تحصیلی یا شغلی هستند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,},
  {id:"cdrisc",title:"تاب‌آوری",icon:<FaShieldAlt className="size-6 text-primaryThemeColor"/>,link:"/user/tests/cdrisc",category: "استرس و تاب‌آوری",
        description: "سنجش تاب‌آوری",
        details: `هدف ارزیابی: سنجش تاب‌آوری
گروه هدف: افرادی که به دنبال مدیریت استرس و افزایش تاب‌آوری هستند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,},
  {id:"ciss",title:"سبک‌های مقابله",icon:<FaShieldAlt className="size-6 text-primaryThemeColor"/>,link:"/user/tests/ciss",category: "استرس و تاب‌آوری",
        description: "روش‌های مقابله با استرس",
        details: `هدف ارزیابی: روش‌های مقابله با استرس
گروه هدف: افرادی که به دنبال مدیریت استرس و افزایش تاب‌آوری هستند
زمان تقریبی تکمیل: ۷ تا ۱۰ دقیقه
نحوه دریافت نتیجه: بازخورد فوری پس از اتمام آزمون`,
    },
];

export const testCategories = [
    "همه",
    "اضطراب و افسردگی",
    "شخصیت",
    "استرس و تاب‌آوری",
    "روابط و ازدواج",
    "هوش و شناخت",
    "سلامت روان",
    "شغلی و تحصیلی",
    "تخصصی",
    "رضایت و شادی",
    "آموزش و یادگیری",
    "مهارت‌های زندگی",
    "روابط اجتماعی",
    "انگیزه و موفقیت"
];