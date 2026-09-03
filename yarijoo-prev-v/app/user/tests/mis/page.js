"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaRocket } from "react-icons/fa";
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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("mis");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questionsData = useMemo(() => [
    { text: "به یادگیری مطالب جدید علاقه‌مندم", type: "intrinsic" },
    { text: "یادگیری برایم لذت‌بخش است", type: "intrinsic" },
    { text: "برای نمرات خوب درس می‌خوانم", type: "extrinsic" },
    { text: "می‌خواهم از دیگران بهتر باشم", type: "extrinsic" },
    { text: "از چالش‌های درسی لذت می‌برم", type: "intrinsic" },
    { text: "برای تحسین شدن تلاش می‌کنم", type: "extrinsic" },
    { text: "کنجکاوی من انگیزه‌ام است", type: "intrinsic" },
    { text: "نمی‌خواهم از دیگران عقب بمانم", type: "extrinsic" },
    { text: "یادگیری خودش پاداش است", type: "intrinsic" },
    { text: "برای موفقیت آینده درس می‌خوانم", type: "extrinsic" },
    { text: "از کشف موضوعات جدید هیجان‌زده می‌شوم", type: "intrinsic" },
    { text: "می‌خواهم مورد تأیید معلمان باشم", type: "extrinsic" },
    { text: "یادگیری باعث رشد شخصی‌ام می‌شود", type: "intrinsic" },
    { text: "به خاطر رقابت با دیگران تلاش می‌کنم", type: "extrinsic" },
    { text: "از حل مسائل پیچیده لذت می‌برم", type: "intrinsic" },
    { text: "برای دریافت جوایز و تقدیر درس می‌خوانم", type: "extrinsic" },
    { text: "یادگیری به خودی خود معنادار است", type: "intrinsic" }
  ], []);

  const questions = useMemo(() => questionsData.map(q => q.text), [questionsData]);

  const options = useMemo(() => [
    { value: 1, label: "کاملاً مخالفم" },
    { value: 2, label: "مخالفم" },
    { value: 3, label: "نه موافق نه مخالف" },
    { value: 4, label: "موافقم" },
    { value: 5, label: "کاملاً موافقم" }
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
    let intrinsic = 0;
    let extrinsic = 0;

    questionsData.forEach((q, idx) => {
      const answer = answers[idx] || 1;
      if (q.type === "intrinsic") {
        intrinsic += answer;
      } else {
        extrinsic += answer;
      }
    });

    const total = intrinsic + extrinsic;
    return { total, intrinsic, extrinsic };
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
    const { total, intrinsic, extrinsic } = scores;
    const maxScore = 85; // 17 questions * 5 points each
    
    const intrinsicRatio = intrinsic / (intrinsic + extrinsic);
    
    if (total <= 34) {
      return {
        level: "انگیزه بسیار پایین",
        color: "#ef4444",
        desc: "انگیزه شما برای یادگیری و پیشرفت بسیار پایین است. این می‌تواند نشان‌دهنده فرسودگی، افسردگی یا نبود هدف باشد.",
        details: "نمره پایین شما نشان می‌دهد که انگیزه کافی برای یادگیری و پیشرفت ندارید. این وضعیت می‌تواند منجر به کاهش عملکرد، نارضایتی و مشکلات در زندگی تحصیلی و شغلی شود.",
        strengths: [
          "آگاهی از مشکل",
          "پتانسیل برای تغییر",
          "امکان دریافت کمک"
        ],
        recommendations: [
          "بررسی علل کمبود انگیزه (افسردگی، فرسودگی، استرس)",
          "تعیین اهداف کوچک و قابل دستیابی",
          "یافتن معنا و هدف در فعالیت‌ها",
          "جشن گرفتن موفقیت‌های کوچک",
          "مشاوره با روان‌شناس یا مشاور تحصیلی",
          "بررسی نیازهای اساسی (خواب، تغذیه، ورزش)"
        ]
      };
    } else if (total <= 51) {
      return {
        level: "انگیزه پایین",
        color: "#f97316",
        desc: "انگیزه شما برای یادگیری و پیشرفت در سطح پایینی است. نیاز به تلاش بیشتر برای تقویت انگیزه دارید.",
        details: "نمره پایین شما نشان می‌دهد که نیاز به تقویت انگیزه دارید. با تعیین اهداف واضح و یافتن معنای بیشتر در فعالیت‌ها می‌توانید انگیزه خود را افزایش دهید.",
        strengths: [
          "برخی علایق و انگیزه‌های اولیه",
          "ظرفیت برای بهبود",
          "تمایل به تغییر"
        ],
        recommendations: [
          "تعیین اهداف روشن و معنادار",
          "یافتن علایق شخصی در موضوعات",
          "ایجاد سیستم پاداش‌دهی",
          "برقراری ارتباط با افراد انگیزه‌بخش",
          "تمرکز بر پیشرفت‌های کوچک",
          "کاهش عوامل بازدارنده انگیزه"
        ]
      };
    } else if (total <= 68) {
      return {
        level: "انگیزه متوسط",
        color: "#eab308",
        desc: "انگیزه شما در سطح متوسطی است. شما انگیزه کافی برای یادگیری دارید اما می‌توانید آن را تقویت کنید.",
        details: "نمره متوسط شما نشان می‌دهد که انگیزه مناسبی دارید. با تمرکز بر انگیزه درونی و یافتن معنا بیشتر در فعالیت‌ها می‌توانید انگیزه خود را افزایش دهید.",
        strengths: [
          "انگیزه مناسب برای یادگیری",
          "تعادل نسبی بین انگیزه درونی و بیرونی",
          "پایه برای رشد بیشتر"
        ],
        recommendations: [
          "افزایش تمرکز بر انگیزه درونی (علاقه، کنجکاوی، رشد)",
          "کاهش وابستگی به پاداش‌های بیرونی",
          "تعیین اهداف چالش‌برانگیزتر",
          "یافتن معنا و هدف عمیق‌تر",
          "اشتراک تجربیات با دیگران",
          "ادامه توسعه مهارت‌ها"
        ]
      };
    } else {
      if (intrinsicRatio >= 0.6) {
        return {
          level: "انگیزه درونی قوی",
          color: "#22c55e",
          desc: "شما انگیزه درونی بسیار قوی‌ای دارید! شما از یادگیری خود لذت می‌برید و کنجکاوی و علاقه شما را به پیش می‌راند.",
          details: "نمره عالی شما با تمرکز بر انگیزه درونی نشان‌دهنده این است که شما از یادگیری خود لذت می‌برید و علایق شما انگیزه اصلی شماست. این نوع انگیزه پایدارتر و مؤثرتر از انگیزه بیرونی است.",
          strengths: [
            "انگیزه درونی قوی (علاقه، کنجکاوی، رشد)",
            "لذت بردن از یادگیری",
            "پایداری انگیزه",
            "استقلال در یادگیری",
            "انگیزه پایدار و عمیق"
          ],
          recommendations: [
            "حفظ و تقویت انگیزه درونی",
            "ادامه کاوش موضوعات جدید",
            "کمک به دیگران در یافتن علایق خود",
            "منتور بودن برای دیگران",
            "اشتراک شور و شوق یادگیری",
            "ادامه مسیر رشد و پیشرفت"
          ]
        };
      } else {
        return {
          level: "انگیزه بالا (بیشتر بیرونی)",
          color: "#10b981",
          desc: "شما انگیزه بالایی دارید اما بیشتر از عوامل بیرونی (پاداش، تأیید، رقابت) تأثیر می‌گیرید.",
          details: "نمره بالا شما نشان می‌دهد که انگیزه زیادی دارید اما بیشتر بر اساس پاداش‌ها و تأییدهای بیرونی است. در حالی که این می‌تواند مؤثر باشد، انگیزه درونی پایدارتر و رضایت‌بخش‌تر است.",
          strengths: [
            "انگیزه بالا برای موفقیت",
            "تمایل به پیشرفت",
            "واکنش مثبت به پاداش‌ها",
            "رقابت‌پذیری"
          ],
          recommendations: [
            "توسعه انگیزه درونی بیشتر",
            "یافتن علایق شخصی در موضوعات",
            "یافتن معنا و هدف عمیق‌تر",
            "کاهش وابستگی به تأییدهای بیرونی",
            "تمرکز بر رضایت از خود پیشرفت",
            "تعادل بین انگیزه درونی و بیرونی"
          ]
        };
      }
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
      labels: ["انگیزه درونی", "انگیزه بیرونی", "نمره کل"],
      datasets: [
        {
          label: "نمرات MIS",
          data: [scores.intrinsic, scores.extrinsic, scores.total],
          backgroundColor: ["#3b82f6", "#f59e0b", interpretation.color],
          borderColor: ["#2563eb", "#d97706", interpretation.color],
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
          text: "مقیاس انگیزش (MIS)",
          font: { size: 14, family: "Vazirmatn" },
          color: "#e2e8f0"
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 85,
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
                <FaRocket className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج مقیاس انگیزش (MIS)</h1>
                <p className="text-secondaryTextColor">Motivation & Incentive Scale</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-darkThemeColor rounded-xl p-3">
                <div className="text-xs text-secondaryTextColor mb-1">انگیزه درونی</div>
                <div className="text-xl font-bold text-blue-500">{scores.intrinsic}</div>
              </div>
              <div className="bg-darkThemeColor rounded-xl p-3">
                <div className="text-xs text-secondaryTextColor mb-1">انگیزه بیرونی</div>
                <div className="text-xl font-bold text-orange-500">{scores.extrinsic}</div>
              </div>
              <div className="bg-darkThemeColor rounded-xl p-3">
                <div className="text-xs text-secondaryTextColor mb-1">نمره کل</div>
                <div className="text-xl font-bold" style={{ color: interpretation.color }}>
                  {scores.total} از 85
                </div>
              </div>
            </div>

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سطح انگیزه</h3>
              <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>
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
              <FaRocket className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">مقیاس انگیزش (MIS)</h1>
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