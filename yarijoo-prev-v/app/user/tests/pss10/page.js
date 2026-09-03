"use client";

import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaFire } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTestResult } from "@/hooks/useTestResult";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Page = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("pss10");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
    { text: "ناراحت شدن به دلیل اتفاق غیرمنتظره", reverse: false },
    { text: "احساس ناتوانی در کنترل مسائل مهم زندگی", reverse: false },
    { text: "احساس عصبی بودن و استرس", reverse: false },
    { text: "اطمینان در توانایی مدیریت مسائل شخصی", reverse: true },
    { text: "احساس کنترل بر اوضاع", reverse: true },
    { text: "ناتوانی در مقابله با کارهایی که باید انجام شود", reverse: false },
    { text: "توانایی کنترل تحریکات در زندگی", reverse: true },
    { text: "احساس مسلط بودن بر اوضاع", reverse: true },
    { text: "عصبانیت به خاطر مسائلی که خارج از کنترل هستند", reverse: false },
    { text: "احساس انباشته شدن مشکلات", reverse: false }
  ];

  const options = [
    { value: 0, label: "هرگز" },
    { value: 1, label: "تقریباً هرگز" },
    { value: 2, label: "گاهی اوقات" },
    { value: 3, label: "اغلب" },
    { value: 4, label: "خیلی زیاد" }
  ];

  // بررسی نتیجه قبلی
  useEffect(() => {
    if (hasResult && previousResult && !resultLoading) {
      setIsCompleted(true);
    }
  }, [hasResult, previousResult, resultLoading]);


  const handleAnswer = (value) => {
    const q = questions[currentQuestion];
    const actualValue = q.reverse ? (4 - value) : value;
    const newAnswers = { ...answers, [currentQuestion]: actualValue };
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
    if (score <= 13) {
      return {
        level: "کم",
        color: "#22c55e",
        desc: "سطح استرس ادراک شده پایین است.",
        details: "نمره شما نشان می‌دهد که سطح استرس ادراک شده‌تان پایین است و شما وقایع زندگی را به صورت کم استرس‌زا ارزیابی می‌کنید. این یک نشانه مثبت از سلامت روانی است.",
        strengths: [
          "مدیریت خوب استرس",
          "ارزیابی واقع‌بینانه وقایع",
          "کنترل مناسب بر اوضاع",
          "عملکرد مناسب در شرایط سخت",
          "کیفیت زندگی خوب"
        ],
        recommendations: [
          "حفظ سبک زندگی سالم و متعادل",
          "ادامه فعالیت‌های مدیریت استرس که برای شما موثر است",
          "حفظ روابط اجتماعی و حمایت خانوادگی",
          "ورزش منظم و خواب کافی"
        ]
      };
    }
    if (score <= 26) {
      return {
        level: "متوسط",
        color: "#eab308",
        desc: "سطح استرس ادراک شده متوسط است.",
        details: "سطح استرس ادراک شده شما در محدوده متوسط است. این طبیعی است اما بهتر است تکنیک‌های مدیریت استرس را یاد بگیرید.",
        strengths: [
          "برخی مهارت‌های مدیریت استرس",
          "آگاهی از نیاز به بهبود"
        ],
        recommendations: [
          "یادگیری تکنیک‌های مدیریت استرس مانند تنفس عمیق",
          "تمرین ذهن‌آگاهی (mindfulness) و مدیتیشن",
          "برنامه‌ریزی و سازماندهی کارها برای کاهش احساس فشار",
          "ورزش منظم و فعالیت‌های لذت‌بخش",
          "درمان شناختی-رفتاری برای مدیریت افکار استرس‌زا"
        ]
      };
    }
    return {
      level: "بالا",
      color: "#ef4444",
      desc: "سطح استرس ادراک شده بالا است و نیاز به توجه دارد.",
      details: "نمره شما نشان می‌دهد که سطح استرس ادراک شده‌تان بالا است و شما وقایع زندگی را به صورت پراسترس ارزیابی می‌کنید. این می‌تواند بر سلامت روانی و جسمی شما تأثیر بگذارد. بهتر است با متخصص مشورت کنید.",
      strengths: [
        "شناسایی مشکل"
      ],
      recommendations: [
        "مراجعه به روان‌شناس برای یادگیری تکنیک‌های مدیریت استرس",
        "درمان شناختی-رفتاری (CBT) برای تغییر ارزیابی استرس‌زا از وقایع",
        "تمرین منظم تکنیک‌های آرام‌سازی پیشرونده عضلانی",
        "بررسی و تغییر سبک زندگی پراسترس",
        "ایجاد سیستم حمایتی قوی",
        "در صورت نیاز، مشورت با پزشک برای بررسی علل جسمی استرس"
      ]
    };
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
      labels: ['نمره شما', 'آستانه متوسط (14)', 'آستانه بالا (27)'],
      datasets: [{
        label: 'استرس',
        data: [score, 14, 27],
        backgroundColor: [interpretation.color + 'B3', 'rgba(34, 197, 94, 0.3)', 'rgba(234, 179, 8, 0.3)', 'rgba(239, 68, 68, 0.3)'],
        borderColor: [interpretation.color, 'rgb(34, 197, 94)', 'rgb(234, 179, 8)', 'rgb(239, 68, 68)'],
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
                <FaFire className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج مقیاس استرس ادراک‌شده (PSS-10)</h1>
                <p className="text-secondaryTextColor">ارزیابی استرس شما</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
                <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>{score}</div>
                <div className="text-sm text-secondaryTextColor">از 40</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سطح استرس</h3>
                <div className="text-2xl font-bold mb-2" style={{ color: interpretation.color }}>{interpretation.level}</div>
                <div className="text-sm text-secondaryTextColor">{interpretation.desc}</div>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار تحلیل</h3>
              <div className="w-full h-80">
                <Bar data={chartData} options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { display: false }, title: { display: true, text: 'سطح استرس', color: '#e5e7eb', font: { size: 16 } } },
                  scales: {
                    y: { beginAtZero: true, max: 40, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                  }
                }} />
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توضیحات</h3>
              <p className="text-secondaryTextColor leading-relaxed mb-4">{interpretation.details}</p>
            </div>

            {interpretation.strengths && interpretation.strengths.length > 0 && (
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نقاط قوت</h3>
                <ul className="space-y-2">
                  {interpretation.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                      <span className="text-secondaryTextColor">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توصیه‌های تخصصی</h3>
              <ul className="space-y-3">
                {interpretation.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                    <span className="text-secondaryTextColor text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">درباره نمرات</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-secondaryTextColor">0-13: استرس پایین</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-secondaryTextColor">14-26: استرس متوسط</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-secondaryTextColor">27-40: استرس بالا</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره PSS-10</h4>
              <p className="text-sm text-blue-300">
                PSS-10 یک مقیاس 10 سوالی برای سنجش میزان استرس ادراک‌شده در ماه گذشته است. 
                این تست نشان می‌دهد که شما وقایع زندگی را تا چه حد استرس‌زا ارزیابی می‌کنید.
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
              <FaFire className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">مقیاس استرس ادراک‌شده (PSS-10)</h1>
              <p className="text-secondaryTextColor">سوال {currentQuestion + 1} از {questions.length}</p>
            </div>
          </div>

          <div className="w-full bg-darkThemeColor rounded-2xl p-6">
            <h2 
              key={`question-title-${currentQuestion}`}
              className="text-lg font-semibold text-primaryTextColor mb-2"
              style={{
                opacity: 0,
                animation: `questionTitleSlideIn 0.5s ease-out 0.2s forwards`,
                animationFillMode: 'forwards',
              }}
            >در ماه گذشته، چند بار این را تجربه کردید؟</h2>
            <h3 
              key={`question-text-${currentQuestion}`}
              className="text-xl font-bold text-primaryThemeColor mb-6"
              style={{
                opacity: 0,
                animation: `questionTextSlideIn 0.5s ease-out 0.4s forwards`,
                animationFillMode: 'forwards',
              }}
            >{questions[currentQuestion].text}</h3>
            <div className="space-y-3">
              {options.map((option, index) => (
                <button key={`${currentQuestion}-${option.value}`} onClick={() => handleAnswer(option.value)} className="w-full p-4 text-right bg-secondaryThemeColor hover:bg-primaryThemeColor/10 rounded-xl border border-borderColor hover:border-primaryThemeColor/40 transition-all"
                  style={{
                    opacity: 0,
                    animation: `testOptionFadeIn 0.4s ease-out ${0.6 + index * 0.1}s forwards`,
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

export default Page;







