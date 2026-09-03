"use client";

import { useTestResult } from "@/hooks/useTestResult";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaBrain } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TestPage = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("communication_style");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
    { text: "مستقیم و صریح حرف می‌زنم", type: "assertive" },
    { text: "نظرات خود را واضح بیان می‌کنم", type: "assertive" },
    { text: "می‌توانم نه بگویم", type: "assertive" },
    { text: "از حق خود دفاع می‌کنم", type: "assertive" },
    { text: "برای اجتناب از تعارض سکوت می‌کنم", type: "passive" },
    { text: "گفتن نظرم را به تعویق می‌اندازم", type: "passive" },
    { text: "احساساتم را پنهان می‌کنم", type: "passive" },
    { text: "ترجیح می‌دهم موافقت کنم تا بحث کنم", type: "passive" },
    { text: "وقتی عصبانی‌ام طعنه می‌زنم", type: "passive_aggressive" },
    { text: "به جای گفتن مشکل، رفتار سرد دارم", type: "passive_aggressive" },
    { text: "کارها را عمداً به تأخیر می‌اندازم", type: "passive_aggressive" },
    { text: "با لحن یا زبان بدن خشم نشان می‌دهم", type: "passive_aggressive" },
    { text: "با صدای بلند و تهاجمی صحبت می‌کنم", type: "aggressive" },
    { text: "دیگران را قطع می‌کنم", type: "aggressive" },
    { text: "دیگران را سرزنش می‌کنم", type: "aggressive" },
    { text: "تهدید یا ارعاب می‌کنم", type: "aggressive" },
    { text: "به احساسات دیگران توجه می‌کنم", type: "assertive" },
    { text: "با احترام اما قاطع صحبت می‌کنم", type: "assertive" },
    { text: "به دیگران اجازه بیان نظر می‌دهم", type: "assertive" },
    { text: "راه حل برد-برد می‌جویم", type: "assertive" }
  ]

  const options = [
  {
    "value": 1,
    "label": "هرگز"
  },
  {
    "value": 2,
    "label": "به ندرت"
  },
  {
    "value": 3,
    "label": "گاهی"
  },
  {
    "value": 4,
    "label": "اغلب"
  },
  {
    "value": 5,
    "label": "همیشه"
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
  // ذخیره نتیجه بعد از تکمیل
  useEffect(() => {
    const saveResultToServer = async () => {
      if (isCompleted && !hasResult && Object.keys(answers).length === questions.length) {
        try {
          const scores = calculateScores();
          const totalScore = scores.totalScore || scores.total_score || Object.values(scores).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
          const interpretation = { level: 'متوسط', color: '#eab308', desc: '' };
          
          // تبدیل answers به آرایه
          const answersArray = questions.map((q, idx) => { const answer = answers[idx]; if (typeof answer === 'object' && answer.value !== undefined) return answer.value; return answer !== undefined ? answer : 0; });

          const saved = await saveResult({
            answers: answersArray,
            totalScore: totalScore,
            total_score: totalScore,
            level: interpretation.level || interpretation.level || 'متوسط',
            interpretation: interpretation,
            scores: scores,
          });
          
          if (saved && saved.success) {
            setIsCompleted(true);
          }
        } catch (error) {
          console.error("Error saving result:", error);
        }
      }
    };

    saveResultToServer();
  }, [isCompleted, hasResult, answers, questions, saveResult]);



  const calculateScores = () => {
    const assertive = [0, 1, 2, 3, 16, 17, 18, 19].reduce((sum, idx) => sum + (answers[idx]?.value || 0), 0);
    const passive = [4, 5, 6, 7].reduce((sum, idx) => sum + (answers[idx]?.value || 0), 0);
    const passive_aggressive = [8, 9, 10, 11].reduce((sum, idx) => sum + (answers[idx]?.value || 0), 0);
    const aggressive = [12, 13, 14, 15].reduce((sum, idx) => sum + (answers[idx]?.value || 0), 0);
    
    return { assertive, passive, passive_aggressive, aggressive };
  };

  const getDominantStyle = (scores) => {
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    return sorted[0][0];
  };

  const getStyleInfo = (style) => {
    const styles = {
      assertive: {
        title: "قاطع (Assertive)",
        persian: "قاطع",
        color: "#22c55e",
        desc: "سبک ارتباطی قاطع - سالم‌ترین سبک. شما نیازها و احساسات خود را به صورت صریح و محترمانه بیان می‌کنید.",
        details: "شما سبک ارتباطی قاطع دارید که ایده‌آل است. این سبک به شما اجازه می‌دهد که نیازهای خود را بیان کنید، از حق خود دفاع کنید، و در عین حال به دیگران احترام بگذارید.",
        strengths: ["بیان صریح نیازها", "احترام به خود و دیگران", "حل تعارض سالم", "ارتباط مؤثر", "اعتماد به نفس"],
        recommendations: ["**حفظ این سبک**: ادامه استفاده از سبک ارتباطی قاطع و سالم", "**الگو بودن**: الگو بودن برای دیگران در ارتباط مؤثر", "**کمک به دیگران**: کمک به دیگران در یادگیری قاطعیت"]
      },
      passive: {
        title: "منفعل (Passive)",
        persian: "منفعل",
        color: "#ef4444",
        desc: "سبک ارتباطی منفعل - نیازها و احساسات خود را کمتر بیان می‌کنید.",
        details: "شما سبک ارتباطی منفعل دارید. برای اجتناب از تعارض، نیازها و احساسات خود را کمتر بیان می‌کنید که می‌تواند منجر به سرکوب احساسات و رنجش شود.",
        strengths: [],
        recommendations: ["**آموزش قاطعیت**: شرکت در دوره‌های آموزشی قاطعیت", "**بیان نیازها**: تمرین بیان مستقیم و صریح نیازها", "**نه گفتن**: یادگیری نه گفتن محترمانه و مؤثر", "**مشاوره**: دریافت کمک حرفه‌ای برای تغییر سبک ارتباطی"]
      },
      passive_aggressive: {
        title: "منفعل-پرخاشگر (Passive-Aggressive)",
        persian: "منفعل-پرخاشگر",
        color: "#f97316",
        desc: "بیان غیرمستقیم نارضایتی به جای بیان صریح.",
        details: "شما سبک ارتباطی منفعل-پرخاشگر دارید. به جای بیان مستقیم احساسات، به صورت غیرمستقیم (طعنه، تعلل، رفتار سرد) نارضایتی خود را نشان می‌دهید.",
        strengths: [],
        recommendations: ["**صداقت**: یادگیری بیان مستقیم و صریح احساسات", "**مواجهه سالم**: رویارویی مستقیم با مسائل به جای طعنه و رفتار غیرمستقیم", "**آموزش قاطعیت**: یادگیری تغییر از سبک منفعل-پرخاشگر به قاطع", "**مشاوره**: دریافت کمک حرفه‌ای برای تغییر الگوی ارتباطی"]
      },
      aggressive: {
        title: "پرخاشگر (Aggressive)",
        persian: "پرخاشگر",
        color: "#dc2626",
        desc: "سبک ارتباطی پرخاشگر - نیازهای خود را بر نیازهای دیگران مقدم می‌دانید.",
        details: "شما سبک ارتباطی پرخاشگر دارید. با تهاجم، داد و فریاد، و عدم احترام به دیگران ارتباط برقرار می‌کنید که می‌تواند روابط را خراب کند.",
        strengths: [],
        recommendations: ["**مدیریت خشم**: یادگیری کنترل خشم و مهارت‌های مدیریت هیجان", "**احترام**: یادگیری احترام به دیدگاه و احساسات دیگران", "**گوش دادن فعال**: یادگیری مهارت‌های گوش دادن فعال و همدلانه", "**مشاوره**: دریافت کمک حرفه‌ای برای تغییر سبک ارتباطی"]
      }
    };
    return styles[style] || styles.assertive;
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
    const dominantStyle = getDominantStyle(scores);
    const styleInfo = getStyleInfo(dominantStyle);

    const chartData = {
      labels: ['قاطع', 'منفعل', 'منفعل-پرخاشگر', 'پرخاشگر'],
      datasets: [{
        label: 'نمرات سبک‌های ارتباطی',
        data: [
          scores.assertive,
          scores.passive,
          scores.passive_aggressive,
          scores.aggressive
        ],
        backgroundColor: [
          '#22c55e',
          '#ef4444',
          '#f97316',
          '#dc2626'
        ],
        borderColor: [
          '#16a34a',
          '#dc2626',
          '#ea580c',
          '#b91c1c'
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
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست سبک ارتباطی</h1>
                <p className="text-secondaryTextColor">تحلیل نتایج شما</p>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سبک ارتباطی اصلی شما</h3>
              <div className="text-3xl font-bold mb-2" style={{ color: styleInfo.color }}>{styleInfo.persian}</div>
              <p className="text-secondaryTextColor mt-2">{styleInfo.desc}</p>
              <p className="text-secondaryTextColor mt-2 text-sm">{styleInfo.details}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-darkThemeColor rounded-2xl p-4">
                <h4 className="text-xs font-medium text-secondaryTextColor mb-1">قاطع</h4>
                <div className="text-xl font-bold mb-1" style={{ color: "#22c55e" }}>{scores.assertive}</div>
                <div className="text-xs text-secondaryTextColor">از 40</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-4">
                <h4 className="text-xs font-medium text-secondaryTextColor mb-1">منفعل</h4>
                <div className="text-xl font-bold mb-1" style={{ color: "#ef4444" }}>{scores.passive}</div>
                <div className="text-xs text-secondaryTextColor">از 20</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-4">
                <h4 className="text-xs font-medium text-secondaryTextColor mb-1">منفعل-پرخاشگر</h4>
                <div className="text-xl font-bold mb-1" style={{ color: "#f97316" }}>{scores.passive_aggressive}</div>
                <div className="text-xs text-secondaryTextColor">از 20</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-4">
                <h4 className="text-xs font-medium text-secondaryTextColor mb-1">پرخاشگر</h4>
                <div className="text-xl font-bold mb-1" style={{ color: "#dc2626" }}>{scores.aggressive}</div>
                <div className="text-xs text-secondaryTextColor">از 20</div>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار مقایسه سبک‌ها</h3>
              <div className="w-full h-80">
                <Bar data={chartData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: true, position: 'top', labels: { color: '#e5e7eb' } },
                    title: { display: true, text: 'نمرات 4 سبک ارتباطی', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: 40, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                  }
                }} />
              </div>
            </div>

            {styleInfo.strengths && styleInfo.strengths.length > 0 && (
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نقاط قوت</h3>
                <ul className="space-y-2">
                  {styleInfo.strengths.map((strength, index) => (
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
                {styleInfo.recommendations.map((rec, index) => (
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
              <h1 className="text-2xl font-bold text-primaryTextColor">تست سبک ارتباطی</h1>
              <p className="text-secondaryTextColor">سوال {currentQuestion + 1} از {questions.length}</p>
            </div>
          </div>

          <div className="w-full bg-darkThemeColor rounded-2xl p-6">
            <h3 className="text-xl font-bold text-primaryThemeColor mb-6">{questions[currentQuestion].text || questions[currentQuestion]}</h3>
            <div className="space-y-3">
              {options.map((option) => (
                <button key={option.value} onClick={() => handleAnswer(option.value)} className="w-full p-4 text-right bg-secondaryThemeColor hover:bg-primaryThemeColor/10 rounded-xl border border-borderColor hover:border-primaryThemeColor/40 transition-all">
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
