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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("aggression");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
    { text: "گاهی نمی‌توانم میل به زدن کسی را کنترل کنم", type: "physical" },
    { text: "به مردم می‌گویم با نظراتشان مخالفم", type: "verbal" },
    { text: "زود عصبانی می‌شوم اما زود آرام می‌شوم", type: "anger" },
    { text: "گاهی از حسادت کور می‌شوم", type: "hostility" },
    { text: "اگر کسی مرا بزند، پس می‌زنم", type: "physical" },
    { text: "با کسانی که مخالفم بحث می‌کنم", type: "verbal" },
    { text: "برخی دوستانم فکر می‌کنند تندخو هستم", type: "anger" },
    { text: "گاهی احساس می‌کنم زندگی با من بی‌انصافی کرده", type: "hostility" },
    { text: "درگیری‌های فیزیکی داشته‌ام", type: "physical" },
    { text: "از کسانی که دوستشان ندارم بد می‌گویم", type: "verbal" },
    { text: "کنترل خودم را از دست می‌دهم", type: "anger" },
    { text: "گاهی احساس می‌کنم مردم از پشت بهم می‌خندند", type: "hostility" },
    { text: "به مردم تهدید می‌کنم", type: "physical" },
    { text: "با دوستانم بیشتر از حد معمول اختلاف دارم", type: "verbal" },
    { text: "برخی دوستانم می‌گویند بداخلاق هستم", type: "anger" },
    { text: "به افراد دیگر مشکوک هستم", type: "hostility" },
    { text: "درگیر دعوا شده‌ام", type: "physical" },
    { text: "برخی افراد مرا عصبانی می‌کنند", type: "anger" },
    { text: "گاهی احساس می‌کنم افراد حسود من هستند", type: "hostility" },
    { text: "اگر باید، از خود دفاع می‌کنم", type: "physical" }
  ]

  const options = [
  {
    "value": 1,
    "label": "کاملاً مخالفم"
  },
  {
    "value": 2,
    "label": "مخالفم"
  },
  {
    "value": 3,
    "label": "نه موافق نه مخالف"
  },
  {
    "value": 4,
    "label": "موافقم"
  },
  {
    "value": 5,
    "label": "کاملاً موافقم"
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
    setAnswers({ ...answers, [currentQuestion]: { value, type: q.type } });

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const calculateScores = () => {
    const physical = [0, 4, 8, 12, 16, 19].reduce((sum, idx) => sum + (answers[idx]?.value || 0), 0);
    const verbal = [1, 5, 9, 13].reduce((sum, idx) => sum + (answers[idx]?.value || 0), 0);
    const anger = [2, 6, 10, 17].reduce((sum, idx) => sum + (answers[idx]?.value || 0), 0);
    const hostility = [3, 7, 11, 14, 15, 18].reduce((sum, idx) => sum + (answers[idx]?.value || 0), 0);
    const totalScore = physical + verbal + anger + hostility;
    
    return { physical, verbal, anger, hostility, totalScore };
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
          const answersArray = questions.map((q, idx) => {
            const answer = answers[idx];
            if (answer !== undefined) {
              // اگر answer یک object است (با value و type)، value را برمی‌گردانیم
              return typeof answer === 'object' && answer.value !== undefined ? answer.value : answer;
            }
            return 0;
          });

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


  const getInterpretation = (score, type = 'total', scores = null) => {
    const maxScores = {
      physical: 30,
      verbal: 20,
      anger: 20,
      hostility: 30,
      total: 100
    };
    
    const max = maxScores[type];
    
    if (type === 'total') {
      if (score <= 30) {
        return {
          level: "پرخاشگری پایین",
          color: "#22c55e",
          desc: "سطح پرخاشگری شما پایین است. شما می‌توانید خشم خود را به خوبی مدیریت کنید.",
          details: "شما مهارت‌های خوبی برای کنترل خشم و پرخاشگری دارید. این نشان‌دهنده سلامت روانی و مهارت‌های ارتباطی قوی است. شما می‌توانید احساسات خود را به صورت سالم بیان کنید و از رفتارهای پرخاشگرانه اجتناب می‌کنید.",
          strengths: [
            "کنترل خوب خشم",
            "مهارت‌های ارتباطی سالم",
            "توانایی بیان احساسات به روش مناسب",
            "خودکنترلی قوی",
            "روابط مثبت با دیگران"
          ],
          recommendations: [
            "حفظ مهارت‌های مدیریت خشم فعلی",
            "ادامه خودآگاهی و کنترل",
            "کمک به دیگران در یادگیری مدیریت خشم"
          ]
        };
      } else if (score <= 60) {
        const hasHighSubscales = scores && (scores.physical > 15 || scores.verbal > 12 || scores.anger > 12 || scores.hostility > 15);
        
        return {
          level: "پرخاشگری متوسط",
          color: "#eab308",
          desc: "سطح پرخاشگری متوسط. گاهی ممکن است در کنترل خشم مشکل داشته باشید.",
          details: "گاهی ممکن است در کنترل خشم و پرخاشگری مشکل داشته باشید. این می‌تواند بر روابط شما تأثیر بگذارد اما با یادگیری مهارت‌های مدیریت خشم می‌توانید بهبود قابل توجهی داشته باشید.",
          strengths: hasHighSubscales ? [] : [
            "برخی مهارت‌های کنترل خشم",
            "آگاهی از نیاز به بهبود",
            "تمایل به تغییر"
          ],
          recommendations: [
            "**یادگیری مهارت‌های ارتباطی**: بیان احساسات به روش سالم",
            "**تکنیک‌های آرامش**: تنفس عمیق، مدیتیشن، ریلکسیشن",
            "**شناسایی محرک‌ها**: چه چیز شما را عصبانی می‌کند؟",
            "**ورزش منظم**: تخلیه انرژی منفی از طریق فعالیت بدنی",
            "**بازسازی شناختی**: تغییر الگوهای فکری منفی",
            "**مدیریت زمان**: کاهش استرس از طریق مدیریت بهتر زمان"
          ]
        };
      } else {
        return {
          level: "پرخاشگری بالا",
          color: "#dc2626",
          desc: "سطح پرخاشگری بالا. نیاز به مداخله و درمان فوری دارید.",
          details: "سطح پرخاشگری شما بالا است و می‌تواند روابط، شغل و سلامت شما را تحت تأثیر قرار دهد. این وضعیت نیاز به مداخله فوری و تخصصی دارد. مشاوره و درمان ضروری است.",
          strengths: [],
          recommendations: [
            "**🚨 درمان فوری**: مشاوره با روانشناس برای مدیریت پرخاشگری",
            "**برنامه مدیریت خشم**: یادگیری تکنیک‌های کنترل خشم",
            "**CBT**: درمان شناختی-رفتاری برای تغییر الگوهای فکری",
            "**گروه درمانی**: شرکت در گروه‌های مدیریت خشم",
            "**ایمنی**: اگر خشونت فیزیکی دارید، فوراً کمک بگیرید",
            "**درمان دارویی**: در صورت نیاز، مشورت با روانپزشک",
            "**برنامه ایمنی**: ایجاد برنامه ایمنی برای جلوگیری از خشونت"
          ]
        };
      }
    } else {
      const percentage = (score / max) * 100;
      if (percentage <= 50) {
        return { level: "پایین", color: "#22c55e" };
      } else if (percentage <= 75) {
        return { level: "متوسط", color: "#eab308" };
      } else {
        return { level: "بالا", color: "#dc2626" };
      }
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
    const interpretation = getInterpretation(scores.totalScore, 'total', scores);
    const maxScore = 100;

    const chartData = {
      labels: ['نمره شما', 'پایین (0-30)', 'متوسط (31-60)', 'بالا (61-100)'],
      datasets: [{
        label: 'نمره پرخاشگری',
        data: [scores.totalScore, 30, 60, 100],
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
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست پرخاشگری</h1>
                <p className="text-secondaryTextColor">تحلیل نتایج شما</p>
              </div>
            </div>

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سطح پرخاشگری</h3>
              <div className="text-3xl font-bold mb-2" style={{ color: interpretation.color }}>{interpretation.level}</div>
              <div className="text-secondaryTextColor mb-4">{interpretation.desc}</div>
              <p className="text-sm text-secondaryTextColor">{interpretation.details}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
                <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>{scores.totalScore}</div>
                <div className="text-sm text-secondaryTextColor">از 100</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">محدوده</h3>
                <div className="text-lg font-semibold mb-1 text-secondaryTextColor">
                  {scores.totalScore <= 30 ? "0-30 (پایین)" : scores.totalScore <= 60 ? "31-60 (متوسط)" : "61-100 (بالا)"}
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-darkThemeColor rounded-2xl p-4">
                <h4 className="text-xs font-medium text-secondaryTextColor mb-1">پرخاشگری فیزیکی</h4>
                <div className="text-xl font-bold mb-1" style={{ color: getInterpretation(scores.physical, 'physical').color }}>{scores.physical}</div>
                <div className="text-xs text-secondaryTextColor">از 30</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-4">
                <h4 className="text-xs font-medium text-secondaryTextColor mb-1">پرخاشگری کلامی</h4>
                <div className="text-xl font-bold mb-1" style={{ color: getInterpretation(scores.verbal, 'verbal').color }}>{scores.verbal}</div>
                <div className="text-xs text-secondaryTextColor">از 20</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-4">
                <h4 className="text-xs font-medium text-secondaryTextColor mb-1">خشم</h4>
                <div className="text-xl font-bold mb-1" style={{ color: getInterpretation(scores.anger, 'anger').color }}>{scores.anger}</div>
                <div className="text-xs text-secondaryTextColor">از 20</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-4">
                <h4 className="text-xs font-medium text-secondaryTextColor mb-1">خصومت</h4>
                <div className="text-xl font-bold mb-1" style={{ color: getInterpretation(scores.hostility, 'hostility').color }}>{scores.hostility}</div>
                <div className="text-xs text-secondaryTextColor">از 30</div>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار زیرمقیاس‌ها</h3>
              <div className="w-full h-80">
                <Bar data={{
                  labels: ['فیزیکی', 'کلامی', 'خشم', 'خصومت'],
                  datasets: [{
                    label: 'نمرات زیرمقیاس‌های پرخاشگری',
                    data: [scores.physical, scores.verbal, scores.anger, scores.hostility],
                    backgroundColor: [
                      '#dc2626',
                      '#f97316',
                      '#eab308',
                      '#ef4444'
                    ],
                    borderColor: [
                      '#b91c1c',
                      '#ea580c',
                      '#ca8a04',
                      '#dc2626'
                    ],
                    borderWidth: 2
                  }]
                }} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: true, position: 'top', labels: { color: '#e5e7eb' } },
                    title: { display: true, text: 'تحلیل زیرمقیاس‌های پرخاشگری', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: 30, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                  }
                }} />
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
                    title: { display: true, text: 'تحلیل نمره پرخاشگری', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: maxScore, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af', maxRotation: 45, minRotation: 45 }, grid: { color: '#374151' } }
                  }
                }} />
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توصیه‌های تخصصی</h3>
              <ul className="space-y-3">
                {interpretation.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                    <span className="text-secondaryTextColor text-sm" dangerouslySetInnerHTML={{ __html: rec.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></span>
                  </li>
                ))}
              </ul>
            </div>

            {scores.totalScore > 60 && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6">
                <h4 className="font-medium text-red-400 mb-3">⚠️ هشدار مهم</h4>
                <p className="text-sm text-red-300">
                  پرخاشگری کنترل نشده می‌تواند به عواقب جدی قانونی و اجتماعی منجر شود. درمان فوری ضروری است. اگر خشونت فیزیکی دارید، فوراً کمک بگیرید.
                </p>
              </div>
            )}

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
              <h1 className="text-2xl font-bold text-primaryTextColor">تست AGGRESSION</h1>
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
