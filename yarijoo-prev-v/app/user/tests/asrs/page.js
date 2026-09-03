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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("asrs");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
    { text: "مشکل در به‌پایان رساندن جزئیات کارها پس از شروع آنها", subscale: "Inattention" },
    { text: "سختی در نظم‌بخشی برای انجام کارهایی که نیازمند سازمان‌دهی‌اند", subscale: "Inattention" },
    { text: "مشکل در به‌خاطر آوردن قرارها یا تعهدات", subscale: "Inattention" },
    { text: "اجتناب یا به‌تعویق انداختن کارهایی که تلاش ذهنی مداوم می‌طلبند", subscale: "Inattention" },
    { text: "بی‌نظمی یا بی‌توجهی به جزئیات هنگام انجام کار", subscale: "Inattention" },
    { text: "گم کردن چیزهایی مانند کلید، گوشی یا مدارک", subscale: "Inattention" },
    { text: "بی‌قراری دست‌ها/پاها یا تاب خوردن در صندلی", subscale: "Hyperactivity" },
    { text: "احساس ناآرامی و دشواری در نشستن طولانی", subscale: "Hyperactivity" },
    { text: "احساس پرت شدن حواس هنگام مکالمات یا جلسات", subscale: "Inattention" },
    { text: "سختی در انتظار نوبت در صف‌ها یا ترافیک", subscale: "Hyperactivity" },
    { text: "قطع کردن حرف دیگران یا پاسخ قبل از اتمام سوال", subscale: "Hyperactivity" },
    { text: "جابجایی بین کارها بدون تکمیل آن‌ها", subscale: "Inattention" },
    { text: "احساس رانده شدن توسط موتور/عجله دائمی", subscale: "Hyperactivity" },
    { text: "مشکل در آرامش پس از وقت کار یا در اوقات فراغت", subscale: "Hyperactivity" },
    { text: "دریافت بازخورد درباره بی‌نظمی یا تأخیرهای مکرر", subscale: "Inattention" },
    { text: "انجام کارها یا سخن گفتن بدون فکر قبلی (تکانشگری)", subscale: "Hyperactivity" },
    { text: "گوش دادن دشوار به‌طور کامل به سخنان دیگران", subscale: "Inattention" },
    { text: "احساس نیاز به بلند شدن/حرکت حتی در شرایط رسمی", subscale: "Hyperactivity" }
  ]

  const options = [
  {
    "value": 0,
    "label": "هرگز"
  },
  {
    "value": 1,
    "label": "به‌ندرت"
  },
  {
    "value": 2,
    "label": "گاهی"
  },
  {
    "value": 3,
    "label": "اغلب"
  },
  {
    "value": 4,
    "label": "بسیار زیاد"
  }
        ]

  // بررسی نتیجه قبلی
  useEffect(() => {
    if (hasResult && previousResult && !resultLoading && Object.keys(answers).length === 0 && !isCompleted) {
      setIsCompleted(true);
      // نمایش نتیجه قبلی
      if (previousResult.total_score !== undefined) {
        setSavedScore(previousResult.total_score);
      }
      // بازیابی answers از previousResult برای نمایش درست
      if (previousResult.answers && Array.isArray(previousResult.answers)) {
        const restoredAnswers = {};
        previousResult.answers.forEach((answer, index) => {
          restoredAnswers[index] = answer;
        });
        setAnswers(restoredAnswers);
      }
    }
  }, [hasResult, previousResult, resultLoading, isCompleted]);


  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [currentQuestion]: value };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const calculateScores = () => {
    const totalScore = Object.values(answers).reduce((sum, score) => sum + (score || 0), 0);
    
    const inattention = [0, 1, 2, 3, 4, 5, 8, 11, 14, 16]
      .reduce((sum, idx) => sum + (answers[idx] || 0), 0);
    
    const hyperactivity = [6, 7, 9, 10, 12, 13, 15, 17]
      .reduce((sum, idx) => sum + (answers[idx] || 0), 0);

    return { totalScore, inattention, hyperactivity };
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


  const getInterpretation = (score, type = 'general') => {
    const maxScore = type === 'inattention' ? 40 : type === 'hyperactivity' ? 32 : 72;
    
    let cutoffs;
    if (type === 'inattention') {
      cutoffs = { minimal: 0, mild: 17, moderate: 23, severe: 29 };
    } else if (type === 'hyperactivity') {
      cutoffs = { minimal: 0, mild: 14, moderate: 18, severe: 24 };
    } else {
      cutoffs = { minimal: 0, mild: 17, moderate: 23, severe: 29 };
    }

    if (score <= cutoffs.mild) {
      return {
        level: "کمینه",
        color: "#22c55e",
        desc: `سطح ${type === 'inattention' ? 'بیتوجهی' : type === 'hyperactivity' ? 'بیش‌فعالی' : 'علائم ADHD'} در حد طبیعی است.`,
        details: `نمره شما نشان می‌دهد که علائم ${type === 'inattention' ? 'بیتوجهی' : type === 'hyperactivity' ? 'بیش‌فعالی' : 'ADHD'} در حد طبیعی است. شما در این زمینه وضعیت مناسبی دارید.`,
        strengths: [
          "عملکرد مناسب",
          "عدم اختلال در زندگی روزمره",
          "کنترل خوب رفتارها",
          "کیفیت زندگی خوب"
        ],
        recommendations: [
          "حفظ این وضعیت",
          "توجه به علائم هشداردهنده",
          "حفظ عادت‌های سالم"
        ]
      };
    }
    if (score <= cutoffs.moderate) {
      return {
        level: "خفیف",
        color: "#eab308",
        desc: `علائم خفیف ${type === 'inattention' ? 'بیتوجهی' : type === 'hyperactivity' ? 'بیش‌فعالی' : 'ADHD'} مشاهده می‌شود.`,
        details: `علائم خفیف ${type === 'inattention' ? 'بیتوجهی' : type === 'hyperactivity' ? 'بیش‌فعالی' : 'ADHD'} در شما مشاهده می‌شود که ممکن است گاهی بر عملکرد شما تأثیر بگذارند اما قابل مدیریت هستند.`,
        strengths: [
          "برخی مهارت‌های مقابله",
          "آگاهی از مشکل"
        ],
        recommendations: [
          "یادگیری راهکارهای مدیریت",
          "استفاده از ابزارهای کمکی",
          "مشاوره در صورت نیاز"
        ]
      };
    }
    if (score <= cutoffs.severe) {
      return {
        level: "متوسط",
        color: "#f97316",
        desc: `سطح متوسط ${type === 'inattention' ? 'بیتوجهی' : type === 'hyperactivity' ? 'بیش‌فعالی' : 'ADHD'} که نیاز به توجه دارد.`,
        details: `علائم متوسط ${type === 'inattention' ? 'بیتوجهی' : type === 'hyperactivity' ? 'بیش‌فعالی' : 'ADHD'} در شما مشاهده می‌شود که نیاز به توجه دارد. این علائم می‌توانند بر عملکرد تحصیلی، شغلی و زندگی روزمره شما تأثیر بگذارند.`,
        strengths: [
          "شناسایی مشکل"
        ],
        recommendations: [
          "مراجعه به روان‌پزشک برای ارزیابی",
          "یادگیری راهکارهای مدیریت",
          "درمان در صورت نیاز"
        ]
      };
    }
    return {
      level: "شدید",
      color: "#ef4444",
      desc: `سطح شدید ${type === 'inattention' ? 'بیتوجهی' : type === 'hyperactivity' ? 'بیش‌فعالی' : 'ADHD'} که نیاز به ارزیابی تخصصی دارد.`,
      details: `علائم شدید ${type === 'inattention' ? 'بیتوجهی' : type === 'hyperactivity' ? 'بیش‌فعالی' : 'ADHD'} در شما مشاهده می‌شود که نیاز به ارزیابی تخصصی فوری دارد. این علائم می‌توانند به شدت بر عملکرد شما تأثیر بگذارند.`,
      strengths: [
        "شناسایی مشکل",
        "شجاعت در جستجوی کمک"
      ],
      recommendations: [
        "مراجعه فوری به روان‌پزشک",
        "ارزیابی جامع",
        "درمان تخصصی",
        "پیگیری منظم"
      ]
    };
  };

  const getRecommendations = (inattention, hyperactivity) => {
    const recommendations = [];
    const hasSevere = inattention > 29 || hyperactivity > 24;

    if (hasSevere) {
      recommendations.push("مراجعه فوری به روان‌پزشک یا متخصص ADHD برای ارزیابی تخصصی");
      recommendations.push("ارزیابی جامع ADHD شامل بررسی تاریخچه و علائم");
    } else if (inattention > 23 || hyperactivity > 18) {
      recommendations.push("مراجعه به روان‌پزشک یا متخصص ADHD برای ارزیابی");
      recommendations.push("یادگیری راهکارهای مدیریت ADHD");
    } else {
      recommendations.push("یادگیری راهکارهای سازماندهی و مدیریت زمان");
      recommendations.push("استفاده از ابزارهای کمکی مانند تقویم و یادآورها");
    }

    if (inattention > 17) {
      recommendations.push("تقسیم کارها به بخش‌های کوچک‌تر");
      recommendations.push("ایجاد محیط کاری بدون حواس‌پرتی");
      recommendations.push("استفاده از تکنیک Pomodoro برای تمرکز");
    }
    if (hyperactivity > 14) {
      recommendations.push("ورزش منظم برای تخلیه انرژی");
      recommendations.push("تمرین تکنیک‌های آرام‌سازی");
      recommendations.push("ایجاد برنامه منظم روزانه");
    }

    return recommendations;
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
    const calculatedScores = calculateScores();
    const totalScore = savedScore !== null ? savedScore : (previousResult?.total_score !== undefined ? previousResult.total_score : calculatedScores.totalScore);
    const { inattention, hyperactivity } = calculatedScores;
    const totalInterpretation = getInterpretation(totalScore);
    const inattentionInterpretation = getInterpretation(inattention, 'inattention');
    const hyperactivityInterpretation = getInterpretation(hyperactivity, 'hyperactivity');
    const recommendations = getRecommendations(inattention, hyperactivity);

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
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست ASRS</h1>
                <p className="text-secondaryTextColor">تحلیل نتایج شما</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
                <div className="text-4xl font-bold mb-2" style={{ color: totalInterpretation.color }}>{totalScore}</div>
                <div className="text-sm text-secondaryTextColor">از 72</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">بیتوجهی</h3>
                <div className="text-3xl font-bold mb-2" style={{ color: inattentionInterpretation.color }}>{inattention}</div>
                <div className="text-sm text-secondaryTextColor">از 40</div>
                <div className="text-xs mt-1" style={{ color: inattentionInterpretation.color }}>{inattentionInterpretation.level}</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">بیش‌فعالی</h3>
                <div className="text-3xl font-bold mb-2" style={{ color: hyperactivityInterpretation.color }}>{hyperactivity}</div>
                <div className="text-sm text-secondaryTextColor">از 32</div>
                <div className="text-xs mt-1" style={{ color: hyperactivityInterpretation.color }}>{hyperactivityInterpretation.level}</div>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار تحلیل</h3>
              <div className="w-full h-80">
                <Bar data={{
                  labels: ['بیتوجهی', 'بیش‌فعالی'],
                  datasets: [{
                    label: 'نمرات',
                    data: [inattention, hyperactivity],
                    backgroundColor: ['rgba(59, 130, 246, 0.7)', 'rgba(147, 51, 234, 0.7)'],
                    borderColor: ['rgb(59, 130, 246)', 'rgb(147, 51, 234)'],
                    borderWidth: 2
                  }]
                }} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'تحلیل نمرات بیتوجهی و بیش‌فعالی', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: 40, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                  }
                }} />
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توضیحات</h3>
              <p className="text-secondaryTextColor leading-relaxed mb-4">{totalInterpretation.details}</p>
            </div>

            {totalInterpretation.strengths && totalInterpretation.strengths.length > 0 && (
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نقاط قوت</h3>
                <ul className="space-y-2">
                  {totalInterpretation.strengths.map((strength, index) => (
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
                {totalInterpretation.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                    <span className="text-secondaryTextColor text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
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
              <h1 className="text-2xl font-bold text-primaryTextColor">تست ASRS</h1>
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
