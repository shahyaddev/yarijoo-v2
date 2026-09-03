"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaUserSecret } from "react-icons/fa";
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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("psychopathy_traits");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questionsData = useMemo(() => [
    { text: "پشیمانی یا احساس گناه کمی دارم", factor: "affective" },
    { text: "احساسات سطحی دارم", factor: "affective" },
    { text: "به احساسات دیگران بی‌تفاوت هستم", factor: "affective" },
    { text: "وجدان کمی دارم", factor: "affective" },
    { text: "دروغ‌گویی برایم آسان است", factor: "interpersonal" },
    { text: "با جذابیت و فریب دیگران را اداره می‌کنم", factor: "interpersonal" },
    { text: "خودشیفته هستم", factor: "interpersonal" },
    { text: "سطحی و جذاب به نظر می‌رسم", factor: "interpersonal" },
    { text: "به راحتی حوصله‌ام سر می‌رود", factor: "lifestyle" },
    { text: "مسئولیت‌پذیری کمی دارم", factor: "lifestyle" },
    { text: "هدف بلندمدت ندارم", factor: "lifestyle" },
    { text: "تکانشی عمل می‌کنم", factor: "lifestyle" },
    { text: "رفتارهای ضداجتماعی داشته‌ام", factor: "antisocial" },
    { text: "کنترل خود ضعیف دارم", factor: "antisocial" },
    { text: "در جوانی مشکلات رفتاری داشتم", factor: "antisocial" },
    { text: "قوانین را نادیده می‌گیرم", factor: "antisocial" }
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
    const factors = {
      affective: 0,
      interpersonal: 0,
      lifestyle: 0,
      antisocial: 0
    };

    questionsData.forEach((q, idx) => {
      const answer = answers[idx] || 1;
      if (factors[q.factor] !== undefined) {
        factors[q.factor] += answer;
      }
    });

    const totalScore = Object.values(factors).reduce((sum, val) => sum + val, 0);

    return { ...factors, totalScore };
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
    const { totalScore, affective, interpersonal, lifestyle, antisocial } = scores;
    const maxScore = 80; // 16 questions * 5 points each
    const percentage = (totalScore / maxScore) * 100;
    
    if (percentage <= 30) {
      return {
        level: "ویژگی‌های روان‌پریشی پایین",
        color: "#22c55e",
        desc: "ویژگی‌های روان‌پریشی شما در سطح پایینی است. شما دارای همدلی، وجدان و مسئولیت‌پذیری مناسبی هستید.",
        details: "نمره پایین شما نشان می‌دهد که ویژگی‌های روان‌پریشی در شما کم است. شما احتمالاً دارای همدلی خوب، وجدان قوی، مسئولیت‌پذیری و مهارت‌های بین‌فردی مناسب هستید. این یک نشانه مثبت است.",
        strengths: [
          "همدلی و درک احساسات دیگران",
          "وجدان قوی",
          "مسئولیت‌پذیری",
          "مهارت‌های بین‌فردی مناسب",
          "کنترل تکانه‌ها",
          "احترام به قوانین و هنجارها"
        ],
        recommendations: [
          "حفظ ویژگی‌های مثبت فعلی",
          "ادامه توسعه مهارت‌های بین‌فردی",
          "حفظ روابط سالم و مثبت",
          "ادامه رعایت قوانین و مسئولیت‌پذیری"
        ]
      };
    } else if (percentage <= 50) {
      return {
        level: "ویژگی‌های روان‌پریشی متوسط",
        color: "#eab308",
        desc: "برخی ویژگی‌های روان‌پریشی در سطح متوسط وجود دارد.",
        details: "نمره متوسط شما نشان می‌دهد که برخی ویژگی‌های روان‌پریشی در شما وجود دارد که ممکن است در برخی موقعیت‌ها بر روابط و رفتار شما تأثیر بگذارد. آگاهی و کار بر روی این ویژگی‌ها می‌تواند کمک کند.",
        strengths: [
          "آگاهی از نیاز به بهبود",
          "برخی ویژگی‌های مثبت"
        ],
        recommendations: [
          "افزایش خودآگاهی و درک تأثیر رفتار بر دیگران",
          "تقویت همدلی از طریق تمرین و یادگیری",
          "کار بر روی مسئولیت‌پذیری و تعهد",
          "یادگیری مهارت‌های کنترل تکانه",
          "احترام به قوانین و هنجارهای اجتماعی",
          "مشاوره با روان‌شناس در صورت نیاز"
        ]
      };
    } else {
      return {
        level: "ویژگی‌های روان‌پریشی بالا",
        color: "#ef4444",
        desc: "ویژگی‌های روان‌پریشی بالایی در شما وجود دارد که نیاز به توجه دارد.",
        details: "نمره بالا شما نشان می‌دهد که ویژگی‌های روان‌پریشی بالایی دارید. این ممکن است شامل کمبود همدلی، وجدان ضعیف، رفتار ضداجتماعی، تکانش‌گری و مشکلات بین‌فردی باشد. این ویژگی‌ها می‌توانند به شدت بر روابط، کار و زندگی شما تأثیر بگذارند.",
        strengths: [
          "شناسایی مشکل",
          "جستجوی کمک"
        ],
        recommendations: [
          "ارزیابی تخصصی روان‌شناسی فوری",
          "درمان فردی تخصصی با درمانگر متخصص در اختلالات شخصیت",
          "درمان شناختی-رفتاری (CBT) برای تغییر الگوهای فکری و رفتاری",
          "درمان دیالکتیکی-رفتاری (DBT) برای مدیریت تکانه و تنظیم هیجان",
          "کار بر روی توسعه همدلی و درک احساسات دیگران",
          "درمان کنترل خشم و مدیریت تکانه",
          "یادگیری مهارت‌های بین‌فردی و ارتباط مؤثر",
          "درمان بلندمدت و فشرده برای تغییر الگوهای عمیق",
          "مشاوره قانونی در صورت نیاز"
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
    const maxScore = 80;

    const chartData = {
      labels: ["عاطفی", "بین‌فردی", "سبک زندگی", "ضداجتماعی", "نمره کل"],
      datasets: [
        {
          label: "نمرات",
          data: [
            scores.affective,
            scores.interpersonal,
            scores.lifestyle,
            scores.antisocial,
            scores.totalScore
          ],
          backgroundColor: [
            "rgba(239, 68, 68, 0.5)",
            "rgba(249, 115, 22, 0.5)",
            "rgba(234, 179, 8, 0.5)",
            "rgba(168, 85, 247, 0.5)",
            interpretation.color + "B3"
          ],
          borderColor: [
            "rgb(239, 68, 68)",
            "rgb(249, 115, 22)",
            "rgb(234, 179, 8)",
            "rgb(168, 85, 247)",
            interpretation.color
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
          text: "ویژگی‌های روان‌پریشی",
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
                <FaUserSecret className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج ویژگی‌های روان‌پریشی</h1>
                <p className="text-secondaryTextColor">Psychopathy Traits Assessment</p>
              </div>
            </div>

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
              <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>
                {scores.totalScore} از {maxScore}
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
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">نمودار عوامل</h3>
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
              <FaUserSecret className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">ویژگی‌های روان‌پریشی</h1>
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