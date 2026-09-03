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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("ders");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
  "وقتی ناراحت می‌شوم، احساساتم را می‌شناسم",
  "به احساساتم توجه می‌کنم",
  "احساساتم را می‌فهمم",
  "وقتی ناراحتم، رفتارم را کنترل نمی‌کنم",
  "وقتی ناراحتم، تمرکز ندارم",
  "وقتی ناراحتم، کنترل می‌کنم",
  "وقتی ناراحتم، خجالت می‌کشم",
  "وقتی ناراحتم، دقیقاً نمی‌دانم چه احساسی دارم",
  "به احساساتم اهمیت می‌دهم",
  "وقتی ناراحتم، مشکل در کار دارم",
  "وقتی ناراحتم، کنترل از دست می‌دهم",
  "وقتی ناراحتم، باور دارم راهی برای بهتر شدن ندارم",
  "وقتی ناراحتم، خجالت از احساساتم دارم",
  "وقتی ناراحتم، نمی‌دانم چطور مدیریت کنم",
  "وقتی ناراحتم، با آن می‌مانم مدت طولانی",
  "وقتی ناراحتم، در نهایت راهی برای بهتر شدن پیدا می‌کنم",
  "وقتی ناراحتم، احساساتم خارج از کنترل به نظر می‌رسد",
  "وقتی ناراحتم، فکر می‌کنم ضعیفم"
        ]

  const options = [
  {
    "value": 1,
    "label": "تقریباً هرگز"
  },
  {
    "value": 2,
    "label": "گاهی"
  },
  {
    "value": 3,
    "label": "نیمی از وقت"
  },
  {
    "value": 4,
    "label": "اکثر اوقات"
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

  const reverseItems = [9, 10, 11, 16];

  const calculateScore = () => {
    let total = 0;
    for (let i = 0; i < questions.length; i++) {
      const value = answers[i] || 0;
      const actualValue = reverseItems.includes(i) ? (6 - value) : value;
      total += actualValue;
    }
    return total;
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
    if (score <= 54) {
      return {
        level: "تنظیم هیجان خوب",
        color: "#22c55e",
        desc: "دشواری پایین در تنظیم هیجان.",
        details: "شما هیجانات خود را به خوبی تنظیم می‌کنید و مهارت‌های تنظیم هیجان مناسبی دارید.",
        strengths: [
          "مهارت‌های تنظیم هیجان خوب",
          "کنترل مناسب احساسات",
          "آگاهی هیجانی بالا",
          "توانایی مدیریت استرس",
          "عملکرد مناسب در موقعیت‌های سخت"
        ],
        recommendations: [
          "حفظ مهارت‌های تنظیم هیجان",
          "ادامه تمرین ذهن‌آگاهی",
          "کمک به دیگران در یادگیری تنظیم هیجان"
        ]
      };
    }
    if (score <= 72) {
      return {
        level: "دشواری متوسط",
        color: "#eab308",
        desc: "دشواری متوسط در تنظیم هیجان.",
        details: "گاهی در تنظیم هیجانات مشکل دارید. یادگیری مهارت‌های تنظیم هیجان می‌تواند مفید باشد.",
        strengths: [
          "برخی مهارت‌های تنظیم هیجان",
          "آگاهی از نیاز به بهبود"
        ],
        recommendations: [
          "یادگیری مهارت‌های تنظیم هیجان",
          "تمرین ذهن‌آگاهی روزانه",
          "یادگیری شناسایی و نام‌گذاری احساسات",
          "مشاوره با روان‌شناس",
          "یادگیری استراتژی‌های مقابله سالم"
        ]
      };
    }
    return {
      level: "دشواری شدید",
      color: "#ef4444",
      desc: "دشواری شدید در تنظیم هیجان که نیاز به کمک دارد.",
      details: "دشواری قابل توجه در تنظیم هیجانات که بر زندگی شما تأثیر می‌گذارد. درمان تخصصی (DBT) توصیه می‌شود.",
      strengths: [
        "شناسایی مشکل"
      ],
      recommendations: [
        "درمان DBT (درمان دیالکتیک رفتاری)",
        "مشاوره فوری با روان‌شناس متخصص",
        "یادگیری مهارت‌های 4گانه DBT: ذهن‌آگاهی، تحمل پریشانی، تنظیم هیجان، اثربخشی بین‌فردی",
        "تمرین روزانه ذهن‌آگاهی (10-20 دقیقه)",
        "ثبت احساسات و trigger ها",
        "ایجاد سیستم حمایتی قوی"
      ]
    };
  };

  const getRecommendations = (score) => {
    if (score <= 54) {
      return [
        "حفظ مهارت‌های تنظیم هیجان",
        "ادامه تمرین ذهن‌آگاهی",
        "کمک به دیگران در یادگیری تنظیم هیجان"
      ];
    }
    if (score <= 72) {
      return [
        "یادگیری مهارت‌های تنظیم هیجان",
        "تمرین ذهن‌آگاهی روزانه",
        "یادگیری شناسایی و نام‌گذاری احساسات",
        "مشاوره با روان‌شناس",
        "یادگیری استراتژی‌های مقابله سالم"
      ];
    }
    return [
      "درمان DBT (درمان دیالکتیک رفتاری)",
      "مشاوره فوری با روان‌شناس متخصص",
      "یادگیری مهارت‌های 4گانه DBT: ذهن‌آگاهی، تحمل پریشانی، تنظیم هیجان، اثربخشی بین‌فردی",
      "تمرین روزانه ذهن‌آگاهی (10-20 دقیقه)",
      "ثبت احساسات و trigger ها",
      "ایجاد سیستم حمایتی قوی"
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
    const maxScore = questions.length * Math.max(...options.map(o => o.value));

    const chartData = {
      labels: ['نمره شما', 'خوب (18-54)', 'متوسط (55-72)', 'شدید (73-90)'],
      datasets: [{
        label: 'نمره DERS',
        data: [score, 54, 72, 90],
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
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست دشواری در تنظیم هیجان (DERS)</h1>
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

            {score > 54 && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-2xl p-6">
                <h4 className="font-medium text-yellow-400 mb-3">⚠️ توجه</h4>
                <p className="text-sm text-yellow-300">دشواری در تنظیم هیجان قابل توجه است. یادگیری مهارت‌های تنظیم هیجان توصیه می‌شود.</p>
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
                    title: { display: true, text: 'تحلیل نمره دشواری در تنظیم هیجان', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: maxScore, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                  }
                }} />
              </div>
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
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توضیحات</h3>
              <p className="text-secondaryTextColor leading-relaxed mb-4">{interpretation.details}</p>
            </div>

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
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره DERS</h4>
              <p className="text-sm text-blue-300">
                مقیاس دشواری‌های تنظیم هیجان (DERS-18) یک ابزار برای ارزیابی مشکلات در تنظیم هیجانات است. 
                نمرات بالاتر نشان‌دهنده دشواری بیشتر در تنظیم هیجان است. DBT مؤثرترین درمان برای مشکلات تنظیم هیجان است.
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
              <h1 className="text-2xl font-bold text-primaryTextColor">تست DERS</h1>
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