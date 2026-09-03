"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaBrain } from "react-icons/fa";
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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("ibt");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questionsData = useMemo(() => [
    { text: "باید در همه چیز کامل باشم وگرنه ارزشی ندارم", belief: "perfectionism" },
    { text: "همه باید مرا دوست داشته باشند", belief: "approval" },
    { text: "اگر کسی مخالف من باشد، یعنی دوستم ندارد", belief: "rejection" },
    { text: "باید همه چیز را کنترل کنم", belief: "control" },
    { text: "اگر اشتباه کنم، فرد بدی هستم", belief: "self_worth" },
    { text: "زندگی باید عادلانه باشد", belief: "fairness" },
    { text: "نمی‌توانم با استرس کنار بیایم", belief: "helplessness" },
    { text: "باید نگران آینده باشم", belief: "worry" },
    { text: "اگر موفق نشوم، شکست‌خورده هستم", belief: "achievement" },
    { text: "باید همیشه قوی باشم", belief: "emotional_control" }
  ], []);

  const questions = useMemo(() => questionsData.map(q => q.text), [questionsData]);

  const options = useMemo(() => [
    { value: 0, label: "هرگز" },
    { value: 1, label: "گاهی" },
    { value: 2, label: "نیمی از وقت" },
    { value: 3, label: "اکثر اوقات" },
    { value: 4, label: "همیشه" }
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
    return Object.values(answers).reduce((sum, score) => sum + (score || 0), 0);
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
    const maxScore = 40; // 10 questions * 4 points each
    
    if (score <= 10) {
      return {
        level: "باورهای منطقی",
        color: "#22c55e",
        desc: "شما باورهای منطقی و واقع‌بینانه‌ای دارید.",
        details: "نمره پایین شما نشان می‌دهد که شما باورهای منطقی و واقع‌بینانه‌ای دارید. شما کمتر از باورهای غیرمنطقی که می‌توانند باعث استرس و اضطراب شوند استفاده می‌کنید. این یک نشانه مثبت از سلامت روانی است.",
        strengths: [
          "باورهای منطقی و واقع‌بینانه",
          "تفکر منعطف",
          "عدم کمال‌گرایی افراطی",
          "درک واقع‌بینانه از خود و دیگران",
          "توانایی مدیریت استرس",
          "سلامت روانی خوب"
        ],
        recommendations: [
          "حفظ باورهای منطقی فعلی",
          "ادامه تفکر واقع‌بینانه",
          "کمک به دیگران در شناسایی و تغییر باورهای غیرمنطقی"
        ]
      };
    } else if (score <= 20) {
      return {
        level: "برخی باورهای غیرمنطقی",
        color: "#eab308",
        desc: "برخی باورهای غیرمنطقی در شما وجود دارد که می‌تواند بهبود یابد.",
        details: "نمره متوسط شما نشان می‌دهد که برخی باورهای غیرمنطقی در شما وجود دارد که می‌توانند باعث استرس و اضطراب شوند. با شناسایی و تغییر این باورها می‌توانید سلامت روانی خود را بهبود دهید.",
        strengths: [
          "بیشتر باورهای منطقی",
          "آگاهی از نیاز به بهبود",
          "تمایل به تغییر"
        ],
        recommendations: [
          "شناسایی باورهای غیرمنطقی که بیشتر به آن‌ها معتقد هستید",
          "یادگیری تکنیک‌های چالش با باورهای غیرمنطقی",
          "درمان شناختی-رفتاری (CBT) برای تغییر باورها",
          "تمرین تفکر منطقی و واقع‌بینانه",
          "جایگزینی باورهای غیرمنطقی با باورهای منطقی",
          "یادگیری پذیرش عدم کمال",
          "کاهش نیاز به تأیید از دیگران",
          "یادگیری مدیریت استرس و نگرانی"
        ]
      };
    } else {
      return {
        level: "باورهای غیرمنطقی بالا",
        color: "#ef4444",
        desc: "باورهای غیرمنطقی بالایی در شما وجود دارد که نیاز به توجه دارد.",
        details: "نمره بالا شما نشان می‌دهد که باورهای غیرمنطقی بالایی دارید که می‌توانند به شدت باعث استرس، اضطراب، افسردگی و مشکلات روانی شوند. این باورها می‌توانند بر عملکرد، روابط و کیفیت زندگی شما تأثیر بگذارند. کار بر روی شناسایی و تغییر این باورها ضروری است.",
        strengths: [
          "شناسایی مشکل",
          "تمایل به تغییر"
        ],
        recommendations: [
          "مراجعه به روان‌شناس برای درمان شناختی-رفتاری (CBT)",
          "شناسایی دقیق باورهای غیرمنطقی",
          "یادگیری تکنیک‌های چالش و تغییر باورها",
          "جایگزینی تدریجی باورهای غیرمنطقی با باورهای منطقی",
          "یادگیری پذیرش عدم کمال و خطا",
          "کاهش نیاز به تأیید و کنترل همه چیز",
          "یادگیری مدیریت استرس و نگرانی",
          "کار بر روی بهبود عزت نفس و خودارزشمندی",
          "درمان فشرده و منظم برای تغییر الگوهای فکری عمیق"
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
    const maxScore = 40;

    const chartData = {
      labels: ["نمره شما", "منطقی (0-10)", "متوسط (11-20)", "غیرمنطقی (21-40)"],
      datasets: [
        {
          label: "IBT Score",
          data: [score, 10, 20, 40],
          backgroundColor: [
            interpretation.color + "B3",
            "rgba(34, 197, 94, 0.3)",
            "rgba(234, 179, 8, 0.3)",
            "rgba(239, 68, 68, 0.3)"
          ],
          borderColor: [
            interpretation.color,
            "#22c55e",
            "#eab308",
            "#ef4444"
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
          text: "تست باورهای غیرمنطقی (IBT)",
          font: { size: 14, family: "Vazirmatn" },
          color: "#e2e8f0"
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 40,
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
                <FaBrain className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست باورهای غیرمنطقی</h1>
                <p className="text-secondaryTextColor">Irrational Beliefs Test (IBT)</p>
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
              <FaBrain className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">تست باورهای غیرمنطقی (IBT)</h1>
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