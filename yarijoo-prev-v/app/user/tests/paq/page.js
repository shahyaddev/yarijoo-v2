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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("paq");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questionsData = useMemo(() => [
    { text: "مستقل", scale: "masculinity" },
    { text: "احساسی", scale: "femininity" },
    { text: "فعال", scale: "masculinity" },
    { text: "قادر به آرام کردن دیگران", scale: "femininity" },
    { text: "رقابتی", scale: "masculinity" },
    { text: "مهربان", scale: "femininity" },
    { text: "مطمئن", scale: "masculinity" },
    { text: "درک کننده", scale: "femininity" },
    { text: "رهبر قوی", scale: "masculinity" },
    { text: "گرم و صمیمی", scale: "femininity" }
  ], []);

  const questions = useMemo(() => questionsData.map(q => q.text), [questionsData]);

  const options = useMemo(() => [
    { value: 1, label: "هرگز یا تقریباً هرگز درست" },
    { value: 2, label: "معمولاً درست نیست" },
    { value: 3, label: "گاهی اما نه اغلب درست" },
    { value: 4, label: "اغلب درست" },
    { value: 5, label: "همیشه یا تقریباً همیشه درست" }
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
    let masculinityScore = 0;
    let femininityScore = 0;

    questionsData.forEach((q, idx) => {
      const answer = answers[idx] || 1;
      if (q.scale === "masculinity") {
        masculinityScore += answer;
      } else {
        femininityScore += answer;
      }
    });

    const totalScore = masculinityScore + femininityScore;
    const difference = Math.abs(masculinityScore - femininityScore);
    
    let genderType = "";
    if (difference < 5) {
      genderType = "androgynous";
    } else if (masculinityScore > femininityScore) {
      genderType = "masculine";
    } else {
      genderType = "feminine";
    }

    return { masculinityScore, femininityScore, totalScore, genderType };
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
    const maxMasculine = 25; // 5 questions * 5 points
    const maxFeminine = 25;
    const maxTotal = 50;

    if (scores.genderType === "androgynous") {
      return {
        level: "شخصیت آندروجینوس (دوگانه)",
        color: "#22c55e",
        desc: "شما ترکیبی متعادل از ویژگی‌های مردانه و زنانه دارید.",
        details: "نمره شما نشان می‌دهد که شما دارای ویژگی‌های شخصیتی متعادلی هستید که شامل هر دو ویژگی‌های سنتی مردانه (مثل استقلال، رقابت‌طلبی، رهبری) و زنانه (مثل همدلی، مهربانی، درک) است. این ترکیب می‌تواند به شما انعطاف‌پذیری و توانایی بیشتری در موقعیت‌های مختلف بدهد.",
        strengths: [
          "تعادل در ویژگی‌های شخصیتی",
          "انعطاف‌پذیری بالا",
          "توانایی سازگاری با موقعیت‌های مختلف",
          "ترکیب قوی از استقلال و همدلی"
        ],
        recommendations: [
          "حفظ این تعادل مثبت",
          "استفاده از ویژگی‌های مختلف بر اساس موقعیت",
          "درک ارزش هر دو دسته ویژگی‌ها",
          "کمک به دیگران برای درک ارزش این تعادل"
        ]
      };
    } else if (scores.genderType === "masculine") {
      return {
        level: "ویژگی‌های مردانه غالب",
        color: "#3b82f6",
        desc: "ویژگی‌های مردانه در شخصیت شما غالب است.",
        details: `نمره شما نشان می‌دهد که ویژگی‌های سنتی مردانه (مثل استقلال، رقابت‌طلبی، رهبری، اعتماد به نفس) در شخصیت شما قوی‌تر است. این می‌تواند در موقعیت‌های رقابتی و رهبری مفید باشد.`,
        strengths: [
          "استقلال و اعتماد به نفس",
          "توانایی رهبری",
          "رقابت‌طلبی",
          "قاطعیت"
        ],
        recommendations: [
          "توسعه مهارت‌های همدلی و ارتباط",
          "درک اهمیت ویژگی‌های زنانه",
          "ایجاد تعادل بین ویژگی‌ها",
          "استفاده از نقاط قوت در موقعیت‌های مناسب"
        ]
      };
    } else {
      return {
        level: "ویژگی‌های زنانه غالب",
        color: "#ec4899",
        desc: "ویژگی‌های زنانه در شخصیت شما غالب است.",
        details: `نمره شما نشان می‌دهد که ویژگی‌های سنتی زنانه (مثل همدلی، مهربانی، درک، گرمی) در شخصیت شما قوی‌تر است. این می‌تواند در موقعیت‌های ارتباطی و مراقبتی مفید باشد.`,
        strengths: [
          "همدلی و درک",
          "مهربانی و گرمی",
          "توانایی ارتباط",
          "مراقبت از دیگران"
        ],
        recommendations: [
          "توسعه اعتماد به نفس و قاطعیت",
          "درک اهمیت ویژگی‌های مردانه",
          "ایجاد تعادل بین ویژگی‌ها",
          "استفاده از نقاط قوت در موقعیت‌های مناسب"
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
      labels: ["ویژگی‌های مردانه", "ویژگی‌های زنانه"],
      datasets: [
        {
          label: "نمرات",
          data: [scores.masculinityScore, scores.femininityScore],
          backgroundColor: ["#3b82f6B3", "#ec4899B3"],
          borderColor: ["#3b82f6", "#ec4899"],
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
          text: "نمرات ویژگی‌های شخصیتی PAQ",
          font: { size: 14, family: "Vazirmatn" },
          color: "#e2e8f0"
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 25,
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
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج پرسشنامه ویژگی‌های شخصی</h1>
                <p className="text-secondaryTextColor">Personal Attributes Questionnaire (PAQ)</p>
              </div>
            </div>

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نوع شخصیت</h3>
              <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>
                {interpretation.level}
              </div>
              <div className="text-sm text-secondaryTextColor mt-2">
                مردانه: {scores.masculinityScore} | زنانه: {scores.femininityScore}
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
              <h1 className="text-2xl font-bold text-primaryTextColor">پرسشنامه ویژگی‌های شخصی (PAQ)</h1>
              <p className="text-secondaryTextColor">Personal Attributes Questionnaire</p>
              <p className="text-secondaryTextColor text-sm mt-1">سوال {currentQuestion + 1} از {questions.length}</p>
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