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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("isi");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
  "مشکل در به‌خواب‌رفتن در ابتدای شب",
  "مشکل در تداوم خواب (بیدار شدن‌های مکرر)",
  "بیدار شدن زودهنگام و ناتوانی در بازخواب",
  "میزان رضایت شما از الگوی خواب کنونی",
  "میزان تداخل مشکلات خواب با عملکرد روزانه (کار/تحصیل/روابط)",
  "قابل‌توجه بودن مشکل خواب برای دیگران (نگرانی دیگران/بازخورد)",
  "میزان نگرانی/پریشانی شما درباره مشکل خواب"
        ]

  const options = [
  {
    "value": 0,
    "label": "هیچ/اصلاً"
  },
  {
    "value": 1,
    "label": "خفیف"
  },
  {
    "value": 2,
    "label": "متوسط"
  },
  {
    "value": 3,
    "label": "شدید"
  },
  {
    "value": 4,
    "label": "بسیار شدید"
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
    if (score <= 7) {
      return {
        level: "بدون بی‌خوابی",
        color: "#22c55e",
        desc: "شما مشکل بی‌خوابی بالینی ندارید.",
        details: "کیفیت خواب شما مناسب است و مشکلات خواب به طور قابل توجهی زندگی شما را مختل نمی‌کند. این یک نشانه مثبت از سلامت خواب است.",
        strengths: [
          "کیفیت خواب مناسب",
          "عدم اختلال در عملکرد روزانه",
          "الگوی خواب منظم",
          "سلامت عمومی خوب"
        ]
      };
    }
    if (score <= 14) {
      return {
        level: "بی‌خوابی خفیف",
        color: "#84cc16",
        desc: "علائم خفیف بی‌خوابی دارید.",
        details: "مشکلات خواب شما در سطح خفیفی است که معمولاً با تغییرات سبک زندگی و بهداشت خواب بهبود می‌یابد. این مرحله می‌تواند با مداخله زودهنگام به راحتی برطرف شود.",
        strengths: [
          "آگاهی از مشکل",
          "زمان مناسب برای مداخله",
          "برخی مهارت‌های مقابله"
        ]
      };
    }
    if (score <= 21) {
      return {
        level: "بی‌خوابی متوسط",
        color: "#eab308",
        desc: "بی‌خوابی متوسط دارید که شروع به تأثیر بر عملکرد روزانه کرده است.",
        details: "مشکلات خواب شما نیاز به مداخله حرفه‌ای دارد. بی‌خوابی متوسط می‌تواند بر عملکرد روزانه، کار و روابط تأثیر بگذارد. CBT-I (درمان شناختی-رفتاری بی‌خوابی) می‌تواند بسیار مؤثر باشد.",
        strengths: [
          "شناسایی مشکل",
          "آمادگی برای بهبود"
        ]
      };
    }
    return {
      level: "بی‌خوابی شدید",
      color: "#ef4444",
      desc: "بی‌خوابی شدید دارید که به شدت عملکرد شما را مختل می‌کند.",
      details: "بی‌خوابی شدید شما نیاز فوری به ارزیابی و درمان توسط متخصص خواب یا روان‌پزشک دارد. این سطح از بی‌خوابی به شدت بر عملکرد روزانه، کار، روابط و کیفیت زندگی شما تأثیر می‌گذارد.",
      strengths: [
        "شناسایی مشکل"
      ]
    };
  };

  const getRecommendations = (score) => {
    if (score <= 7) {
      return [
        "حفظ بهداشت خواب فعلی",
        "خواب منظم",
        "محیط مناسب خواب",
        "اجتناب از محرک‌ها قبل خواب"
      ];
    }
    if (score <= 14) {
      return [
        "رعایت بهداشت خواب",
        "برنامه خواب منظم",
        "محدود کردن کافئین",
        "ورزش روزانه",
        "تکنیک‌های آرام‌سازی قبل خواب"
      ];
    }
    if (score <= 21) {
      return [
        "مشاوره با متخصص خواب",
        "CBT-I (درمان شناختی-رفتاری بی‌خوابی)",
        "بررسی علل پزشکی",
        "بهداشت خواب دقیق",
        "اجتناب از خواب روزانه"
      ];
    }
    return [
      "مراجعه فوری به متخصص خواب",
      "بررسی کامل پزشکی",
      "احتمال نیاز به دارو موقت",
      "CBT-I تخصصی",
      "بررسی اختلالات همزمان"
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
    const maxScore = 28;

    const chartData = {
      labels: ['نمره شما', 'طبیعی (0-7)', 'خفیف (8-14)', 'متوسط (15-21)', 'شدید (22-28)'],
      datasets: [{
        label: 'نمره ISI',
        data: [score, 7, 14, 21, 28],
        backgroundColor: [
          interpretation.color + 'B3',
          'rgba(34, 197, 94, 0.3)',
          'rgba(234, 179, 8, 0.3)',
          'rgba(249, 115, 22, 0.3)',
          'rgba(239, 68, 68, 0.3)'
        ],
        borderColor: [
          interpretation.color,
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)',
          'rgb(249, 115, 22)',
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
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست ISI</h1>
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

            {score > 7 && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-2xl p-6">
                <h4 className="font-medium text-yellow-400 mb-3">⚠️ توجه</h4>
                <p className="text-sm text-yellow-300">مشکلات خواب قابل توجهی در شما مشاهده می‌شود. ارزیابی تخصصی توصیه می‌شود.</p>
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
                    title: { display: true, text: 'تحلیل نمره ISI', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: maxScore, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
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
              <ul className="list-disc list-inside space-y-2 text-secondaryTextColor">
                {getRecommendations(score).map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره ISI</h4>
              <p className="text-sm text-blue-300">
                شاخص شدت بی‌خوابی (ISI) یک ابزار 7 سوالی برای ارزیابی شدت بی‌خوابی است. 
                نمرات: 0-7 (بدون بی‌خوابی)، 8-14 (خفیف)، 15-21 (متوسط)، 22-28 (شدید).
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
              <h1 className="text-2xl font-bold text-primaryTextColor">تست ISI</h1>
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