"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaUserFriends } from "react-icons/fa";
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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("interpersonal_competence");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questionsData = useMemo(() => [
    { text: "به راحتی با افراد جدید صحبت می‌کنم", dimension: "initiation" },
    { text: "می‌توانم احساساتم را ابراز کنم", dimension: "self_disclosure" },
    { text: "وقتی لازم است، می‌توانم نه بگویم", dimension: "assertiveness" },
    { text: "راحت دوستان جدید پیدا می‌کنم", dimension: "initiation" },
    { text: "درباره مسائل شخصی‌ام با دیگران صحبت می‌کنم", dimension: "self_disclosure" },
    { text: "از حقوق خودم دفاع می‌کنم", dimension: "assertiveness" },
    { text: "در جمع‌ها راحت هستم", dimension: "initiation" },
    { text: "می‌توانم به دیگران اعتماد کنم", dimension: "self_disclosure" },
    { text: "می‌توانم درخواست کمک کنم", dimension: "assertiveness" },
    { text: "مهارت‌های اجتماعی خوبی دارم", dimension: "initiation" },
    { text: "نیازها و خواسته‌هایم را بیان می‌کنم", dimension: "self_disclosure" },
    { text: "در تعارضات موضع خود را بیان می‌کنم", dimension: "assertiveness" },
    { text: "به راحتی گفتگو را شروع می‌کنم", dimension: "initiation" },
    { text: "احساساتم را پنهان نمی‌کنم", dimension: "self_disclosure" },
    { text: "می‌توانم انتقاد سازنده بدهم", dimension: "assertiveness" }
  ], []);

  const questions = useMemo(() => questionsData.map(q => q.text), [questionsData]);

  const options = useMemo(() => [
    { value: 1, label: "هرگز" },
    { value: 2, label: "به ندرت" },
    { value: 3, label: "گاهی" },
    { value: 4, label: "اغلب" },
    { value: 5, label: "همیشه" }
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
    let initiation = 0;
    let self_disclosure = 0;
    let assertiveness = 0;

    questionsData.forEach((q, idx) => {
      const answer = answers[idx] || 1;
      if (q.dimension === "initiation") {
        initiation += answer;
      } else if (q.dimension === "self_disclosure") {
        self_disclosure += answer;
      } else {
        assertiveness += answer;
      }
    });

    const total = initiation + self_disclosure + assertiveness;
    return { total, initiation, self_disclosure, assertiveness };
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
    if (scores.total <= 30) {
      return {
        level: "شایستگی بین‌فردی پایین",
        color: "#dc2626",
        desc: "شایستگی‌های بین‌فردی شما در سطح پایینی است و ممکن است در روابط اجتماعی دچار مشکل شوید.",
        details: "نمره پایین در سه بُعد اصلی (آغاز ارتباط، افشای خود، جرأت‌ورزی) نشان می‌دهد که مهارت‌های اجتماعی شما نیاز به بهبود قابل توجه دارد.",
        strengths: [
          "آگاهی از نیاز به بهبود",
          "امکان یادگیری مهارت‌ها"
        ],
        recommendations: [
          "آموزش مهارت‌های اجتماعی",
          "گروه‌درمانی",
          "تمرین در موقعیت‌های کم‌استرس",
          "مشاوره برای اضطراب اجتماعی",
          "یادگیری جرأت‌ورزی"
        ]
      };
    } else if (scores.total <= 52) {
      return {
        level: "شایستگی بین‌فردی متوسط",
        color: "#eab308",
        desc: "شایستگی‌های اجتماعی شما در سطح متوسطی است. در برخی موقعیت‌ها راحت هستید و در برخی نه.",
        details: "شما مهارت‌های پایه دارید اما می‌توانید در تمام سه بُعد بهبود یابید.",
        strengths: [
          "مهارت‌های اجتماعی پایه",
          "موفقیت در برخی موقعیت‌ها",
          "انگیزه برای بهبود"
        ],
        recommendations: [
          "تمرین مهارت‌های خاص",
          "افزایش تعاملات اجتماعی",
          "یادگیری ارتباط مؤثر",
          "تقویت اعتماد به نفس اجتماعی"
        ]
      };
    } else {
      return {
        level: "شایستگی بین‌فردی بالا",
        color: "#22c55e",
        desc: "شما مهارت‌های اجتماعی عالی دارید! در ارتباطات بین‌فردی ماهر هستید.",
        details: "نمره بالای شما در سه بُعد (آغاز ارتباط، افشای خود، جرأت‌ورزی) نشان‌دهنده شایستگی بالای اجتماعی است.",
        strengths: [
          "ارتباطات مؤثر",
          "راحتی در موقعیت‌های اجتماعی",
          "جرأت‌ورزی مناسب",
          "افشای خود سالم",
          "شبکه اجتماعی قوی"
        ],
        recommendations: [
          "حفظ مهارت‌های فعلی",
          "کمک به دیگران",
          "منتور بودن",
          "توسعه مهارت‌های رهبری"
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
      labels: ["آغاز ارتباط", "افشای خود", "جرأت‌ورزی", "نمره کل"],
      datasets: [
        {
          label: "شایستگی بین‌فردی",
          data: [scores.initiation, scores.self_disclosure, scores.assertiveness, scores.total],
          backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#22c55e"],
          borderColor: ["#2563eb", "#059669", "#d97706", "#16a34a"],
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
          text: "ابعاد شایستگی بین‌فردی",
          font: { size: 14, family: "Vazirmatn" },
          color: "#e2e8f0"
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 75,
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
                <FaUserFriends className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج شایستگی بین‌فردی</h1>
                <p className="text-secondaryTextColor">Interpersonal Competence</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-darkThemeColor rounded-xl p-3">
                <div className="text-xs text-secondaryTextColor mb-1">آغاز ارتباط</div>
                <div className="text-xl font-bold text-blue-500">{scores.initiation}</div>
              </div>
              <div className="bg-darkThemeColor rounded-xl p-3">
                <div className="text-xs text-secondaryTextColor mb-1">افشای خود</div>
                <div className="text-xl font-bold text-green-500">{scores.self_disclosure}</div>
              </div>
              <div className="bg-darkThemeColor rounded-xl p-3">
                <div className="text-xs text-secondaryTextColor mb-1">جرأت‌ورزی</div>
                <div className="text-xl font-bold text-orange-500">{scores.assertiveness}</div>
              </div>
            </div>

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
              <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>
                {scores.total} از 75
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
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">نمودار ابعاد</h3>
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
              <FaUserFriends className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">پرسشنامه شایستگی بین‌فردی</h1>
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



