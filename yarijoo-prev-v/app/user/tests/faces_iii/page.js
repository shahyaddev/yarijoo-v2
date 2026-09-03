"use client";

import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaBrain } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTestResult } from "@/hooks/useTestResult";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TestPage = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("faces_iii");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questionsData = [
    { text: "اعضا در تصمیمات مشارکت دارند", dimension: "cohesion" },
    { text: "با هم کارها انجام می‌شود", dimension: "cohesion" },
    { text: "دوستان یکدیگر را می‌پذیریم", dimension: "cohesion" },
    { text: "راحت است که قوانین تغییر کند", dimension: "flexibility" },
    { text: "دوست داریم با هم وقت بگذرانیم", dimension: "cohesion" },
    { text: "والدین و فرزندان درباره تنبیه بحث می‌کنند", dimension: "flexibility" },
    { text: "به یکدیگر نزدیک احساس می‌کنیم", dimension: "cohesion" },
    { text: "در خانواده نظم‌وترتیب عوض می‌شود", dimension: "flexibility" },
    { text: "از فعالیت‌های مشترک لذت می‌بریم", dimension: "cohesion" },
    { text: "قوانین خانواده عوض می‌شود", dimension: "flexibility" },
    { text: "به راحتی به ذهنمان می‌رسد با هم چه کنیم", dimension: "cohesion" },
    { text: "مسئولیت‌ها بین اعضا جابجا می‌شود", dimension: "flexibility" },
    { text: "در تصمیمات مهم با هم مشورت می‌کنیم", dimension: "cohesion" },
    { text: "اعضا می‌توانند کارهایشان را انجام دهند", dimension: "flexibility" },
    { text: "تعلق به خانواده را احساس می‌کنیم", dimension: "cohesion" },
    { text: "شیوه انجام کارها قابل بحث است", dimension: "flexibility" },
    { text: "به یکدیگر وفادار هستیم", dimension: "cohesion" },
    { text: "می‌توانیم روی نحوه حل مشکلات توافق کنیم", dimension: "flexibility" },
    { text: "احساس بسیار نزدیکی به هم داریم", dimension: "cohesion" },
    { text: "عدالت در مجازات‌ها رعایت می‌شود", dimension: "flexibility" }
  ];

  const questions = questionsData.map(q => q.text);

  const options = [
  {
    "value": 1,
    "label": "تقریباً هرگز"
  },
  {
    "value": 2,
    "label": "گاهی"
  },
  {
    "value": 3,
    "label": "بعضی وقت‌ها"
  },
  {
    "value": 4,
    "label": "اغلب"
  },
  {
    "value": 5,
    "label": "تقریباً همیشه"
  }
        ]

  // بررسی نتیجه قبلی
  useEffect(() => {
    if (hasResult && previousResult && !resultLoading) {
      setIsCompleted(true);
    }
  }, [hasResult, previousResult, resultLoading]);


  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [currentQuestion]: value };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const calculateScores = () => {
    let cohesion = 0;
    let flexibility = 0;

    questionsData.forEach((q, idx) => {
      const answer = answers[idx] || 0;
      if (q.dimension === "cohesion") {
        cohesion += answer;
      } else {
        flexibility += answer;
      }
    });

    return { cohesion, flexibility, total: cohesion + flexibility };
  };

  const getFamilyType = (cohesion, flexibility) => {
    const cohesionLevel = cohesion <= 25 ? "low" : cohesion <= 40 ? "moderate" : "high";
    const flexibilityLevel = flexibility <= 25 ? "low" : flexibility <= 40 ? "moderate" : "high";
    
    if (cohesionLevel === "moderate" && flexibilityLevel === "moderate") {
      return { type: "balanced", level: "خانواده متعادل", color: "#22c55e" };
    } else if (cohesionLevel === "low" || flexibilityLevel === "low") {
      return { type: "unbalanced", level: "خانواده نامتعادل", color: "#ef4444" };
    } else {
      return { type: "somewhat_balanced", level: "خانواده نسبتاً متعادل", color: "#eab308" };
    }
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


  const getInterpretation = (cohesion, flexibility) => {
    const familyType = getFamilyType(cohesion, flexibility);
    const cohesionMax = 50;
    const flexibilityMax = 50;

    if (familyType.type === "balanced") {
      return {
        ...familyType,
        desc: "خانواده شما متعادل و سالم است. انسجام و انعطاف در حد بهینه است.",
        details: "شما تعادل خوبی بین نزدیکی و استقلال، ساختار و انعطاف دارید. این نوع خانواده سالم‌ترین نوع است و سلامت روانی بهتری برای همه اعضا فراهم می‌کند.",
        strengths: [
          "روابط نزدیک اما احترام به فردیت",
          "قوانین واضح اما قابل انعطاف",
          "ارتباط باز و صادقانه",
          "حل مسئله مشترک",
          "حمایت متقابل با استقلال"
        ],
        recommendations: [
          "حفظ تعادل موجود",
          "ادامه ارتباط باز",
          "حمایت از رشد فردی اعضا",
          "انطباق با تغییرات به صورت مشترک"
        ],
        cohesion,
        flexibility
      };
    } else if (familyType.type === "somewhat_balanced") {
      return {
        ...familyType,
        desc: "خانواده شما نسبتاً متعادل است اما نیاز به بهبود دارد.",
        details: "شما در برخی ابعاد خوب هستید اما ممکن است نیاز به تعادل بیشتر داشته باشید. انسجام یا انعطاف ممکن است بیش از حد یا کم باشد.",
        strengths: [],
        recommendations: [
          "شناسایی نقاط ضعف",
          "ایجاد تعادل بین انسجام و انعطاف",
          "مشاوره خانواده برای بهبود",
          "یادگیری مهارت‌های ارتباط مؤثر"
        ],
        cohesion,
        flexibility
      };
    } else {
      return {
        ...familyType,
        desc: "خانواده شما نامتعادل است و نیاز به مداخله دارد.",
        details: "خانواده شما در معرض مشکلات جدی است. انسجام یا انعطاف بسیار پایین یا بسیار بالا است که می‌تواند منجر به مشکلات ارتباطی، تعارض و آسیب روانی شود.",
        strengths: [],
        recommendations: [
          "مشاوره خانواده فوری",
          "آموزش والدین",
          "یادگیری تعیین مرزهای سالم",
          "بهبود ارتباطات خانوادگی",
          "ایجاد ساختار انعطاف‌پذیر",
          "درمان فردی برای اعضا در صورت نیاز"
        ],
        cohesion,
        flexibility
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
    const interpretation = getInterpretation(scores.cohesion, scores.flexibility);
    const maxScore = 100;

    const chartData = {
      labels: ['انسجام', 'انعطاف'],
      datasets: [{
        label: 'نمره ابعاد',
        data: [scores.cohesion, scores.flexibility],
        backgroundColor: ['rgba(59, 130, 246, 0.5)', 'rgba(16, 185, 129, 0.5)'],
        borderColor: ['rgb(59, 130, 246)', 'rgb(16, 185, 129)'],
        borderWidth: 2
      }]
    };

    return (
      <div className="w-full flex flex-col items-center">
        <Header /><MobileHeader />
        <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
          <Sidebar />
          <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="size-16 rounded-2xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20">
                <FaBrain className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست FACES III (انسجام و انعطاف خانواده)</h1>
                <p className="text-secondaryTextColor">تحلیل نتایج شما</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">انسجام</h3>
                <div className="text-4xl font-bold mb-2" style={{ color: "#3b82f6" }}>{scores.cohesion}</div>
                <div className="text-sm text-secondaryTextColor">از 50</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">انعطاف</h3>
                <div className="text-4xl font-bold mb-2" style={{ color: "#10b981" }}>{scores.flexibility}</div>
                <div className="text-sm text-secondaryTextColor">از 50</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نوع خانواده</h3>
                <div className="text-2xl font-bold mb-2" style={{ color: interpretation.color }}>{interpretation.level}</div>
                <div className="text-sm text-secondaryTextColor">{interpretation.desc}</div>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار ابعاد</h3>
              <div className="w-full h-80">
                <Bar data={chartData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'انسجام و انعطاف خانواده', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: 50, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                  }
                }} />
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توضیحات</h3>
              <p className="text-secondaryTextColor leading-relaxed mb-4">{interpretation.details}</p>
            </div>

            {interpretation.strengths && interpretation.strengths.length > 0 && (
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">ویژگی‌های مثبت</h3>
                <ul className="space-y-2">
                  {interpretation.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                      <span className="text-secondaryTextColor">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توصیه‌های تخصصی</h3>
              <ul className="space-y-3">
                {interpretation.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                    <span className="text-secondaryTextColor text-sm" dangerouslySetInnerHTML={{ __html: rec.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></span>
                  </li>
                ))}
              </ul>
            </div>

            <button onClick={() => { setCurrentQuestion(0); setAnswers({}); setIsCompleted(false); }} className="w-full h-12 bg-primaryThemeColor text-white rounded-xl font-medium hover:bg-primaryThemeColor/90 transition-colors">
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
      <Header /><MobileHeader />
      <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
        <Sidebar />
        <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="size-16 rounded-2xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20">
              <FaBrain className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">تست FACES III (انسجام و انعطاف خانواده)</h1>
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
            >{questions[currentQuestion]}</h3>
            <div className="space-y-3">
              {options.map((option, index) => (
                <button key={`${currentQuestion}-${option.value}`} onClick={() => handleAnswer(option.value)} className="w-full p-4 text-right bg-secondaryThemeColor hover:bg-primaryThemeColor/10 rounded-xl border border-borderColor hover:border-primaryThemeColor/40 transition-all"
                  style={{
                    opacity: 0,
                    animation: `testOptionFadeIn 0.4s ease-out ${0.4 + index * 0.1}s forwards`,
                    animationFillMode: 'forwards',
                  }}>
                  <span className="text-primaryTextColor font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="w-full bg-darkThemeColor rounded-2xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-secondaryTextColor">پیشرفت: {Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
              <div className="w-32 h-2 bg-secondaryThemeColor rounded-full overflow-hidden">
                <div className="h-full bg-primaryThemeColor rounded-full transition-all duration-300" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TestPage;