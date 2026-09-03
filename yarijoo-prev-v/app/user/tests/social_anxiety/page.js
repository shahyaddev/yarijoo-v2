"use client";

import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaExclamationCircle } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTestResult } from "@/hooks/useTestResult";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TestPage = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("social_anxiety");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
  "از صحبت کردن در جمع می‌ترسم",
  "نگران قضاوت دیگران هستم",
  "در موقعیت‌های اجتماعی مضطرب می‌شوم",
  "از ملاقات با افراد جدید اجتناب می‌کنم",
  "از خجالت کشیدن می‌ترسم",
  "قرمز شدن صورتم مرا نگران می‌کند",
  "از رفتن به مهمانی می‌ترسم",
  "در جمع لرزش بدنی دارم",
  "از مرکز توجه بودن می‌ترسم",
  "نگران اشتباه کردن در جمع هستم",
  "از تماس چشمی اجتناب می‌کنم",
  "در جمع تنگی نفس دارم",
  "از صحبت با افراد مهم می‌ترسم",
  "نگران نظر دیگران درباره‌ام هستم",
  "از رستوران رفتن در جمع می‌ترسم",
  "از تلفن کردن در جمع اجتناب می‌کنم",
  "از نوشتن در جمع می‌ترسم"
        ]

  const options = [
  {
    "value": 0,
    "label": "هرگز"
  },
  {
    "value": 1,
    "label": "گاهی"
  },
  {
    "value": 2,
    "label": "اغلب"
  },
  {
    "value": 3,
    "label": "معمولاً"
  },
  {
    "value": 4,
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

  const calculateScores = () => {
    const fearItems = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16];
    const avoidanceItems = [1, 3, 6, 8, 10, 13, 15];
    
    const scores = { fear: 0, avoidance: 0 };
    questions.forEach((q, idx) => {
      const answer = answers[idx] || 0;
      if (fearItems.includes(idx)) {
        scores.fear += answer;
      } else if (avoidanceItems.includes(idx)) {
        scores.avoidance += answer;
      }
    });
    return scores;
  };

  // ذخیره نتیجه بعد از تکمیل
  useEffect(() => {
    const saveResultToServer = async () => {
      if (isCompleted && !hasResult && Object.keys(answers).length === questions.length) {
        const scores = calculateScores();
        const score = scores.totalScore || scores.total_score || Object.values(answers).reduce((sum, val) => sum + (val || 0), 0);
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
            scores: scores
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
    const maxScore = 68;
    
    if (score <= 18) {
      return {
        level: "اضطراب اجتماعی خفیف",
        color: "#22c55e",
        desc: "علائم اضطراب اجتماعی خفیف؛ قابل مدیریت با خودیاری.",
        details: "نمره شما نشان می‌دهد که اضطراب اجتماعی در حد طبیعی تا خفیف است. این علائم قابل مدیریت هستند.",
        strengths: [
          "عملکرد مناسب در موقعیت‌های اجتماعی",
          "سطح اضطراب قابل مدیریت",
          "توانایی نسبی در مواجهه با موقعیت‌های اجتماعی"
        ],
        recommendations: [
          "آموزش روانی درباره اضطراب اجتماعی",
          "مواجهه تدریجی در موقعیت‌های کم‌خطر",
          "تمرین مهارت‌های اجتماعی",
          "حفظ تعاملات اجتماعی"
        ]
      };
    } else if (score <= 30) {
      return {
        level: "اضطراب اجتماعی متوسط",
        color: "#eab308",
        desc: "علائم متوسط؛ درمان ساختاریافته توصیه می‌شود.",
        details: "اضطراب اجتماعی شما در حد متوسط است و در برخی موقعیت‌ها تأثیر قابل توجهی دارد.",
        strengths: [
          "برخی مهارت‌های اجتماعی",
          "آگاهی از مشکل"
        ],
        recommendations: [
          "CBT متمرکز بر اضطراب اجتماعی",
          "بازسازی شناختی باورهای منفی",
          "تمرین‌های ایفای نقش",
          "مواجهه تدریجی",
          "گروه درمانی مهارت‌های اجتماعی"
        ]
      };
    } else if (score <= 40) {
      return {
        level: "اضطراب اجتماعی شدید",
        color: "#f97316",
        desc: "علائم شدید؛ ارزیابی تخصصی و برنامه فشرده.",
        details: "اضطراب اجتماعی شما شدید است و تأثیر قابل توجهی بر زندگی روزمره، کار و روابط شما می‌گذارد.",
        strengths: [
          "شناسایی مشکل"
        ],
        recommendations: [
          "درمان CBT/ERP فوری",
          "گروه‌درمانی مهارت‌های اجتماعی",
          "بررسی همبود افسردگی",
          "مواجهه سیستماتیک",
          "درمان دارویی در صورت نیاز (با تجویز پزشک)"
        ]
      };
    } else {
      return {
        level: "اضطراب اجتماعی بسیار شدید",
        color: "#dc2626",
        desc: "بسیار شدید؛ مراقبت چندرشته‌ای ضروری است.",
        details: "اضطراب اجتماعی شما بسیار شدید است و به شدت بر عملکرد روزمره، شغل و روابط شما تأثیر می‌گذارد.",
        strengths: [
          "شناسایی مشکل"
        ],
        recommendations: [
          "ارجاع تخصصی فوری",
          "درمان چندرشته‌ای فشرده",
          "درمان دارویی (با تجویز پزشک)",
          "حمایت خانواده و دوستان",
          "پیگیری منظم و نزدیک"
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
    const scores = calculateScores();
    const interpretation = getInterpretation(score);
    const maxScore = 68;

    const chartData = {
      labels: ['نمره شما', 'خفیف', 'متوسط', 'شدید', 'بسیار شدید'],
      datasets: [{
        label: 'اضطراب اجتماعی',
        data: [score, 18, 30, 40, 68],
        backgroundColor: [
          interpretation.color + 'B3',
          'rgba(34, 197, 94, 0.3)',
          'rgba(234, 179, 8, 0.3)',
          'rgba(249, 115, 22, 0.3)',
          'rgba(220, 38, 38, 0.3)'
        ],
        borderColor: [
          interpretation.color,
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)',
          'rgb(249, 115, 22)',
          'rgb(220, 38, 38)'
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
                <FaExclamationCircle className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست اضطراب اجتماعی</h1>
                <p className="text-secondaryTextColor">تحلیل نتایج شما</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
                <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>{score}</div>
                <div className="text-sm text-secondaryTextColor">از {maxScore}</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سطح</h3>
                <div className="text-2xl font-bold mb-2" style={{ color: interpretation.color }}>{interpretation.level}</div>
                <div className="text-sm text-secondaryTextColor">{interpretation.desc}</div>
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
                {interpretation.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                    <span className="text-secondaryTextColor text-sm">{rec}</span>
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
                    title: { display: true, text: 'تحلیل نمره اضطراب اجتماعی', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: maxScore, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
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
              <FaExclamationCircle className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">تست اضطراب اجتماعی</h1>
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