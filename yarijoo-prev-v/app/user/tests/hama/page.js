"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaExclamationTriangle } from "react-icons/fa";
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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("hama");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = useMemo(() => [
    "خلق مضطرب/نگران",
    "تنش و بی‌قراری",
    "ترس‌ها (عمومی/خاص)",
    "اختلالات خواب مرتبط با اضطراب",
    "اشکالات تمرکز و حافظه",
    "خلق افسرده همراه اضطراب",
    "شکایات جسمی: عضلانی (گرفتگی/درد)",
    "شکایات جسمی: حسی (کرختی/گزگز)",
    "علائم قلبی-عروقی (تپش، تنگی سینه)",
    "علائم تنفسی (تنگی نفس)",
    "علائم گوارشی (تهوع/دل‌پیچه)",
    "علائم ادراری/ژنتیک مرتبط با اضطراب",
    "علائم خودمختار (تعریق/خشکی دهان)",
    "رفتار مشاهده‌ای (بی‌قراری، تنش ظاهری)"
  ], []);

  const options = useMemo(() => [
    { value: 0, label: "هیچ" },
    { value: 1, label: "خفیف" },
    { value: 2, label: "متوسط" },
    { value: 3, label: "شدید" },
    { value: 4, label: "بسیار شدید" }
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
    if (score <= 7) {
      return {
        level: "بدون اضطراب",
        color: "#22c55e",
        desc: "شما علائم اضطراب ندارید. سطح اضطراب شما در محدوده طبیعی قرار دارد.",
        details: "نمره شما نشان می‌دهد که علائم بالینی اضطراب در شما وجود ندارد. شما از نظر روانی و جسمی در وضعیت سالمی قرار دارید و اضطراب به طور قابل توجهی زندگی شما را مختل نمی‌کند.",
        strengths: [
          "سلامت روانی مناسب",
          "کنترل خوب استرس",
          "خواب مناسب",
          "عملکرد شناختی سالم",
          "فقدان علائم جسمانی اضطراب",
          "آرامش نسبی"
        ],
        recommendations: [
          "حفظ سبک زندگی سالم فعلی",
          "ادامه مهارت‌های مدیریت استرس",
          "ورزش منظم",
          "خواب کافی و با کیفیت",
          "تغذیه متعادل",
          "روابط اجتماعی مثبت",
          "تمرینات ذهن‌آگاهی برای پیشگیری"
        ]
      };
    } else if (score <= 14) {
      return {
        level: "اضطراب خفیف",
        color: "#eab308",
        desc: "علائم خفیفی از اضطراب در شما مشاهده می‌شود. این سطح معمولاً با استرس‌های روزمره همراه است.",
        details: "شما علائم خفیفی از اضطراب دارید که ممکن است با استرس‌های زندگی روزمره مرتبط باشد. این سطح معمولاً با تکنیک‌های آرام‌سازی و مدیریت استرس قابل کنترل است.",
        strengths: [
          "آگاهی از علائم اضطراب",
          "سطح قابل کنترل",
          "امکان بهبود با مداخلات ساده",
          "برخی جنبه‌های عملکردی سالم"
        ],
        recommendations: [
          "آموزش تکنیک‌های تنفس عمیق",
          "تمرینات آرام‌سازی عضلانی پیشرونده",
          "ورزش هوازی منظم",
          "کاهش کافئین و محرک‌ها",
          "بهبود کیفیت خواب",
          "مدیریت استرس‌زاها",
          "مشاوره در صورت تداوم علائم"
        ]
      };
    } else if (score <= 21) {
      return {
        level: "اضطراب متوسط",
        color: "#f59e0b",
        desc: "شما اضطراب متوسطی را تجربه می‌کنید که شروع به تأثیرگذاری بر عملکرد روزمره شما کرده است.",
        details: "علائم اضطراب شما هم جنبه‌های روانی (نگرانی، تنش) و هم جسمانی (تپش قلب، مشکلات گوارشی، عضلانی) را شامل می‌شود. این سطح نیاز به مداخله حرفه‌ای دارد.",
        strengths: [
          "شناخت نیاز به کمک",
          "توانایی عملکرد با وجود اضطراب",
          "انگیزه برای بهبود"
        ],
        recommendations: [
          "مشاوره با روان‌شناس برای شناخت‌درمانی-رفتاری (CBT)",
          "آموزش مهارت‌های مدیریت اضطراب",
          "تمرینات ذهن‌آگاهی روزانه",
          "ورزش منظم (حداقل 30 دقیقه، 3-5 بار در هفته)",
          "بررسی الگوهای فکری منفی",
          "تکنیک‌های آرام‌سازی پیشرفته",
          "بهبود روتین خواب",
          "کاهش مواجهه با استرس‌زاها"
        ]
      };
    } else if (score <= 28) {
      return {
        level: "اضطراب شدید",
        color: "#ef4444",
        desc: "شما اضطراب شدیدی را تجربه می‌کنید که به طور قابل توجهی عملکرد و کیفیت زندگی شما را مختل کرده است.",
        details: "علائم اضطراب شدید شما هم روانی، هم جسمانی و هم رفتاری است. این سطح از اضطراب نیازمند ارزیابی و درمان فوری توسط روان‌پزشک یا روان‌شناس بالینی است.",
        strengths: [
          "شناخت شدت مشکل",
          "انجام غربالگری",
          "آمادگی برای دریافت کمک"
        ],
        recommendations: [
          "مراجعه فوری به روان‌پزشک برای ارزیابی کامل",
          "احتمال نیاز به درمان دارویی (ضداضطراب/ضدافسردگی)",
          "روان‌درمانی تخصصی (CBT, ACT)",
          "بررسی مشکلات پزشکی همزمان (تیروئید، قلبی)",
          "آموزش خانواده برای حمایت",
          "تمرینات آرام‌سازی روزانه",
          "اجتناب از الکل و مواد",
          "حمایت اجتماعی قوی",
          "پیگیری منظم با متخصص"
        ]
      };
    } else {
      return {
        level: "اضطراب بسیار شدید",
        color: "#dc2626",
        desc: "شما اضطراب بسیار شدیدی دارید که به شدت ناتوان‌کننده است. نیاز فوری به مداخله حرفه‌ای دارید.",
        details: "نمره شما نشان‌دهنده اضطراب بسیار شدید با علائم گسترده روانی، جسمانی و رفتاری است. این وضعیت می‌تواند با حملات پانیک، اختلال اضطراب فراگیر یا سایر اختلالات اضطرابی شدید همراه باشد و نیاز فوری به درمان دارد.",
        strengths: [
          "آگاهی از نیاز فوری به کمک",
          "شجاعت برای انجام غربالگری",
          "امکان بهبود قابل توجه با درمان مناسب"
        ],
        recommendations: [
          "مراجعه فوری به اورژانس یا روان‌پزشک (همین امروز!)",
          "درمان دارویی تحت نظر پزشک",
          "روان‌درمانی فشرده و تخصصی",
          "احتمال نیاز به بستری شدن کوتاه‌مدت",
          "حمایت 24 ساعته خانواده",
          "حذف موقت استرس‌زاهای اصلی",
          "پیگیری روزانه/هفتگی با درمانگر",
          "شرکت در گروه‌های حمایتی",
          "آموزش مهارت‌های مقابله‌ای فوری",
          "در صورت افکار خودکشی: تماس فوری با خط کمک یا 115"
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
      labels: ["نمره شما", "آستانه خفیف", "آستانه متوسط", "آستانه شدید", "حداکثر"],
      datasets: [
        {
          label: "اضطراب",
          data: [score, 8, 15, 22, 56],
          backgroundColor: ["#3b82f6", "#22c55e", "#eab308", "#f59e0b", "#dc2626"],
          borderColor: ["#2563eb", "#16a34a", "#ca8a04", "#d97706", "#b91c1c"],
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
          text: "مقیاس اضطراب همیلتون (HAM-A)",
          font: { size: 14, family: "Vazirmatn" },
          color: "#e2e8f0"
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 56,
          ticks: { color: "#94a3b8", font: { family: "Vazirmatn" } },
          grid: { color: "#334155" }
        },
        x: {
          ticks: { color: "#94a3b8", font: { family: "Vazirmatn", size: 10 } },
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
                <FaExclamationTriangle className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج مقیاس اضطراب همیلتون</h1>
                <p className="text-secondaryTextColor">Hamilton Anxiety Rating Scale (HAM-A)</p>
              </div>
            </div>

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
              <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>
                {score} از 56
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
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">نمودار شدت اضطراب</h3>
              <div style={{ height: "300px" }}>
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-red-900/20 border border-red-600/30 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-red-500 mb-3">⚠️ هشدار مهم</h3>
              <p className="text-secondaryTextColor leading-relaxed">
                مقیاس HAM-A یک ابزار بالینی است که معمولاً توسط متخصصان سلامت روان استفاده می‌شود. 
                اگر نمره بالایی دارید یا علائم شدید اضطراب دارید، حتماً با روان‌پزشک مشورت کنید.
              </p>
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
              <FaExclamationTriangle className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">مقیاس اضطراب همیلتون (HAM-A)</h1>
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
