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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("bhs");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
  "آینده برایم امیدوارکننده به نظر می‌رسد.",
  "انتظار ندارم اوضاع بهتر شود.",
  "برای اهدافم برنامه مشخصی دارم.",
  "معمولاً اتفاق‌ها بر خلاف میل من پیش می‌رود.",
  "با تلاش می‌توانم آینده بهتری بسازم.",
  "هیچ دلیلی برای تلاش نمی‌بینم.",
  "آینده روشنی پیش رویم می‌بینم.",
  "هیچ امیدی به تغییر ندارم.",
  "می‌توانم مسیر زندگی‌ام را بهبود دهم.",
  "انتظار شکست‌های بیشتری دارم.",
  "چشم‌انداز مطلوبی برای خودم می‌بینم.",
  "تجربه نشان داده تلاش‌هایم بی‌نتیجه است.",
  "اهداف واقع‌بینانه و دست‌یافتنی دارم.",
  "تصور می‌کنم آینده‌ام تیره است.",
  "می‌توانم موانع را مدیریت کنم.",
  "چیزها بهتر نخواهند شد.",
  "به توانایی تغییر شرایط باور دارم.",
  "بهتر شدن اوضاع غیرممکن است.",
  "برای آینده برنامه‌ریزی می‌کنم.",
  "هیچ برنامه‌ای برای آینده ندارم."
        ]

  const options = [
  {
    "value": 0,
    "label": "مخالفم"
  },
  {
    "value": 1,
    "label": "موافقم"
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
    if (score <= 3) {
      return {
        level: "کمینه",
        color: "#22c55e",
        desc: "سطح ناامیدی در حد طبیعی است.",
        details: "نمره شما نشان می‌دهد که سطح ناامیدی در حد طبیعی است. شما نگرش مثبت و امیدوارانه‌ای نسبت به آینده دارید.",
        strengths: [
          "نگرش مثبت نسبت به آینده",
          "امید به بهتر شدن شرایط",
          "اعتماد به توانایی تغییر",
          "برنامه‌ریزی برای آینده",
          "مقاومت در برابر ناامیدی"
        ]
      };
    }
    if (score <= 7) {
      return {
        level: "خفیف",
        color: "#eab308",
        desc: "علائم خفیف ناامیدی مشاهده می‌شود.",
        details: "بر اساس پاسخ‌های شما، علائم خفیف ناامیدی وجود دارد که قابل کنترل است. یادگیری مهارت‌های مدیریت ناامیدی می‌تواند کمک کند.",
        strengths: [
          "برخی جنبه‌های امید هنوز وجود دارد",
          "آگاهی از وضعیت",
          "ظرفیت برای بهبود"
        ]
      };
    }
    if (score <= 13) {
      return {
        level: "متوسط",
        color: "#f97316",
        desc: "سطح متوسط ناامیدی که نیاز به توجه دارد.",
        details: "علائم ناامیدی متوسطی در شما مشاهده می‌شود که نیاز به توجه دارد. این می‌تواند بر عملکرد روزانه و کیفیت زندگی تأثیر بگذارد.",
        strengths: [
          "شناسایی مشکل",
          "آمادگی برای بهبود"
        ]
      };
    }
    return {
      level: "شدید",
      color: "#ef4444",
      desc: "سطح شدید ناامیدی و نیاز به مراقبت فوری.",
      details: "علائم ناامیدی شدیدی در شما مشاهده می‌شود که نیاز به مداخله تخصصی فوری دارد. این وضعیت می‌تواند خطرناک باشد و بر همه جنبه‌های زندگی شما تأثیر بگذارد. لطفاً فوراً با متخصص سلامت روان تماس بگیرید.",
      strengths: [
        "شناسایی مشکل"
      ]
    };
  };

  const getRecommendations = (score) => {
    if (score <= 3) {
      return [
        "حفظ نگرش مثبت و واقع‌بینانه",
        "تعیین اهداف واقع‌بینانه و قابل دستیابی",
        "حفظ روابط اجتماعی و حمایت خانوادگی"
      ];
    }
    if (score <= 7) {
      return [
        "یادگیری تکنیک‌های تغییر افکار منفی",
        "تعیین اهداف کوچک و قابل دستیابی",
        "افزایش فعالیت‌های لذت‌بخش",
        "درمان شناختی-رفتاری خودیاری"
      ];
    }
    if (score <= 13) {
      return [
        "مراجعه به روان‌شناس یا روان‌پزشک برای ارزیابی تخصصی",
        "درمان شناختی-رفتاری (CBT) برای ناامیدی",
        "بررسی و تغییر افکار منفی درباره آینده",
        "ایجاد سیستم حمایتی قوی"
      ];
    }
    return [
      "مراجعه فوری به روان‌پزشک یا روان‌درمانگر",
      "برنامه ایمنی و مدیریت بحران",
      "برنامه درمانی جامع شامل درمان دارویی و روان‌درمانی",
      "ایجاد سیستم حمایتی قوی و نظارت مداوم",
      "پیگیری منظم و فوری"
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
    const maxScore = 20;

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
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست BHS</h1>
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
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار تحلیل</h3>
              <div className="w-full h-80">
                <Bar data={{
                  labels: ['نمره شما', 'آستانه خفیف (4)', 'آستانه متوسط (8)', 'آستانه شدید (14)'],
                  datasets: [{
                    label: 'نمره ناامیدی',
                    data: [score, 4, 8, 14],
                    backgroundColor: [interpretation.color + 'B3', 'rgba(234, 179, 8, 0.3)', 'rgba(249, 115, 22, 0.3)', 'rgba(239, 68, 68, 0.3)'],
                    borderColor: [interpretation.color, 'rgb(234, 179, 8)', 'rgb(249, 115, 22)', 'rgb(239, 68, 68)'],
                    borderWidth: 2
                  }]
                }} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'نمره ناامیدی و آستانه‌ها', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: 20, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
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
                  <span className="text-secondaryTextColor">0-3: کمینه (طبیعی)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-secondaryTextColor">4-7: خفیف</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-secondaryTextColor">8-13: متوسط</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-secondaryTextColor">14-20: شدید</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره BHS</h4>
              <p className="text-sm text-blue-300">
                مقیاس ناامیدی بک (BHS) یک ابزار 20 سوالی برای ارزیابی ناامیدی است. 
                نمرات بالا نشان‌دهنده ناامیدی شدید است که می‌تواند خطرناک باشد.
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
              <FaBrain className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">تست BHS</h1>
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