"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaUserClock } from "react-icons/fa";
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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("geriatric_depression");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questionsData = useMemo(() => [
    { text: "آیا از زندگی خود راضی هستید؟", reverse: true },
    { text: "آیا بسیاری از فعالیت‌ها و علایق را رها کرده‌اید؟", reverse: false },
    { text: "آیا احساس می‌کنید زندگی‌تان خالی است؟", reverse: false },
    { text: "آیا اغلب حوصله‌تان سر می‌رود؟", reverse: false },
    { text: "آیا بیشتر اوقات با روحیه خوب هستید؟", reverse: true },
    { text: "آیا می‌ترسید اتفاق بدی بیفتد؟", reverse: false },
    { text: "آیا بیشتر اوقات شاد هستید؟", reverse: true },
    { text: "آیا اغلب احساس درماندگی می‌کنید؟", reverse: false },
    { text: "آیا ترجیح می‌دهید در خانه بمانید؟", reverse: false },
    { text: "آیا احساس می‌کنید مشکلات حافظه بیشتر از دیگران دارید؟", reverse: false },
    { text: "آیا فکر می‌کنید زنده بودن عالی است؟", reverse: true },
    { text: "آیا احساس بی‌ارزشی می‌کنید؟", reverse: false },
    { text: "آیا احساس سرزندگی می‌کنید؟", reverse: true },
    { text: "آیا فکر می‌کنید وضعیت‌تان ناامیدکننده است؟", reverse: false },
    { text: "آیا فکر می‌کنید اکثر مردم از شما بهتر هستند؟", reverse: false }
  ], []);

  const questions = useMemo(() => questionsData.map(q => q.text), [questionsData]);

  const options = useMemo(() => [
    { value: 0, label: "خیر" },
    { value: 1, label: "بله" }
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
    let total = 0;
    questionsData.forEach((q, idx) => {
      const answer = answers[idx] || 0;
      if (q.reverse) {
        total += (answer === 0 ? 1 : 0);
      } else {
        total += answer;
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
    if (score <= 4) {
      return {
        level: "بدون افسردگی",
        color: "#22c55e",
        desc: "شما علائم افسردگی ندارید. سلامت روانی شما در وضعیت خوبی قرار دارد.",
        details: "نمره شما نشان می‌دهد که از نظر روانی در وضعیت سالمی هستید و علائم افسردگی در شما مشاهده نمی‌شود. از زندگی خود رضایت دارید و انرژی و اشتیاق لازم برای فعالیت‌های روزمره را دارید.",
        strengths: [
          "رضایت از زندگی",
          "حفظ علایق و فعالیت‌ها",
          "روحیه و انرژی مناسب",
          "امیدواری به آینده",
          "احساس ارزشمندی",
          "حافظه و تمرکز مناسب"
        ],
        recommendations: [
          "حفظ سبک زندگی فعلی",
          "ادامه فعالیت‌های اجتماعی",
          "حفظ روابط اجتماعی قوی",
          "ورزش منظم",
          "تغذیه سالم",
          "فعالیت‌های لذت‌بخش",
          "غربالگری سالانه سلامت روان"
        ]
      };
    } else if (score <= 9) {
      return {
        level: "افسردگی خفیف",
        color: "#eab308",
        desc: "علائم خفیفی از افسردگی در شما مشاهده می‌شود که نیاز به توجه و پیگیری دارد.",
        details: "برخی نشانه‌های افسردگی در شما دیده می‌شود. این سطح از علائم معمولاً با تغییرات سبک زندگی و حمایت اجتماعی قابل بهبود است، اما نیاز به پیگیری دارد تا به افسردگی شدیدتر تبدیل نشود.",
        strengths: [
          "آگاهی از علائم اولیه",
          "امکان بهبود با مداخلات ساده",
          "برخی جنبه‌های مثبت زندگی هنوز باقی است",
          "انگیزه برای بهبود"
        ],
        recommendations: [
          "مشاوره با روان‌شناس یا پزشک سالمندان",
          "افزایش فعالیت‌های اجتماعی",
          "پیوستن به گروه‌های اجتماعی سالمندان",
          "ورزش منظم (پیاده‌روی روزانه)",
          "فعالیت‌های لذت‌بخش روزمره",
          "تقویت شبکه حمایت اجتماعی",
          "بررسی مشکلات جسمی همزمان",
          "پیگیری منظم علائم"
        ]
      };
    } else {
      return {
        level: "افسردگی قابل توجه",
        color: "#dc2626",
        desc: "علائم قابل توجهی از افسردگی در شما مشاهده می‌شود که نیازمند مداخله حرفه‌ای است.",
        details: "نمره شما نشان‌دهنده افسردگی قابل توجه است که نیاز به ارزیابی و درمان توسط متخصص دارد. افسردگی در سالمندان اغلب کم‌تشخیص داده می‌شود اما با درمان مناسب قابل بهبود است.",
        strengths: [
          "شناخت نیاز به کمک حرفه‌ای",
          "انجام غربالگری افسردگی",
          "امکان بهبود با درمان مناسب"
        ],
        recommendations: [
          "مراجعه فوری به روان‌پزشک یا روان‌شناس",
          "ارزیابی کامل پزشکی (بسیاری بیماری‌ها می‌توانند علائم افسردگی ایجاد کنند)",
          "بررسی داروهای مصرفی (برخی داروها افسردگی ایجاد می‌کنند)",
          "درمان دارویی در صورت نیاز",
          "روان‌درمانی تخصصی برای سالمندان",
          "فعالیت بدنی منظم (حتی پیاده‌روی کوتاه)",
          "حمایت خانواده و نزدیکان",
          "بررسی مشکلات پزشکی همزمان (دیابت، قلبی، تیروئید)",
          "جلوگیری از انزوای اجتماعی",
          "برنامه روزانه منظم و ساختاریافته"
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
      labels: ["نمره شما", "آستانه خفیف", "آستانه متوسط", "حداکثر"],
      datasets: [
        {
          label: "افسردگی",
          data: [score, 5, 10, 15],
          backgroundColor: ["#3b82f6", "#22c55e", "#eab308", "#dc2626"],
          borderColor: ["#2563eb", "#16a34a", "#ca8a04", "#b91c1c"],
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
          text: "مقیاس افسردگی سالمندان (GDS-15)",
          font: { size: 14, family: "Vazirmatn" },
          color: "#e2e8f0"
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 15,
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
                <FaUserClock className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج مقیاس افسردگی سالمندان</h1>
                <p className="text-secondaryTextColor">Geriatric Depression Scale (GDS-15)</p>
              </div>
            </div>

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
              <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>
                {score} از 15
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
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">نمودار مقایسه‌ای</h3>
              <div style={{ height: "300px" }}>
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-yellow-500 mb-3">⚠️ نکته مهم</h3>
              <p className="text-secondaryTextColor leading-relaxed">
                این آزمون یک ابزار غربالگری است، نه تشخیص قطعی. اگر نمره بالایی دارید یا علائم افسردگی دارید، 
                حتماً با پزشک یا روان‌پزشک مشورت کنید. افسردگی در سالمندان قابل درمان است!
              </p>
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
              <FaUserClock className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">مقیاس افسردگی سالمندان (GDS-15)</h1>
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
            <div className="grid grid-cols-2 gap-4">
              {options.map((option, index) => (
                <button
                  key={`${currentQuestion}-${option.value}`}
                  onClick={() => handleAnswer(option.value)}
                  className="p-6 text-center bg-secondaryThemeColor hover:bg-primaryThemeColor/10 rounded-xl border border-borderColor hover:border-primaryThemeColor/40 transition-all"
                >
                  <span className="text-primaryTextColor font-bold text-lg">{option.label}</span>
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
