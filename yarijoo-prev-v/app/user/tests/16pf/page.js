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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("16pf");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
  "معمولاً در جمع‌های اجتماعی راحت و پرانرژی هستم",
  "به جزئیات دقیق توجه می‌کنم و تا حد امکان مراقب اشتباهات هستم",
  "احساسات خود را به راحتی بروز می‌دهم",
  "از قوانین و مقررات پیروی می‌کنم حتی اگر گاهی منطقی به نظر نرسند",
  "معمولاً به دیگران اعتماد می‌کنم مگر اینکه دلیلی برای بی‌اعتمادی داشته باشم",
  "دوست دارم در موقعیت‌های جدید و غیرمنتظره قرار بگیرم",
  "نگران نظر دیگران درباره خودم هستم",
  "دوست دارم کارها را به شیوه سنتی و آزمایش‌شده انجام دهم",
  "وقتی تصمیم می‌گیرم بیشتر از منطق استفاده می‌کنم تا احساسات",
  "معمولاً آرام و بی‌دغدغه هستم",
  "دوست دارم در مورد مفاهیم انتزاعی و فلسفی فکر کنم",
  "مستقل هستم و دوست دارم کارها را به روش خودم انجام دهم",
  "به راحتی می‌توانم با دیگران ارتباط برقرار کنم",
  "احساس می‌کنم مردم اغلب به من بی‌توجه هستند",
  "ترجیح می‌دهم در گروه کار کنم تا به تنهایی",
  "برنامه‌های دقیق و منظم دارم و آن‌ها را دنبال می‌کنم"
        ]

  const options = [
    { value: 1, label: "کاملاً مخالفم" },
    { value: 2, label: "مخالفم" },
    { value: 3, label: "نه موافق نه مخالف" },
    { value: 4, label: "موافقم" },
    { value: 5, label: "کاملاً موافقم" }
  ];

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
    const maxScore = 80;
    
    if (score <= 32) {
      return {
        level: "نمره پایین",
        color: "#eab308",
        desc: "نمره کلی شما پایین است. تفسیر دقیق‌تر نیاز به ارزیابی عامل‌های جداگانه دارد.",
        details: "نمره کلی پایین شما نشان می‌دهد که برخی از ویژگی‌های شخصیتی کمتر ابراز شده‌اند. این می‌تواند طبیعی باشد و تفسیر دقیق نیاز به ارزیابی 16 فاکتور جداگانه دارد.",
        strengths: ["الگوهای شخصیتی ملایم", "تعادل نسبی"],
        recommendations: [
          "**تفسیر دقیق‌تر**: ارزیابی هر یک از 16 فاکتور جداگانه",
          "**کوچینگ**: کوچینگ برای خودآگاهی بیشتر",
          "**رشد مهارت‌ها**: توسعه مهارت‌های بین‌فردی",
          "**مشاوره**: مشاوره برای درک بهتر شخصیت"
        ]
      };
    } else if (score <= 48) {
      return {
        level: "نمره متوسط",
        color: "#84cc16",
        desc: "نمره شما در محدوده متوسط است.",
        details: "شما تعادل نسبی در ابعاد شخصیت دارید. این نشان‌دهنده سازگاری و انعطاف‌پذیری است.",
        strengths: ["تعادل در شخصیت", "سازگاری", "انعطاف‌پذیری"],
        recommendations: [
          "**بهینه‌سازی**: استفاده از نقاط قوت در نقش شغلی",
          "**یادگیری**: برنامه یادگیری تطبیقی",
          "**رشد**: ادامه رشد و توسعه"
        ]
      };
    } else if (score <= 64) {
      return {
        level: "نمره بالا",
        color: "#22c55e",
        desc: "نمره شما بالا است.",
        details: "شما ویژگی‌های شخصیتی قوی و واضح دارید. این می‌تواند نشان‌دهنده ثبات و قوت شخصیت باشد.",
        strengths: ["ویژگی‌های قوی", "ثبات شخصیت", "وضوح در ویژگی‌ها"],
        recommendations: [
          "**استفاده از نقاط قوت**: استفاده مؤثر از ویژگی‌های قوی",
          "**تعادل**: حفظ تعادل در موقعیت‌های مختلف",
          "**مدیریت**: مدیریت مناسب ویژگی‌های شخصیتی"
        ]
      };
    } else {
      return {
        level: "نمره بسیار بالا",
        color: "#dc2626",
        desc: "نمره شما بسیار بالا است.",
        details: "نمره بسیار بالای شما نشان می‌دهد که برخی ویژگی‌ها بسیار قوی هستند. مهم است که این ویژگی‌ها را مدیریت کنید تا از افراط و تفریط جلوگیری شود.",
        strengths: ["ویژگی‌های بسیار قوی"],
        recommendations: [
          "**مدیریت ریسک**: مدیریت ریسک‌های موقعیتی",
          "**انعطاف‌پذیری**: توسعه انعطاف‌پذیری رفتاری",
          "**تعادل**: جستجوی تعادل در ویژگی‌ها",
          "**مشاوره**: مشاوره برای مدیریت مؤثر ویژگی‌ها"
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
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست 16 عامل شخصیتی کتل</h1>
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
                    title: { display: true, text: 'تحلیل نمره', color: '#e5e7eb', font: { size: 16 } }
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
                    <span className="text-secondaryTextColor text-sm" dangerouslySetInnerHTML={{ __html: rec.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">یادداشت مهم</h3>
              <p className="text-secondaryTextColor text-sm leading-relaxed">تست 16PF یک تست جامع شخصیت است که 16 فاکتور مختلف را ارزیابی می‌کند. برای تفسیر دقیق‌تر، ارزیابی هر یک از 16 فاکتور به صورت جداگانه توصیه می‌شود.</p>
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
              <h1 className="text-2xl font-bold text-primaryTextColor">تست 16 عامل شخصیتی کتل</h1>
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
