"use client";

import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaBrain } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTestResult } from "@/hooks/useTestResult";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TestPage = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("life_satisfaction");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
  "از بسیاری جهات، زندگی‌ام به آرمانم نزدیک است",
  "شرایط زندگی‌ام عالی است",
  "از زندگی‌ام راضی هستم",
  "تاکنون چیزهای مهمی که می‌خواستم را به دست آورده‌ام",
  "اگر می‌توانستم دوباره زندگی کنم، تقریباً هیچ چیز را تغییر نمی‌دادم"
        ]

  const options = [
  {
    "value": 1,
    "label": "کاملاً مخالفم"
  },
  {
    "value": 2,
    "label": "مخالفم"
  },
  {
    "value": 3,
    "label": "کمی مخالفم"
  },
  {
    "value": 4,
    "label": "نه موافق نه مخالف"
  },
  {
    "value": 5,
    "label": "کمی موافقم"
  },
  {
    "value": 6,
    "label": "موافقم"
  },
  {
    "value": 7,
    "label": "کاملاً موافقم"
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
    const maxScore = 35;
    
    if (score <= 9) {
      return {
        level: "بسیار ناراضی",
        color: "#dc2626",
        desc: "رضایت از زندگی بسیار پایین.",
        details: "رضایت شما از زندگی بسیار پایین است. این می‌تواند نشان‌دهنده افسردگی یا مشکلات عمیق در زندگی باشد.",
        strengths: [],
        recommendations: [
          "**مشاوره فوری**: با روانشناس مشورت کنید",
          "**بررسی منابع نارضایتی**: چه چیز باعث نارضایتی است؟",
          "**درمان افسردگی**: اگر افسردگی دارید، درمان ضروری است",
          "**حمایت اجتماعی**: تقویت روابط و شبکه حمایتی",
          "**تغییرات زندگی**: در صورت نیاز، تغییرات بزرگ در زندگی"
        ]
      };
    } else if (score <= 14) {
      return {
        level: "ناراضی",
        color: "#ef4444",
        desc: "رضایت از زندگی پایین.",
        details: "رضایت شما از زندگی پایین است. نیاز به بهبود دارید.",
        strengths: [],
        recommendations: [
          "**شناسایی منابع نارضایتی**: چه چیز باید تغییر کند؟",
          "**هدف‌گذاری**: تعیین اهداف قابل دستیابی",
          "**مشاوره**: کمک حرفه‌ای برای بهبود",
          "**فعالیت‌های مثبت**: انجام کارهایی که لذت می‌برید",
          "**روابط**: بهبود روابط با دیگران"
        ]
      };
    } else if (score <= 19) {
      return {
        level: "کمی ناراضی",
        color: "#f97316",
        desc: "رضایت کمتر از متوسط.",
        details: "رضایت شما از زندگی کمتر از متوسط است. با تلاش می‌توانید بهبود ایجاد کنید.",
        strengths: [],
        recommendations: [
          "**بهبود جنبه‌های مثبت**: تمرکز بر چیزهای خوب",
          "**هدف‌گذاری**: تعیین و دنبال کردن اهداف",
          "**قدردانی**: تمرین قدردانی روزانه",
          "**فعالیت‌های معنادار**: انجام کارهای معنادار"
        ]
      };
    } else if (score <= 24) {
      return {
        level: "متوسط",
        color: "#eab308",
        desc: "رضایت متوسط از زندگی.",
        details: "رضایت شما از زندگی در حد متوسط است. می‌توانید با تلاش بیشتر بهبود دهید.",
        strengths: ["رضایت نسبی", "پایه برای بهبود"],
        recommendations: [
          "**افزایش رضایت**: کار بر روی جنبه‌های مهم زندگی",
          "**اهداف بزرگ‌تر**: تعیین اهداف چالش‌برانگیز",
          "**رشد شخصی**: یادگیری و رشد مداوم"
        ]
      };
    } else if (score <= 29) {
      return {
        level: "راضی",
        color: "#84cc16",
        desc: "رضایت خوب از زندگی.",
        details: "رضایت شما از زندگی خوب است.",
        strengths: ["رضایت خوب", "تعادل زندگی", "احساس مثبت"],
        recommendations: [
          "**حفظ رضایت**: ادامه کارهای مثبت",
          "**رشد مداوم**: ادامه بهبود و رشد"
        ]
      };
    } else {
      return {
        level: "بسیار راضی",
        color: "#22c55e",
        desc: "رضایت عالی از زندگی.",
        details: "رضایت شما از زندگی عالی است. تبریک می‌گوییم!",
        strengths: ["رضایت عالی", "تعادل خوب", "احساس مثبت قوی", "زندگی معنادار"],
        recommendations: [
          "**حفظ این وضعیت**: ادامه مسیر فعلی",
          "**کمک به دیگران**: به اشتراک‌گذاری تجربیات",
          "**الگو بودن**: الهام بخشیدن به دیگران"
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
      labels: ['نمره شما', 'پایین', 'متوسط', 'بالا'],
      datasets: [{
        label: 'نمره تست',
        data: [score, maxScore * 0.33, maxScore * 0.66, maxScore],
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
                <FaBrain className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست رضایت از زندگی</h1>
                <p className="text-secondaryTextColor">تحلیل نتایج شما</p>
              </div>
            </div>

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره رضایت از زندگی</h3>
              <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>{score}</div>
              <div className="text-sm text-secondaryTextColor mb-4">از 35</div>
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
                <Bar data={{
                  labels: ['نمره شما', 'بسیار ناراضی (5-9)', 'ناراضی (10-14)', 'کمی ناراضی (15-19)', 'متوسط (20-24)', 'راضی (25-29)', 'بسیار راضی (30-35)'],
                  datasets: [{
                    label: 'نمره رضایت از زندگی',
                    data: [score, 9, 14, 19, 24, 29, 35],
                    backgroundColor: [
                      interpretation.color + 'B3',
                      'rgba(220, 38, 38, 0.3)',
                      'rgba(239, 68, 68, 0.3)',
                      'rgba(249, 115, 22, 0.3)',
                      'rgba(234, 179, 8, 0.3)',
                      'rgba(132, 204, 22, 0.3)',
                      'rgba(34, 197, 94, 0.3)'
                    ],
                    borderColor: [
                      interpretation.color,
                      'rgb(220, 38, 38)',
                      'rgb(239, 68, 68)',
                      'rgb(249, 115, 22)',
                      'rgb(234, 179, 8)',
                      'rgb(132, 204, 22)',
                      'rgb(34, 197, 94)'
                    ],
                    borderWidth: 2
                  }]
                }} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'تحلیل رضایت از زندگی', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: 35, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af', maxRotation: 45, minRotation: 45 }, grid: { color: '#374151' } }
                  }
                }} />
              </div>
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
              <FaBrain className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">تست رضایت از زندگی</h1>
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