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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("enrich");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
  "همسرم بهترین دوستم است",
  "رابطه‌ام کامل است",
  "ارتباط خوبی داریم",
  "به راحتی با هم صحبت می‌کنیم",
  "احساسات خود را بیان می‌کنیم",
  "تعارضات را سالم حل می‌کنیم",
  "در اختلافات منصف هستیم",
  "فعالیت‌های مشترک داریم",
  "از وقت با هم لذت می‌بریم",
  "جنسیت رابطه رضایت‌بخش است",
  "نیازهای جنسی برآورده می‌شود",
  "کودکان و فرزندپروری را به خوبی مدیریت می‌کنیم",
  "در مورد فرزندان هم‌نظر هستیم",
  "خانواده‌ها و دوستانمان حمایتگر هستند",
  "تعادل بین خانواده و دوستان داریم",
  "نقش‌های خانوادگی واضح است",
  "انتظارات از یکدیگر مشخص است",
  "در مورد مسائل مالی توافق داریم",
  "مدیریت پول را به خوبی انجام می‌دهیم",
  "ارزش‌ها و باورهایمان مشترک است"
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
    "label": "نه موافق نه مخالف"
  },
  {
    "value": 4,
    "label": "موافقم"
  },
  {
    "value": 5,
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
    if (score <= 40) {
      return {
        level: "رضایت بسیار پایین",
        color: "#dc2626",
        desc: "رضایت زناشویی بسیار پایین که نیاز به مداخله فوری دارد.",
        details: "نمره شما نشان می‌دهد که رضایت از رابطه زناشویی بسیار پایین است. این وضعیت نیاز به توجه و مداخله تخصصی دارد. مشکلات جدی در ارتباط، صمیمیت و رضایت وجود دارد که می‌تواند تهدیدکننده رابطه باشد.",
        strengths: [
          "آگاهی از مشکل",
          "تمایل به بهبود"
        ],
        recommendations: [
          "مراجعه فوری به مشاور خانواده یا زوج‌درمانگر",
          "برنامه مشاوره زوجی منظم",
          "شناسایی و حل تعارض‌های اساسی",
          "یادگیری مهارت‌های ارتباطی",
          "ایجاد فضای امن برای گفت‌وگو"
        ]
      };
    }
    if (score <= 60) {
      return {
        level: "رضایت پایین",
        color: "#ef4444",
        desc: "رضایت زناشویی پایین که نیاز به تلاش و بهبود دارد.",
        details: "رضایت از رابطه زناشویی در سطح پایین است. مشکلات قابل توجهی در برخی جنبه‌های رابطه وجود دارد که نیاز به تلاش و بهبود دارد. کار بر روی بهبود رابطه توصیه می‌شود.",
        strengths: [
          "برخی جنبه‌های مثبت",
          "پتانسیل بهبود"
        ],
        recommendations: [
          "مشاوره زوجی برای بهبود رابطه",
          "کار بر روی مهارت‌های ارتباطی",
          "افزایش زمان کیفیت با هم",
          "شناسایی و حل مشکلات ارتباطی",
          "یادگیری حل تعارض"
        ]
      };
    }
    if (score <= 80) {
      return {
        level: "رضایت متوسط",
        color: "#eab308",
        desc: "رضایت زناشویی در سطح متوسط است.",
        details: "رضایت از رابطه در سطح متوسط است. برخی جنبه‌های رابطه رضایت‌بخش هستند اما هنوز زمینه برای بهبود وجود دارد. با تلاش و تمرکز می‌توانید کیفیت رابطه را افزایش دهید.",
        strengths: [
          "تعادل نسبی در رابطه",
          "برخی جنبه‌های مثبت",
          "پایه برای بهبود"
        ],
        recommendations: [
          "افزایش فعالیت‌های مشترک",
          "تقویت ارتباطات روزمره",
          "یادگیری مهارت‌های جدید ارتباطی",
          "تعیین اهداف مشترک",
          "قدردانی و قدردانی از یکدیگر"
        ]
      };
    }
    return {
      level: "رضایت بالا",
      color: "#22c55e",
      desc: "رضایت زناشویی بالا است.",
      details: "رضایت از رابطه زناشویی در سطح خوبی است. شما از اکثر جنبه‌های رابطه راضی هستید و رابطه سالم و مثبتی دارید. ادامه تلاش برای حفظ و بهبود رابطه توصیه می‌شود.",
      strengths: [
        "رضایت بالا از رابطه",
        "ارتباط مؤثر",
        "صمیمیت مناسب",
        "حل تعارض سالم",
        "رضایت جنسی",
        "همکاری در مسائل"
      ],
      recommendations: [
        "حفظ و تقویت روابط مثبت فعلی",
        "ادامه فعالیت‌های مشترک",
        "قدردانی منظم از یکدیگر",
        "برنامه‌ریزی برای آینده مشترک",
        "جشن‌گیری دستاوردها"
      ]
    };
  };

  const getRecommendations = (score) => {
    if (score <= 40) {
      return [
        "مراجعه فوری به مشاور خانواده یا زوج‌درمانگر",
        "برنامه مشاوره زوجی منظم",
        "شناسایی و حل تعارض‌های اساسی",
        "یادگیری مهارت‌های ارتباطی",
        "ایجاد فضای امن برای گفت‌وگو"
      ];
    }
    if (score <= 60) {
      return [
        "مشاوره زوجی برای بهبود رابطه",
        "کار بر روی مهارت‌های ارتباطی",
        "افزایش زمان کیفیت با هم",
        "شناسایی و حل مشکلات ارتباطی",
        "یادگیری حل تعارض"
      ];
    }
    if (score <= 80) {
      return [
        "افزایش فعالیت‌های مشترک",
        "تقویت ارتباطات روزمره",
        "یادگیری مهارت‌های جدید ارتباطی",
        "تعیین اهداف مشترک",
        "قدردانی و قدردانی از یکدیگر"
      ];
    }
    return [
      "حفظ و تقویت روابط مثبت فعلی",
      "ادامه فعالیت‌های مشترک",
      "قدردانی منظم از یکدیگر",
      "برنامه‌ریزی برای آینده مشترک",
      "جشن‌گیری دستاوردها"
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
    const maxScore = 100;

    const chartData = {
      labels: ['نمره شما', 'پایین (40)', 'متوسط (60)', 'خوب (80)', 'عالی (100)'],
      datasets: [{
        label: 'نمره ENRICH',
        data: [score, 40, 60, 80, 100],
        backgroundColor: [
          interpretation.color + 'B3',
          'rgba(220, 38, 38, 0.3)',
          'rgba(239, 68, 68, 0.3)',
          'rgba(234, 179, 8, 0.3)',
          'rgba(34, 197, 94, 0.3)'
        ],
        borderColor: [
          interpretation.color,
          'rgb(220, 38, 38)',
          'rgb(239, 68, 68)',
          'rgb(234, 179, 8)',
          'rgb(34, 197, 94)'
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
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست ENRICH</h1>
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

            {score <= 60 && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-2xl p-6">
                <h4 className="font-medium text-yellow-400 mb-3">⚠️ توجه</h4>
                <p className="text-sm text-yellow-300">رضایت زناشویی در سطح پایینی است. مشاوره زوجی توصیه می‌شود.</p>
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
                    title: { display: true, text: 'تحلیل نمره ENRICH', color: '#e5e7eb', font: { size: 16 } }
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
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره ENRICH</h4>
              <p className="text-sm text-blue-300">
                ENRICH یک مقیاس 20 سوالی برای ارزیابی رضایت زناشویی است. 
                این تست جنبه‌های مختلف رابطه را بررسی می‌کند: ارتباطات، حل تعارض، 
                رضایت جنسی، نقش‌ها، والدین، خانواده و دوستان، مدیریت مالی، 
                ارزش‌ها و اعتقادات.
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
              <h1 className="text-2xl font-bold text-primaryTextColor">تست ENRICH</h1>
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