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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("emss");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
  { text: "احساس می‌کنم کسی مراقبم نیست", schema: "abandonment" },
  { text: "نمی‌توانم به مردم اعتماد کنم", schema: "mistrust" },
  { text: "احساس محرومیت عاطفی دارم", schema: "emotional_deprivation" },
  { text: "احساس نقص و کمبود دارم", schema: "defectiveness" },
  { text: "احساس جدایی اجتماعی دارم", schema: "social_isolation" },
  { text: "احساس می‌کنم وابسته‌ام", schema: "dependence" },
  { text: "نگران بیماری و خطر هستم", schema: "vulnerability" },
  { text: "خیلی به دیگران نزدیک می‌شوم", schema: "enmeshment" },
  { text: "احساس شکست می‌کنم", schema: "failure" },
  { text: "احساس استحقاق دارم", schema: "entitlement" },
  { text: "نمی‌توانم خودم را کنترل کنم", schema: "insufficient_self_control" },
  { text: "باید دیگران را راضی کنم", schema: "subjugation" },
  { text: "فدا کاری می‌کنم", schema: "self_sacrifice" },
  { text: "به دنبال تأیید هستم", schema: "approval_seeking" },
  { text: "بدبین و منفی‌نگر هستم", schema: "negativity" },
  { text: "خود را کنترل زیاد می‌کنم", schema: "emotional_inhibition" },
  { text: "معیارهای بسیار بالا دارم", schema: "unrelenting_standards" },
  { text: "انتقادی و تنبیه‌گر هستم", schema: "punitiveness" }
        ]

  const options = [
    { value: 1, label: "کاملاً نادرست" },
    { value: 2, label: "نادرست" },
    { value: 3, label: "کمی درست" },
    { value: 4, label: "متوسط درست" },
    { value: 5, label: "درست" },
    { value: 6, label: "کاملاً درست" }
  ];

  // بررسی نتیجه قبلی
  useEffect(() => {
    if (hasResult && previousResult && !resultLoading) {
      setIsCompleted(true);
    }
  }, [hasResult, previousResult, resultLoading]);


  const handleAnswer = (value) => {
    const q = questions[currentQuestion];
    setAnswers({ ...answers, [currentQuestion]: { value, schema: q.schema } });

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const calculateSchemaScores = () => {
    const schemaScores = {};
    questions.forEach((q, index) => {
      if (!schemaScores[q.schema]) schemaScores[q.schema] = 0;
      if (answers[index]) {
        schemaScores[q.schema] += answers[index].value || 0;
      }
    });
    return schemaScores;
  };

  const getTopSchemas = (schemaScores) => {
    const sorted = Object.entries(schemaScores).sort((a, b) => b[1] - a[1]);
    return sorted.slice(0, 3);
  };

  const getSchemaInfo = (schema) => {
    const schemas = {
      abandonment: "ترک شدن",
      mistrust: "بی‌اعتمادی",
      emotional_deprivation: "محرومیت عاطفی",
      defectiveness: "نقص",
      social_isolation: "جدایی اجتماعی",
      dependence: "وابستگی",
      vulnerability: "آسیب‌پذیری",
      enmeshment: "درهم‌تنیدگی",
      failure: "شکست",
      entitlement: "استحقاق",
      insufficient_self_control: "کنترل ناکافی",
      subjugation: "تابعیت",
      self_sacrifice: "فداکاری",
      approval_seeking: "جستجوی تأیید",
      negativity: "منفی‌گرایی",
      emotional_inhibition: "بازداری هیجانی",
      unrelenting_standards: "معیارهای سخت",
      punitiveness: "تنبیه‌گری"
    };
    return schemas[schema] || schema;
  };

  const calculateTotalScore = () => {
    return Object.values(answers).reduce((sum, answer) => sum + (answer?.value || 0), 0);
  };

  const calculateScore = () => calculateTotalScore();

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


  const getInterpretation = (score, topSchemas) => {
    const maxScore = 108;
    
    if (score <= 60) {
      return {
        level: "طرحواره‌های محدود",
        color: "#22c55e",
        desc: "طرحواره‌های ناسازگار اولیه شما محدود است. عملکرد شما سالم است.",
        details: "نمره پایین شما نشان می‌دهد که طرحواره‌های ناسازگار اولیه در شما محدود است. این یک نشانه مثبت است که نشان‌دهنده سلامت روانی خوب و الگوهای سازگارانه است.",
        strengths: [
          "عملکرد سالم",
          "الگوهای سازگارانه",
          "کیفیت زندگی خوب",
          "روابط سالم"
        ],
        recommendations: [
          "حفظ سلامت روانی",
          "آگاهی از الگوهای رفتاری",
          "رشد مداوم",
          "مراقبت از سلامت روانی"
        ],
        topSchemas
      };
    } else if (score <= 120) {
      return {
        level: "برخی طرحواره‌ها",
        color: "#eab308",
        desc: "برخی طرحواره‌های ناسازگار اولیه در شما وجود دارد که گاهی بر زندگی تأثیر می‌گذارد.",
        details: "شما برخی طرحواره‌های ناسازگار اولیه دارید که ممکن است در موقعیت‌های خاص بر زندگی شما تأثیر بگذارد. این طرحواره‌ها معمولاً از تجربیات کودکی شکل می‌گیرند.",
        strengths: [
          "آگاهی از طرحواره‌ها",
          "امکان تغییر",
          "عملکرد نسبی"
        ],
        recommendations: [
          "شناسایی طرحواره‌های فعال",
          "درک ریشه طرحواره‌ها (معمولاً کودکی)",
          "به چالش کشیدن طرحواره‌ها",
          "تجربیات جدید برای تغییر",
          "درمان طرحواره در صورت نیاز"
        ],
        topSchemas
      };
    } else {
      return {
        level: "طرحواره‌های متعدد قوی",
        color: "#ef4444",
        desc: "طرحواره‌های ناسازگار اولیه قوی و متعددی در شما وجود دارد که به شدت بر زندگی تأثیر می‌گذارد.",
        details: "نمره بالای شما نشان می‌دهد که طرحواره‌های ناسازگار اولیه قوی و متعددی دارید. این می‌تواند منجر به مشکلات روانشناختی جدی، اختلالات شخصیت، افسردگی مزمن، اضطراب و مشکلات در روابط شود.",
        strengths: [],
        recommendations: [
          "درمان طرحواره فوری (Schema Therapy)",
          "کار عمیق برای تغییر الگوهای ریشه‌ای",
          "بازنویسی طرحواره با تجربیات جدید",
          "روابط بهبودبخش",
          "صبر - تغییر طرحواره‌ها 1-3 سال طول می‌کشد",
          "مراقبت حرفه‌ای ضروری است"
        ],
        topSchemas
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
    const totalScore = calculateTotalScore();
    const schemaScores = calculateSchemaScores();
    const topSchemas = getTopSchemas(schemaScores);
    const interpretation = getInterpretation(totalScore, topSchemas);
    const maxScore = 108;

    const chartData = {
      labels: ['نمره شما', 'پایین', 'متوسط', 'بالا'],
      datasets: [{
        label: 'نمره تست',
        data: [totalScore, maxScore * 0.33, maxScore * 0.66, maxScore],
        backgroundColor: [
          interpretation.color + 'B3',
          'rgba(34, 197, 94, 0.3)',
          'rgba(234, 179, 8, 0.3)',
          'rgba(239, 68, 68, 0.3)'
        ],
        borderColor: [
          interpretation.color,
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)',
          'rgb(239, 68, 68)'
        ],
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
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست طرحواره‌های ناسازگار اولیه</h1>
                <p className="text-secondaryTextColor">تحلیل نتایج شما</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
                <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>{totalScore}</div>
                <div className="text-sm text-secondaryTextColor">از {maxScore}</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سطح</h3>
                <div className="text-2xl font-bold mb-2" style={{ color: interpretation.color }}>{interpretation.level}</div>
                <div className="text-sm text-secondaryTextColor">{interpretation.desc}</div>
              </div>
            </div>

            {topSchemas.length > 0 && (
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">طرحواره‌های برتر</h3>
                <div className="space-y-3">
                  {topSchemas.map(([schema, score], index) => (
                    <div key={schema} className="flex items-center justify-between p-3 bg-secondaryThemeColor rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-primaryThemeColor/20 text-primaryThemeColor flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <span className="text-primaryTextColor font-medium">{getSchemaInfo(schema)}</span>
                      </div>
                      <span className="text-secondaryTextColor font-bold">{score}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار تحلیل</h3>
              <div className="w-full h-80">
                <Bar data={chartData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'تحلیل نمره طرحواره‌های ناسازگار اولیه', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: maxScore, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
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
                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نقاط قوت</h3>
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
              <h1 className="text-2xl font-bold text-primaryTextColor">تست طرحواره‌های ناسازگار اولیه</h1>
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
            >{questions[currentQuestion].text || questions[currentQuestion]}</h3>
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