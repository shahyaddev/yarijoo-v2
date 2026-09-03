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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("spin");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
  "ترس از جلب توجه در جمع",
  "اجتناب از صحبت در جمع یا کلاس",
  "تپش قلب/لرزش هنگام مواجهه اجتماعی",
  "نگرانی از قضاوت منفی دیگران",
  "اجتناب از تماس چشمی در گفتگو",
  "خشکی گلو/عرق سرد در موقعیت اجتماعی",
  "ترس از اشتباه کردن در حضور دیگران",
  "اجتناب از معاشرت‌های جدید",
  "لرزش صدا یا دست هنگام ارائه",
  "ترس از اینکه احمق به نظر برسم",
  "اجتناب از پرسیدن سؤال در جمع",
  "گرگرفتگی یا سرخی صورت در جمع",
  "ترس از صحبت با افراد صاحب‌نفوذ",
  "اجتناب از مهمانی یا دورهمی‌ها",
  "دل‌درد/تهوع ناشی از اضطراب اجتماعی",
  "ترس از غذا خوردن/نوشیدن در جمع",
  "اجتناب از تماس تلفنی/اداری به‌علت اضطراب"
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
    const fearItems = [0, 3, 6, 9, 12, 15];
    const avoidanceItems = [1, 4, 7, 10, 13, 16];
    const physioItems = [2, 5, 8, 11, 14];
    
    const scores = { fear: 0, avoidance: 0, physio: 0 };
    questions.forEach((q, idx) => {
      const answer = answers[idx] || 0;
      if (fearItems.includes(idx)) {
        scores.fear += answer;
      } else if (avoidanceItems.includes(idx)) {
        scores.avoidance += answer;
      } else if (physioItems.includes(idx)) {
        scores.physio += answer;
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
    if (score <= 18) {
      return {
        level: "اضطراب اجتماعی خفیف",
        color: "#22c55e",
        desc: "علائم هراس اجتماعی خفیف؛ قابل مدیریت با خودیاری.",
        details: "نمره شما نشان می‌دهد که اضطراب اجتماعی در حد طبیعی تا خفیف است. این علائم قابل مدیریت هستند و تأثیر محدودی بر زندگی شما دارند.",
        strengths: [
          "عملکرد مناسب در موقعیت‌های اجتماعی",
          "سطح اضطراب قابل مدیریت",
          "توانایی نسبی در مواجهه با موقعیت‌های اجتماعی"
        ],
        recommendations: [
          "آموزش روانی درباره اضطراب اجتماعی",
          "مواجهه تدریجی در موقعیت‌های کم‌خطر",
          "تمرین مهارت‌های اجتماعی",
          "حفظ تعاملات اجتماعی",
          "تقویت اعتماد به نفس"
        ]
      };
    }
    if (score <= 30) {
      return {
        level: "اضطراب اجتماعی متوسط",
        color: "#eab308",
        desc: "علائم متوسط؛ درمان ساختاریافته توصیه می‌شود.",
        details: "اضطراب اجتماعی شما در حد متوسط است و در برخی موقعیت‌ها تأثیر قابل توجهی دارد. درمان ساختاریافته می‌تواند بسیار مفید باشد.",
        strengths: [
          "برخی مهارت‌های اجتماعی",
          "آگاهی از مشکل"
        ],
        recommendations: [
          "CBT متمرکز بر اضطراب اجتماعی",
          "بازسازی شناختی باورهای منفی",
          "تمرین‌های ایفای نقش",
          "مواجهه تدریجی",
          "گروه درمانی مهارت‌های اجتماعی",
          "مدیریت اضطراب"
        ]
      };
    }
    if (score <= 40) {
      return {
        level: "اضطراب اجتماعی شدید",
        color: "#f97316",
        desc: "علائم شدید؛ ارزیابی تخصصی و برنامه فشرده.",
        details: "اضطراب اجتماعی شما شدید است و تأثیر قابل توجهی بر زندگی روزمره، کار و روابط شما می‌گذارد. ارزیابی و درمان تخصصی ضروری است.",
        strengths: [
          "شناسایی مشکل"
        ],
        recommendations: [
          "درمان CBT/ERP فوری",
          "گروه‌درمانی مهارت‌های اجتماعی",
          "بررسی همبود افسردگی/سوءمصرف",
          "مواجهه سیستماتیک",
          "درمان دارویی در صورت نیاز (با تجویز پزشک)",
          "مراقبت تخصصی چندرشته‌ای"
        ]
      };
    }
    return {
      level: "اضطراب اجتماعی بسیار شدید",
      color: "#dc2626",
      desc: "بسیار شدید؛ مراقبت چندرشته‌ای ضروری است.",
      details: "اضطراب اجتماعی شما بسیار شدید است و به شدت بر عملکرد روزمره، شغل و روابط شما تأثیر می‌گذارد. مراقبت فوری و جامع چندرشته‌ای ضروری است.",
      strengths: [
        "شناسایی مشکل"
      ],
      recommendations: [
        "ارجاع تخصصی فوری",
        "برنامه ایمنی و مدیریت اجتناب",
        "درمان چندرشته‌ای فشرده",
        "ادغام درمان‌های مبتنی بر شواهد",
        "درمان دارویی (با تجویز پزشک)",
        "حمایت خانواده و دوستان",
        "پیگیری منظم و نزدیک"
      ]
    };
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
    const maxScore = 68;

    const chartData = {
      labels: ['نمره شما', 'خفیف (0-19)', 'متوسط (20-30)', 'شدید (31-40)', 'بسیار شدید (41-68)'],
      datasets: [{
        label: 'نمره SPIN',
        data: [score, 19, 30, 40, 68],
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
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست اضطراب اجتماعی (SPIN)</h1>
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

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نقاط قوت</h3>
              <ul className="list-disc list-inside space-y-2 text-secondaryTextColor">
                {interpretation.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
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

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توصیه‌ها</h3>
              <ul className="list-disc list-inside space-y-2 text-secondaryTextColor">
                {interpretation.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره SPIN</h4>
              <p className="text-sm text-blue-300">
                مقیاس هراس اجتماعی (SPIN) یک ابزار 17 سوالی برای ارزیابی اضطراب اجتماعی است. 
                نمرات: 0-19 (خفیف)، 20-30 (متوسط)، 31-40 (شدید)، 41-68 (بسیار شدید).
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
              <h1 className="text-2xl font-bold text-primaryTextColor">تست SPIN</h1>
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
