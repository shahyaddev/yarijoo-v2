"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaHandsHelping } from "react-icons/fa";
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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("help_seeking");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = useMemo(() => [
    "اگر مشکل روانی داشته باشم، از متخصص کمک می‌گیرم",
    "درخواست کمک نشانه ضعف است",
    "راحت می‌توانم مشکلاتم را با دیگران در میان بگذارم",
    "ترجیح می‌دهم مشکلاتم را خودم حل کنم",
    "مشاوره روانشناسی می‌تواند مفید باشد",
    "نگران هستم دیگران داوری‌ام کنند",
    "از دوستانم برای مشکلات کمک می‌خواهم",
    "مراجعه به روان‌شناس ننگ است",
    "وقتی نیاز دارم، راحت کمک می‌خواهم",
    "باید قوی باشم و کمک نخواهم",
    "مشاوره حرفه‌ای موثر است",
    "نگران هستم محرمانگی رعایت نشود"
  ], []);

  const options = useMemo(() => [
    { value: 1, label: "کاملاً مخالفم" },
    { value: 2, label: "مخالفم" },
    { value: 3, label: "کمی مخالفم" },
    { value: 4, label: "کمی موافقم" },
    { value: 5, label: "موافقم" },
    { value: 6, label: "کاملاً موافقم" }
  ], []);

  const reverseItems = [1, 3, 5, 9, 11]; // positive items (0-indexed)

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
    let total = 0;
    questions.forEach((q, idx) => {
      const answer = answers[idx] || 1;
      if (reverseItems.includes(idx)) {
        total += answer;
      } else {
        total += (7 - answer);
      }
    });
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
    if (score <= 36) {
      return {
        level: "تمایل بسیار کم به درخواست کمک",
        color: "#dc2626",
        desc: "شما تمایل بسیار کمی به درخواست کمک حرفه‌ای دارید و ممکن است از طلب یاری اجتناب کنید.",
        details: "این ممکن است ناشی از انگ اجتماعی، ترس از داوری، یا باور به خودکفایی افراطی باشد. این می‌تواند مانع دریافت کمک مورد نیاز شود.",
        strengths: [
          "استقلال و خودکفایی",
          "توانایی حل مسئله فردی"
        ],
        recommendations: [
          "بازنگری باورها درباره درخواست کمک",
          "شناخت اینکه کمک خواستن نشانه قدرت است نه ضعف",
          "صحبت با کسی که تجربه مثبت مشاوره دارد",
          "شروع با موضوعات کوچک‌تر",
          "آموزش درباره مزایای مشاوره",
          "کاهش خودانتقادگری"
        ]
      };
    } else if (score <= 48) {
      return {
        level: "تمایل کم به درخواست کمک",
        color: "#f59e0b",
        desc: "شما تردید دارید که آیا باید کمک حرفه‌ای بگیرید یا نه.",
        details: "ممکن است برخی موانع ذهنی یا اجتماعی مانع درخواست کمک شما شوند. شناخت و رفع این موانع می‌تواند مفید باشد.",
        strengths: [
          "برخی آگاهی از مزایای کمک",
          "تمایل نسبی در شرایط خاص",
          "توانایی‌های مقابله‌ای موجود"
        ],
        recommendations: [
          "شناسایی موانع خاص درخواست کمک",
          "کاهش انگ و شرم",
          "آموزش مهارت‌های ارتباطی",
          "یافتن منابع قابل اعتماد",
          "شروع با منابع کم‌استرس‌تر (کتاب، آنلاین)"
        ]
      };
    } else if (score <= 60) {
      return {
        level: "تمایل متوسط به درخواست کمک",
        color: "#eab308",
        desc: "شما تمایل متوسطی به درخواست کمک دارید. در برخی موقعیت‌ها کمک می‌خواهید.",
        details: "شما توانایی نسبی در شناخت نیاز به کمک و درخواست آن دارید، اما هنوز برخی موانع وجود دارد.",
        strengths: [
          "توانایی شناخت نیاز به کمک",
          "تجربه درخواست کمک",
          "تعادل بین استقلال و کمک‌خواهی"
        ],
        recommendations: [
          "تقویت مهارت‌های درخواست کمک",
          "کاهش تردیدها",
          "افزایش شبکه حمایت",
          "یادگیری انواع منابع کمک"
        ]
      };
    } else {
      return {
        level: "تمایل بالا به درخواست کمک",
        color: "#22c55e",
        desc: "شما تمایل بالایی به درخواست کمک حرفه‌ای دارید و راحت کمک می‌خواهید.",
        details: "شما درک کرده‌اید که درخواست کمک نشانه خودآگاهی و قدرت است. این نگرش می‌تواند به سلامت روانی بهتر کمک کند.",
        strengths: [
          "خودآگاهی بالا",
          "پذیرش نیاز به کمک",
          "راحتی در ارتباط",
          "استفاده مؤثر از منابع"
        ],
        recommendations: [
          "ادامه این نگرش مثبت",
          "کمک به دیگران برای درخواست کمک",
          "تشویق دیگران به مشاوره",
          "حفظ تعادل بین کمک‌خواهی و استقلال"
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
          label: "کمک‌خواهی",
          data: [score, 12, 48, 72],
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
          text: "تمایل به درخواست کمک حرفه‌ای",
          font: { size: 14, family: "Vazirmatn" },
          color: "#e2e8f0"
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 72,
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
                <FaHandsHelping className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج نگرش به درخواست کمک</h1>
                <p className="text-secondaryTextColor">Help-Seeking Attitudes</p>
              </div>
            </div>

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
              <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>
                {score} از 72
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
              <FaHandsHelping className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">نگرش به درخواست کمک</h1>
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



