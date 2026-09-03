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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("pswq");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
    { text: "اغلب درباره چیزهایی که ممکن است اشتباه شود نگرانم.", reverse: false },
    { text: "وقتی یک نگرانی شروع می‌شود، سخت است متوقفش کنم.", reverse: false },
    { text: "بیشتر از افراد دیگر نگران می‌شوم.", reverse: false },
    { text: "نگرانی‌ها ذهن مرا مشغول نگه می‌دارند.", reverse: false },
    { text: "حتی وقتی چیز مهمی در پیش نیست، باز هم نگران می‌شوم.", reverse: false },
    { text: "وقتی یک مشکل را حل می‌کنم، سریعاً درباره مشکل بعدی نگران می‌شوم.", reverse: false },
    { text: "نگران بودن به عادتی برای من تبدیل شده است.", reverse: false },
    { text: "کنترل نگرانی‌ها برایم دشوار است.", reverse: false },
    { text: "نگرانی‌های کوچک را بزرگ می‌کنم.", reverse: false },
    { text: "وقتی یک فکر نگران‌کننده می‌آید، بارها برمی‌گردد.", reverse: false },
    { text: "گاهی می‌توانم نگرانی را به‌خوبی کنار بگذارم.", reverse: true },
    { text: "وقتی مشغول کاری هستم، نگرانی‌ها کمتر می‌شوند.", reverse: true },
    { text: "به ندرت نگران مسائل جزئی می‌شوم.", reverse: true },
    { text: "نگرانی‌ام بیش از حد معمول است.", reverse: false },
    { text: "اغلب نگران اتفاقاتی هستم که احتمالاً هرگز رخ نمی‌دهند.", reverse: false },
    { text: "سعی می‌کنم از نگرانی جلوگیری کنم ولی دوباره برمی‌گردد.", reverse: false }
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
    const q = questions[currentQuestion];
    const actualValue = q.reverse ? (6 - value) : value;
    const newAnswers = { ...answers, [currentQuestion]: actualValue };
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
    if (score < 45) {
      return {
        level: "کمینه-متوسط",
        color: "#22c55e",
        desc: "سطح نگرانی در حد طبیعی تا متوسط است.",
        details: "نمره شما نشان می‌دهد که سطح نگرانی در حد طبیعی تا متوسط است. شما می‌توانید نگرانی‌های خود را مدیریت کنید و آن‌ها به طور قابل توجهی زندگی شما را مختل نمی‌کنند.",
        strengths: [
          "کنترل مناسب نگرانی",
          "عملکرد مناسب در زندگی روزمره",
          "مهارت‌های مقابله مؤثر",
          "کیفیت زندگی خوب"
        ]
      };
    }
    if (score <= 59) {
      return {
        level: "بالا",
        color: "#eab308",
        desc: "سطح نگرانی بالا که نیاز به توجه دارد.",
        details: "سطح نگرانی بالا در شما مشاهده می‌شود که نیاز به مدیریت دارد. نگرانی‌های شما ممکن است شروع به تأثیرگذاری بر عملکرد روزانه و کیفیت زندگی کنند. یادگیری مهارت‌های مدیریت نگرانی می‌تواند کمک کند.",
        strengths: [
          "آگاهی از مشکل",
          "برخی مهارت‌های مقابله",
          "قابل بهبود بودن"
        ]
      };
    }
    return {
      level: "بسیار بالا",
      color: "#ef4444",
      desc: "سطح نگرانی بسیار بالا که نیاز به مداخله دارد.",
      details: "سطح نگرانی بسیار بالا در شما مشاهده می‌شود که نیاز به مداخله تخصصی دارد. نگرانی‌های مفرط شما به شدت بر عملکرد روزانه، کار، روابط و کیفیت زندگی تأثیر می‌گذارند. این ممکن است نشان‌دهنده اختلال اضطراب فراگیر (GAD) باشد.",
      strengths: [
        "شناسایی مشکل"
      ]
    };
  };

  const getRecommendations = (score) => {
    if (score < 45) {
      return [
        "حفظ سبک زندگی سالم",
        "مدیریت استرس",
        "تمرین ذهن‌آگاهی"
      ];
    }
    if (score <= 59) {
      return [
        "یادگیری تکنیک‌های مدیریت نگرانی",
        "درمان شناختی-رفتاری (CBT) برای نگرانی",
        "تمرین ذهن‌آگاهی و آرام‌سازی",
        "مشاوره با روان‌شناس"
      ];
    }
    return [
      "مراجعه به روان‌شناس یا روان‌پزشک",
      "درمان شناختی-رفتاری (CBT) برای نگرانی مفرط",
      "یادگیری تکنیک‌های مدیریت نگرانی",
      "برنامه درمانی ساختاریافته"
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
    const maxScore = 80;

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
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست PSWQ</h1>
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
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار تحلیل</h3>
              <div className="w-full h-80">
                <Bar data={{
                  labels: ['نمره شما', 'آستانه بالا (45)', 'آستانه بسیار بالا (60)'],
                  datasets: [{
                    label: 'نمره نگرانی',
                    data: [score, 45, 60],
                    backgroundColor: [interpretation.color + 'B3', 'rgba(234, 179, 8, 0.3)', 'rgba(239, 68, 68, 0.3)'],
                    borderColor: [interpretation.color, 'rgb(234, 179, 8)', 'rgb(239, 68, 68)'],
                    borderWidth: 2
                  }]
                }} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'نمره نگرانی و آستانه‌ها', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: 80, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                  }
                }} />
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توصیه‌های تخصصی</h3>
              <ul className="list-disc list-inside space-y-2 text-secondaryTextColor">
                {recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره PSWQ</h4>
              <p className="text-sm text-blue-300">PSWQ یک ابزار 16 سوالی برای سنجش نگرانی مفرط است. نمره 45 یا بالاتر نشان‌دهنده سطح بالای نگرانی است.</p>
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
              <h1 className="text-2xl font-bold text-primaryTextColor">تست PSWQ</h1>
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
            >{questions[currentQuestion].text}</h3>
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