"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaHeartBroken } from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import { useTestResult } from "@/hooks/useTestResult";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TestPage = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("emotional_divorce");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = useMemo(() => [
    "احساس جدایی عاطفی از همسرم می‌کنم",
    "دیگر احساسات عمیق به همسرم ندارم",
    "صحبت کردن با همسرم سخت است",
    "از صمیمیت اجتناب می‌کنم",
    "احساس تنهایی در رابطه می‌کنم",
    "علاقه به فعالیت‌های مشترک ندارم",
    "احساس می‌کنم همسرم مرا نمی‌فهمد",
    "بیشتر زمان را جدا می‌گذرانیم",
    "دیگر نیازها و خواسته‌هایمان مشترک نیست",
    "احساس بی‌تفاوتی می‌کنم",
    "مشکلات را با همسرم در میان نمی‌گذارم",
    "دیگر رویاهای مشترک نداریم",
    "احساس می‌کنم غریبه‌ایم",
    "تعارضات حل نشده زیاد است",
    "اعتماد از بین رفته",
    "احترام متقابل کم شده",
    "فکر می‌کنم به جدایی",
    "احساس می‌کنم رابطه به پایان رسیده"
  ], []);

  const options = useMemo(() => [
    { value: 1, label: "هرگز" },
    { value: 2, label: "به ندرت" },
    { value: 3, label: "گاهی" },
    { value: 4, label: "اغلب" },
    { value: 5, label: "همیشه" }
  ], []);

  // بررسی نتیجه قبلی
  useEffect(() => {
    if (hasResult && previousResult && !resultLoading) {
      setIsCompleted(true);
    }
  }, [hasResult, previousResult, resultLoading]);


  const handleAnswer = (value) => {
    setAnswers({ ...answers, [currentQuestion]: value });
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const calculateScore = () => {
    return Object.values(answers).reduce((sum, score) => sum + score, 0);
  };

  // ذخیره نتیجه بعد از تکمیل
  useEffect(() => {
    const saveResultToServer = async () => {
      if (isCompleted && !hasResult && Object.keys(answers).length === questions.length) {
        
        const score = calculateScore();
        const interpretation = getInterpretation(score);

        
        try {
          // تبدیل answers به آرایه
          const answersArray = questions.map((q, idx) => { const answer = answers[idx]; return answer !== undefined ? answer : 0; });

          const saved = await saveResult({
            answers: answersArray,
            totalScore: score,
            total_score: score,
            level: interpretation.level,
            interpretation: interpretation,
          });
          
          if (saved && saved.success) {
            setSavedScore(score);
            setIsCompleted(true);
          }
        } catch (error) {
          console.error("Error saving result:", error);
        }
      }
    };

    saveResultToServer();
  }, [isCompleted, hasResult, answers, questions, saveResult]);


  const getInterpretation = (score) => {
    if (score <= 27) {
      return {
        level: "رابطه سالم",
        color: "#22c55e",
        desc: "رابطه زناشویی شما در وضعیت سالم و مطلوبی قرار دارد. ارتباط عاطفی قوی و سالمی با همسرتان دارید.",
        details: "نمره شما نشان می‌دهد که رابطه شما از نظر عاطفی، ارتباطی و صمیمیت در وضعیت مطلوبی است. شما و همسرتان همچنان به یکدیگر متصل هستید و رابطه‌ای سالم و پایدار دارید.",
        strengths: [
          "ارتباط عاطفی قوی و سالم",
          "صمیمیت و نزدیکی مناسب",
          "ارتباطات باز و صادقانه",
          "اعتماد و احترام متقابل",
          "فعالیت‌ها و اهداف مشترک",
          "حل سازنده تعارضات"
        ],
        recommendations: [
          "حفظ و تقویت ارتباطات فعلی",
          "اختصاص زمان کیفی به همدیگر",
          "ابراز محبت و قدردانی منظم",
          "تقویت مهارت‌های ارتباطی",
          "برنامه‌ریزی برای فعالیت‌های مشترک",
          "شرکت در دوره‌های آموزشی زوج‌درمانی پیشگیرانه"
        ]
      };
    } else if (score <= 45) {
      return {
        level: "نشانه‌های اولیه فاصله عاطفی",
        color: "#eab308",
        desc: "برخی نشانه‌های اولیه فاصله عاطفی در رابطه شما مشاهده می‌شود. این مرحله قابل بازگشت است با تلاش دوطرفه.",
        details: "شما شروع به تجربه برخی مشکلات در ارتباط عاطفی با همسرتان کرده‌اید. این نشانه‌های اولیه اگر نادیده گرفته شوند، می‌توانند به مشکلات جدی‌تری تبدیل شوند. اکنون بهترین زمان برای اقدام و بهبود رابطه است.",
        strengths: [
          "آگاهی از وجود مشکل",
          "امکان بازگشت به وضعیت سالم",
          "برخی جنبه‌های مثبت هنوز باقی است",
          "انگیزه برای بهبود"
        ],
        recommendations: [
          "مشاوره زوج‌درمانی برای حل مشکلات",
          "افزایش زمان صرف شده با همدیگر",
          "بهبود مهارت‌های گوش دادن فعال",
          "ابراز احساسات و نیازها به صورت صادقانه",
          "تلاش برای درک دیدگاه همسر",
          "ایجاد فعالیت‌های لذت‌بخش مشترک"
        ]
      };
    } else if (score <= 63) {
      return {
        level: "فاصله عاطفی قابل توجه",
        color: "#f59e0b",
        desc: "فاصله عاطفی قابل توجهی در رابطه شما ایجاد شده است. مداخله حرفه‌ای ضروری است.",
        details: "رابطه شما دچار فاصله عاطفی جدی شده است. ارتباطات، صمیمیت و اعتماد به شدت کاهش یافته و ممکن است احساس کنید با غریبه‌ای زندگی می‌کنید. این وضعیت نیازمند توجه فوری و مداخله حرفه‌ای است.",
        strengths: [
          "هنوز امکان بازسازی رابطه وجود دارد",
          "آگاهی از شدت مشکل",
          "برخی روابط همچنان برقرار است"
        ],
        recommendations: [
          "مراجعه فوری به زوج‌درمانگر متخصص",
          "شرکت در دوره‌های آموزشی مهارت‌های زناشویی",
          "تعهد دوطرفه به بهبود رابطه",
          "کاهش منابع استرس خارجی",
          "ایجاد فضای امن برای گفتگو",
          "تمرین بخشش و پذیرش",
          "بازنگری در انتظارات و نیازها"
        ]
      };
    } else if (score <= 72) {
      return {
        level: "فاصله عاطفی شدید",
        color: "#ef4444",
        desc: "فاصله عاطفی بسیار شدیدی در رابطه شما وجود دارد. وضعیت بحرانی است و نیازمند مداخله فوری حرفه‌ای.",
        details: "رابطه شما در وضعیت بحرانی قرار دارد. تقریباً تمام جنبه‌های عاطفی، ارتباطی و صمیمیت در رابطه شما دچار مشکل جدی شده است. بدون مداخله حرفه‌ای و تلاش جدی دوطرفه، احتمال بهبود بسیار کم است.",
        strengths: [
          "شناخت از وضعیت بحرانی رابطه",
          "امکان تصمیم‌گیری آگاهانه",
          "فرصت برای ارزیابی دوباره رابطه"
        ],
        recommendations: [
          "مراجعه فوری به زوج‌درمانگر باتجربه",
          "ارزیابی جدی ادامه یا پایان رابطه",
          "مشاوره فردی برای هر دو طرف",
          "در صورت تصمیم به ادامه: تعهد کامل به درمان",
          "در صورت تصمیم به جدایی: مشاوره برای فرآیند سالم جدایی",
          "توجه به سلامت روانی خود و فرزندان (در صورت وجود)",
          "جستجوی حمایت اجتماعی و خانوادگی"
        ]
      };
    } else {
      return {
        level: "طلاق عاطفی کامل",
        color: "#dc2626",
        desc: "شما در وضعیت طلاق عاطفی کامل قرار دارید. رابطه عاطفی شما با همسرتان عملاً به پایان رسیده است.",
        details: "نمره شما نشان می‌دهد که رابطه عاطفی شما با همسرتان کاملاً قطع شده است. در این وضعیت، شما و همسرتان علی‌رغم زندگی مشترک، هیچ ارتباط عاطفی معناداری ندارید. این وضعیت می‌تواند تأثیرات روانی شدیدی بر هر دو طرف و فرزندان داشته باشد.",
        strengths: [
          "وضوح در شناخت وضعیت رابطه",
          "آمادگی برای تصمیم‌گیری مهم",
          "فرصت برای شروع مجدد زندگی"
        ],
        recommendations: [
          "مشاوره فوری با زوج‌درمانگر برای ارزیابی امکان بازسازی",
          "مشاوره حقوقی در صورت تصمیم به جدایی",
          "روان‌درمانی فردی برای پردازش احساسات",
          "حمایت روانی برای فرزندان (در صورت وجود)",
          "برنامه‌ریزی برای آینده (با یا بدون همسر)",
          "توجه ویژه به سلامت روان و جسم خود",
          "جستجوی حمایت از دوستان و خانواده",
          "پرهیز از تصمیمات هیجانی و عجولانه"
        ]
      };
    }
  };

  // نمایش loading
  if (resultLoading) {
    return (
      <div className="w-full flex flex-col items-center min-h-screen justify-center">
        <div className="text-primaryTextColor">در حال بررسی...</div>
      </div>
    );
  }


  if (isCompleted) {
    // استفاده از نمره ذخیره شده یا محاسبه شده
    const score = savedScore !== null ? savedScore : (previousResult?.total_score !== undefined ? previousResult.total_score : calculateScore());
    const interpretation = getInterpretation(score);

    const chartData = {
      labels: ["نمره شما", "حداقل", "متوسط", "حداکثر"],
      datasets: [
        {
          label: "طلاق عاطفی",
          data: [score, 18, 45, 90],
          backgroundColor: ["#3b82f6", "#22c55e", "#eab308", "#dc2626"],
          borderColor: ["#2563eb", "#16a34a", "#ca8a04", "#b91c1c"],
          borderWidth: 2
        }
      ]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "مقایسه نمره شما با محدوده‌های مختلف",
          font: { size: 14, family: "Vazirmatn" },
          color: "#e2e8f0"
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 90,
          ticks: { color: "#94a3b8", font: { family: "Vazirmatn" } },
          grid: { color: "#334155" }
        },
        x: {
          ticks: { color: "#94a3b8", font: { family: "Vazirmatn" } },
          grid: { color: "#334155" }
        }
      }
    };

    return (
      <div className="w-full flex flex-col items-center">
        <Header />
        <MobileHeader />
        <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
          <Sidebar />
          <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="size-16 rounded-2xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20">
                <FaHeartBroken className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست طلاق عاطفی</h1>
                <p className="text-secondaryTextColor">تحلیل وضعیت رابطه زناشویی شما</p>
              </div>
            </div>

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
              <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>
                {score} از 90
              </div>
              <div className="text-lg font-semibold" style={{ color: interpretation.color }}>
                {interpretation.level}
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">توضیحات</h3>
              <p className="text-secondaryTextColor leading-relaxed mb-4">{interpretation.desc}</p>
              <p className="text-secondaryTextColor leading-relaxed">{interpretation.details}</p>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">نقاط قوت</h3>
              <ul className="list-disc list-inside space-y-2 text-secondaryTextColor">
                {interpretation.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">توصیه‌ها</h3>
              <ul className="list-disc list-inside space-y-2 text-secondaryTextColor">
                {interpretation.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">نمودار مقایسه‌ای</h3>
              <div style={{ height: "300px" }}>
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>

            <button
              onClick={() => {
                setCurrentQuestion(0);
                setAnswers({});
                setIsCompleted(false);
              }}
              className="w-full h-12 bg-primaryThemeColor text-white rounded-xl font-medium hover:bg-primaryThemeColor/90 transition-colors"
            >
              انجام مجدد تست
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      <Header />
      <MobileHeader />
      <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
        <Sidebar />
        <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="size-16 rounded-2xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20">
              <FaHeartBroken className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">تست طلاق عاطفی</h1>
              <p className="text-secondaryTextColor">سوال {currentQuestion + 1} از {questions.length}</p>
            </div>
          </div>

          <div className="w-full bg-darkThemeColor rounded-2xl p-6">
            <h3 
              key={`question-text-${currentQuestion}`}
              className="text-xl font-bold text-primaryThemeColor mb-6"
              style={{
                opacity: 0,
                animation: `questionTextSlideIn 0.5s ease-out 0.2s forwards`,
                animationFillMode: 'forwards',
              }}
            >
              {questions[currentQuestion]}
            </h3>
            <div className="space-y-3">
              {options.map((option, index) => (
                <button
                  key={`${currentQuestion}-${option.value}`}
                  onClick={() => handleAnswer(option.value)}
                  className="w-full p-4 text-right bg-secondaryThemeColor hover:bg-primaryThemeColor/10 rounded-xl border border-borderColor hover:border-primaryThemeColor/40 transition-all"
                >
                  <span className="text-primaryTextColor font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="w-full bg-darkThemeColor rounded-2xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-secondaryTextColor">
                پیشرفت: {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
              </span>
            </div>
            <div className="w-full h-2 bg-secondaryThemeColor rounded-full overflow-hidden">
              <div
                className="h-full bg-primaryThemeColor rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TestPage;
