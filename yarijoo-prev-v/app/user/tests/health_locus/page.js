"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaHeartbeat } from "react-icons/fa";
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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("health_locus");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questionsData = useMemo(() => [
    { text: "اگر بیمار شوم، به خاطر سرنوشت من است", dimension: "chance" },
    { text: "سلامتی‌ام به خاطر رفتارهای خودم است", dimension: "internal" },
    { text: "پزشکان کنترل سلامتی من را دارند", dimension: "powerful_others" },
    { text: "شانس نقش مهمی در سلامتی‌ام دارد", dimension: "chance" },
    { text: "می‌توانم با رفتارم سلامتی‌ام را حفظ کنم", dimension: "internal" },
    { text: "بهبودی‌ام به تخصص پزشکان بستگی دارد", dimension: "powerful_others" },
    { text: "سلامتی یا بیماری‌ام تصادفی است", dimension: "chance" },
    { text: "مسئولیت سلامتی‌ام با خودم است", dimension: "internal" },
    { text: "باید به حرف پزشکان اعتماد کنم", dimension: "powerful_others" },
    { text: "سلامتی‌ام کنترلی ندارد", dimension: "chance" },
    { text: "با رفتارهای سالم می‌توانم بیماری را پیشگیری کنم", dimension: "internal" },
    { text: "پزشکان بهترین می‌دانند چطور سالم بمانم", dimension: "powerful_others" }
  ], []);

  const questions = useMemo(() => questionsData.map(q => q.text), [questionsData]);

  const options = useMemo(() => [
    { value: 1, label: "کاملاً مخالفم" },
    { value: 2, label: "مخالفم" },
    { value: 3, label: "کمی مخالفم" },
    { value: 4, label: "کمی موافقم" },
    { value: 5, label: "موافقم" },
    { value: 6, label: "کاملاً موافقم" }
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
    let internal = 0;
    let chance = 0;
    let powerful_others = 0;

    questionsData.forEach((q, idx) => {
      const answer = answers[idx] || 1;
      if (q.dimension === "internal") {
        internal += answer;
      } else if (q.dimension === "chance") {
        chance += answer;
      } else {
        powerful_others += answer;
      }
    });

    return { internal, chance, powerful_others };
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
    const dominant = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    
    if (dominant === "internal") {
      return {
        type: "کنترل درونی",
        color: "#22c55e",
        desc: "شما باور دارید که سلامتی‌تان تحت کنترل خودتان است.",
        details: "افراد با کنترل درونی بالا معتقدند که رفتارها و تصمیمات خودشان (ورزش، تغذیه، مدیریت استرس) نقش اصلی در سلامتی‌شان دارد. این باور معمولاً با رفتارهای سلامت‌محور بیشتر همراه است.",
        strengths: [
          "مسئولیت‌پذیری بالا برای سلامتی",
          "احتمال بیشتر رفتارهای سلامت‌محور",
          "انگیزه برای پیشگیری از بیماری",
          "احساس کنترل و قدرت"
        ],
        recommendations: [
          "ادامه رفتارهای سلامت‌محور",
          "پذیرش محدودیت‌ها (برخی بیماری‌ها کنترل ندارند)",
          "مشورت با پزشکان هنگام نیاز",
          "تعادل بین کنترل و پذیرش",
          "توجه به نقش ژنتیک و محیط"
        ]
      };
    } else if (dominant === "powerful_others") {
      return {
        type: "کنترل دیگران قدرتمند",
        color: "#eab308",
        desc: "شما باور دارید که سلامتی‌تان به دست پزشکان و متخصصان است.",
        details: "افراد با این باور معتقدند که سلامتی‌شان به تخصص و تصمیمات پزشکان بستگی دارد. این می‌تواند منجر به اعتماد زیاد به پزشکان شود اما ممکن است مسئولیت شخصی را کاهش دهد.",
        strengths: [
          "اعتماد به تخصص پزشکان",
          "پایبندی به توصیه‌های پزشکی",
          "مراجعه به موقع برای مشکلات"
        ],
        recommendations: [
          "افزایش احساس کنترل شخصی",
          "یادگیری درباره سلامتی",
          "مشارکت فعال در تصمیمات درمانی",
          "اتخاذ رفتارهای پیشگیرانه",
          "پرسش سوال از پزشکان"
        ]
      };
    } else {
      return {
        type: "کنترل شانس/اقبال",
        color: "#ef4444",
        desc: "شما باور دارید که سلامتی‌تان به شانس و اقبال بستگی دارد.",
        details: "این باور می‌تواند منجر به رفتارهای سلامت‌محور کمتر شود چون فرد احساس می‌کند نمی‌تواند کاری انجام دهد. این باور معمولاً با سلامت ضعیف‌تر همراه است.",
        strengths: [
          "پذیرش محدودیت‌های کنترل",
          "کمتر خود را سرزنش می‌کنید"
        ],
        recommendations: [
          "افزایش احساس کنترل شخصی",
          "آموزش تأثیر رفتارها بر سلامتی",
          "شروع رفتارهای کوچک سلامت‌محور",
          "مشاهده نتایج مثبت رفتارها",
          "مشاوره برای تقویت خودکارآمدی",
          "پرهیز از تفکر قربانی"
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
      labels: ["کنترل درونی", "شانس/اقبال", "دیگران قدرتمند"],
      datasets: [
        {
          label: "منبع کنترل سلامت",
          data: [scores.internal, scores.chance, scores.powerful_others],
          backgroundColor: ["#22c55e", "#ef4444", "#eab308"],
          borderColor: ["#16a34a", "#dc2626", "#ca8a04"],
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
          text: "تحلیل منبع کنترل سلامت",
          font: { size: 14, family: "Vazirmatn" },
          color: "#e2e8f0"
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 24,
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
                <FaHeartbeat className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج منبع کنترل سلامت</h1>
                <p className="text-secondaryTextColor">Health Locus of Control</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-darkThemeColor rounded-2xl p-4">
                <div className="text-xs text-secondaryTextColor mb-1">کنترل درونی</div>
                <div className="text-2xl font-bold text-green-500">{scores.internal}</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-4">
                <div className="text-xs text-secondaryTextColor mb-1">شانس/اقبال</div>
                <div className="text-2xl font-bold text-red-500">{scores.chance}</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-4">
                <div className="text-xs text-secondaryTextColor mb-1">دیگران قدرتمند</div>
                <div className="text-2xl font-bold text-yellow-500">{scores.powerful_others}</div>
              </div>
            </div>

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نوع غالب</h3>
              <div className="text-2xl font-bold mb-2" style={{ color: interpretation.color }}>
                {interpretation.type}
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
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">نمودار سه بُعد کنترل سلامت</h3>
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
              <FaHeartbeat className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">منبع کنترل سلامت</h1>
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



