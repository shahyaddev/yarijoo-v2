"use client";

import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaExclamationTriangle } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { toFarsiNumber } from "@/helper/helper";
import { useTestResult } from "@/hooks/useTestResult";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Page = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("gad7");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [currentQuestion]);

  const questions = [
    "احساس عصبی بودن، اضطراب یا روی لبه بودن",
    "ناتوانی در متوقف کردن یا کنترل نگرانی",
    "نگرانی بیش از حد درباره مسائل گوناگون",
    "مشکل در آرام شدن یا استراحت کردن",
    "بی‌قراری به اندازه‌ای که آرام نشستن سخت شود",
    "زودرنجی یا تحریک‌پذیری",
    "احساس ترس انگار اتفاق بدی خواهد افتاد"
  ];

  const options = [
    { value: 0, label: "اصلاً" },
    { value: 1, label: "چند روز" },
    { value: 2, label: "بیش از نیمی از روزها" },
    { value: 3, label: "تقریباً هر روز" }
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

  const calculateScore = () => Object.values(answers).reduce((sum, score) => sum + score, 0);

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
    if (score <= 4) {
      return {
        level: "کمینه",
        color: "#22c55e",
        desc: "اضطراب ناچیز یا بدون علائم",
        details: "نمره شما نشان می‌دهد که در این زمینه وضعیت خوبی دارید و علائم اضطراب کمی مشاهده می‌شود.",
        strengths: [
          "عملکرد مناسب در این حوزه",
          "نشانه‌های سلامت روانی مطلوب",
          "توانایی مقابله با چالش‌های روزمره"
        ]
      };
    } else if (score <= 9) {
      return {
        level: "خفیف",
        color: "#eab308",
        desc: "اضطراب خفیف",
        details: "علائم خفیف اضطراب مشاهده می‌شود که ممکن است نیاز به توجه داشته باشد.",
        strengths: []
      };
    } else if (score <= 14) {
      return {
        level: "متوسط",
        color: "#f97316",
        desc: "اضطراب متوسط",
        details: "اضطراب متوسط که نیاز به درمان و پیگیری دارد.",
        strengths: []
      };
    } else {
      return {
        level: "شدید",
        color: "#ef4444",
        desc: "اضطراب شدید",
        details: "اضطراب شدید که نیاز به مراقبت فوری تخصصی دارد.",
        strengths: []
      };
    }
  };

  const getRecommendations = (score) => {
    if (score <= 4) {
      return [
        "ادامه شیوه زندگی فعلی و حفظ عادت‌های سالم",
        "توجه به علائم هشداردهنده و تغییرات احتمالی",
        "حفظ تعادل بین کار، استراحت و تفریح",
        "تقویت روابط اجتماعی و حمایت خانوادگی",
        "مراقبت منظم از سلامت جسمی و روانی"
      ];
    } else if (score <= 9) {
      return [
        "تکنیک‌های آرام‌سازی و تنفس عمیق",
        "فعالیت بدنی منظم (30 دقیقه روزانه)",
        "برنامه‌ریزی و مدیریت استرس",
        "محدود کردن مصرف کافئین",
        "توجه به الگوهای خواب"
      ];
    } else if (score <= 14) {
      return [
        "مشاوره با متخصص سلامت روان (CBT/ACT)",
        "برنامه‌ریزی منظم روزانه",
        "تکنیک‌های ذهن‌آگاهی و مدیتیشن",
        "ورزش منظم و تغذیه سالم",
        "بررسی علل جسمی احتمالی"
      ];
    } else {
      return [
        "ارجاع فوری به روان‌پزشک یا متخصص",
        "برنامه ایمنی و مدیریت بحران",
        "درمان ترکیبی (دارویی و روان‌درمانی)",
        "حمایت خانوادگی و نظارت نزدیک",
        "پیگیری منظم و ادامه درمان"
      ];
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
    const recommendations = getRecommendations(score);

    const chartData = {
      labels: ['نمره شما', 'خفیف', 'متوسط', 'شدید'],
      datasets: [{
        label: 'نمره GAD-7',
        data: [score || 0, 4, 9, 14],
        backgroundColor: [(interpretation?.color || "#22c55e") + 'B3', 'rgba(234, 179, 8, 0.3)', 'rgba(249, 115, 22, 0.3)', 'rgba(239, 68, 68, 0.3)'],
        borderColor: [interpretation?.color || "#22c55e", 'rgb(234, 179, 8)', 'rgb(249, 115, 22)', 'rgb(239, 68, 68)'],
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
                <FaExclamationTriangle className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج مقیاس اضطراب فراگیر (GAD-7)</h1>
                <p className="text-secondaryTextColor">ارزیابی اضطراب شما</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
                <div className="text-4xl font-bold mb-2" style={{ color: interpretation?.color || "#22c55e" }}>{toFarsiNumber(score || 0)}</div>
                <div className="text-sm text-secondaryTextColor">از {toFarsiNumber(21)}</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سطح اضطراب</h3>
                <div className="text-2xl font-bold mb-2" style={{ color: interpretation?.color || "#22c55e" }}>{interpretation?.level || "نامشخص"}</div>
                <div className="text-sm text-secondaryTextColor">{interpretation?.desc || ""}</div>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار تحلیل</h3>
              <div className="w-full h-80">
                <Bar data={chartData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'نمره GAD-7 و آستانه‌ها', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: 21, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
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
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره GAD-7</h4>
              <p className="text-sm text-blue-300">
                GAD-7 یک ابزار 7 سوالی برای غربالگری اختلال اضطراب فراگیر است. 
                این تست برای ارزیابی سریع شدت اضطراب در دو هفته گذشته طراحی شده است.
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
              <h1 className="text-2xl font-bold text-primaryTextColor">مقیاس اضطراب فراگیر (GAD-7)</h1>
              <p className="text-secondaryTextColor">سوال {toFarsiNumber(currentQuestion + 1)} از {toFarsiNumber(questions.length)}</p>
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
              در دو هفته گذشته، چند بار این مشکل را داشته‌اید؟
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
                  className="w-full p-4 text-right bg-secondaryThemeColor hover:bg-primaryThemeColor/10 rounded-xl border border-borderColor hover:border-primaryThemeColor/40"
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

          <div className="w-full bg-darkThemeColor rounded-2xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-secondaryTextColor">پیشرفت: {toFarsiNumber(Math.round(((currentQuestion + 1) / questions.length) * 100))}%</span>
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








