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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("stai");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
    { text: "اکنون احساس آرامش می‌کنم", type: "State", reverse: true },
    { text: "اکنون احساس امنیت می‌کنم", type: "State", reverse: true },
    { text: "اکنون احساس تنش دارم", type: "State", reverse: false },
    { text: "اکنون احساس ناراحتی می‌کنم", type: "State", reverse: false },
    { text: "اکنون احساس راحتی می‌کنم", type: "State", reverse: true },
    { text: "اکنون نگران هستم", type: "State", reverse: false },
    { text: "اکنون ناامید هستم", type: "State", reverse: false },
    { text: "اکنون آرام هستم", type: "State", reverse: true },
    { text: "اکنون مضطرب هستم", type: "State", reverse: false },
    { text: "اکنون احساس راحتی دارم", type: "State", reverse: true },
    { text: "اکنون اعتماد به نفس دارم", type: "State", reverse: true },
    { text: "اکنون عصبی هستم", type: "State", reverse: false },
    { text: "اکنون آرامش ذهنی دارم", type: "State", reverse: true },
    { text: "اکنون دلواپس هستم", type: "State", reverse: false },
    { text: "اکنون راحت و آسوده‌ام", type: "State", reverse: true },
    { text: "اکنون بی‌قرارم", type: "State", reverse: false },
    { text: "اکنون ذهنم آرام است", type: "State", reverse: true },
    { text: "اکنون نگران اتفاقات پیش‌رو هستم", type: "State", reverse: false },
    { text: "اکنون احساس راحتی دارم", type: "State", reverse: true },
    { text: "اکنون تنش زیادی دارم", type: "State", reverse: false },
    { text: "معمولاً احساس آرامش می‌کنم", type: "Trait", reverse: true },
    { text: "معمولاً احساس امنیت می‌کنم", type: "Trait", reverse: true },
    { text: "معمولاً احساس تنش دارم", type: "Trait", reverse: false },
    { text: "معمولاً ناراحت هستم", type: "Trait", reverse: false },
    { text: "معمولاً احساس راحتی می‌کنم", type: "Trait", reverse: true },
    { text: "معمولاً نگران هستم", type: "Trait", reverse: false },
    { text: "معمولاً بی‌قرار هستم", type: "Trait", reverse: false },
    { text: "معمولاً آرام هستم", type: "Trait", reverse: true },
    { text: "معمولاً مضطرب هستم", type: "Trait", reverse: false },
    { text: "معمولاً احساس راحتی دارم", type: "Trait", reverse: true },
    { text: "معمولاً اعتماد به نفس دارم", type: "Trait", reverse: true },
    { text: "معمولاً عصبی هستم", type: "Trait", reverse: false },
    { text: "معمولاً ذهن آرامی دارم", type: "Trait", reverse: true },
    { text: "معمولاً دلواپس هستم", type: "Trait", reverse: false },
    { text: "معمولاً راحت و آسوده‌ام", type: "Trait", reverse: true },
    { text: "معمولاً بی‌قرارم", type: "Trait", reverse: false },
    { text: "معمولاً ذهنم آرام است", type: "Trait", reverse: true },
    { text: "معمولاً نگران اتفاقات آینده هستم", type: "Trait", reverse: false },
    { text: "معمولاً احساس راحتی دارم", type: "Trait", reverse: true },
    { text: "معمولاً تنش زیادی دارم", type: "Trait", reverse: false }
  ]

  const options = [
  {
    "value": 1,
    "label": "اصلاً"
  },
  {
    "value": 2,
    "label": "کمی"
  },
  {
    "value": 3,
    "label": "تا حدودی"
  },
  {
    "value": 4,
    "label": "خیلی زیاد"
  }
        ]

  // بررسی نتیجه قبلی
  useEffect(() => {
    if (hasResult && previousResult && !resultLoading) {
      setIsCompleted(true);
    }
  }, [hasResult, previousResult, resultLoading]);


  const handleAnswer = (value) => {
    const q = questions[currentQuestion];
    const actualValue = q.reverse ? (5 - value) : value;
    const newAnswers = { ...answers, [currentQuestion]: { value: actualValue, type: q.type } };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const calculateScores = () => {
    const state = Object.values(answers)
      .filter((a, idx) => questions[idx].type === 'State')
      .reduce((sum, a) => sum + (a.value || 0), 0);
    
    const trait = Object.values(answers)
      .filter((a, idx) => questions[idx].type === 'Trait')
      .reduce((sum, a) => sum + (a.value || 0), 0);
    
    return { state, trait, total: state + trait };
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
    const maxScore = 80;
    const typeLabel = type === 'State' ? 'اضطراب حالت' : type === 'Trait' ? 'اضطراب صفت' : 'اضطراب';
    
    if (score <= 40) {
      return {
        level: "پایین",
        color: "#22c55e",
        desc: `سطح ${typeLabel} پایین است.`,
        details: `نمره شما نشان می‌دهد که سطح ${typeLabel} در حد طبیعی و پایین است. این وضعیت مطلوب است و نشان‌دهنده سلامت روانی خوب در این بعد می‌باشد.`,
        strengths: [
          `سطح ${typeLabel} طبیعی`,
          "کنترل مناسب اضطراب",
          "عملکرد مناسب در موقعیت‌های استرس‌زا",
          "کیفیت زندگی خوب"
        ]
      };
    }
    if (score <= 50) {
      return {
        level: "متوسط-پایین",
        color: "#84cc16",
        desc: `سطح ${typeLabel} در محدوده متوسط-پایین است.`,
        details: `سطح ${typeLabel} شما کمی بالاتر از حد طبیعی است اما هنوز در محدوده قابل کنترل قرار دارد.`,
        strengths: [
          `سطح ${typeLabel} نسبتاً کنترل شده`,
          "برخی مهارت‌های مقابله"
        ]
      };
    }
    if (score <= 60) {
      return {
        level: "متوسط",
        color: "#eab308",
        desc: `سطح ${typeLabel} متوسط است.`,
        details: `سطح ${typeLabel} شما در حد متوسط است و ممکن است در برخی موقعیت‌ها تأثیر بگذارد. یادگیری مهارت‌های مدیریت اضطراب توصیه می‌شود.`,
        strengths: [
          "آگاهی از مشکل",
          "برخی مهارت‌های پایه"
        ]
      };
    }
    return {
      level: "بالا",
      color: "#ef4444",
      desc: `سطح ${typeLabel} بالا است.`,
      details: `سطح ${typeLabel} شما بالا است و ممکن است به شدت بر عملکرد روزانه، کار و روابط شما تأثیر بگذارد. ارزیابی و درمان تخصصی توصیه می‌شود.`,
      strengths: [
        "شناسایی مشکل"
      ]
    };
  };

  const getRecommendations = (stateScore, traitScore) => {
    const recommendations = [];
    const hasHighAnxiety = stateScore > 50 || traitScore > 50;

    if (hasHighAnxiety) {
      recommendations.push("مراجعه به روان‌شناس یا روان‌پزشک برای ارزیابی تخصصی");
      recommendations.push("درمان شناختی-رفتاری (CBT) برای مدیریت اضطراب");
    } else {
      recommendations.push("یادگیری تکنیک‌های مدیریت اضطراب");
      recommendations.push("تمرین ذهن‌آگاهی و آرام‌سازی");
    }

    if (stateScore > 40) {
      recommendations.push("تمرین تکنیک‌های تنفس عمیق برای کاهش اضطراب لحظه‌ای");
      recommendations.push("آرام‌سازی پیشرونده عضلانی");
    }
    if (traitScore > 40) {
      recommendations.push("بازسازی شناختی برای تغییر الگوهای فکری مضطرب");
      recommendations.push("مواجهه تدریجی با موقعیت‌های اضطراب‌زا");
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
    const { state, trait, total } = calculateScores();
    const stateInterpretation = getInterpretation(state, 'State');
    const traitInterpretation = getInterpretation(trait, 'Trait');
    const recommendations = getRecommendations(state, trait);

    const chartData = {
      labels: ['اضطراب حالت (State)', 'اضطراب صفت (Trait)'],
      datasets: [{
        label: 'نمرات',
        data: [state, trait],
        backgroundColor: ['rgba(59, 130, 246, 0.7)', 'rgba(147, 51, 234, 0.7)'],
        borderColor: ['rgb(59, 130, 246)', 'rgb(147, 51, 234)'],
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
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست اضطراب صفت-حالت (STAI)</h1>
                <p className="text-secondaryTextColor">مقیاس اضطراب صفت-حالت</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">اضطراب حالت (State)</h3>
                <div className="text-4xl font-bold mb-2" style={{ color: stateInterpretation.color }}>{state}</div>
                <div className="text-sm text-secondaryTextColor">از 80</div>
                <div className="text-sm mt-2" style={{ color: stateInterpretation.color }}>{stateInterpretation.level}</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">اضطراب صفت (Trait)</h3>
                <div className="text-4xl font-bold mb-2" style={{ color: traitInterpretation.color }}>{trait}</div>
                <div className="text-sm text-secondaryTextColor">از 80</div>
                <div className="text-sm mt-2" style={{ color: traitInterpretation.color }}>{traitInterpretation.level}</div>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار تحلیل</h3>
              <div className="w-full h-80">
                <Bar data={chartData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'مقایسه اضطراب حالت و صفت', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: 80, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                  }
                }} />
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">تفسیر</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-blue-400 mb-2">اضطراب حالت (State Anxiety)</h4>
                  <p className="text-sm text-secondaryTextColor mb-1">{stateInterpretation.desc}</p>
                  {stateInterpretation.details && (
                    <p className="text-sm text-secondaryTextColor mt-2 leading-relaxed">{stateInterpretation.details}</p>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-purple-400 mb-2">اضطراب صفت (Trait Anxiety)</h4>
                  <p className="text-sm text-secondaryTextColor mb-1">{traitInterpretation.desc}</p>
                  {traitInterpretation.details && (
                    <p className="text-sm text-secondaryTextColor mt-2 leading-relaxed">{traitInterpretation.details}</p>
                  )}
                </div>
              </div>
            </div>

            {(stateInterpretation.strengths && stateInterpretation.strengths.length > 0) || (traitInterpretation.strengths && traitInterpretation.strengths.length > 0) ? (
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نقاط قوت</h3>
                <ul className="space-y-2">
                  {[...(stateInterpretation.strengths || []), ...(traitInterpretation.strengths || [])].filter((v, i, a) => a.indexOf(v) === i).map((strength, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                      <span className="text-secondaryTextColor">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توصیه‌های تخصصی</h3>
              <ul className="space-y-3">
                {recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                    <span className="text-secondaryTextColor text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره STAI</h4>
              <p className="text-sm text-blue-300">
                STAI (State-Trait Anxiety Inventory) یک مقیاس 40 سوالی است که دو بعد اضطراب را می‌سنجد:
                اضطراب حالت (اضطراب لحظه‌ای) و اضطراب صفت (ویژگی پایدار شخصیت). 
                هر بعد شامل 20 سوال است.
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
              <h1 className="text-2xl font-bold text-primaryTextColor">تست اضطراب صفت-حالت (STAI)</h1>
              <p className="text-secondaryTextColor">سوال {currentQuestion + 1} از {questions.length}</p>
            </div>
          </div>

          <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
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