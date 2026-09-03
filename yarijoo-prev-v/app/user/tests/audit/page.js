"use client";

import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaWineBottle } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTestResult } from "@/hooks/useTestResult";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Page = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("audit");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
    "چند بار الکل می‌نوشید؟",
    "در روزهایی که الکل می‌نوشید، معمولاً چند نوشیدنی مصرف می‌کردید؟",
    "چند بار 6 یا بیشتر نوشیدنی در یک مجلس مصرف کردید؟",
    "چند بار در سال گذشته نتوانستید نوشیدن را متوقف کنید؟",
    "چند بار به دلیل نوشیدن، از انجام کارهای مورد انتظار باز ماندید؟",
    "چند بار برای شروع روز، به الکل نیاز داشتید؟",
    "چند بار پس از نوشیدن، احساس گناه یا پشیمانی کردید؟",
    "چند بار نتوانستید شب قبل را به خاطر بیاورید؟",
    "آیا خودتان یا دیگری به دلیل نوشیدن شما آسیب دیده‌اید؟",
    "آیا خانواده یا دوست نگران نوشیدن شما بوده یا توصیه کرده‌اند کم کنید؟"
  ];

  const getOptionsForQuestion = (qIndex) => {
    if (qIndex < 8) {
      return [
        { value: 0, label: "هرگز" },
        { value: 1, label: "کمتر از ماهی یک بار" },
        { value: 2, label: "ماهی یک بار" },
        { value: 3, label: "هفتگی" },
        { value: 4, label: "روزانه یا تقریباً روزانه" }
      ];
    } else {
      return [
        { value: 0, label: "خیر" },
        { value: 2, label: "بله، اما نه در سال گذشته" },
        { value: 4, label: "بله، در سال گذشته" }
      ];
    }
  };

  const options = getOptionsForQuestion(currentQuestion);

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
    const maxScore = 40;
    
    if (score <= 7) {
      return {
        level: "سطح پایین - مصرف کم‌خطر",
        color: "#22c55e",
        desc: "مصرف الکل شما در سطح کم‌خطر است.",
        details: "نمره شما نشان می‌دهد که مصرف الکل در سطح کم‌خطر است. این یک نشانه مثبت از سلامت است. با این حال، مهم است که این سطح را حفظ کنید و در صورت بروز هرگونه تغییر، به آن توجه کنید.",
        strengths: [
          "مصرف کم‌خطر الکل",
          "کنترل مناسب بر مصرف",
          "عدم وابستگی",
          "سلامت جسمی و روانی مناسب"
        ],
        recommendations: [
          "حفظ سطح فعلی مصرف",
          "آگاهی از دستورالعمل‌های مصرف ایمن",
          "حفظ تعادل در سبک زندگی",
          "توجه به علائم هشداردهنده در صورت افزایش مصرف",
          "مراقبت منظم از سلامت"
        ]
      };
    } else if (score <= 15) {
      return {
        level: "سطح متوسط - مصرف مضر",
        color: "#eab308",
        desc: "مصرف الکل شما در سطح مضر است و نیاز به کاهش دارد.",
        details: "نمره شما نشان می‌دهد که مصرف الکل در سطح مضر است. این می‌تواند بر سلامت جسمی و روانی شما تأثیر بگذارد. کاهش مصرف الکل توصیه می‌شود.",
        strengths: [
          "آگاهی از مشکل",
          "زمان مناسب برای تغییر"
        ],
        recommendations: [
          "کاهش مصرف الکل",
          "تعیین روزهای بدون الکل",
          "جستجوی حمایت از خانواده و دوستان",
          "مشاوره با متخصص در صورت نیاز",
          "یادگیری راه‌های مقابله بدون الکل"
        ]
      };
    } else if (score <= 19) {
      return {
        level: "سطح بالا - مصرف بسیار مضر",
        color: "#f97316",
        desc: "مصرف الکل شما در سطح بسیار مضر است و نیاز به مداخله دارد.",
        details: "نمره شما نشان می‌دهد که مصرف الکل در سطح بسیار مضر است. این می‌تواند به شدت بر سلامت جسمی، روانی، کار و روابط شما تأثیر بگذارد. مداخله تخصصی توصیه می‌شود.",
        strengths: [
          "شناسایی مشکل"
        ],
        recommendations: [
          "مراجعه فوری به متخصص اعتیاد یا روان‌پزشک",
          "برنامه درمانی برای کاهش مصرف",
          "حمایت خانواده و دوستان",
          "درمان گروهی در صورت نیاز",
          "مدیریت بحران و برنامه ایمنی"
        ]
      };
    } else {
      return {
        level: "سطح بسیار بالا - احتمال وابستگی",
        color: "#dc2626",
        desc: "نمره شما نشان‌دهنده احتمال وابستگی به الکل است. نیاز به درمان فوری دارید.",
        details: "نمره شما نشان می‌دهد که احتمال وابستگی به الکل وجود دارد. این یک وضعیت جدی است که نیاز به درمان فوری و جامع دارد. این می‌تواند به شدت بر همه جنبه‌های زندگی شما تأثیر بگذارد.",
        strengths: [
          "شناسایی مشکل"
        ],
        recommendations: [
          "🚨 مراجعه فوری به متخصص اعتیاد یا روان‌پزشک",
          "برنامه درمانی جامع شامل درمان دارویی و روان‌درمانی",
          "بستری احتمالی در مراکز درمانی در صورت نیاز",
          "حمایت کامل از خانواده و دوستان",
          "گروه‌های حمایتی و درمان گروهی",
          "مدیریت بحران و برنامه ایمنی",
          "پیگیری منظم و نظارت نزدیک"
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
      labels: ['نمره شما', 'کم‌خطر', 'خطر', 'بالا', 'وابستگی'],
      datasets: [{
        label: 'AUDIT',
        data: [score, 7, 15, 19, 40],
        backgroundColor: [interpretation.color + 'B3', 'rgba(34, 197, 94, 0.3)', 'rgba(234, 179, 8, 0.3)', 'rgba(249, 115, 22, 0.3)', 'rgba(239, 68, 68, 0.3)'],
        borderColor: [interpretation.color, 'rgb(34, 197, 94)', 'rgb(234, 179, 8)', 'rgb(249, 115, 22)', 'rgb(239, 68, 68)'],
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
                <FaWineBottle className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست AUDIT</h1>
                <p className="text-secondaryTextColor">غربالگری مصرف الکل</p>
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
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سطح خطر</h3>
                <div className="text-2xl font-bold mb-2" style={{ color: interpretation.color }}>{interpretation.level}</div>
                <div className="text-sm text-secondaryTextColor">{interpretation.desc}</div>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار تحلیل</h3>
              <div className="w-full h-80">
                <Bar data={chartData} options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { display: false }, title: { display: true, text: 'نمره AUDIT', color: '#e5e7eb', font: { size: 16 } } },
                  scales: {
                    y: { beginAtZero: true, max: 40, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                  }
                }} />
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
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توصیه‌ها</h3>
              <ul className="list-disc list-inside space-y-2 text-secondaryTextColor">
                {interpretation.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>

            {score > 15 && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6">
                <h4 className="font-medium text-red-400 mb-3">⚠️ توصیه مهم</h4>
                <p className="text-sm text-red-300">
                  نمره شما نشان‌دهنده مصرف مضر یا احتمال وابستگی است. 
                  لطفاً با متخصص اعتیاد یا روان‌پزشک مشورت کنید.
                </p>
              </div>
            )}

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره AUDIT</h4>
              <p className="text-sm text-blue-300">
                AUDIT (Alcohol Use Disorders Identification Test) یک ابزار 10 سوالی غربالگری مصرف الکل توسط WHO است. 
                نمره 8 یا بالاتر نشان‌دهنده مصرف مضر است.
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

  // بررسی نتیجه قبلی
  useEffect(() => {
    if (hasResult && previousResult && !resultLoading) {
      setIsCompleted(true);
    }
  }, [hasResult, previousResult, resultLoading]);


  const handleAnswer = (value) => {
    setAnswers({ ...answers, [currentQuestion]: value });
    if (currentQuestion < questions.length - 1) setCurrentQuestion(currentQuestion + 1);
    else setIsCompleted(true);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <Header /><MobileHeader />
      <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
        <Sidebar />
        <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="size-16 rounded-2xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20">
              <FaWineBottle className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">تست AUDIT</h1>
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

export default Page;



