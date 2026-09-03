"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaStar } from "react-icons/fa";
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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("hope_scale");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = useMemo(() => [
    "می‌توانم به راه‌های زیادی برای حل مشکلات فکر کنم",
    "با تمام قوا به دنبال اهدافم هستم",
    "راه‌های زیادی برای رسیدن به چیزی که می‌خواهم وجود دارد",
    "در گذشته به خوبی با اهدافم کنار آمده‌ام",
    "حتی وقتی دیگران نا‌امید می‌شوند، راهی پیدا می‌کنم",
    "به اهدافی که برای خودم تعیین کرده‌ام می‌رسم",
    "اهدافم را به طور فعال دنبال می‌کنم",
    "می‌توانم برای هر مشکل راه‌حلی فکر کنم"
  ], []);

  const options = useMemo(() => [
    { value: 1, label: "کاملاً نادرست" },
    { value: 2, label: "بیشتر نادرست" },
    { value: 3, label: "کمی نادرست" },
    { value: 4, label: "کمی درست" },
    { value: 5, label: "بیشتر درست" },
    { value: 6, label: "کاملاً درست" }
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
    return Object.values(answers).reduce((sum, score) => sum + score, 0);
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
    if (score <= 16) {
      return {
        level: "امید بسیار پایین",
        color: "#dc2626",
        desc: "سطح امید شما بسیار پایین است. احتمالاً احساس ناامیدی و ناتوانی در رسیدن به اهداف دارید.",
        details: "نمره پایین شما نشان‌دهنده مشکل در دیدن راه‌های مختلف و فقدان انگیزه برای پیگیری اهداف است. این وضعیت نیاز به کمک حرفه‌ای دارد.",
        strengths: [
          "آگاهی از وضعیت",
          "تکمیل این آزمون",
          "امکان بهبود"
        ],
        recommendations: [
          "مشاوره فوری با روان‌درمانگر",
          "آموزش مهارت‌های امیدواری",
          "تعیین اهداف کوچک و قابل دستیابی",
          "یادآوری موفقیت‌های گذشته",
          "جستجوی حمایت اجتماعی"
        ]
      };
    } else if (score <= 32) {
      return {
        level: "امید متوسط",
        color: "#eab308",
        desc: "سطح امید شما متوسط است. گاهی امیدوار هستید و گاهی نه.",
        details: "شما توانایی‌هایی برای فکر کردن راه‌ها و پیگیری اهداف دارید اما این مهارت‌ها نیاز به تقویت دارند.",
        strengths: [
          "برخی تجربیات موفق",
          "توانایی نسبی در حل مسئله",
          "انگیزه متوسط"
        ],
        recommendations: [
          "تقویت مهارت‌های حل مسئله",
          "افزایش اهداف و برنامه‌ریزی",
          "تمرین فکر کردن راه‌های مختلف",
          "جشن گرفتن موفقیت‌ها"
        ]
      };
    } else {
      return {
        level: "امید بالا",
        color: "#22c55e",
        desc: "سطح امید شما بالاست! شما به توانایی خود برای رسیدن به اهداف ایمان دارید.",
        details: "نمره بالای شما نشان می‌دهد که هم در فکر کردن راه‌های مختلف و هم در پیگیری اهداف قوی هستید. این یک دارایی روانشناختی قدرتمند است.",
        strengths: [
          "تفکر خلاق برای راه‌ها",
          "انگیزه قوی",
          "پشتکار بالا",
          "خوش‌بینی فعال"
        ],
        recommendations: [
          "حفظ این سطح عالی",
          "تعیین اهداف بزرگ‌تر",
          "کمک به دیگران",
          "اشتراک تجربیات"
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
      labels: ["نمره شما", "حداقل", "متوسط", "حداکثر"],
      datasets: [
        {
          label: "امید",
          data: [score, 8, 32, 48],
          backgroundColor: ["#3b82f6", "#dc2626", "#eab308", "#22c55e"],
          borderColor: ["#2563eb", "#b91c1c", "#ca8a04", "#16a34a"],
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
          text: "مقیاس امید",
          font: { size: 14, family: "Vazirmatn" },
          color: "#e2e8f0"
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 48,
          ticks: { color: "#94a3b8", font: { family: "Vazirmatn" } },
          grid: { color: "#334155" }
        },
        x: {
          ticks: { color: "#94a3b8", font: { family: "Vazirmatn" } },
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
                <FaStar className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج مقیاس امید</h1>
                <p className="text-secondaryTextColor">Hope Scale</p>
              </div>
            </div>

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
              <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>
                {score} از 48
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
              <FaStar className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">مقیاس امید</h1>
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
            <div className="grid grid-cols-2 gap-3">
              {options.map((option, index) => (
                <button
                  key={`${currentQuestion}-${option.value}`}
                  onClick={() => handleAnswer(option.value)}
                  className="p-4 text-center bg-secondaryThemeColor hover:bg-primaryThemeColor/10 rounded-xl border border-borderColor hover:border-primaryThemeColor/40 transition-all"
                >
                  <span className="text-primaryTextColor font-medium text-sm">{option.label}</span>
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



