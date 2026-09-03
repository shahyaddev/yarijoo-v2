"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaLaptop } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTestResult } from "@/hooks/useTestResult";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Page = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("iat");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
    "چند بار از برنامه‌تان بیشتر در اینترنت می‌مانید؟",
    "چند بار به خاطر اینترنت از کارهای خانه غافل می‌شوید؟",
    "چند بار صمیمیت با همسر را به اینترنت ترجیح می‌دهید؟",
    "چند بار با کاربران آنلاین روابط جدید می‌سازید؟",
    "چند بار دیگران از زمان اینترنت شما شکایت می‌کنند؟",
    "چند بار نمرات یا کار شما به خاطر اینترنت آسیب می‌بیند؟",
    "چند بار قبل از کارهای دیگر ایمیل خود را چک می‌کنید؟",
    "چند بار عملکرد کاری شما به خاطر اینترنت کاهش می‌یابد؟",
    "چند بار وقتی کسی می‌پرسد آنلاین چه کار می‌کنید دفاعی می‌شوید؟",
    "چند بار افکار مزاحم زندگی را با اینترنت کنار می‌زنید؟",
    "چند بار خودتان را منتظر دفعه بعد آنلاین شدن می‌یابید؟",
    "چند بار می‌ترسید بدون اینترنت زندگی خسته‌کننده شود؟",
    "چند بار وقتی آنلاین هستید کسی مزاحم شود عصبانی می‌شوید؟",
    "چند بار به خاطر دیر وقت آنلاین بودن کم می‌خوابید؟",
    "چند بار وقتی آفلاین هستید فکرتان به اینترنت است؟",
    "چند بار با خودتان می‌گویید فقط چند دقیقه دیگر آنلاین بمانم؟",
    "چند بار سعی کردید زمان اینترنت را کم کنید و نتوانستید؟",
    "چند بار سعی می‌کنید زمان آنلاین بودن را پنهان کنید؟",
    "چند بار بیرون رفتن را به اینترنت ترجیح می‌دهید؟",
    "چند بار وقتی آفلاین هستید افسرده، عصبی یا بی‌حوصله می‌شوید؟"
  ];

  const options = [
    { value: 1, label: "به ندرت" },
    { value: 2, label: "گاهی" },
    { value: 3, label: "اغلب" },
    { value: 4, label: "معمولاً" },
    { value: 5, label: "همیشه" }
  ];

  // بررسی نتیجه قبلی
  useEffect(() => {
    if (hasResult && previousResult && !resultLoading) {
      setIsCompleted(true);
    }
  }, [hasResult, previousResult, resultLoading]);


  const handleAnswer = (value) => {
    setAnswers({ ...answers, [currentQuestion]: value });
    if (currentQuestion < questions.length - 1) setCurrentQuestion(currentQuestion + 1);
    else setIsCompleted(true);
  };

  const calculateScore = () => Object.values(answers).reduce((sum, score) => sum + score, 0);

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
    
    if (score <= 39) {
      return {
        level: "استفاده طبیعی",
        color: "#22c55e",
        desc: "استفاده شما از اینترنت در محدوده طبیعی است.",
        details: "شما استفاده متعادلی از اینترنت دارید و وابستگی به اینترنت ندارید. می‌توانید از اینترنت استفاده کنید بدون اینکه بر زندگی شما تأثیر منفی بگذارد.",
        strengths: ["استفاده متعادل", "کنترل خوب", "عدم وابستگی", "تعادل کار و زندگی"],
        recommendations: [
          "**حفظ تعادل**: ادامه استفاده متعادل از اینترنت",
          "**آگاهی**: توجه به تغییرات در الگوی استفاده",
          "**مرزها**: تعیین مرزهای سالم برای استفاده"
        ]
      };
    } else if (score <= 69) {
      return {
        level: "مشکلات خفیف تا متوسط",
        color: "#eab308",
        desc: "مشکلات خفیف تا متوسط در استفاده از اینترنت دارید.",
        details: "شما نشانه‌هایی از وابستگی به اینترنت دارید که ممکن است بر برخی جنبه‌های زندگی شما تأثیر بگذارد. نیاز به توجه و تغییر الگوی استفاده دارید.",
        strengths: [],
        recommendations: [
          "**کاهش زمان**: محدود کردن زمان استفاده روزانه",
          "**فعالیت‌های جایگزین**: پیدا کردن فعالیت‌های دیگر",
          "**قوانین**: تعیین قوانین مشخص برای استفاده",
          "**مشاوره**: در صورت نیاز، مشاوره با متخصص",
          "**گروه‌های حمایتی**: شرکت در گروه‌های حمایتی"
        ]
      };
    } else {
      return {
        level: "اعتیاد شدید",
        color: "#ef4444",
        desc: "نشانه‌های اعتیاد شدید به اینترنت دارید.",
        details: "نمره شما نشان‌دهنده اعتیاد شدید به اینترنت است که می‌تواند بر زندگی، کار، روابط و سلامت شما تأثیر جدی بگذارد. نیاز به مداخله فوری دارید.",
        strengths: [],
        recommendations: [
          "**🚨 مشاوره فوری**: مراجعه فوری به متخصص سلامت روان",
          "**درمان تخصصی**: شرکت در برنامه‌های درمان اعتیاد به اینترنت",
          "**کاهش تدریجی**: کاهش تدریجی و برنامه‌ریزی شده استفاده",
          "**فعالیت‌های جایگزین**: جایگزین کردن با فعالیت‌های سالم",
          "**حمایت خانواده**: کمک خانواده و دوستان",
          "**برنامه درمانی**: پیگیری برنامه درمانی تخصصی"
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
    const chartData = {
      labels: ['نمره شما', 'طبیعی', 'خفیف', 'شدید'],
      datasets: [{
        label: 'IAT',
        data: [score, 39, 69, 100],
        backgroundColor: [interpretation.color + 'B3', 'rgba(34, 197, 94, 0.3)', 'rgba(234, 179, 8, 0.3)', 'rgba(239, 68, 68, 0.3)'],
        borderColor: [interpretation.color, 'rgb(34, 197, 94)', 'rgb(234, 179, 8)', 'rgb(239, 68, 68)'],
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
                <FaLaptop className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست اعتیاد به اینترنت</h1>
                <p className="text-secondaryTextColor">IAT</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
                <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>{score}</div>
                <div className="text-sm text-secondaryTextColor">از 100</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">وضعیت</h3>
                <div className="text-2xl font-bold mb-2" style={{ color: interpretation.color }}>{interpretation.level}</div>
                <div className="text-sm text-secondaryTextColor">{interpretation.desc}</div>
              </div>
            </div>
            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار</h3>
              <div className="w-full h-80">
                <Bar data={chartData} options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { display: false }, title: { display: true, text: 'اعتیاد به اینترنت', color: '#e5e7eb', font: { size: 16 } } },
                  scales: { y: { beginAtZero: true, max: 100, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }, x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } } }
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
            <button onClick={() => { setCurrentQuestion(0); setAnswers({}); setIsCompleted(false); }} className="w-full h-12 bg-primaryThemeColor text-white rounded-xl font-medium hover:bg-primaryThemeColor/90 transition-colors">انجام مجدد تست</button>
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
              <FaLaptop className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">تست اعتیاد به اینترنت</h1>
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

export default Page;







