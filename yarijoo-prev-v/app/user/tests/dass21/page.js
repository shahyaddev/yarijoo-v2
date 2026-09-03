"use client";

import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaBalanceScale } from "react-icons/fa";
import { Radar, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTestResult } from "@/hooks/useTestResult";


ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Page = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("dass21");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
    { text: "احساس کردم با چیزهای زیادی دست‌وپنجه نرم می‌کنم", subscale: "Stress" },
    { text: "دهانم خشک می‌شد بی‌آنکه تشنه باشم", subscale: "Anxiety" },
    { text: "انگار هیچ‌چیز مرا شاد نمی‌کند", subscale: "Depression" },
    { text: "دشواری در آرام ماندن یا ریلکس کردن داشتم", subscale: "Stress" },
    { text: "هیچ چیز برایم هیجان‌انگیز نبود", subscale: "Depression" },
    { text: "به‌طور ناگهانی مضطرب می‌شدم (بدون دلیل مشخص)", subscale: "Anxiety" },
    { text: "احساس کردم توان کنار آمدن با مسئولیت‌ها را ندارم", subscale: "Stress" },
    { text: "هیچ انتظار مثبتی از آینده نداشتم", subscale: "Depression" },
    { text: "به‌سختی آرام می‌شدم پس از ناراحتی", subscale: "Stress" },
    { text: "از احساس ترس یا وحشت ناگهانی رنج بردم", subscale: "Anxiety" },
    { text: "احساس کردم هیچ ارزشی ندارم", subscale: "Depression" },
    { text: "احساس فشار یا تنیدگی دائمی داشتم", subscale: "Stress" },
    { text: "نفس‌کم می‌آوردم یا دشواری تنفس داشتم", subscale: "Anxiety" },
    { text: "بی‌حوصله و کم‌انرژی بودم", subscale: "Depression" },
    { text: "زودرنج و تحریک‌پذیر بودم", subscale: "Stress" },
    { text: "نگرانی‌های مداوم و کنترل‌نشده داشتم", subscale: "Anxiety" },
    { text: "احساس ناامیدی نسبت به زندگی داشتم", subscale: "Depression" },
    { text: "به‌سختی تحمل فشارها را داشتم", subscale: "Stress" },
    { text: "احساس لرزش/تپش یا تنش بدنی آزاردهنده داشتم", subscale: "Anxiety" },
    { text: "از چیزهایی که قبلاً لذت می‌بردم، دیگر لذت نمی‌بردم", subscale: "Depression" },
    { text: "احساس کردم در آستانه فروپاشی هستم", subscale: "Anxiety" }
  ];

  const options = [
    { value: 0, label: "اصلاً" },
    { value: 1, label: "کمی" },
    { value: 2, label: "زیاد" },
    { value: 3, label: "خیلی زیاد" }
  ];

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
    const depression = [2, 4, 7, 10, 13, 16, 19].reduce((sum, idx) => sum + (answers[idx] || 0), 0) * 2;
    const anxiety = [1, 5, 9, 12, 15, 18, 20].reduce((sum, idx) => sum + (answers[idx] || 0), 0) * 2;
    const stress = [0, 3, 6, 8, 11, 14, 17].reduce((sum, idx) => sum + (answers[idx] || 0), 0) * 2;
    return { depression, anxiety, stress };
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


  const getInterpretation = (score, type = 'general') => {
    let cutoffs;
    const typeLabel = type === 'depression' ? 'افسردگی' : type === 'anxiety' ? 'اضطراب' : 'استرس';
    
    if (type === 'depression') {
      cutoffs = { normal: 9, mild: 13, moderate: 20, severe: 27, extremely_severe: 28 };
    } else if (type === 'anxiety') {
      cutoffs = { normal: 7, mild: 9, moderate: 14, severe: 19, extremely_severe: 42 };
    } else {
      cutoffs = { normal: 14, mild: 18, moderate: 25, severe: 33, extremely_severe: 42 };
    }

    if (score <= cutoffs.normal) {
      return {
        level: "طبیعی",
        color: "#22c55e",
        desc: `سطح ${typeLabel} در محدوده طبیعی است.`,
        details: `نمره شما نشان می‌دهد که سطح ${typeLabel} در حد طبیعی است. این یک نشانه مثبت از سلامت روانی است.`,
        strengths: [
          `سطح ${typeLabel} طبیعی`,
          "سلامت روانی خوب",
          "عملکرد مناسب",
          "کیفیت زندگی خوب"
        ]
      };
    }
    if (score <= cutoffs.mild) {
      return {
        level: "خفیف",
        color: "#eab308",
        desc: `علائم ${typeLabel} خفیف مشاهده می‌شود.`,
        details: `علائم ${typeLabel} خفیفی در شما مشاهده می‌شود. این علائم قابل کنترل هستند و با یادگیری مهارت‌های مقابله می‌توانید آن‌ها را مدیریت کنید.`,
        strengths: [
          "برخی مهارت‌های مقابله",
          "آگاهی از مشکل"
        ]
      };
    }
    if (score <= cutoffs.moderate) {
      return {
        level: "متوسط",
        color: "#f97316",
        desc: `سطح ${typeLabel} متوسط است.`,
        details: `سطح ${typeLabel} شما متوسط است و ممکن است بر عملکرد روزانه تأثیر بگذارد. ارزیابی و درمان تخصصی توصیه می‌شود.`,
        strengths: [
          "شناسایی مشکل"
        ]
      };
    }
    if (score <= cutoffs.severe) {
      return {
        level: "شدید",
        color: "#dc2626",
        desc: `سطح ${typeLabel} شدید است.`,
        details: `سطح ${typeLabel} شما شدید است و نیاز به مداخله فوری دارد. این می‌تواند به شدت بر زندگی شما تأثیر بگذارد.`,
        strengths: [
          "شناسایی مشکل"
        ]
      };
    }
    return {
      level: "بسیار شدید",
      color: "#991b1b",
      desc: `سطح ${typeLabel} بسیار شدید است و نیاز به مراقبت فوری دارد.`,
      details: `سطح ${typeLabel} شما بسیار شدید است و نیاز به مراقبت فوری و جامع دارد. درمان تخصصی فوری ضروری است.`,
      strengths: [
        "شناسایی مشکل"
      ]
    };
  };

  const getRecommendations = (depression, anxiety, stress) => {
    const recommendations = [];
    const hasSevere = depression > 27 || anxiety > 19 || stress > 33;

    if (hasSevere) {
      recommendations.push("مراجعه فوری به روان‌پزشک برای ارزیابی و درمان");
      recommendations.push("برنامه درمانی جامع شامل درمان دارویی و روان‌درمانی");
    } else if (depression > 20 || anxiety > 14 || stress > 25) {
      recommendations.push("مراجعه به روان‌شناس یا روان‌پزشک برای ارزیابی تخصصی");
      recommendations.push("درمان شناختی-رفتاری (CBT)");
    } else {
      recommendations.push("یادگیری تکنیک‌های مدیریت استرس");
      recommendations.push("تمرین ذهن‌آگاهی و آرام‌سازی");
    }

    if (depression > 13) {
      recommendations.push("فعال‌سازی رفتاری و افزایش فعالیت‌های لذت‌بخش");
      recommendations.push("تقویت حمایت اجتماعی");
    }
    if (anxiety > 9) {
      recommendations.push("تمرین تنفس عمیق و آرام‌سازی");
      recommendations.push("مواجهه تدریجی با موقعیت‌های اضطراب‌زا");
    }
    if (stress > 18) {
      recommendations.push("برنامه‌ریزی و مدیریت زمان");
      recommendations.push("تمرین منظم تکنیک‌های آرام‌سازی");
    }

    return recommendations;
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
    const { depression, anxiety, stress } = calculateScores();
    const depInterpretation = getInterpretation(depression, 'depression');
    const anxInterpretation = getInterpretation(anxiety, 'anxiety');
    const stressInterpretation = getInterpretation(stress, 'stress');

    const radarData = {
      labels: ['افسردگی', 'اضطراب', 'استرس'],
      datasets: [{
        label: 'نمرات شما',
        data: [depression, anxiety, stress],
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgb(99, 102, 241)',
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(99, 102, 241)',
        borderWidth: 2
      }]
    };

    const barData = {
      labels: ['افسردگی', 'اضطراب', 'استرس'],
      datasets: [{
        label: 'نمره',
        data: [depression, anxiety, stress],
        backgroundColor: [depInterpretation.color + 'B3', anxInterpretation.color + 'B3', stressInterpretation.color + 'B3'],
        borderColor: [depInterpretation.color, anxInterpretation.color, stressInterpretation.color],
        borderWidth: 2
      }]
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
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج مقیاس DASS-21</h1>
                <p className="text-secondaryTextColor">افسردگی، اضطراب و استرس</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">افسردگی</h3>
                <div className="text-3xl font-bold mb-2" style={{ color: depInterpretation.color }}>{depression}</div>
                <div className="text-sm" style={{ color: depInterpretation.color }}>{depInterpretation.level}</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">اضطراب</h3>
                <div className="text-3xl font-bold mb-2" style={{ color: anxInterpretation.color }}>{anxiety}</div>
                <div className="text-sm" style={{ color: anxInterpretation.color }}>{anxInterpretation.level}</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">استرس</h3>
                <div className="text-3xl font-bold mb-2" style={{ color: stressInterpretation.color }}>{stress}</div>
                <div className="text-sm" style={{ color: stressInterpretation.color }}>{stressInterpretation.level}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار راداری</h3>
                <div className="w-full h-80">
                  <Radar data={radarData} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      r: {
                        beginAtZero: true,
                        max: 42,
                        ticks: { color: '#9ca3af', backdropColor: 'transparent' },
                        grid: { color: '#374151' },
                        pointLabels: { color: '#e5e7eb', font: { size: 14 } }
                      }
                    },
                    plugins: { legend: { display: false } }
                  }} />
                </div>
              </div>

              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار ستونی</h3>
                <div className="w-full h-80">
                  <Bar data={barData} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: { beginAtZero: true, max: 42, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                      x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                    }
                  }} />
                </div>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">تفسیر</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-blue-400 mb-2">افسردگی</h4>
                  <p className="text-sm text-secondaryTextColor mb-1">{depInterpretation.desc}</p>
                  {depInterpretation.details && (
                    <p className="text-sm text-secondaryTextColor mt-2 leading-relaxed">{depInterpretation.details}</p>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-purple-400 mb-2">اضطراب</h4>
                  <p className="text-sm text-secondaryTextColor mb-1">{anxInterpretation.desc}</p>
                  {anxInterpretation.details && (
                    <p className="text-sm text-secondaryTextColor mt-2 leading-relaxed">{anxInterpretation.details}</p>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-orange-400 mb-2">استرس</h4>
                  <p className="text-sm text-secondaryTextColor mb-1">{stressInterpretation.desc}</p>
                  {stressInterpretation.details && (
                    <p className="text-sm text-secondaryTextColor mt-2 leading-relaxed">{stressInterpretation.details}</p>
                  )}
                </div>
              </div>
            </div>

            {((depInterpretation.strengths && depInterpretation.strengths.length > 0) || (anxInterpretation.strengths && anxInterpretation.strengths.length > 0) || (stressInterpretation.strengths && stressInterpretation.strengths.length > 0)) && (
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نقاط قوت</h3>
                <ul className="space-y-2">
                  {[...(depInterpretation.strengths || []), ...(anxInterpretation.strengths || []), ...(stressInterpretation.strengths || [])].filter((v, i, a) => a.indexOf(v) === i).map((strength, index) => (
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
                {getRecommendations(depression, anxiety, stress).map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                    <span className="text-secondaryTextColor text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره DASS-21</h4>
              <p className="text-sm text-blue-300">
                DASS-21 یک مقیاس 21 سوالی برای سنجش سه بعد افسردگی، اضطراب و استرس است. 
                نمرات در محدوده 0-42 برای هر بعد قرار می‌گیرند (نمره × 2).
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
              <h1 className="text-2xl font-bold text-primaryTextColor">مقیاس DASS-21</h1>
              <p className="text-secondaryTextColor">سوال {currentQuestion + 1} از {questions.length}</p>
            </div>
          </div>

          <div className="w-full bg-darkThemeColor rounded-2xl p-6">
            <h2 
              key={`question-title-${currentQuestion}`}
              className="text-lg font-semibold text-primaryTextColor mb-2"
              style={{
                opacity: 0,
                animation: `questionTitleSlideIn 0.5s ease-out 0.2s forwards`,
                animationFillMode: 'forwards',
              }}
            >در هفته گذشته، تا چه حد این مورد را تجربه کردید؟</h2>
            <h3 
              key={`question-text-${currentQuestion}`}
              className="text-xl font-bold text-primaryThemeColor mb-6"
              style={{
                opacity: 0,
                animation: `questionTextSlideIn 0.5s ease-out 0.4s forwards`,
                animationFillMode: 'forwards',
              }}
            >{questions[currentQuestion].text}</h3>
            <div className="space-y-3">
              {options.map((option, index) => (
                <button key={`${currentQuestion}-${option.value}`} onClick={() => handleAnswer(option.value)} className="w-full p-4 text-right bg-secondaryThemeColor hover:bg-primaryThemeColor/10 rounded-xl border border-borderColor hover:border-primaryThemeColor/40 transition-all"
                  style={{
                    opacity: 0,
                    animation: `testOptionFadeIn 0.4s ease-out ${0.6 + index * 0.1}s forwards`,
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

export default Page;







