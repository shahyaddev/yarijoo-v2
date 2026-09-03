"use client";

import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaHeartBroken } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { useTestResult } from "@/hooks/useTestResult";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Page = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("bdi");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
    "احساس غمگینی یا دل‌گرفتگی",
    "نگرش منفی نسبت به آینده (بدبینی)",
    "احساس شکست یا ناکامی در زندگی",
    "کاهش لذت از فعالیت‌هایی که قبلاً خوشایند بود",
    "احساس گناه یا سرزنش خود",
    "احساس می‌کنم سزاوار تنبیه هستم",
    "ناراضی بودن از خود یا بیزاری از خود",
    "خودانتقادی شدید یا سرزنش مداوم خود",
    "افکار مربوط به مرگ یا آسیب به خود",
    "گریه کردن یا میل به گریه",
    "بی‌قراری یا تحریک‌پذیری (آژیتاسیون)",
    "کاهش علاقه به فعالیت‌های روزمره",
    "مشکل در تصمیم‌گیری یا دودلی",
    "احساس بی‌ارزشی یا بی‌کفایتی",
    "کاهش انرژی یا خستگی زودرس",
    "اختلالات خواب (کم‌خوابی یا پرخوابی)",
    "تحریک‌پذیری یا عصبانیت",
    "تغییر اشتها (کاهش یا افزایش)",
    "مشکل تمرکز و توجه",
    "خستگی جسمی/ذهنی مداوم",
    "کاهش علاقه جنسی"
  ];

  const options = [
    { value: 0, label: "اصلاً" },
    { value: 1, label: "کمی" },
    { value: 2, label: "متوسط" },
    { value: 3, label: "شدید" }
  ];

  // بررسی نتیجه قبلی
  useEffect(() => {
    if (hasResult && previousResult && !resultLoading) {
      setIsCompleted(true);
    }
  }, [hasResult, previousResult, resultLoading]);


  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [currentQuestion]: value };
    setAnswers(newAnswers);
    
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
          const answersArray = questions.map((q, idx) => {
            const answer = answers[idx];
            return answer !== undefined ? answer : 0;
          });

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
    if (score <= 13) return { level: "کمینه", color: "#22c55e", desc: "نشانگان افسردگی ناچیز" };
    if (score <= 19) return { level: "خفیف", color: "#eab308", desc: "علائم خفیف افسردگی" };
    if (score <= 28) return { level: "متوسط", color: "#f97316", desc: "اختلال قابل‌توجه در خلق و انرژی" };
    return { level: "شدید", color: "#ef4444", desc: "افسردگی شدید، نیاز به مراقبت فوری" };
  };

  const getRecommendations = (score) => {
    if (score <= 13) return [
      "بهداشت خواب و ورزش منظم",
      "حفظ روابط اجتماعی سالم",
      "پایش علائم در دوره‌های پرفشار",
      "فعالیت‌های لذت‌بخش روزانه"
    ];
    if (score <= 19) return [
      "CBT خودیاری و فعال‌سازی رفتاری",
      "تقویت حمایت اجتماعی",
      "ورزش منظم (30 دقیقه روزانه)",
      "تکنیک‌های آرام‌سازی و ذهن‌آگاهی"
    ];
    if (score <= 28) return [
      "ارجاع به درمانگر CBT/ACT",
      "بررسی علل جسمی و دارویی با پزشک",
      "برنامه ساختاریافته روزانه",
      "پیگیری منظم تخصصی"
    ];
    return [
      "ارجاع تخصصی فوری به روان‌پزشک",
      "برنامه ایمنی و مدیریت بحران",
      "ادغام درمان‌های دارویی و روان‌درمانی",
      "حمایت خانواده و نظارت نزدیک"
    ];
  };

  const hasSuicidalThoughts = () => {
    return answers[8] && answers[8] > 0;
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
    const recommendations = getRecommendations(score);
    const suicidalAlert = hasSuicidalThoughts();

    const chartData = {
      labels: ['نمره شما', 'آستانه خفیف', 'آستانه متوسط', 'آستانه شدید'],
      datasets: [{
        label: 'نمره افسردگی',
        data: [score, 13, 19, 28],
        backgroundColor: [
          interpretation.color + 'B3',
          'rgba(234, 179, 8, 0.3)',
          'rgba(249, 115, 22, 0.3)',
          'rgba(239, 68, 68, 0.3)'
        ],
        borderColor: [
          interpretation.color,
          'rgb(234, 179, 8)',
          'rgb(249, 115, 22)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 2
      }]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'نمره افسردگی و آستانه‌های تشخیصی',
          color: '#e5e7eb',
          font: { size: 16 }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 63,
          ticks: { color: '#9ca3af' },
          grid: { color: '#374151' }
        },
        x: {
          ticks: { color: '#9ca3af' },
          grid: { color: '#374151' }
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
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست افسردگی بک (BDI)</h1>
                <p className="text-secondaryTextColor">ارزیابی سطح افسردگی شما</p>
              </div>
            </div>

            {suicidalAlert && (
              <div className="bg-red-900/30 border-2 border-red-500 rounded-2xl p-6 animate-pulse">
                <h3 className="text-xl font-bold text-red-400 mb-3 flex items-center gap-2">
                  🚨 هشدار فوری
                </h3>
                <p className="text-red-300 mb-4">
                  شما در پاسخ به سوال مربوط به افکار مرگ یا آسیب به خود، نمره مثبت داده‌اید. 
                  این نشان‌دهنده نیاز به ارزیابی فوری است.
                </p>
                <div className="bg-red-950/50 rounded-xl p-4">
                  <p className="text-red-200 font-medium mb-2">لطفاً فوراً اقدام کنید:</p>
                  <ul className="text-red-200 text-sm space-y-1">
                    <li>• با روان‌پزشک یا روان‌درمانگر تماس بگیرید</li>
                    <li>• با یکی از نزدیکان خود صحبت کنید</li>
                    <li>• به اورژانس مراجعه کنید (115)</li>
                    <li>• با خط مشاوره بحران تماس بگیرید (1480)</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
                <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>
                  {score}
                </div>
                <div className="text-sm text-secondaryTextColor">از 63</div>
              </div>

              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سطح افسردگی</h3>
                <div 
                  className="text-2xl font-bold mb-2"
                  style={{ color: interpretation.color }}
                >
                  {interpretation.level}
                </div>
                <div className="text-sm text-secondaryTextColor">{interpretation.desc}</div>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار تحلیل</h3>
              <div className="w-full h-80">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توصیه‌های تخصصی</h3>
              <ul className="space-y-3">
                {recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                    <span className="text-secondaryTextColor">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">درباره نمرات</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-secondaryTextColor">0-13: کمینه (طبیعی)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-secondaryTextColor">14-19: خفیف</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-secondaryTextColor">20-28: متوسط</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-secondaryTextColor">29-63: شدید</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره تست</h4>
              <p className="text-sm text-blue-300">
                تست افسردگی بک (BDI-II) یک ابزار استاندارد 21 سوالی برای ارزیابی شدت علائم افسردگی است. 
                این تست توسط آرون بک در سال 1961 توسعه یافت و در سال 1996 بازنگری شد. 
                BDI یکی از پرکاربردترین ابزارهای سنجش افسردگی در جهان است و در تحقیقات و بالین استفاده می‌شود.
              </p>
            </div>

            <div className="bg-amber-900/20 border border-amber-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-amber-400 mb-3">⚠️ نکته مهم</h4>
              <p className="text-sm text-amber-300">
                این تست ابزار تشخیصی نیست و نمی‌تواند جایگزین ارزیابی تخصصی باشد. 
                اگر نمره شما در محدوده متوسط تا شدید است یا علائم بر زندگی روزمره شما تأثیر می‌گذارد، 
                حتماً با متخصص سلامت روان مشورت کنید.
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
              <FaHeartBroken className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">تست افسردگی بک (BDI)</h1>
              <p className="text-secondaryTextColor">سوال {currentQuestion + 1} از {questions.length}</p>
            </div>
          </div>

          <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
            <h2 
              key={`question-title-${currentQuestion}`}
              className="text-lg font-semibold text-primaryTextColor mb-2"
              style={{
                opacity: 0,
                animation: `questionTitleSlideIn 0.5s ease-out 0.2s forwards`,
                animationFillMode: 'forwards',
              }}
            >
              در دو هفته اخیر، شدت این علامت را مشخص کنید:
            </h2>
            <h3 
              key={`question-text-${currentQuestion}`}
              className="text-xl font-bold text-primaryThemeColor mb-6"
              style={{
                opacity: 0,
                animation: `questionTextSlideIn 0.5s ease-out 0.4s forwards`,
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
                  style={{
                    opacity: 0,
                    animation: `testOptionFadeIn 0.4s ease-out ${0.6 + index * 0.1}s forwards`,
                    animationFillMode: 'forwards',
                  }}
                >
                  <span className="text-primaryTextColor font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {currentQuestion === 8 && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-4">
              <p className="text-sm text-red-300">
                ⚠️ این سوال در مورد افکار مربوط به مرگ یا آسیب است. 
                اگر این افکار دارید، لطفاً با یک متخصص صحبت کنید. 
                خط مشاوره بحران: 1480
              </p>
            </div>
          )}

          <div className="w-full bg-darkThemeColor rounded-2xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-secondaryTextColor">
                پیشرفت: {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
              </span>
              <div className="w-32 h-2 bg-secondaryThemeColor rounded-full overflow-hidden">
                <div
                  className="h-full bg-primaryThemeColor rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Page;








