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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("eat26");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
  "اغلب به کالری و چربی غذا فکر می‌کنم.",
  "از غذاهایی که فکر می‌کنم مرا چاق می‌کنند دوری می‌کنم.",
  "پس از پرخوری، احساس گناه شدید دارم.",
  "وزنم به‌طور قابل‌توجهی بر احساس ارزشمندی‌ام اثر دارد.",
  "برای کنترل وزن، وعده‌ها را حذف می‌کنم.",
  "گاهی تا حد ناراحتی، بیش از حد می‌خورم.",
  "از خوردن در جمع احساس خجالت می‌کنم.",
  "از غذا به‌عنوان راهی برای مدیریت احساسات استفاده می‌کنم.",
  "از وزن‌کشی مکرر برای کنترل وزن استفاده می‌کنم.",
  "نگرانم دیگران میزان خوردنم را قضاوت کنند.",
  "پس از خوردنِ زیاد، به فکر جبران (ورزش شدید/روزه) می‌افتم.",
  "حسی از کنترل‌نداشتن بر شروع یا توقف خوردن دارم.",
  "خوردن غذاهای پرکالری مرا بسیار مضطرب می‌کند.",
  "حجم وعده‌هایم را کمتر از دیگران نگه می‌دارم.",
  "غذا خوردن را به‌خاطر ترس از افزایش وزن به‌تعویق می‌اندازم.",
  "گاهی بدون گرسنگی واقعی، ناگهانی شروع به خوردن می‌کنم.",
  "برای کاهش وزن، خوراکی‌ها را با وسواس انتخاب می‌کنم.",
  "از غذا خوردن در حضور افراد خاص اجتناب می‌کنم.",
  "اگر از برنامه غذایی‌ام منحرف شوم، خودم را سرزنش می‌کنم.",
  "انگار ذهنم دائماً درگیر فکر غذا است.",
  "برای چند ساعت طولانی از خوردن پرهیز می‌کنم تا کالری را محدود کنم.",
  "برای راضی کردن دیگران، کمتر از نیازم می‌خورم.",
  "اگر وزنم کمی بالا برود، بسیار نگران می‌شوم.",
  "وقتی استرس دارم، کنترل خوردنم سخت می‌شود.",
  "گاهی وعده‌ها را با نوشیدنی جایگزین می‌کنم تا وزنم بالا نرود.",
  "در مهمانی‌ها سعی می‌کنم کمتر از بقیه بخورم."
        ]

  const options = [
  {
    "value": 1,
    "label": "هرگز"
  },
  {
    "value": 2,
    "label": "به‌ندرت"
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
    "label": "معمولاً"
  },
  {
    "value": 6,
    "label": "همیشه"
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
    if (score < 20) {
      return {
        level: "کمینه",
        color: "#22c55e",
        desc: "نگرش‌های تغذیه‌ای در حد طبیعی است.",
        details: "نمره شما نشان می‌دهد که نگرش‌های تغذیه‌ای در حد طبیعی است. شما رابطه سالمی با غذا دارید و نگرانی غیرطبیعی در مورد وزن و تغذیه وجود ندارد.",
        strengths: [
          "نگرش سالم نسبت به غذا",
          "عدم وسواس در مورد وزن",
          "رابطه متعادل با تغذیه",
          "عدم رفتارهای ناسالم غذایی"
        ]
      };
    }
    if (score <= 30) {
      return {
        level: "متوسط",
        color: "#eab308",
        desc: "نگرانی‌های متوسط مرتبط با تغذیه وجود دارد.",
        details: "بر اساس پاسخ‌های شما، نگرانی‌های متوسطی در مورد تغذیه وجود دارد که قابل توجه است. این می‌تواند نشان‌دهنده شروع مشکلات یا الگوهای ناسالم باشد که نیاز به توجه دارد.",
        strengths: [
          "آگاهی از مشکل",
          "زمان مناسب برای تغییر",
          "برخی الگوهای سالم هنوز وجود دارد"
        ]
      };
    }
    return {
      level: "بالا",
      color: "#ef4444",
      desc: "نگرانی‌های شدید مرتبط با اختلالات خوردن.",
      details: "نمره شما نشان می‌دهد که نگرانی‌های شدیدی در مورد تغذیه وجود دارد که ممکن است نشان‌دهنده اختلال خوردن (مانند آنورکسیا، بولیمیا، یا اختلال خوردن بینگ) باشد. این یک وضعیت جدی است که نیاز به ارزیابی و درمان تخصصی فوری دارد.",
      strengths: [
        "شناسایی مشکل"
      ]
    };
  };

  const getRecommendations = (score) => {
    if (score < 20) {
      return [
        "حفظ عادات غذایی سالم و متعادل",
        "توجه به نیازهای تغذیه‌ای بدن",
        "اجتناب از رژیم‌های سخت‌گیرانه غیرضروری",
        "حفظ نگرش سالم نسبت به غذا و بدن"
      ];
    }
    if (score <= 30) {
      return [
        "مراجعه به متخصص تغذیه یا روان‌شناس",
        "بررسی نگرش‌ها و رفتارهای مرتبط با غذا",
        "یادگیری عادات غذایی سالم",
        "مدیریت استرس و اضطراب مرتبط با غذا"
      ];
    }
    return [
      "مراجعه فوری به متخصص تغذیه و روان‌درمانگر",
      "ارزیابی جامع برای اختلالات خوردن",
      "درمان تخصصی اختلالات خوردن",
      "ایجاد سیستم حمایتی قوی",
      "پیگیری منظم و نظارت نزدیک"
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
    const maxScore = 78;

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
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست EAT26</h1>
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
                <Bar data={{
                  labels: ['نمره شما', 'آستانه هشدار (20)', 'آستانه بالا (30)'],
                  datasets: [{
                    label: 'نمره EAT-26',
                    data: [score, 20, 30],
                    backgroundColor: [interpretation.color + 'B3', 'rgba(234, 179, 8, 0.3)', 'rgba(239, 68, 68, 0.3)'],
                    borderColor: [interpretation.color, 'rgb(234, 179, 8)', 'rgb(239, 68, 68)'],
                    borderWidth: 2
                  }]
                }} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'نمره EAT-26 و آستانه‌ها', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: 78, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                  }
                }} />
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
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توصیه‌های تخصصی</h3>
              <ul className="space-y-3">
                {recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                    <span className="text-secondaryTextColor">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {score >= 20 && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-2xl p-6">
                <h4 className="font-medium text-yellow-400 mb-3">⚠️ توجه</h4>
                <p className="text-sm text-yellow-300">نمره شما نشان‌دهنده نگرانی‌های مرتبط با تغذیه است. مشاوره با متخصص توصیه می‌شود.</p>
              </div>
            )}

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره EAT-26</h4>
              <p className="text-sm text-blue-300">EAT-26 یک ابزار 26 سوالی برای ارزیابی نگرش‌ها و رفتارهای مرتبط با اختلالات خوردن است. نمره 20 یا بالاتر نشان‌دهنده نگرانی‌های مرتبط با تغذیه است.</p>
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
              <h1 className="text-2xl font-bold text-primaryTextColor">تست EAT26</h1>
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