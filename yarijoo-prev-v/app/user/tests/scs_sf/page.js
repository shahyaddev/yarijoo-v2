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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("scs_sf");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
    { text: "وقتی شکست می‌خورم، نسبت به خودم مهربان هستم.", reverse: false },
    { text: "وقتی اشتباه می‌کنم، خودم را سرزنش می‌کنم.", reverse: true },
    { text: "در سختی‌ها، به خودم یادآوری می‌کنم که انسان بودن یعنی ناقص بودن.", reverse: false },
    { text: "وقتی رنج می‌کشم، احساس می‌کنم تنها هستم.", reverse: true },
    { text: "وقتی درد عاطفی دارم، با ملایمت با خودم رفتار می‌کنم.", reverse: false },
    { text: "وقتی اتفاق بدی می‌افتد، در احساساتم گرفتار می‌شوم.", reverse: true },
    { text: "وقتی اوضاع خوب نیست، با خودم مثل یک دوست خوب رفتار می‌کنم.", reverse: false },
    { text: "وقتی اشتباه می‌کنم، احساس می‌کنم از دیگران جدا افتاده‌ام.", reverse: true },
    { text: "وقتی شرایط سخت می‌شود، به خودم یادآوری می‌کنم که تنها من نیستم.", reverse: false },
    { text: "وقتی حال بدی دارم، بیش از حد در احساساتم غرق می‌شوم.", reverse: true },
    { text: "وقتی به خودم سخت می‌گیرم، سعی می‌کنم مهربان‌تر باشم.", reverse: false },
    { text: "وقتی شکست می‌خورم، خودم را تحقیر می‌کنم.", reverse: true }
  ]

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
    "label": "نسبتاً زیاد"
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
    setAnswers({ ...answers, [currentQuestion]: value });

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const calculateScore = () => {
    let total = 0;
    for (let i = 0; i < questions.length; i++) {
      const value = answers[i] || 0;
      const actualValue = questions[i].reverse ? (6 - value) : value;
      total += actualValue;
    }
    return total / questions.length;
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


  const getInterpretation = (mean) => {
    if (mean <= 2.4) {
      return {
        level: "خودشفقتی پایین",
        color: "#ef4444",
        desc: "سخت‌گیری با خود، خودانتقادی شدید، احساس انزوا در رنج.",
        details: "خودشفقتی شما پایین است. شما تمایل دارید با خود سخت باشید، خود را به شدت انتقاد کنید و در زمان رنج احساس تنهایی کنید. این الگو می‌تواند منجر به افسردگی، اضطراب، استرس مزمن و کاهش کیفیت زندگی شود. بهبود خودشفقتی می‌تواند تأثیر قابل توجهی بر سلامت روانی شما داشته باشد.",
        strengths: [
          "آگاهی از نیاز به تغییر",
          "تمایل به بهبود وضعیت"
        ],
        recommendations: [
          "**برنامه MSC**: شرکت در دوره Mindful Self-Compassion",
          "**خودگفتاری مهربان**: صحبت با خود مانند یک دوست صمیمی",
          "**درک انسانیت مشترک**: همه انسان‌ها اشتباه می‌کنند و رنج می‌برند",
          "**تمرین ذهن‌آگاهی**: پذیرش احساسات بدون قضاوت",
          "**نوشتن نامه**: نوشتن نامه مهربانانه به خود در زمان سختی",
          "**درمان CFT**: درمان متمرکز بر شفقت (Compassion-Focused Therapy)",
          "**کاهش خودانتقادی**: شناسایی و به چالش کشیدن افکار خودانتقادی"
        ]
      };
    }
    if (mean <= 3.4) {
      return {
        level: "خودشفقتی متوسط",
        color: "#eab308",
        desc: "خودشفقتی در حد متوسط - نیاز به تقویت دارد.",
        details: "خودشفقتی شما در حد متوسط است. شما گاهی اوقات می‌توانید با خود مهربان باشید اما هنوز در زمان‌های سختی تمایل به خودانتقادی دارید. با تمرین بیشتر می‌توانید خودشفقتی خود را تقویت کنید و بهره‌مندی بیشتری از مزایای آن ببرید.",
        strengths: [
          "برخی مهارت‌های خودشفقتی پایه",
          "آگاهی از اهمیت خودشفقتی",
          "توانایی گاهی مهربان بودن با خود"
        ],
        recommendations: [
          "**تمرین منظم**: اختصاص زمان روزانه برای تمرین خودشفقتی",
          "**برنامه MSC**: شرکت در دوره‌های آموزشی خودشفقتی",
          "**خودگفتاری مهربان**: تمرین صحبت مثبت با خود",
          "**تمرینات ذهن‌آگاهی**: افزایش آگاهی از لحظه حال",
          "**یادگیری پذیرش**: پذیرش اشتباهات و ناقص بودن به عنوان بخشی از انسانیت",
          "**نوشتن روزانه**: ثبت افکار و احساسات با نگاه مهربانانه"
        ]
      };
    }
    return {
      level: "خودشفقتی بالا",
      color: "#22c55e",
      desc: "مهربانی با خود، پذیرش اشتباهات، درک انسانیت مشترک.",
      details: "خودشفقتی شما در سطح بالایی است. شما می‌توانید با خود مهربان باشید، اشتباهات را بپذیرید و درک می‌کنید که همه انسان‌ها ناقص هستند. این سطح از خودشفقتی با سلامت روان بهتر، مقاومت بیشتر در برابر استرس، رضایت بیشتر از زندگی و روابط بهتر همراه است. این یک مهارت ارزشمند است که باید حفظ شود.",
      strengths: [
        "مهربانی با خود در زمان سختی",
        "پذیرش اشتباهات و ناقص بودن",
        "درک انسانیت مشترک",
        "تعادل بین خودانتقادی و خوددوستی",
        "مقاومت بیشتر در برابر استرس",
        "سلامت روانی بهتر"
      ],
      recommendations: [
        "**حفظ سطح فعلی**: ادامه تمرینات منظم خودشفقتی",
        "**به اشتراک‌گذاری**: به اشتراک‌گذاری تجربیات با دیگران",
        "**کمک به دیگران**: کمک به دیگران در یادگیری خودشفقتی",
        "**ادامه رشد**: ادامه یادگیری و رشد در مسیر خودشفقتی",
        "**الگو بودن**: الگو بودن برای دیگران در زمینه خودشفقتی"
      ]
    };
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
    const mean = calculateScore();
    const interpretation = getInterpretation(mean);

    const chartData = {
      labels: ['نمره شما', 'پایین (1.0-2.4)', 'متوسط (2.5-3.4)', 'بالا (3.5-5.0)'],
      datasets: [{
        label: 'میانگین خودشفقتی',
        data: [mean, 2.4, 3.4, 5.0],
        backgroundColor: [
          interpretation.color + 'B3',
          'rgba(239, 68, 68, 0.3)',
          'rgba(234, 179, 8, 0.3)',
          'rgba(34, 197, 94, 0.3)'
        ],
        borderColor: [
          interpretation.color,
          'rgb(239, 68, 68)',
          'rgb(234, 179, 8)',
          'rgb(34, 197, 94)'
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
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج مقیاس خودشفقتی (SCS-SF)</h1>
                <p className="text-secondaryTextColor">تحلیل نتایج شما</p>
              </div>
            </div>

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سطح خودشفقتی</h3>
              <div className="text-3xl font-bold mb-2" style={{ color: interpretation.color }}>{interpretation.level}</div>
              <div className="text-secondaryTextColor mb-4">{interpretation.desc}</div>
              <p className="text-sm text-secondaryTextColor">{interpretation.details}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">میانگین خودشفقتی</h3>
                <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>{mean.toFixed(2)}</div>
                <div className="text-sm text-secondaryTextColor">از 5.0</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">محدوده</h3>
                <div className="text-lg font-semibold mb-1 text-secondaryTextColor">
                  {mean <= 2.4 ? "1.0-2.4 (پایین)" : mean <= 3.4 ? "2.5-3.4 (متوسط)" : "3.5-5.0 (بالا)"}
                </div>
              </div>
            </div>

            {interpretation.strengths && interpretation.strengths.length > 0 && (
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نقاط قوت</h3>
                <ul className="space-y-2">
                  {interpretation.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                      <span className="text-secondaryTextColor">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {mean <= 2.4 && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-2xl p-6">
                <h4 className="font-medium text-yellow-400 mb-3">⚠️ توجه</h4>
                <p className="text-sm text-yellow-300">خودشفقتی شما پایین است. یادگیری و تمرین خودشفقتی می‌تواند سلامت روانی شما را بهبود بخشد.</p>
              </div>
            )}

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار تحلیل</h3>
              <div className="w-full h-80">
                <Bar data={chartData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: true, position: 'top', labels: { color: '#e5e7eb' } },
                    title: { display: true, text: 'میانگین خودشفقتی SCS-SF', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: 5, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                  }
                }} />
              </div>
            </div>

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

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره SCS-SF</h4>
              <p className="text-sm text-blue-300">
                مقیاس خودشفقتی - فرم کوتاه (SCS-SF) یک ابزار 12 سوالی برای ارزیابی خودشفقتی است. 
                این تست شامل سه بعد است: خودمهربانی، انسانیت مشترک، و ذهن‌آگاهی.
                برخی سوالات به صورت معکوس نمره‌دهی می‌شوند. نمره نهایی میانگین همه سوالات است (1-5).
                نمرات: 1.0-2.4 (پایین), 2.5-3.4 (متوسط), 3.5-5.0 (بالا).
              </p>
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
              <h1 className="text-2xl font-bold text-primaryTextColor">مقیاس خودشفقتی (SCS-SF)</h1>
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
            >{questions[currentQuestion].text}</h3>
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