"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaHeart } from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import { useTestResult } from "@/hooks/useTestResult";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TestPage = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("raas");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = useMemo(() => [
    "از رابطه‌ام راضی هستم",
    "رابطه‌ام انتظاراتم را برآورده می‌کند",
    "رابطه‌ام عالی است",
    "شریکم نیازهایم را برآورده می‌کند",
    "رابطه‌ام بسیار خوب است",
    "هیچ چیز در رابطه‌ام را تغییر نمی‌دهم",
    "از شریکم راضی هستم"
  ], []);

  const options = useMemo(() => [
    { value: 1, label: "کاملاً مخالفم" },
    { value: 2, label: "مخالفم" },
    { value: 3, label: "کمی مخالفم" },
    { value: 4, label: "نه موافق نه مخالف" },
    { value: 5, label: "کمی موافقم" },
    { value: 6, label: "موافقم" },
    { value: 7, label: "کاملاً موافقم" }
  ], []);

  // بررسی نتیجه قبلی
  useEffect(() => {
    if (hasResult && previousResult && !resultLoading) {
      setIsCompleted(true);
    }
  }, [hasResult, previousResult, resultLoading]);


  const handleAnswer = (value) => {
    setAnswers({ ...answers, [currentQuestion]: value });
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const calculateScore = () => {
    return Object.values(answers).reduce((sum, score) => sum + (score || 1), 0);
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
    const maxScore = 49; // 7 questions * 7 points each
    
    if (score <= 14) {
      return {
        level: "رضایت بسیار پایین",
        color: "#ef4444",
        desc: "رضایت از رابطه شما بسیار پایین است. این وضعیت نیاز به مداخله فوری و تخصصی دارد.",
        details: "نمره پایین شما نشان می‌دهد که رضایت بسیار کمی از رابطه فعلی خود دارید. مشکلات جدی در ارتباط، صمیمیت و رضایت وجود دارد که می‌تواند تهدیدکننده رابطه باشد. این وضعیت نیازمند توجه و مداخله حرفه‌ای است.",
        strengths: [
          "آگاهی از مشکل",
          "تمایل به بهبود",
          "جستجوی کمک"
        ],
        recommendations: [
          "مراجعه فوری به مشاور خانواده یا زوج‌درمانگر",
          "برنامه مشاوره زوجی منظم و فشرده",
          "شناسایی و حل تعارض‌های اساسی",
          "یادگیری مهارت‌های ارتباطی مؤثر",
          "ایجاد فضای امن برای گفت‌وگوی صادقانه",
          "بررسی نیازهای برآورده نشده هر دو طرف",
          "در صورت نیاز، مشاوره فردی برای هر یک از طرفین"
        ]
      };
    } else if (score <= 21) {
      return {
        level: "رضایت پایین",
        color: "#f97316",
        desc: "رضایت از رابطه شما پایین است. مشکلات قابل توجهی در برخی جنبه‌های رابطه وجود دارد.",
        details: "نمره پایین شما نشان می‌دهد که رضایت کافی از رابطه ندارید. مشکلات قابل توجهی در برخی جنبه‌های رابطه وجود دارد که نیاز به تلاش و بهبود دارد. کار بر روی بهبود رابطه ضروری است.",
        strengths: [
          "برخی جنبه‌های مثبت در رابطه",
          "پتانسیل برای بهبود",
          "تمایل به کار روی رابطه"
        ],
        recommendations: [
          "مشاوره زوجی برای بهبود رابطه",
          "کار بر روی مهارت‌های ارتباطی",
          "افزایش زمان کیفیت با یکدیگر",
          "شناسایی و حل مشکلات ارتباطی",
          "یادگیری تکنیک‌های حل تعارض",
          "تقویت صمیمیت عاطفی و فیزیکی",
          "بررسی و رفع نیازهای برآورده نشده"
        ]
      };
    } else if (score <= 35) {
      return {
        level: "رضایت متوسط",
        color: "#eab308",
        desc: "رضایت از رابطه شما در سطح متوسط است. برخی جنبه‌ها رضایت‌بخش هستند اما زمینه برای بهبود وجود دارد.",
        details: "نمره متوسط شما نشان می‌دهد که احساس رضایت نسبی از رابطه دارید اما هنوز جنبه‌هایی وجود دارند که نیاز به بهبود دارند. با تلاش و تمرکز می‌توانید کیفیت رابطه را افزایش دهید.",
        strengths: [
          "تعادل نسبی در رابطه",
          "برخی جنبه‌های مثبت",
          "پایه محکم برای بهبود",
          "ارتباطات نسبتاً مناسب"
        ],
        recommendations: [
          "افزایش فعالیت‌های مشترک و سرگرمی‌های دو نفره",
          "تقویت ارتباطات روزمره و گفت‌وگوهای عمیق",
          "یادگیری مهارت‌های جدید ارتباطی",
          "تعیین اهداف مشترک برای آینده",
          "قدردانی منظم و ابراز عشق",
          "کار بر روی تقویت صمیمیت",
          "حل مسائل کوچک قبل از تبدیل به مشکلات بزرگ"
        ]
      };
    } else {
      return {
        level: "رضایت بالا",
        color: "#22c55e",
        desc: "رضایت از رابطه شما بالا است! شما از اکثر جنبه‌های رابطه راضی هستید و رابطه سالم و مثبتی دارید.",
        details: "نمره بالا شما نشان می‌دهد که از رابطه خود رضایت زیادی دارید. شما از اکثر جنبه‌های رابطه راضی هستید و رابطه سالم، مثبت و رضایت‌بخشی دارید. ادامه تلاش برای حفظ و بهبود رابطه توصیه می‌شود.",
        strengths: [
          "رضایت بالا از رابطه",
          "ارتباط مؤثر و سالم",
          "صمیمیت عاطفی و فیزیکی مناسب",
          "حل تعارض سالم",
          "احترام متقابل",
          "همکاری در مسائل",
          "رضایت از شریک زندگی"
        ],
        recommendations: [
          "حفظ و تقویت روابط مثبت فعلی",
          "ادامه فعالیت‌های مشترک و سرگرمی‌ها",
          "قدردانی منظم و ابراز عشق",
          "برنامه‌ریزی برای آینده مشترک",
          "جشن‌گیری دستاوردها و لحظات خاص",
          "کمک به دیگران در ایجاد روابط سالم",
          "ادامه رشد و توسعه فردی برای حفظ جذابیت"
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
    const maxScore = 49;

    const chartData = {
      labels: ["نمره شما", "پایین (7-14)", "متوسط (15-21)", "خوب (22-35)", "عالی (36-49)"],
      datasets: [
        {
          label: "RAAS Score",
          data: [score, 14, 21, 35, 49],
          backgroundColor: [
            interpretation.color + "B3",
            "rgba(239, 68, 68, 0.3)",
            "rgba(249, 115, 22, 0.3)",
            "rgba(234, 179, 8, 0.3)",
            "rgba(34, 197, 94, 0.3)"
          ],
          borderColor: [
            interpretation.color,
            "#ef4444",
            "#f97316",
            "#eab308",
            "#22c55e"
          ],
          borderWidth: 2
        }
      ]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "مقیاس رضایت از روابط (RAAS)",
          font: { size: 14, family: "Vazirmatn" },
          color: "#e2e8f0"
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 49,
          ticks: { color: "#94a3b8", font: { family: "Vazirmatn" } },
          grid: { color: "#334155" }
        },
        x: {
          ticks: { color: "#94a3b8", font: { family: "Vazirmatn", size: 10 } },
          grid: { color: "#334155" }
        }
      }
    };

    return (
      <div className="w-full flex flex-col items-center">
        <Header />
        <MobileHeader />
        <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
          <Sidebar />
          <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="size-16 rounded-2xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20">
                <FaHeart className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج مقیاس رضایت از روابط</h1>
                <p className="text-secondaryTextColor">Relationship Assessment Scale (RAAS)</p>
              </div>
            </div>

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
              <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>
                {score} از {maxScore}
              </div>
              <div className="text-lg font-semibold" style={{ color: interpretation.color }}>
                {interpretation.level}
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">توضیحات</h3>
              <p className="text-secondaryTextColor leading-relaxed mb-4">{interpretation.desc}</p>
              <p className="text-secondaryTextColor leading-relaxed">{interpretation.details}</p>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">نقاط قوت</h3>
              <ul className="list-disc list-inside space-y-2 text-secondaryTextColor">
                {interpretation.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">توصیه‌ها</h3>
              <ul className="list-disc list-inside space-y-2 text-secondaryTextColor">
                {interpretation.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">نمودار</h3>
              <div style={{ height: "300px" }}>
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>

            <button
              onClick={() => {
                setCurrentQuestion(0);
                setAnswers({});
                setIsCompleted(false);
              }}
              className="w-full h-12 bg-primaryThemeColor text-white rounded-xl font-medium hover:bg-primaryThemeColor/90 transition-colors"
            >
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
      <Header />
      <MobileHeader />
      <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
        <Sidebar />
        <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="size-16 rounded-2xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20">
              <FaHeart className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">مقیاس رضایت از روابط (RAAS)</h1>
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
            >
              {questions[currentQuestion]}
            </h3>
            <div className="space-y-3">
              {options.map((option, index) => (
                <button
                  key={`${currentQuestion}-${option.value}`}
                  onClick={() => handleAnswer(option.value)}
                  className="w-full p-4 text-right bg-secondaryThemeColor hover:bg-primaryThemeColor/10 rounded-xl border border-borderColor hover:border-primaryThemeColor/40 transition-all"
                >
                  <span className="text-primaryTextColor font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="w-full bg-darkThemeColor rounded-2xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-secondaryTextColor">
                پیشرفت: {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
              </span>
            </div>
            <div className="w-full h-2 bg-secondaryThemeColor rounded-full overflow-hidden">
              <div
                className="h-full bg-primaryThemeColor rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TestPage;