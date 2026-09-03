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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("k10");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
  "خود را بی‌دلیل عصبی یا مضطرب احساس کرده‌ام.",
  "چنان نگران بوده‌ام که آرام شدن برایم سخت بوده است.",
  "چنان بی‌قراری داشته‌ام که نمی‌توانستم آرام بگیرم.",
  "احساس ناامیدی نسبت به آینده داشته‌ام.",
  "احساس کرده‌ام هر کاری سخت‌تر از معمول است.",
  "احساس افسردگی یا دل‌گرفتگی داشته‌ام.",
  "احساس کرده‌ام هیچ چیز مرا شاد نمی‌کند.",
  "احساس خستگی بدون علت واضح داشته‌ام.",
  "چنان ناراحت بوده‌ام که هیچ چیز آرامم نمی‌کرد.",
  "احساس بی‌ارزشی یا بی‌فایدگی داشته‌ام."
        ]

  const options = [
  {
    "value": 1,
    "label": "هیچ‌وقت"
  },
  {
    "value": 2,
    "label": "به‌ندرت"
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
    "label": "تقریباً همیشه"
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
    if (score <= 19) {
      return {
        level: "کمینه",
        color: "#22c55e",
        desc: "سطح پریشانی روانی کم است.",
        details: "نمره شما نشان می‌دهد که سطح پریشانی روانی در حد طبیعی است. این یک نشانه مثبت از سلامت روانی است.",
        strengths: [
          "سلامت روانی خوب",
          "عدم علائم قابل توجه پریشانی",
          "عملکرد مناسب",
          "کیفیت زندگی خوب"
        ],
        recommendations: [
          "حفظ سبک زندگی سالم",
          "ادامه فعالیت‌های لذت‌بخش",
          "حفظ روابط اجتماعی"
        ]
      };
    }
    if (score <= 24) {
      return {
        level: "خفیف",
        color: "#84cc16",
        desc: "سطح پریشانی روانی خفیف است.",
        details: "علائم خفیف پریشانی روانی در شما مشاهده می‌شود. این قابل کنترل است و با یادگیری مهارت‌های مقابله می‌توانید آن را مدیریت کنید.",
        strengths: [
          "برخی مهارت‌های مقابله",
          "آگاهی از مشکل"
        ],
        recommendations: [
          "یادگیری تکنیک‌های مدیریت استرس",
          "تمرین ذهن‌آگاهی",
          "پایش علائم و توجه به تغییرات"
        ]
      };
    }
    if (score <= 29) {
      return {
        level: "متوسط",
        color: "#eab308",
        desc: "سطح پریشانی روانی متوسط است.",
        details: "علائم متوسط پریشانی روانی در شما مشاهده می‌شود که نیاز به توجه دارد. این می‌تواند بر عملکرد شما تأثیر بگذارد.",
        strengths: [
          "شناسایی مشکل"
        ],
        recommendations: [
          "مراجعه به روان‌شناس یا روان‌پزشک برای ارزیابی",
          "درمان شناختی-رفتاری (CBT)",
          "یادگیری تکنیک‌های مدیریت استرس",
          "تقویت حمایت اجتماعی"
        ]
      };
    }
    return {
      level: "شدید",
      color: "#ef4444",
      desc: "سطح پریشانی روانی شدید است.",
      details: "علائم شدید پریشانی روانی در شما مشاهده می‌شود که نیاز به مداخله فوری دارد. این می‌تواند به شدت بر زندگی شما تأثیر بگذارد.",
      strengths: [
        "شناسایی مشکل"
      ],
      recommendations: [
        "مراجعه فوری به روان‌پزشک برای ارزیابی و درمان",
        "برنامه درمانی جامع شامل درمان دارویی و روان‌درمانی",
        "برنامه ایمنی و مدیریت بحران",
        "حمایت خانواده و اطرافیان"
      ]
    };
  };

  const getRecommendations = (score) => {
    if (score <= 19) {
      return [
        "حفظ سبک زندگی سالم",
        "ادامه فعالیت‌های لذت‌بخش",
        "حفظ روابط اجتماعی"
      ];
    }
    if (score <= 24) {
      return [
        "یادگیری تکنیک‌های مدیریت استرس",
        "تمرین ذهن‌آگاهی",
        "پایش علائم و توجه به تغییرات"
      ];
    }
    if (score <= 29) {
      return [
        "مراجعه به روان‌شناس یا روان‌پزشک برای ارزیابی",
        "درمان شناختی-رفتاری (CBT)",
        "یادگیری تکنیک‌های مدیریت استرس",
        "تقویت حمایت اجتماعی"
      ];
    }
    return [
      "مراجعه فوری به روان‌پزشک برای ارزیابی و درمان",
      "برنامه درمانی جامع شامل درمان دارویی و روان‌درمانی",
      "برنامه ایمنی و مدیریت بحران",
      "حمایت خانواده و اطرافیان"
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
    const maxScore = 50;

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
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست K10</h1>
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
                <Bar data={chartData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'تحلیل نمره K10', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: maxScore, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                  }
                }} />
              </div>
            </div>

            {score > 24 && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-2xl p-6">
                <h4 className="font-medium text-yellow-400 mb-3">⚠️ توجه</h4>
                <p className="text-sm text-yellow-300">نمره شما نشان‌دهنده سطح متوسط تا شدید پریشانی روانی است. ارزیابی تخصصی توصیه می‌شود.</p>
              </div>
            )}

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

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره K10</h4>
              <p className="text-sm text-blue-300">
                K10 یک مقیاس 10 سوالی برای ارزیابی سطح پریشانی روانی در 30 روز گذشته است. 
                نمرات: 10-19 (کمینه)، 20-24 (خفیف)، 25-29 (متوسط)، 30-50 (شدید).
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
              <h1 className="text-2xl font-bold text-primaryTextColor">تست K10</h1>
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