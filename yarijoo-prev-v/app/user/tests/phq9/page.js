"use client";

import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaSadTear } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTestResult } from "@/hooks/useTestResult";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Page = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("phq9");
  const [savedScore, setSavedScore] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
    "بی‌میلی یا لذت‌نبردن از انجام کارها",
    "احساس غم، افسردگی یا ناامیدی",
    "مشکل در خواب (کم‌خوابی یا پرخوابی)",
    "خستگی یا کمبود انرژی",
    "کاهش اشتها یا پرخوری",
    "احساس بد نسبت به خود؛ شکست‌خورده یا مایه زحمت بودن",
    "مشکل تمرکز (مثلاً روی مطالعه یا کارهای روزمره)",
    "کندی یا بی‌قراری حرکتی که دیگران هم متوجه شوند",
    "افکار مرگ یا آسیب به خود"
  ];

  const options = [
    { value: 0, label: "اصلاً" },
    { value: 1, label: "چند روز" },
    { value: 2, label: "بیش از نیمی از روزها" },
    { value: 3, label: "تقریباً هر روز" }
  ];

  // بررسی نتیجه قبلی - فقط اگر کاربر به صفحه برگشته باشد (نه در حال انجام تست)
  useEffect(() => {
    if (hasResult && previousResult && !resultLoading && Object.keys(answers).length === 0 && !isCompleted) {
      setIsCompleted(true);
      // نمایش نتیجه قبلی
      if (previousResult.total_score !== undefined) {
        setSavedScore(previousResult.total_score);
      }
      // بازیابی answers از previousResult برای نمایش درست
      if (previousResult.answers && Array.isArray(previousResult.answers)) {
        const restoredAnswers = {};
        previousResult.answers.forEach((answer, index) => {
          restoredAnswers[index] = answer;
        });
        setAnswers(restoredAnswers);
      }
    }
  }, [hasResult, previousResult, resultLoading, isCompleted]);


  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [currentQuestion]: value };
    setAnswers(newAnswers);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const calculateScore = () => Object.values(answers).reduce((sum, score) => sum + score, 0);

  // ذخیره نتیجه بعد از تکمیل
  useEffect(() => {
    const saveResultToServer = async () => {
      // بررسی که آیا همه سوالات پاسخ داده شده‌اند
      if (isCompleted && !isSaving && Object.keys(answers).length === questions.length) {
        // بررسی که آیا همه پاسخ‌ها valid هستند
        const allAnswersValid = questions.every((_, idx) => answers[idx] !== undefined && answers[idx] !== null);
        
        if (!allAnswersValid) {
          console.error("Not all questions answered");
          return;
        }

        setIsSaving(true);
        
        const score = calculateScore();
        const interpretation = getInterpretation(score);

        try {
          // تبدیل answers به آرایه
          const answersArray = questions.map((q, idx) => {
            const answer = answers[idx];
            return answer !== undefined && answer !== null ? answer : 0;
          });

          console.log("Saving test result:", {
            testName: "phq9",
            answers: answersArray,
            score,
            level: interpretation.level
          });

          const saved = await saveResult({
            answers: answersArray,
            totalScore: score,
            total_score: score,
            level: interpretation.level,
            interpretation: interpretation,
          });
          
          console.log("Save result response:", saved);
          
          if (saved && saved.success) {
            setSavedScore(score);
          } else {
            console.error("Failed to save result:", saved);
          }
        } catch (error) {
          console.error("Error saving result:", error);
        } finally {
          setIsSaving(false);
        }
      }
    };

    saveResultToServer();
  }, [isCompleted, isSaving, answers, questions, saveResult]);


  const getInterpretation = (score) => {
    if (score <= 4) {
      return {
        level: "کمینه",
        color: "#22c55e",
        desc: "علائم افسردگی ناچیز یا عدم افسردگی.",
        details: "نمره شما نشان می‌دهد که در این زمینه وضعیت خوبی دارید و علائم افسردگی کمی مشاهده می‌شود. این یک نشانه مثبت از سلامت روانی است.",
        strengths: [
          "عدم علائم افسردگی",
          "عملکرد مناسب در زندگی روزمره",
          "کیفیت زندگی خوب",
          "سازگاری مناسب"
        ]
      };
    }
    if (score <= 9) {
      return {
        level: "خفیف",
        color: "#eab308",
        desc: "علائم خفیف افسردگی.",
        details: "بر اساس پاسخ‌های شما، علائم افسردگی خفیفی وجود دارد که قابل کنترل است. یادگیری مهارت‌های مدیریت افسردگی می‌تواند کمک کند.",
        strengths: [
          "برخی مهارت‌های مقابله",
          "آگاهی از مشکل",
          "قابل کنترل بودن علائم"
        ]
      };
    }
    if (score <= 14) {
      return {
        level: "متوسط",
        color: "#f97316",
        desc: "علائم متوسط افسردگی.",
        details: "علائم افسردگی متوسطی در شما مشاهده می‌شود که نیاز به توجه دارد. این می‌تواند بر عملکرد روزانه تأثیر بگذارد.",
        strengths: [
          "شناسایی مشکل",
          "آمادگی برای بهبود"
        ]
      };
    }
    if (score <= 19) {
      return {
        level: "متوسط-شدید",
        color: "#dc2626",
        desc: "علائم متوسط تا شدید افسردگی.",
        details: "علائم افسردگی متوسط تا شدیدی در شما مشاهده می‌شود که نیاز به مداخله تخصصی دارد. این می‌تواند به شدت بر عملکرد، کار و روابط شما تأثیر بگذارد.",
        strengths: [
          "شناسایی مشکل"
        ]
      };
    }
    return {
      level: "شدید",
      color: "#ef4444",
      desc: "علائم شدید افسردگی و نیاز به مراقبت فوری.",
      details: "علائم افسردگی شدیدی در شما مشاهده می‌شود که نیاز به مداخله فوری تخصصی دارد. این علائم به شدت بر همه جنبه‌های زندگی شما تأثیر می‌گذارد.",
      strengths: [
        "شناسایی مشکل"
      ]
    };
  };

  const getRecommendations = (score) => {
    if (score <= 4) {
      return [
        "حفظ سبک زندگی سالم و فعال",
        "ورزش منظم و خواب کافی",
        "حفظ روابط اجتماعی و حمایت خانوادگی",
        "پایش علائم در دوره‌های پراسترس"
      ];
    }
    if (score <= 9) {
      return [
        "فعال‌سازی رفتاری و افزایش فعالیت‌های لذت‌بخش",
        "یادگیری تکنیک‌های مدیریت استرس",
        "تقویت حمایت اجتماعی",
        "درمان شناختی-رفتاری خودیاری (CBT)",
        "ورزش منظم و رژیم غذایی سالم"
      ];
    }
    if (score <= 14) {
      return [
        "مراجعه به روان‌شناس یا روان‌پزشک برای ارزیابی تخصصی",
        "درمان شناختی-رفتاری (CBT) یا ACT",
        "بررسی علل جسمی و دارویی با پزشک",
        "برنامه ساختاریافته روزانه",
        "پیگیری منظم"
      ];
    }
    if (score <= 19) {
      return [
        "مراجعه فوری به روان‌پزشک برای ارزیابی و درمان",
        "برنامه درمانی جامع شامل درمان دارویی و روان‌درمانی",
        "درمان شناختی-رفتاری (CBT) تخصصی",
        "ایجاد سیستم حمایتی قوی",
        "پیگیری منظم و نظارت نزدیک"
      ];
    }
    return [
      "مراجعه فوری و اورژانسی به روان‌پزشک",
      "برنامه درمانی فشرده شامل درمان دارویی و روان‌درمانی",
      "ایجاد سیستم حمایتی قوی و نظارت مداوم",
      "برنامه ایمنی و مدیریت بحران",
      "پیگیری روزانه و نظارت نزدیک"
    ];
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
    // بررسی هشدار خودکشی از answers یا previousResult
    const suicidalAlert = (answers[8] && answers[8] > 0) || (previousResult?.answers && Array.isArray(previousResult.answers) && previousResult.answers[8] > 0);

    const chartData = {
      labels: ['نمره شما', 'آستانه خفیف (5)', 'آستانه متوسط (10)', 'آستانه متوسط-شدید (15)', 'آستانه شدید (20)'],
      datasets: [{
        label: 'نمره PHQ-9',
        data: [score, 5, 10, 15, 20],
        backgroundColor: [interpretation.color + 'B3', 'rgba(234, 179, 8, 0.3)', 'rgba(249, 115, 22, 0.3)', 'rgba(239, 68, 68, 0.3)', 'rgba(220, 38, 38, 0.3)'],
        borderColor: [interpretation.color, 'rgb(234, 179, 8)', 'rgb(249, 115, 22)', 'rgb(239, 68, 68)', 'rgb(220, 38, 38)'],
        borderWidth: 2
      }]
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
                <FaSadTear className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج پرسشنامه سلامت بیمار (PHQ-9)</h1>
                <p className="text-secondaryTextColor">ارزیابی افسردگی شما</p>
              </div>
            </div>

            {suicidalAlert && (
              <div className="bg-red-900/30 border-2 border-red-500 rounded-2xl p-6 animate-pulse">
                <h3 className="text-xl font-bold text-red-400 mb-3">🚨 هشدار فوری</h3>
                <p className="text-red-300 mb-4">
                  شما افکار مربوط به مرگ یا آسیب به خود را گزارش کرده‌اید. لطفاً فوراً با متخصص تماس بگیرید.
                </p>
                <div className="bg-red-950/50 rounded-xl p-4">
                  <ul className="text-red-200 text-sm space-y-1">
                    <li>• اورژانس: 115</li>
                    <li>• خط بحران: 1480</li>
                    <li>• با نزدیکان صحبت کنید</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
                <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>{score}</div>
                <div className="text-sm text-secondaryTextColor">از 27</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سطح افسردگی</h3>
                <div className="text-2xl font-bold mb-2" style={{ color: interpretation.color }}>{interpretation.level}</div>
                <div className="text-sm text-secondaryTextColor">{interpretation.desc}</div>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توضیحات</h3>
              <p className="text-secondaryTextColor leading-relaxed mb-4">{interpretation.desc}</p>
              <p className="text-secondaryTextColor leading-relaxed">{interpretation.details}</p>
            </div>

            {interpretation.strengths && interpretation.strengths.length > 0 && (
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نقاط قوت</h3>
                <ul className="list-disc list-inside space-y-2 text-secondaryTextColor">
                  {interpretation.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار تحلیل</h3>
              <div className="w-full h-80">
                <Bar data={chartData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'نمره PHQ-9 و آستانه‌ها', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: 27, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                  }
                }} />
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

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره PHQ-9</h4>
              <p className="text-sm text-blue-300">
                PHQ-9 یک ابزار غربالگری 9 سوالی برای افسردگی است که بر اساس معیارهای DSM-IV طراحی شده است.
                این تست در مراکز بهداشتی و درمانی به طور گسترده استفاده می‌شود.
              </p>
            </div>

            <button 
              onClick={async () => {
                try {
                  // ابتدا state های local را reset کن
                  setCurrentQuestion(0);
                  setAnswers({});
                  setIsCompleted(false);
                  setSavedScore(null);
                  setIsSaving(false);
                  
                  // سپس نتیجه را از سرور حذف کن
                  await resetResult();
                  
                  console.log("Test reset successfully");
                } catch (error) {
                  console.error("Error resetting test:", error);
                  // در هر صورت state های local را reset کن
                  setCurrentQuestion(0);
                  setAnswers({});
                  setIsCompleted(false);
                  setSavedScore(null);
                  setIsSaving(false);
                }
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
              <FaSadTear className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">پرسشنامه سلامت بیمار (PHQ-9)</h1>
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
            >در دو هفته گذشته، چند بار این مشکل را داشته‌اید؟</h2>
            <h3 
              key={`question-text-${currentQuestion}`}
              className="text-xl font-bold text-primaryThemeColor mb-6"
              style={{
                opacity: 0,
                animation: `questionTextSlideIn 0.5s ease-out 0.4s forwards`,
                animationFillMode: 'forwards',
              }}
            >{questions[currentQuestion]}</h3>
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
              <p className="text-sm text-red-300">⚠️ اگر این افکار دارید، لطفاً فوراً با متخصص تماس بگیرید. خط بحران: 1480</p>
            </div>
          )}

          <div className="w-full bg-darkThemeColor rounded-2xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-secondaryTextColor">پیشرفت: {Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
              <div className="w-32 h-2 bg-secondaryThemeColor rounded-full overflow-hidden">
                <div className="h-full bg-primaryThemeColor rounded-full transition-all duration-300" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}></div>
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







