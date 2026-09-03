"use client";

import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaHeartbeat } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTestResult } from "@/hooks/useTestResult";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TestPage = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("sleep_quality");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
  "بیش از 30 دقیقه طول کشید تا بخوابید",
  "در نیمه شب بیدار شدید",
  "برای رفتن به دستشویی بیدار شدید",
  "نتوانستید راحت نفس بکشید",
  "سرفه کردید یا خروپف کردید",
  "احساس سرما کردید",
  "احساس گرما کردید",
  "کابوس دیدید",
  "درد داشتید",
  "کیفیت خوابتان چطور بود؟ (0=خیلی خوب، 3=خیلی بد)",
  "داروی خواب استفاده کردید",
  "در طول روز خواب‌آلود بودید",
  "مشکل در انجام کارها به دلیل خواب‌آلودگی داشتید",
  "چند ساعت در شب خوابیدید؟"
        ]

  const options = [
  {
    "value": 0,
    "label": "هرگز"
  },
  {
    "value": 1,
    "label": "کمتر از یک بار در هفته"
  },
  {
    "value": 2,
    "label": "یک یا دو بار در هفته"
  },
  {
    "value": 3,
    "label": "سه یا بیشتر در هفته"
  }
        ]

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
    let total = 0;
    for (let i = 0; i < questions.length; i++) {
      total += answers[i] || 0;
    }
    return total;
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
    if (score <= 5) {
      return {
        level: "کیفیت خواب خوب",
        color: "#22c55e",
        desc: "کیفیت خواب شما در حد خوب و مناسب است.",
        details: "شما از کیفیت خواب مطلوبی برخوردار هستید. الگوی خواب شما سالم است و مشکلات قابل توجهی در خوابیدن یا بیدار ماندن ندارید. این سطح از کیفیت خواب برای سلامت جسمی و روانی شما مفید است.",
        strengths: [
          "خواب با کیفیت و آرام",
          "الگوی خواب منظم",
          "کمبود اختلالات خواب",
          "عملکرد روزانه خوب"
        ],
        recommendations: [
          "حفظ بهداشت خواب فعلی و رعایت برنامه منظم خواب",
          "ادامه عادت‌های سالم خواب (اتاق تاریک و خنک، بدون وسایل الکترونیکی)",
          "اجتناب از محرک‌ها قبل خواب (کافئین، الکل، ورزش سنگین)",
          "تمرین تکنیک‌های آرامش قبل خواب برای حفظ کیفیت"
        ]
      };
    } else if (score <= 10) {
      return {
        level: "کیفیت خواب متوسط",
        color: "#eab308",
        desc: "کیفیت خواب شما در حد متوسط است و نیاز به بهبود دارد.",
        details: "شما مشکلات خفیف تا متوسط در خواب دارید. ممکن است در به خواب رفتن یا بیدار ماندن در طول شب مشکل داشته باشید. بهبود بهداشت خواب می‌تواند کیفیت خواب شما را افزایش دهد.",
        strengths: [
          "برخی جنبه‌های مثبت در الگوی خواب",
          "آگاهی از مشکلات خواب"
        ],
        recommendations: [
          "بهبود بهداشت خواب: زمان خواب و بیداری ثابت، حتی در آخر هفته",
          "ایجاد محیط خواب مناسب: تاریک، خنک، و آرام",
          "محدود کردن کافئین از بعدازظهر و اجتناب کامل از الکل قبل خواب",
          "ورزش منظم (اما نه در ساعات نزدیک به خواب)",
          "تکنیک‌های آرامش: مدیتیشن، تنفس عمیق، یا حمام گرم",
          "محدود کردن استفاده از صفحه نمایش 1 ساعت قبل خواب"
        ]
      };
    } else {
      return {
        level: "کیفیت خواب ضعیف",
        color: "#ef4444",
        desc: "کیفیت خواب شما ضعیف است و نیاز به مداخله دارد.",
        details: "شما مشکلات قابل توجهی در کیفیت خواب دارید. اختلالات مکرر در خواب، مشکل در به خواب رفتن، یا خواب ناکافی می‌تواند بر سلامت جسمی، روانی و عملکرد روزانه شما تأثیر منفی بگذارد.",
        strengths: [
          "تمایل به بهبود کیفیت خواب",
          "آگاهی از مشکلات موجود"
        ],
        recommendations: [
          "مشاوره با متخصص خواب یا پزشک برای ارزیابی علل زمینه‌ای",
          "پیاده‌سازی برنامه بهداشت خواب ساختاریافته",
          "بررسی و درمان احتمالی اختلالات خواب (آپنه، بی‌خوابی، سندرم پاهای بی‌قرار)",
          "درمان شناختی-رفتاری برای بی‌خوابی (CBT-I) در صورت نیاز",
          "بررسی تأثیر استرس، اضطراب یا افسردگی بر خواب",
          "ایجاد برنامه خواب منظم و پایبندی به آن",
          "پرهیز از چرت‌های طولانی در روز",
          "در صورت نیاز، استفاده از داروهای خواب تحت نظارت پزشک"
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
    const maxScore = questions.length * Math.max(...options.map(o => o.value));

    const chartData = {
      labels: ['نمره شما', 'خوب (0-5)', 'متوسط (6-10)', 'ضعیف (11-42)'],
      datasets: [{
        label: 'نمره PSQI',
        data: [score, 5, 10, maxScore],
        backgroundColor: [
          interpretation.color + 'B3',
          'rgba(34, 197, 94, 0.3)',
          'rgba(234, 179, 8, 0.3)',
          'rgba(239, 68, 68, 0.3)'
        ],
        borderColor: [
          interpretation.color,
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 2
      }]
    };

    return (
      <div className="w-full flex flex-col items-center">
        <Header /><MobileHeader />
        <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
          <Sidebar />
          <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="size-16 rounded-2xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20">
                <FaHeartbeat className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج پرسشنامه کیفیت خواب پیتسبورگ (PSQI)</h1>
                <p className="text-secondaryTextColor">تحلیل نتایج شما</p>
              </div>
            </div>

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سطح کیفیت خواب</h3>
              <div className="text-3xl font-bold mb-2" style={{ color: interpretation.color }}>{interpretation.level}</div>
              <div className="text-secondaryTextColor mb-4">{interpretation.desc}</div>
              <p className="text-sm text-secondaryTextColor">{interpretation.details}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
                <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>{score}</div>
                <div className="text-sm text-secondaryTextColor">از {maxScore}</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">محدوده نمره</h3>
                <div className="text-lg font-semibold mb-1 text-secondaryTextColor">
                  {score <= 5 ? "0-5 (خوب)" : score <= 10 ? "6-10 (متوسط)" : "11-42 (ضعیف)"}
                </div>
              </div>
            </div>

            {interpretation.strengths && interpretation.strengths.length > 0 && (
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نقاط قوت الگوی خواب</h3>
                <ul className="space-y-2">
                  {interpretation.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                      <span className="text-secondaryTextColor">{strength}</span>
                    </li>
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
                    title: { display: true, text: 'تحلیل نمره PSQI', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: maxScore, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af', maxRotation: 45, minRotation: 45 }, grid: { color: '#374151' } }
                  }
                }} />
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توصیه‌های تخصصی</h3>
              <ul className="space-y-3">
                {interpretation.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                    <span className="text-secondaryTextColor">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره PSQI</h4>
              <p className="text-sm text-blue-300">
                پرسشنامه کیفیت خواب پیتسبورگ (PSQI) یک ابزار استاندارد برای ارزیابی کیفیت خواب است. 
                نمرات: 0-5 (خوب)، 6-21 (ضعیف).
              </p>
            </div>

            <button onClick={() => { setCurrentQuestion(0); setAnswers({}); setIsCompleted(false); }} className="w-full h-12 bg-primaryThemeColor text-white rounded-xl font-medium hover:bg-primaryThemeColor/90 transition-colors">
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
      <Header /><MobileHeader />
      <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
        <Sidebar />
        <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="size-16 rounded-2xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20">
              <FaHeartbeat className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">پرسشنامه کیفیت خواب پیتسبورگ (PSQI)</h1>
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
            >{questions[currentQuestion]}</h3>
            <div className="space-y-3">
              {options.map((option, index) => (
                <button key={`${currentQuestion}-${option.value}`} onClick={() => handleAnswer(option.value)} className="w-full p-4 text-right bg-secondaryThemeColor hover:bg-primaryThemeColor/10 rounded-xl border border-borderColor hover:border-primaryThemeColor/40 transition-all"
                  style={{
                    opacity: 0,
                    animation: `testOptionFadeIn 0.4s ease-out ${0.4 + index * 0.1}s forwards`,
                    animationFillMode: 'forwards',
                  }}>
                  <span className="text-primaryTextColor font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

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

export default TestPage;