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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("bsi18");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
    { text: "سردرد یا دردهای پراکنده بدنی", subscale: "Somatization" },
    { text: "احساس غمگینی یا دل‌گرفتگی", subscale: "Depression" },
    { text: "احساس نگرانی یا دل‌شوره", subscale: "Anxiety" },
    { text: "سرگیجه یا سبک‌سری", subscale: "Somatization" },
    { text: "احساس بی‌ارزشی یا بی‌فایدگی", subscale: "Depression" },
    { text: "تپش قلب یا لرزش به‌علت اضطراب", subscale: "Anxiety" },
    { text: "تهوع یا ناراحتی معده", subscale: "Somatization" },
    { text: "کاهش علاقه به فعالیت‌های معمول", subscale: "Depression" },
    { text: "احساس ترس بدون دلیل مشخص", subscale: "Anxiety" },
    { text: "بی‌حسی یا مورمور در بدن", subscale: "Somatization" },
    { text: "افکار ناامیدی نسبت به آینده", subscale: "Depression" },
    { text: "احساس تنش یا ناتوانی در آرام شدن", subscale: "Anxiety" },
    { text: "درد قفسه سینه یا تنگی نفس", subscale: "Somatization" },
    { text: "اختلال در تمرکز به‌علت خلق پایین", subscale: "Depression" },
    { text: "وحشت‌زدگی یا حمله اضطراب", subscale: "Anxiety" },
    { text: "احساس ضعف یا خستگی بدنی", subscale: "Somatization" },
    { text: "احساس گناه یا خودسرزنشی", subscale: "Depression" },
    { text: "بی‌قراری یا ناتوانی در نشستن آرام", subscale: "Anxiety" }
  ]

  const options = [
  {
    "value": 0,
    "label": "اصلاً"
  },
  {
    "value": 1,
    "label": "کمی"
  },
  {
    "value": 2,
    "label": "متوسط"
  },
  {
    "value": 3,
    "label": "زیاد"
  },
  {
    "value": 4,
    "label": "بسیار زیاد"
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
    setAnswers({ ...answers, [currentQuestion]: { value, subscale: q.subscale } });

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const calculateScores = () => {
    const somatization = [0, 3, 6, 9, 12, 15].reduce((sum, idx) => sum + (answers[idx]?.value || 0), 0);
    const depression = [1, 4, 7, 10, 13, 16].reduce((sum, idx) => sum + (answers[idx]?.value || 0), 0);
    const anxiety = [2, 5, 8, 11, 14, 17].reduce((sum, idx) => sum + (answers[idx]?.value || 0), 0);
    const totalScore = somatization + depression + anxiety;
    
    return { somatization, depression, anxiety, totalScore };
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


  const getInterpretation = (score, somatization, depression, anxiety) => {
    if (score <= 17) {
      return {
        level: "شدت پایین",
        color: "#22c55e",
        desc: "علائم روانشناختی در حد طبیعی است.",
        details: "نمره شما نشان می‌دهد که علائم روانشناختی در حد طبیعی است و سلامت روانی شما خوب است.",
        strengths: [
          "سلامت روانی خوب",
          "عدم علائم قابل توجه",
          "عملکرد مناسب",
          "کیفیت زندگی خوب"
        ],
        recommendations: [
          "حفظ سلامت روانی فعلی",
          "ادامه فعالیت‌های مثبت",
          "پایش منظم سلامت روانی"
        ]
      };
    }
    if (score <= 35) {
      return {
        level: "شدت متوسط",
        color: "#eab308",
        desc: "علائم روانشناختی متوسط وجود دارد.",
        details: "علائم روانشناختی شما در حد متوسط است و نیاز به توجه دارد. برخی علائم جسمانی، افسردگی یا اضطراب ممکن است وجود داشته باشد.",
        strengths: [
          "برخی منابع مقابله",
          "آگاهی از علائم"
        ],
        recommendations: []
      };
    }
    return {
      level: "شدت بالا",
      color: "#ef4444",
      desc: "علائم روانشناختی شدید وجود دارد که نیاز به ارزیابی دارد.",
      details: "نمره شما نشان می‌دهد که علائم روانشناختی شدید است و نیاز به ارزیابی و درمان تخصصی دارد. ممکن است علائم جسمانی، افسردگی و اضطراب قابل توجهی وجود داشته باشد.",
      strengths: [
        "شناسایی مشکل"
      ],
      recommendations: []
    };
  };

  const getRecommendations = (totalScore, somatization, depression, anxiety) => {
    if (totalScore <= 17) {
      return [
        "حفظ سلامت روانی فعلی",
        "ادامه فعالیت‌های مثبت",
        "پایش منظم سلامت روانی"
      ];
    }
    if (totalScore <= 35) {
      const recommendations = [
        "مشاوره با روان‌شناس",
        "یادگیری تکنیک‌های مدیریت استرس"
      ];
      
      if (depression > 12) {
        recommendations.push("بررسی احتمال افسردگی");
        recommendations.push("درمان شناختی-رفتاری (CBT)");
      }
      if (anxiety > 12) {
        recommendations.push("یادگیری تکنیک‌های مدیریت اضطراب");
        recommendations.push("تمرینات آرام‌سازی");
      }
      if (somatization > 12) {
        recommendations.push("بررسی علل جسمانی علائم");
        recommendations.push("درمان تلفیقی جسم-روان");
      }
      
      return recommendations;
    }
    return [
      "مراجعه فوری به روان‌پزشک یا روان‌شناس",
      "ارزیابی جامع و تشخیص کامل",
      "درمان ترکیبی (دارو + روان‌درمانی)",
      "بررسی خطر خودکشی یا خودآسیبی",
      "درگیر کردن خانواده در روند درمان",
      "پیگیری منظم و نزدیک"
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
    const scores = calculateScores();
    const recommendations = getRecommendations(scores.totalScore, scores.somatization, scores.depression, scores.anxiety);
    const interpretation = getInterpretation(scores.totalScore, scores.somatization, scores.depression, scores.anxiety);
    interpretation.recommendations = recommendations;
    const maxScore = 72;

    const chartData = {
      labels: ['جسمانی‌سازی', 'افسردگی', 'اضطراب', 'نمره کل'],
      datasets: [{
        label: 'نمرات زیرمقیاس‌ها',
        data: [scores.somatization, scores.depression, scores.anxiety, scores.totalScore],
        backgroundColor: [
          'rgba(34, 197, 94, 0.5)',
          'rgba(59, 130, 246, 0.5)',
          'rgba(168, 85, 247, 0.5)',
          interpretation.color + 'B3'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(168, 85, 247)',
          interpretation.color
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
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج چک‌لیست علائم مختصر (BSI-18)</h1>
                <p className="text-secondaryTextColor">تحلیل نتایج شما</p>
              </div>
            </div>

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل (GSI)</h3>
              <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>{scores.totalScore}</div>
              <div className="text-sm text-secondaryTextColor mb-4">از {maxScore}</div>
              <div className="text-2xl font-bold mb-2" style={{ color: interpretation.color }}>{interpretation.level}</div>
              <div className="text-sm text-secondaryTextColor">{interpretation.desc}</div>
              <p className="text-sm text-secondaryTextColor mt-2">{interpretation.details}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">جسمانی‌سازی</h3>
                <div className="text-2xl font-bold mb-1" style={{ color: "#22c55e" }}>{scores.somatization}</div>
                <div className="text-xs text-secondaryTextColor">از 24</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">افسردگی</h3>
                <div className="text-2xl font-bold mb-1" style={{ color: "#3b82f6" }}>{scores.depression}</div>
                <div className="text-xs text-secondaryTextColor">از 24</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">اضطراب</h3>
                <div className="text-2xl font-bold mb-1" style={{ color: "#a855f7" }}>{scores.anxiety}</div>
                <div className="text-xs text-secondaryTextColor">از 24</div>
              </div>
            </div>

            {scores.totalScore > 17 && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-2xl p-6">
                <h4 className="font-medium text-yellow-400 mb-3">⚠️ توجه</h4>
                <p className="text-sm text-yellow-300">
                  {scores.totalScore > 35 
                    ? "علائم روانشناختی شدید وجود دارد. ارزیابی و درمان تخصصی توصیه می‌شود."
                    : "علائم روانشناختی متوسط وجود دارد. مشاوره با روان‌شناس توصیه می‌شود."}
                </p>
              </div>
            )}

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار زیرمقیاس‌ها</h3>
              <div className="w-full h-80">
                <Bar data={chartData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: true, position: 'top', labels: { color: '#e5e7eb' } },
                    title: { display: true, text: 'نمرات زیرمقیاس‌های BSI-18', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: 24, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
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
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره BSI-18</h4>
              <p className="text-sm text-blue-300">
                چک‌لیست علائم مختصر (BSI-18) یک ابزار 18 سوالی برای ارزیابی علائم روانشناختی است. 
                این تست سه زیرمقیاس دارد: جسمانی‌سازی (6 سوال)، افسردگی (6 سوال)، و اضطراب (6 سوال).
                نمره کل (GSI): 0-17 (پایین), 18-35 (متوسط), 36-72 (بالا).
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
              <h1 className="text-2xl font-bold text-primaryTextColor">چک‌لیست علائم مختصر (BSI-18)</h1>
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