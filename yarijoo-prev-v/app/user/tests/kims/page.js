"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaLeaf } from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { useTestResult } from "@/hooks/useTestResult";
import { baseURL } from "@/services/API";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TestPage = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("kims");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [savedScores, setSavedScores] = useState(null);

  const questionsData = useMemo(() => [
    { text: "متوجه احساساتم می‌شوم", reverse: false, facet: "observe" },
    { text: "به حس‌های بدنی توجه می‌کنم", reverse: false, facet: "observe" },
    { text: "تجربیاتم را با کلمات توصیف می‌کنم", reverse: false, facet: "describe" },
    { text: "می‌توانم احساساتم را نام‌گذاری کنم", reverse: false, facet: "describe" },
    { text: "کاملاً در کاری که انجام می‌دهم غرق می‌شوم", reverse: false, facet: "act_with_awareness" },
    { text: "به طور خودکار عمل نمی‌کنم", reverse: false, facet: "act_with_awareness" },
    { text: "افکار و احساساتم را قضاوت نمی‌کنم", reverse: false, facet: "non_judging" },
    { text: "به خودم می‌گویم نباید چنین احساسی داشته باشم", reverse: true, facet: "non_judging" },
    { text: "افکارم را می‌گذارم بیایند و بروند", reverse: false, facet: "non_reactivity" },
    { text: "با افکار منفی مبارزه نمی‌کنم", reverse: false, facet: "non_reactivity" }
  ], []);

  const questions = useMemo(() => questionsData.map(q => q.text), [questionsData]);

  const options = useMemo(() => [
    { value: 1, label: "تقریباً هرگز" },
    { value: 2, label: "به ندرت" },
    { value: 3, label: "گاهی" },
    { value: 4, label: "اغلب" },
    { value: 5, label: "تقریباً همیشه" }
  ], []);

  // اگر نتیجه قبلی وجود داشت، آن را نمایش بده
  useEffect(() => {
    if (hasResult && previousResult && !resultLoading) {
      setIsCompleted(true);
      // تبدیل نتیجه قبلی به فرمت قابل استفاده
      if (previousResult.total_score || previousResult.scores) {
        const scores = {
          observe: previousResult.scores?.observe || 0,
          describe: previousResult.scores?.describing || 0,
          act_with_awareness: previousResult.scores?.acting_with_awareness || 0,
          non_judging: previousResult.scores?.accepting_without_judgment || 0,
          non_reactivity: 0,
          totalScore: previousResult.total_score || 0
        };
        setSavedScores(scores);
      }
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

  // ذخیره نتیجه بعد از تکمیل تست
  useEffect(() => {
    const saveResultToServer = async () => {
      if (isCompleted && !hasResult && Object.keys(answers).length === questions.length) {
        const scores = calculateScores();
        const interpretation = getInterpretation(scores);
        
        try {
          // تبدیل answers به آرایه
          const answersArray = questionsData.map((q, idx) => answers[idx] || 0);

          const saved = await saveResult({
            answers: answersArray,
            totalScore: scores.totalScore,
            total_score: scores.totalScore,
            level: interpretation.level,
            interpretation: interpretation,
            scores: scores
          });
          
          if (saved && saved.success) {
            setSavedScores(scores);
            setIsCompleted(true);
          }
        } catch (error) {
          console.error("Error saving result:", error);
        }
      }
    };

    saveResultToServer();
  }, [isCompleted, hasResult, answers, questionsData, questions, saveResult]);

  const calculateScores = () => {
    const facetScores = {
      observe: 0,
      describe: 0,
      act_with_awareness: 0,
      non_judging: 0,
      non_reactivity: 0
    };

    questionsData.forEach((q, idx) => {
      const answer = answers[idx] || 1;
      const score = q.reverse ? (6 - answer) : answer;
      
      if (q.facet === "non_reactivity") {
        facetScores.non_reactivity += score;
      } else {
        facetScores[q.facet] += score;
      }
    });

    const totalScore = Object.values(facetScores).reduce((sum, val) => sum + val, 0);
    return { ...facetScores, totalScore };
  };

  const getInterpretation = (scores) => {
    const maxScore = 50; // 10 questions * 5 points each
    
    if (scores.totalScore <= 25) {
      return {
        level: "ذهن‌آگاهی پایین",
        color: "#ef4444",
        desc: "سطح ذهن‌آگاهی شما پایین است و نیاز به تمرین و آموزش دارد.",
        details: "نمره شما نشان می‌دهد که مهارت‌های ذهن‌آگاهی شما نیاز به تقویت دارد. ذهن‌آگاهی یک مهارت قابل یادگیری است که می‌تواند به کاهش استرس، بهبود سلامت روان و افزایش کیفیت زندگی کمک کند.",
        strengths: ["آگاهی از نیاز به بهبود", "پتانسیل برای یادگیری"],
        recommendations: [
          "شرکت در دوره‌های آموزش ذهن‌آگاهی (MBSR - Mindfulness-Based Stress Reduction)",
          "شروع با مدیتیشن روزانه 5-10 دقیقه",
          "تمرین تکنیک‌های مشاهده (توجه به احساسات و حس‌های بدنی)",
          "تمرین توصیف تجربیات با کلمات",
          "تمرین عمل با آگاهی (حضور کامل در لحظه)",
          "یادگیری پذیرش بدون قضاوت",
          "استفاده از اپلیکیشن‌های ذهن‌آگاهی و مدیتیشن",
          "شرکت در کلاس‌های یوگا یا تای‌چی"
        ]
      };
    } else if (scores.totalScore <= 35) {
      return {
        level: "ذهن‌آگاهی متوسط",
        color: "#eab308",
        desc: "سطح ذهن‌آگاهی شما متوسط است. با تمرین بیشتر می‌توانید آن را بهبود دهید.",
        details: "شما برخی مهارت‌های ذهن‌آگاهی را دارید اما هنوز جا برای بهبود وجود دارد. با تمرین منظم می‌توانید سطح ذهن‌آگاهی خود را افزایش دهید و از مزایای بیشتری بهره‌مند شوید.",
        strengths: ["برخی مهارت‌های ذهن‌آگاهی پایه", "آگاهی از اهمیت ذهن‌آگاهی"],
        recommendations: [
          "افزایش زمان تمرین مدیتیشن به 15-20 دقیقه روزانه",
          "تمرین منظم مهارت‌های چهارگانه ذهن‌آگاهی",
          "تمرین ذهن‌آگاهی در فعالیت‌های روزمره",
          "شرکت در دوره‌های پیشرفته ذهن‌آگاهی",
          "خواندن کتاب‌های مرتبط با ذهن‌آگاهی",
          "تمرین ذهن‌آگاهی در موقعیت‌های استرس‌زا"
        ]
      };
    } else {
      return {
        level: "ذهن‌آگاهی بالا",
        color: "#22c55e",
        desc: "سطح ذهن‌آگاهی شما بالا است!",
        details: "نمره بالا شما نشان می‌دهد که شما مهارت‌های ذهن‌آگاهی قوی دارید. شما می‌توانید به خوبی احساسات و افکار خود را مشاهده کنید، آن‌ها را توصیف کنید، با آگاهی عمل کنید و بدون قضاوت بپذیرید. این یک نشانه عالی از سلامت روان است.",
        strengths: [
          "مهارت‌های قوی ذهن‌آگاهی",
          "توانایی مشاهده و توصیف تجربیات",
          "عمل با آگاهی",
          "پذیرش بدون قضاوت",
          "سلامت روان بهتر"
        ],
        recommendations: [
          "حفظ و ادامه تمرینات منظم ذهن‌آگاهی",
          "عمیق‌تر کردن تمرینات",
          "آموزش ذهن‌آگاهی به دیگران",
          "کمک به دیگران در یادگیری این مهارت",
          "ادامه رشد و توسعه مهارت‌های ذهن‌آگاهی"
        ]
      };
    }
  };

  // نمایش loading در حال بررسی نتیجه قبلی
  if (resultLoading) {
    return (
      <div className="w-full flex flex-col items-center min-h-screen justify-center">
        <div className="text-primaryTextColor">در حال بررسی...</div>
      </div>
    );
  }

  if (isCompleted) {
    const scores = savedScores || calculateScores();
    const interpretation = getInterpretation(scores);

    const chartData = {
      labels: ["مشاهده", "توصیف", "عمل با آگاهی", "عدم قضاوت", "عدم واکنش"],
      datasets: [
        {
          label: "نمرات جنبه‌های ذهن‌آگاهی",
          data: [
            scores.observe,
            scores.describe,
            scores.act_with_awareness,
            scores.non_judging,
            scores.non_reactivity
          ],
          backgroundColor: interpretation.color + "B3",
          borderColor: interpretation.color,
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
          text: "جنبه‌های ذهن‌آگاهی (KIMS)",
          font: { size: 14, family: "Vazirmatn" },
          color: "#e2e8f0"
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 10,
          ticks: { color: "#94a3b8", font: { family: "Vazirmatn" } },
          grid: { color: "#334155" }
        },
        x: {
          ticks: { color: "#94a3b8", font: { family: "Vazirmatn", size: 9 } },
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
                <FaLeaf className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج پرسشنامه ذهن‌آگاهی کنتاکی</h1>
                <p className="text-secondaryTextColor">Kentucky Inventory of Mindfulness Skills (KIMS)</p>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
              <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>
                {scores.totalScore} از {50}
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
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">نمودار جنبه‌های ذهن‌آگاهی</h3>
              <div style={{ height: "300px" }}>
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>

            <button
              onClick={async () => {
                await resetResult();
                setCurrentQuestion(0);
                setAnswers({});
                setIsCompleted(false);
                setSavedScores(null);
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
              <FaLeaf className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">پرسشنامه ذهن‌آگاهی کنتاکی (KIMS)</h1>
              <p className="text-secondaryTextColor">Kentucky Inventory of Mindfulness Skills</p>
              <p className="text-secondaryTextColor text-sm mt-1">سوال {currentQuestion + 1} از {questions.length}</p>
            </div>
          </div>

          <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
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
                  className="w-full p-4 text-right bg-secondaryThemeColor hover:bg-primaryThemeColor/10 rounded-xl border border-borderColor hover:border-primaryThemeColor/40"
                  style={{
                    opacity: 0,
                    animation: `testOptionFadeIn 0.4s ease-out ${0.4 + index * 0.1}s forwards`,
                    animationFillMode: 'forwards',
                  }}
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
