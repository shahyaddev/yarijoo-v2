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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("glasser_needs");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
  "نیاز به بقا و امنیت مالی",
  "نیاز به سلامتی و تندرستی",
  "نیاز به دوست داشتن و دوست داشته شدن",
  "نیاز به تعلق به گروه",
  "نیاز به احترام و شناخته شدن",
  "نیاز به موفقیت و پیشرفت",
  "نیاز به آزادی و استقلال",
  "نیاز به انتخاب و کنترل زندگی",
  "نیاز به تفریح و شادی",
  "نیاز به خنده و بازی",
  "نیاز به امنیت و ثبات",
  "نیاز به رابطه صمیمی",
  "نیاز به تأثیرگذاری",
  "نیاز به انتخاب شغل",
  "نیاز به سرگرمی"
        ]

  const options = [
  {
    "value": 1,
    "label": "خیلی کم"
  },
  {
    "value": 2,
    "label": "کم"
  },
  {
    "value": 3,
    "label": "متوسط"
  },
  {
    "value": 4,
    "label": "زیاد"
  },
  {
    "value": 5,
    "label": "خیلی زیاد"
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

  const calculateTopNeeds = () => {
    const needScores = {};
    questions.forEach((q, index) => {
      needScores[q] = answers[index] || 0;
    });
    const sorted = Object.entries(needScores).sort((a, b) => b[1] - a[1]);
    return sorted.slice(0, 3);
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
    const maxScore = 75;
    const topNeeds = calculateTopNeeds();
    
    if (score <= 30) {
      return {
        level: "نیازهای اولیه برآورده نشده",
        color: "#ef4444",
        desc: "نیازهای اساسی شما به اندازه کافی برآورده نشده‌اند. این می‌تواند بر رفاه شما تأثیر بگذارد.",
        details: "نمره پایین شما نشان می‌دهد که نیازهای اساسی زندگی شما (بقا، عشق، قدرت، آزادی، تفریح) به طور کامل برآورده نشده‌اند. این می‌تواند منجر به نارضایتی، استرس و مشکلات سلامت روان شود.",
        strengths: [],
        recommendations: [
          "**شناسایی نیازهای اولویت**: تعیین کدام نیازها بیشتر برآورده نشده‌اند",
          "**برنامه‌ریزی**: ایجاد برنامه برای برآورده کردن نیازهای اساسی",
          "**بقا و امنیت**: کار بر روی نیازهای پایه (امنیت مالی، سلامتی)",
          "**عشق و تعلق**: تقویت روابط و ارتباطات اجتماعی",
          "**قدرت و موفقیت**: تعیین اهداف قابل دستیابی",
          "**آزادی**: افزایش کنترل و انتخاب در زندگی",
          "**تفریح**: اختصاص زمان برای لذت و سرگرمی",
          "**مشاوره**: در صورت نیاز، مشاوره برای بهبود رفاه"
        ],
        topNeeds
      };
    } else if (score <= 52) {
      return {
        level: "برخی نیازها برآورده شده",
        color: "#eab308",
        desc: "برخی از نیازهای شما برآورده شده‌اند اما هنوز جا برای بهبود وجود دارد.",
        details: "شما در برآورده کردن برخی نیازهای اساسی موفق بوده‌اید اما همه نیازها به طور کامل برآورده نشده‌اند. با تمرکز بر نیازهای برآورده نشده می‌توانید رفاه خود را افزایش دهید.",
        strengths: [
          "برخی نیازها برآورده شده",
          "آگاهی از نیازها",
          "امکان بهبود"
        ],
        recommendations: [
          "**شناسایی نیازهای ضعیف**: شناسایی نیازهایی که کمتر برآورده شده‌اند",
          "**تعادل**: تلاش برای تعادل در برآورده کردن همه نیازها",
          "**اولویت‌بندی**: اولویت‌بندی نیازهای مهم‌تر",
          "**عمل**: اقدام برای برآورده کردن نیازهای باقی‌مانده"
        ],
        topNeeds
      };
    } else {
      return {
        level: "نیازهای اساسی به خوبی برآورده شده",
        color: "#22c55e",
        desc: "نیازهای اساسی شما به خوبی برآورده شده‌اند. شما از رفاه خوبی برخوردار هستید.",
        details: "تبریک! نیازهای اساسی شما (بقا، عشق، قدرت، آزادی، تفریح) به خوبی برآورده شده‌اند. این نشان‌دهنده رفاه و تعادل در زندگی شماست.",
        strengths: [
          "تعادل در نیازها",
          "رفاه خوب",
          "رضایت از زندگی",
          "انگیزه و انرژی"
        ],
        recommendations: [
          "**حفظ تعادل**: ادامه حفظ تعادل در برآورده کردن نیازها",
          "**کمک به دیگران**: کمک به دیگران در برآورده کردن نیازهایشان",
          "**رشد**: ادامه رشد و توسعه شخصی",
          "**قدرشناسی**: قدردانی از چیزهایی که دارید"
        ],
        topNeeds
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
    const maxScore = 75;

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
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست نیازهای گلاسر</h1>
                <p className="text-secondaryTextColor">تحلیل نتایج شما</p>
              </div>
            </div>

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سطح</h3>
              <div className="text-2xl font-bold mb-2" style={{ color: interpretation.color }}>{interpretation.level}</div>
              <div className="text-sm text-secondaryTextColor mb-4">{interpretation.desc}</div>
              <p className="text-sm text-secondaryTextColor leading-relaxed">{interpretation.details}</p>
            </div>

            {interpretation.topNeeds && interpretation.topNeeds.length > 0 && (
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">سه نیاز برتر شما</h3>
                <div className="space-y-3">
                  {interpretation.topNeeds.map(([need, score], index) => (
                    <div key={index} className="bg-secondaryThemeColor rounded-xl p-4 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-primaryThemeColor/20 text-primaryThemeColor flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <span className="text-primaryTextColor font-medium">{need}</span>
                      </div>
                      <div className="text-lg font-bold text-primaryThemeColor">{score}/5</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                    title: { display: true, text: 'تحلیل نمره نیازهای اساسی', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: maxScore, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                  }
                }} />
              </div>
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
              <h1 className="text-2xl font-bold text-primaryTextColor">تست نیازهای گلاسر</h1>
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