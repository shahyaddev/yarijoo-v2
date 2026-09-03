"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaHeartBroken } from "react-icons/fa";
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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("selsa");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questionsData = useMemo(() => [
    { text: "احساس تنهایی در روابط رمانتیک می‌کنم", type: "romantic" },
    { text: "کسی را برای رابطه عاطفی ندارم", type: "romantic" },
    { text: "احساس تنهایی در خانواده می‌کنم", type: "family" },
    { text: "خانواده‌ام مرا درک نمی‌کند", type: "family" },
    { text: "احساس تنهایی در دوستی‌ها می‌کنم", type: "social" },
    { text: "دوستان واقعی ندارم", type: "social" },
    { text: "از رابطه عاطفی‌ام راضی نیستم", type: "romantic" },
    { text: "از خانواده‌ام حمایت نمی‌شوم", type: "family" },
    { text: "دوستان نزدیک ندارم", type: "social" },
    { text: "به کسی نزدیک نیستم", type: "romantic" },
    { text: "احساس می‌کنم در روابط عاطفی تنها هستم", type: "romantic" },
    { text: "خانواده‌ام در زمان مشکلات کنارم نیستند", type: "family" },
    { text: "در جمع دوستان احساس تنهایی می‌کنم", type: "social" },
    { text: "کسی نیست که با او احساس صمیمیت کنم", type: "romantic" }
  ], []);

  const questions = useMemo(() => questionsData.map(q => q.text), [questionsData]);

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

  const calculateScores = () => {
    let romantic = 0;
    let family = 0;
    let social = 0;

    questionsData.forEach((q, idx) => {
      const answer = answers[idx] || 1;
      if (q.type === "romantic") {
        romantic += answer;
      } else if (q.type === "family") {
        family += answer;
      } else {
        social += answer;
      }
    });

    const total = romantic + family + social;
    return { total, romantic, family, social };
  };

  const calculateScore = () => calculateScores().total;

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


  const getInterpretation = (scores) => {
    const { total, romantic, family, social } = scores;
    const maxScore = 98; // 14 questions * 7 points each
    
    const avgScore = total / questions.length;
    
    if (avgScore <= 2.5) {
      return {
        level: "تنهایی پایین",
        color: "#22c55e",
        desc: "احساس تنهایی شما در حد طبیعی و سالم است. شما روابط اجتماعی و عاطفی مناسبی دارید.",
        details: "نمره پایین شما نشان می‌دهد که از روابط معنادار در حوزه‌های رمانتیک، خانواده و اجتماعی برخوردار هستید. این وضعیت مثبت برای سلامت روانی و عاطفی شما بسیار مفید است.",
        strengths: [
          "روابط رمانتیک پایدار و رضایت‌بخش",
          "حمایت مناسب از خانواده",
          "شبکه اجتماعی قوی",
          "احساس تعلق و ارتباط",
          "کیفیت زندگی اجتماعی خوب"
        ],
        recommendations: [
          "حفظ و قدردانی از روابط موجود",
          "توسعه عمق روابط فعلی",
          "سرمایه‌گذاری مداوم در روابط",
          "کمک به دیگران در ایجاد ارتباطات",
          "ایجاد روابط جدید با حفظ کیفیت"
        ]
      };
    } else if (avgScore <= 4) {
      return {
        level: "تنهایی متوسط",
        color: "#eab308",
        desc: "احساس تنهایی متوسط - نیاز به تقویت روابط در برخی حوزه‌ها.",
        details: "شما در برخی حوزه‌های روابط احساس تنهایی می‌کنید. شناسایی حوزه‌های خاص (رمانتیک، خانواده، اجتماعی) و تلاش برای تقویت آنها می‌تواند به کاهش این احساس کمک کند.",
        strengths: [
          "وجود برخی روابط مثبت",
          "آگاهی از اهمیت روابط",
          "توانایی ایجاد ارتباط اولیه",
          "درک نیاز به بهبود"
        ],
        recommendations: [
          "شناسایی حوزه‌های خاص تنهایی (رمانتیک، خانواده، اجتماعی)",
          "تقویت روابط موجود با سرمایه‌گذاری زمانی بیشتر",
          "ایجاد روابط جدید از طریق فعالیت‌های مشترک",
          "گفتگوی صادقانه با عزیزان درباره نیازهای عاطفی",
          "شرکت در فعالیت‌های گروهی و اجتماعی",
          "تمرین مهارت‌های ارتباطی و عمیق‌سازی روابط",
          "درخواست کمک از مشاور برای بهبود مهارت‌های اجتماعی"
        ]
      };
    } else {
      const dominantType = romantic >= family && romantic >= social ? "رمانتیک" :
                          family >= social ? "خانواده" : "اجتماعی";
      
      return {
        level: "تنهایی بالا",
        color: "#ef4444",
        desc: `احساس تنهایی شدید - بیشتر در حوزه ${dominantType}. نیاز به مداخله و حمایت فوری.`,
        details: `نمره بالا شما نشان‌دهنده احساس تنهایی شدید است که بیشتر در حوزه ${dominantType} تجربه می‌شود. این احساس می‌تواند تأثیرات جدی بر سلامت روانی، جسمی و کیفیت زندگی شما داشته باشد. دریافت حمایت تخصصی و تلاش برای ایجاد روابط معنادار ضروری است.`,
        strengths: [
          "تمایل به بهبود وضعیت",
          "آگاهی از مشکل",
          "جستجوی راه‌حل",
          "اراده برای تغییر"
        ],
        recommendations: [
          "مشاوره تخصصی فوری با روانشناس یا مشاور",
          `تمرکز ویژه بر کاهش تنهایی ${dominantType}`,
          "درمان شناختی-رفتاری (CBT) برای تغییر الگوهای فکری منفی",
          "گروه‌درمانی برای تمرین مهارت‌های ارتباطی",
          "ایجاد روابط جدید از طریق فعالیت‌های مورد علاقه",
          "تقویت روابط خانوادگی موجود (اگر خانواده موجود است)",
          "یادگیری مهارت‌های ارتباطی و اجتماعی",
          "پیوستن به گروه‌های پشتیبانی",
          "درمان مشکلات همزمان (افسردگی، اضطراب) در صورت وجود"
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
    const scores = calculateScores();
    const interpretation = getInterpretation(scores);

    const chartData = {
      labels: ["تنهایی رمانتیک", "تنهایی خانوادگی", "تنهایی اجتماعی", "نمره کل"],
      datasets: [
        {
          label: "SELSA Scores",
          data: [scores.romantic, scores.family, scores.social, scores.total],
          backgroundColor: ["#ef4444", "#f59e0b", "#3b82f6", interpretation.color],
          borderColor: ["#dc2626", "#d97706", "#2563eb", interpretation.color],
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
          text: "ارزیابی تنهایی اجتماعی و هیجانی (SELSA)",
          font: { size: 14, family: "Vazirmatn" },
          color: "#e2e8f0"
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 98,
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
                <FaHeartBroken className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج ارزیابی تنهایی اجتماعی و هیجانی</h1>
                <p className="text-secondaryTextColor">Social and Emotional Loneliness Scale (SELSA)</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-darkThemeColor rounded-xl p-3">
                <div className="text-xs text-secondaryTextColor mb-1">تنهایی رمانتیک</div>
                <div className="text-xl font-bold text-red-500">{scores.romantic}</div>
              </div>
              <div className="bg-darkThemeColor rounded-xl p-3">
                <div className="text-xs text-secondaryTextColor mb-1">تنهایی خانوادگی</div>
                <div className="text-xl font-bold text-orange-500">{scores.family}</div>
              </div>
              <div className="bg-darkThemeColor rounded-xl p-3">
                <div className="text-xs text-secondaryTextColor mb-1">تنهایی اجتماعی</div>
                <div className="text-xl font-bold text-blue-500">{scores.social}</div>
              </div>
            </div>

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
              <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>
                {scores.total} از {98}
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
              <FaHeartBroken className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">ارزیابی تنهایی اجتماعی و هیجانی (SELSA)</h1>
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