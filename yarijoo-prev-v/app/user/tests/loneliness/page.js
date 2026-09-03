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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("loneliness");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
    { text: "احساس می‌کنم از دیگران جدا افتاده‌ام.", reverse: false },
    { text: "کسی هست که واقعاً مرا درک کند.", reverse: true },
    { text: "اغلب احساس تنهایی می‌کنم.", reverse: false },
    { text: "روابط نزدیک و صمیمی دارم.", reverse: true },
    { text: "در جمع‌ها خودم را بیرون از جمع حس می‌کنم.", reverse: false },
    { text: "وقتی نیاز دارم کسی هست که با او حرف بزنم.", reverse: true },
    { text: "احساس می‌کنم کسی مرا واقعاً نمی‌شناسد.", reverse: false },
    { text: "از حمایت عاطفی مناسب برخوردارم.", reverse: true },
    { text: "گاهی احساس می‌کنم هیچ‌کس کنارم نیست.", reverse: false },
    { text: "احساس تعلق به گروه/خانواده/دوستان دارم.", reverse: true },
    { text: "احساس می‌کنم از نظر اجتماعی کنار گذاشته شده‌ام.", reverse: false },
    { text: "روابط معناداری در زندگی‌ام دارم.", reverse: true },
    { text: "کسی را ندارم که نگرانی‌هایم را با او در میان بگذارم.", reverse: false },
    { text: "افرادی هستند که به من اهمیت می‌دهند.", reverse: true },
    { text: "احساس می‌کنم به دیگران نزدیک نیستم.", reverse: false },
    { text: "در زمان‌های سخت تنها نیستم.", reverse: true },
    { text: "ارتباطاتم سطحی و ناپایدار است.", reverse: false },
    { text: "حداقل یک رابطه بسیار صمیمی دارم.", reverse: true },
    { text: "اغلب احساس می‌کنم نادیده گرفته می‌شوم.", reverse: false },
    { text: "در محیط‌های اجتماعی احساس تعلق می‌کنم.", reverse: true }
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
    setAnswers({ ...answers, [currentQuestion]: value });

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const calculateScore = () => {
    let total = 0;
    for (let i = 0; i < questions.length; i++) {
      const value = answers[i] || 0;
      const actualValue = questions[i].reverse ? (5 - value) : value;
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
    if (score <= 34) {
      return {
        level: "تنهایی پایین",
        color: "#22c55e",
        desc: "احساس تنهایی شما در حد طبیعی و سالم است.",
        details: "شما از روابط اجتماعی و حمایتی مناسبی برخوردار هستید و احساس تعلق و ارتباط قوی دارید. این سطح از ارتباط اجتماعی برای سلامت روانی و عاطفی شما بسیار مفید است.",
        strengths: [
          "روابط اجتماعی پایدار و معنادار",
          "احساس تعلق به گروه‌های اجتماعی",
          "دسترسی به شبکه حمایتی قوی",
          "مهارت‌های ارتباطی مناسب",
          "کیفیت زندگی اجتماعی خوب"
        ],
        recommendations: [
          "حفظ و قدردانی از روابط اجتماعی فعلی",
          "توسعه شبکه‌های اجتماعی موجود",
          "شرکت در فعالیت‌های گروهی و اجتماعی",
          "کمک به دیگران در ایجاد ارتباطات اجتماعی",
          "ایجاد روابط عمیق‌تر با افراد موجود در شبکه اجتماعی"
        ]
      };
    }
    if (score <= 49) {
      return {
        level: "تنهایی متوسط",
        color: "#eab308",
        desc: "احساس تنهایی متوسط - نیاز به تقویت روابط اجتماعی.",
        details: "شما گاهی احساس تنهایی می‌کنید و ممکن است در برخی موقعیت‌ها روابط اجتماعی شما کافی نباشد. تقویت روابط موجود و ایجاد روابط جدید می‌تواند به کاهش این احساس کمک کند.",
        strengths: [
          "وجود برخی روابط اجتماعی",
          "آگاهی از اهمیت روابط اجتماعی",
          "توانایی ایجاد ارتباط اولیه"
        ],
        recommendations: [
          "افزایش فعالیت‌های اجتماعی و شرکت در گروه‌ها یا کلاس‌های مورد علاقه",
          "ایجاد روابط جدید از طریق فعالیت‌های مشترک",
          "تقویت روابط موجود با سرمایه‌گذاری زمانی بیشتر",
          "تمرین مهارت‌های ارتباطی و اجتماعی",
          "درخواست کمک از مشاور یا درمانگر برای بهبود مهارت‌های اجتماعی",
          "پیوستن به گروه‌های اجتماعی یا باشگاه‌های مرتبط با علایق",
          "شرکت داوطلبانه در فعالیت‌های اجتماعی"
        ]
      };
    }
    return {
      level: "تنهایی بالا",
      color: "#ef4444",
      desc: "احساس تنهایی شدید - نیاز به مداخله و حمایت فوری.",
      details: "احساس تنهایی شدید شما می‌تواند تأثیرات جدی بر سلامت روانی، جسمی و کیفیت زندگی شما داشته باشد. این احساس می‌تواند منجر به افسردگی، اضطراب و مشکلات سلامتی شود. دریافت حمایت تخصصی و تلاش برای ایجاد روابط اجتماعی ضروری است.",
      strengths: [
        "تمایل به بهبود وضعیت",
        "آگاهی از مشکل و جستجوی راه‌حل"
      ],
      recommendations: [
        "مشاوره تخصصی فوری با روانشناس یا مشاور برای مدیریت احساس تنهایی",
        "درمان شناختی-رفتاری (CBT) برای تغییر الگوهای فکری منفی",
        "ایجاد روابط جدید از طریق فعالیت‌های مورد علاقه و سرگرمی‌ها",
        "تقویت روابط خانوادگی موجود",
        "پیوستن به گروه‌های پشتیبانی یا درمان گروهی",
        "شرکت در فعالیت‌های داوطلبانه برای ایجاد حس هدفمندی و ارتباط",
        "یادگیری مهارت‌های ارتباطی و اجتماعی از طریق کارگاه‌ها",
        "استفاده از برنامه‌ها یا وب‌سایت‌های ملاقات برای ایجاد ارتباط",
        "در صورت وجود، درمان مشکلات روانی همراه (افسردگی، اضطراب)"
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
    const maxScore = 80;

    const chartData = {
      labels: ['نمره شما', 'پایین (20-34)', 'متوسط (35-49)', 'بالا (50-80)'],
      datasets: [{
        label: 'نمره UCLA Loneliness',
        data: [score, 34, 49, 80],
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
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج مقیاس تنهایی UCLA</h1>
                <p className="text-secondaryTextColor">تحلیل نتایج شما</p>
              </div>
            </div>

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سطح تنهایی</h3>
              <div className="text-3xl font-bold mb-2" style={{ color: interpretation.color }}>{interpretation.level}</div>
              <div className="text-secondaryTextColor mb-4">{interpretation.desc}</div>
              <p className="text-sm text-secondaryTextColor">{interpretation.details}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
                <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>{score}</div>
                <div className="text-sm text-secondaryTextColor">از {maxScore}</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">محدوده</h3>
                <div className="text-lg font-semibold mb-1 text-secondaryTextColor">
                  {score <= 34 ? "20-34 (پایین)" : score <= 49 ? "35-49 (متوسط)" : "50-80 (بالا)"}
                </div>
              </div>
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

            {score > 34 && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-2xl p-6">
                <h4 className="font-medium text-yellow-400 mb-3">⚠️ توجه</h4>
                <p className="text-sm text-yellow-300">احساس تنهایی قابل توجهی در شما مشاهده می‌شود. تقویت روابط اجتماعی توصیه می‌شود.</p>
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
                    title: { display: true, text: 'تحلیل نمره UCLA Loneliness', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: maxScore, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                  }
                }} />
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توصیه‌های تخصصی</h3>
              <ul className="space-y-3">
                {interpretation.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                    <span className="text-secondaryTextColor">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره UCLA Loneliness Scale</h4>
              <p className="text-sm text-blue-300">
                مقیاس تنهایی UCLA یک ابزار 20 سوالی برای ارزیابی احساس تنهایی است. 
                نمرات: 20-34 (پایین), 35-49 (متوسط), 50-80 (بالا). برخی سوالات به صورت معکوس نمره‌دهی می‌شوند.
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
              <h1 className="text-2xl font-bold text-primaryTextColor">مقیاس تنهایی UCLA</h1>
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
