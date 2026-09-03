"use client";

import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaCloudMeatball } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTestResult } from "@/hooks/useTestResult";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TestPage = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("work_stress");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
  "احساس فشار کاری می‌کنم",
  "کار بیش از توانم است",
  "زمان کافی ندارم",
  "انتظارات غیرواقعی از من هست",
  "با همکاران مشکل دارم",
  "مدیرم حمایت نمی‌کند",
  "ابهام در وظایفم وجود دارد",
  "کنترلی بر کارم ندارم",
  "نگران از دست دادن شغلم هستم",
  "کارم بر خوابم تأثیر می‌گذارد",
  "سردرد یا مشکلات جسمی دارم",
  "تمرکزم کم شده",
  "تحریک‌پذیر و عصبی هستم",
  "انگیزه‌ام کم شده",
  "فکر می‌کنم شغل دیگری پیدا کنم",
  "کارم بر روابطم تأثیر منفی دارد",
  "احساس فرسودگی می‌کنم",
  "کارم بر سلامتی‌ام تأثیر می‌گذارد"
        ]

  const options = [
  {
    "value": 1,
    "label": "هرگز"
  },
  {
    "value": 2,
    "label": "به ندرت"
  },
  {
    "value": 3,
    "label": "گاهی"
  },
  {
    "value": 4,
    "label": "اغلب"
  },
  {
    "value": 5,
    "label": "همیشه"
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
    return Object.values(answers).reduce((sum, score) => sum + (score || 0), 0);
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
    const maxScore = 90;
    
    if (score <= 36) {
      return {
        level: "استرس شغلی پایین",
        color: "#22c55e",
        desc: "استرس شغلی شما پایین است. محیط کار سالمی دارید.",
        details: "نمره شما نشان می‌دهد که استرس شغلی در حد پایین است و می‌توانید با چالش‌های کاری به خوبی کنار بیایید.",
        strengths: ["محیط کار سالم", "توانایی مدیریت استرس", "تعادل کار-زندگی"],
        recommendations: [
          "**محیط کار سالم**: حفظ این وضعیت",
          "**حفظ تعادل**: ادامه مدیریت خوب استرس"
        ]
      };
    } else if (score <= 54) {
      return {
        level: "استرس شغلی متوسط",
        color: "#eab308",
        desc: "استرس شغلی قابل توجه. نیاز به مدیریت بهتر دارید.",
        details: "استرس شغلی متوسط در شما مشاهده می‌شود. یادگیری مهارت‌های مدیریت استرس می‌تواند کمک زیادی کند.",
        strengths: [],
        recommendations: [
          "**مدیریت زمان**: اولویت‌بندی وظایف",
          "**مرزگذاری**: تعیین حدود کار/زندگی",
          "**حمایت**: کمک از همکاران/مدیر",
          "**مهارت‌های مقابله**: آرامش، ورزش",
          "**ارزیابی**: آیا کار مناسب است؟"
        ]
      };
    } else {
      return {
        level: "استرس شغلی بالا - خطر فرسودگی",
        color: "#dc2626",
        desc: "استرس شغلی شدید که می‌تواند منجر به فرسودگی شود.",
        details: "استرس شغلی شما شدید است و می‌تواند منجر به فرسودگی شغلی، مشکلات سلامتی و کاهش عملکرد شود. اقدام فوری ضروری است.",
        strengths: [],
        recommendations: [
          "**🚨 اقدام فوری**: استرس شغلی مزمن خطرناک است",
          "**استراحت**: مرخصی اگر ممکن است",
          "**ارزیابی شغل**: آیا این کار ارزش دارد؟",
          "**تغییر**: تغییر نقش، بخش یا شغل",
          "**حمایت**: مشاوره شغلی/روانشناختی",
          "**مذاکره**: با مدیر درباره بار کار",
          "**مهارت‌های مقابله**: مدیریت استرس فشرده",
          "**شبکه**: حمایت همکاران"
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
      labels: ['نمره شما', 'پایین (0-36)', 'متوسط (37-54)', 'بالا (55-90)'],
      datasets: [{
        label: 'نمره استرس شغلی',
        data: [score, 36, 54, 90],
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
                <FaCloudMeatball className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست استرس شغلی</h1>
                <p className="text-secondaryTextColor">تحلیل نتایج شما</p>
              </div>
            </div>

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره استرس شغلی</h3>
              <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>{score}</div>
              <div className="text-sm text-secondaryTextColor mb-4">از 90</div>
              <div className="text-2xl font-bold mb-2" style={{ color: interpretation.color }}>{interpretation.level}</div>
              <div className="text-sm text-secondaryTextColor">{interpretation.desc}</div>
              <p className="text-sm text-secondaryTextColor mt-2">{interpretation.details}</p>
            </div>

            {interpretation.strengths && interpretation.strengths.length > 0 && (
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نقاط قوت</h3>
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
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توصیه‌های تخصصی</h3>
              <ul className="space-y-3">
                {interpretation.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                    <span className="text-secondaryTextColor text-sm" dangerouslySetInnerHTML={{ __html: rec.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار تحلیل</h3>
              <div className="w-full h-80">
                <Bar data={chartData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'تحلیل استرس شغلی', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: 90, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                  }
                }} />
              </div>
            </div>

            {score > 54 && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6">
                <h4 className="font-medium text-red-400 mb-3">⚠️ هشدار مهم</h4>
                <p className="text-sm text-red-300">
                  استرس شغلی مزمن خطرناک است و می‌تواند منجر به فرسودگی، مشکلات سلامتی و کاهش عملکرد شود. اگر احساس می‌کنید استرس زندگی شما را تحت تأثیر قرار داده، فوراً کمک بگیرید.
                </p>
              </div>
            )}

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
              <FaCloudMeatball className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">تست WORK_STRESS</h1>
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