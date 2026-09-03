"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaBalanceScale } from "react-icons/fa";
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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("shq");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questionsData = useMemo(() => [
    { text: "خود واقعی و ایده‌آل من متفاوت است", reverse: false, discrepancy: "actual_ideal" },
    { text: "از آنچه هستم راضی نیستم", reverse: false, discrepancy: "actual_ideal" },
    { text: "از انتظارات دیگران عقب هستم", reverse: false, discrepancy: "actual_ought" },
    { text: "آنطور که باید نیستم", reverse: false, discrepancy: "actual_ought" },
    { text: "خودم را می‌شناسم", reverse: true, clarity: "low" },
    { text: "درباره خودم مطمئن نیستم", reverse: false, clarity: "low" },
    { text: "از بودن خودم راضی هستم", reverse: true, discrepancy: "actual_ideal" },
    { text: "می‌دانم چه کسی هستم", reverse: true, clarity: "low" },
    { text: "به انتظارات خود می‌رسم", reverse: true, discrepancy: "actual_ideal" },
    { text: "مسئولیت‌هایم را انجام می‌دهم", reverse: true, discrepancy: "actual_ought" }
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
    let actualIdealDiscrepancy = 0;
    let actualOughtDiscrepancy = 0;
    let clarity = 0;
    let total = 0;

    questionsData.forEach((q, idx) => {
      const answer = answers[idx] || 1;
      let score = answer;
      if (q.reverse) {
        score = 6 - answer;
      }

      total += score;

      if (q.discrepancy === "actual_ideal") {
        actualIdealDiscrepancy += score;
      } else if (q.discrepancy === "actual_ought") {
        actualOughtDiscrepancy += score;
      }

      if (q.clarity) {
        clarity += score;
      }
    });

    return {
      total: total,
      actualIdealDiscrepancy: actualIdealDiscrepancy,
      actualOughtDiscrepancy: actualOughtDiscrepancy,
      clarity: clarity,
      average: total / questions.length
    };
  };

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
    const avg = scores.average;
    
    if (avg <= 2.0) {
      return {
        level: "رضایت بالا و وضوح خود",
        color: "#22c55e",
        desc: "شما از خود واقعی‌تان راضی هستید و وضوح خوبی از هویت خود دارید.",
        details: "نمره پایین شما نشان می‌دهد که تفاوت کمی بین خود واقعی و ایده‌آل شما وجود دارد و وضوح خوبی از هویت خود دارید. این وضعیت با رضایت بالا از زندگی، سلامت روان بهتر و عملکرد مناسب همراه است.",
        strengths: [
          "وضوح هویت بالا",
          "رضایت از خود",
          "عدم تفاوت زیاد بین خود واقعی و ایده‌آل",
          "عملکرد روانی مناسب",
          "کیفیت زندگی خوب"
        ],
        recommendations: [
          "حفظ این سطح از رضایت و وضوح",
          "ادامه فعالیت‌هایی که حس رضایت ایجاد می‌کند",
          "حفظ روابط سالم و مثبت",
          "ادامه رشد شخصی و یادگیری"
        ]
      };
    } else if (avg <= 3.0) {
      return {
        level: "رضایت متوسط",
        color: "#eab308",
        desc: "شما در برخی زمینه‌ها راضی هستید اما در برخی دیگر تفاوت بین خود واقعی و ایده‌آل وجود دارد.",
        details: "نمره متوسط شما نشان می‌دهد که در برخی زمینه‌ها راضی هستید اما هنوز تفاوت‌هایی بین خود واقعی و ایده‌آل یا انتظارات وجود دارد. این وضعیت طبیعی است اما با کار روی خود می‌توانید بهبود پیدا کنید.",
        strengths: [
          "برخی جنبه‌های رضایت",
          "آگاهی از تفاوت‌ها",
          "پتانسیل برای بهبود"
        ],
        recommendations: [
          "شناسایی دقیق تفاوت‌ها بین خود واقعی و ایده‌آل",
          "تعیین اهداف واقع‌بینانه و قابل دستیابی",
          "کار روی تقویت نقاط قوت",
          "پذیرش محدودیت‌های طبیعی",
          "تمرین خودشفقتی و پذیرش خود",
          "کاهش انتظارات غیرواقع‌بینانه"
        ]
      };
    } else {
      return {
        level: "تفاوت زیاد و رضایت پایین",
        color: "#ef4444",
        desc: "تفاوت قابل توجهی بین خود واقعی و ایده‌آل یا انتظارات شما وجود دارد و وضوح هویت پایین است.",
        details: "نمره بالا شما نشان می‌دهد که تفاوت زیادی بین خود واقعی و ایده‌آل یا انتظارات شما وجود دارد. این وضعیت می‌تواند منجر به نارضایتی، استرس، اضطراب و کاهش کیفیت زندگی شود. کار روی کاهش این تفاوت‌ها و افزایش وضوح هویت ضروری است.",
        strengths: [
          "آگاهی از مشکل",
          "تمایل به بهبود",
          "شناخت نیاز به تغییر"
        ],
        recommendations: [
          "مشاوره با روان‌شناس برای بررسی وضوح هویت",
          "شناسایی دقیق تفاوت‌ها بین خود واقعی و ایده‌آل",
          "تعیین اهداف واقع‌بینانه و قابل دستیابی",
          "کار روی پذیرش خود واقعی",
          "کاهش انتظارات غیرواقع‌بینانه و کمال‌گرایی",
          "تمرین خودشفقتی و مهربانی با خود",
          "یادگیری مهارت‌های مقابله‌ای برای مدیریت استرس",
          "درمان شناختی-رفتاری (CBT) برای تغییر باورها درباره خود"
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
    const maxScore = questions.length * 5;

    const chartData = {
      labels: ["نمره کل", "تفاوت واقعی-ایده‌آل", "تفاوت واقعی-باید", "وضوح هویت"],
      datasets: [
        {
          label: "SHQ Scores",
          data: [
            scores.total,
            scores.actualIdealDiscrepancy,
            scores.actualOughtDiscrepancy,
            scores.clarity
          ],
          backgroundColor: [
            interpretation.color + "B3",
            "rgba(239, 68, 68, 0.3)",
            "rgba(249, 115, 22, 0.3)",
            "rgba(34, 197, 94, 0.3)"
          ],
          borderColor: [
            interpretation.color,
            "#ef4444",
            "#f97316",
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
          text: "پرسشنامه خود-معلول‌سازی (SHQ)",
          font: { size: 14, family: "Vazirmatn" },
          color: "#e2e8f0"
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: maxScore,
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
                <FaBalanceScale className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج پرسشنامه خود-معلول‌سازی</h1>
                <p className="text-secondaryTextColor">Self-Handicapping Questionnaire (SHQ)</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-darkThemeColor rounded-xl p-3">
                <div className="text-xs text-secondaryTextColor mb-1">نمره کل</div>
                <div className="text-xl font-bold" style={{ color: interpretation.color }}>{scores.total}</div>
              </div>
              <div className="bg-darkThemeColor rounded-xl p-3">
                <div className="text-xs text-secondaryTextColor mb-1">میانگین</div>
                <div className="text-xl font-bold" style={{ color: interpretation.color }}>{scores.average.toFixed(2)}</div>
              </div>
            </div>

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سطح رضایت و وضوح</h3>
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
              <FaBalanceScale className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">پرسشنامه خود-معلول‌سازی (SHQ)</h1>
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