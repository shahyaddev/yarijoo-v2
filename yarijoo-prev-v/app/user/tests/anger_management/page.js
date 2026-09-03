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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("anger_management");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
    { text: "زود عصبانی می‌شوم", reverse: false },
    { text: "چیزهای کوچک مرا آزار می‌دهند", reverse: false },
    { text: "احساس می‌کنم دیگران مرا تحریک می‌کنند", reverse: false },
    { text: "وقتی عصبانی‌ام، داد می‌زنم", reverse: false },
    { text: "می‌توانم خشمم را کنترل کنم", reverse: true },
    { text: "دیر آرام می‌شوم", reverse: false },
    { text: "به چیزها یا در می‌کوبم", reverse: false },
    { text: "احساس می‌کنم آتشفشانی هستم که ممکن است منفجر شود", reverse: false },
    { text: "از عصبانیتم پشیمان می‌شوم", reverse: false },
    { text: "قبل از عصبانی شدن فکر می‌کنم", reverse: true },
    { text: "وقتی عصبانی‌ام، حرف‌های بدی می‌زنم", reverse: false },
    { text: "می‌توانم آرام بمانم در موقعیت‌های استرس‌زا", reverse: true },
    { text: "احساس می‌کنم همه چیز علیه من است", reverse: false },
    { text: "دیگران می‌گویند عصبانی هستم", reverse: false },
    { text: "می‌توانم درباره خشمم صحبت کنم", reverse: true },
    { text: "خیلی سریع از کوره در می‌روم", reverse: false },
    { text: "می‌توانم راه‌های سالم برای ابراز خشم پیدا کنم", reverse: true },
    { text: "وقتی عصبانی‌ام، چیزهایی می‌گویم که بعداً پشیمان می‌شوم", reverse: false },
    { text: "نفس عمیق می‌کشم وقتی عصبانی می‌شوم", reverse: true },
    { text: "احساس می‌کنم خشم زندگی‌ام را کنترل می‌کند", reverse: false }
  ];

  const options = [
  {
    "label": "هرگز",
    "value": 1
  },
  {
    "label": "به ندرت",
    "value": 2
  },
  {
    "label": "گاهی",
    "value": 3
  },
  {
    "label": "اغلب",
    "value": 4
  },
  {
    "label": "همیشه",
    "value": 5
  }
];

  // بررسی نتیجه قبلی
  useEffect(() => {
    if (hasResult && previousResult && !resultLoading) {
      setIsCompleted(true);
    }
  }, [hasResult, previousResult, resultLoading]);


  const handleAnswer = (value) => {
    const q = questions[currentQuestion];
    const actualValue = q.reverse ? (6 - value) : value;
    setAnswers({ ...answers, [currentQuestion]: actualValue });

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
    const maxScore = 100;
    
    if (score <= 30) {
      return {
        level: "کنترل خوب خشم",
        color: "#22c55e",
        desc: "شما خشم خود را به خوبی مدیریت می‌کنید.",
        details: "نمره شما نشان می‌دهد که مهارت‌های مدیریت خشم خوبی دارید و می‌توانید خشم خود را به صورت سالم کنترل کنید.",
        strengths: ["کنترل خوب خشم", "مهارت‌های مدیریت", "آرامش در موقعیت‌های استرس‌زا"],
        recommendations: [
          "حفظ مهارت‌ها",
          "ادامه خودآگاهی",
          "الگو برای دیگران"
        ]
      };
    } else if (score <= 60) {
      return {
        level: "مشکلات متوسط",
        color: "#eab308",
        desc: "گاهی در کنترل خشم مشکل دارید. یادگیری مهارت‌های مدیریت خشم مفید است.",
        details: "شما گاهی در کنترل خشم مشکل دارید. ممکن است سریع عصبانی شوید یا واکنش‌های شدید نشان دهید. یادگیری مهارت‌های مدیریت خشم می‌تواند کمک زیادی کند.",
        strengths: [],
        recommendations: [
          "**شناسایی محرک‌ها**: چه چیز شما را عصبانی می‌کند؟",
          "**تکنیک‌های آرامش**: تنفس، time-out، شمارش",
          "**بازسازی شناختی**: تغییر تفکرات خشم‌آور",
          "**ارتباط مؤثر**: بیان احساسات به جای انفجار",
          "**آموزش مدیریت خشم**: کلاس یا کارگاه",
          "**ورزش**: تخلیه انرژی منفی"
        ]
      };
    } else {
      return {
        level: "مشکل جدی خشم",
        color: "#dc2626",
        desc: "خشم به شدت بر زندگی شما تأثیر می‌گذارد. درمان ضروری است.",
        details: "نمره شما نشان‌دهنده مشکل جدی در مدیریت خشم است. خشم کنترل نشده می‌تواند روابط، شغل و سلامت شما را تحت تأثیر قرار دهد. درمان فوری ضروری است.",
        strengths: [],
        recommendations: [
          "**🚨 درمان فوری**: با روانشناس مشورت کنید",
          "**برنامه مدیریت خشم**: برنامه ساختاریافته",
          "**CBT**: تغییر الگوهای فکری",
          "**آموزش مهارت**: مهارت‌های ارتباطی و حل تعارض",
          "**دارو**: در برخی موارد",
          "**گروه درمانی**: بسیار مؤثر",
          "**درمان اختلالات همراه**: افسردگی، اضطراب، PTSD",
          "**برنامه ایمنی**: اگر خشونت دارید"
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
      labels: ['نمره شما', 'کنترل خوب (0-30)', 'متوسط (31-60)', 'مشکل جدی (61-100)'],
      datasets: [{
        label: 'نمره مدیریت خشم',
        data: [score, 30, 60, 100],
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
                <h1 className="text-2xl font-bold text-primaryTextColor">مدیریت خشم</h1>
                <p className="text-secondaryTextColor">تحلیل نتایج شما</p>
              </div>
            </div>

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره مدیریت خشم</h3>
              <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>{score}</div>
              <div className="text-sm text-secondaryTextColor mb-4">از 100</div>
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
                    title: { display: true, text: 'تحلیل مدیریت خشم', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: 100, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                  }
                }} />
              </div>
            </div>

            {score > 60 && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6">
                <h4 className="font-medium text-red-400 mb-3">⚠️ هشدار مهم</h4>
                <p className="text-sm text-red-300">
                  خشم کنترل نشده می‌تواند زندگی را نابود کند. درمان ضروری و مؤثر است. اگر خشونت دارید، فوراً کمک بگیرید.
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
              <FaBrain className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">مدیریت خشم</h1>
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
            >{questions[currentQuestion].text || questions[currentQuestion]}</h3>
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