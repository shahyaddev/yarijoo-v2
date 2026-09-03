"use client";

import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaBrain } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { toFarsiNumber } from "@/helper/helper";
import { useTestResult } from "@/hooks/useTestResult";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Page = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("bai");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [currentQuestion]);

  const questions = [
    { text: "احساس گزگز یا مورمور در بدن", type: "somatic" },
    { text: "احساس گرگرفتگی یا حرارت ناگهانی", type: "somatic" },
    { text: "لرزش در پاها", type: "somatic" },
    { text: "ناتوانی در آرام ماندن یا بی‌قراری", type: "cognitive" },
    { text: "ترس از وقوع بدترین اتفاق", type: "cognitive" },
    { text: "احساس گیجی یا سبک‌سری", type: "somatic" },
    { text: "تپش قلب یا ضربان سریع", type: "somatic" },
    { text: "عدم تعادل یا احساس زمین‌خوردن", type: "somatic" },
    { text: "ترس از دست دادن کنترل", type: "cognitive" },
    { text: "احساس تنگی نفس یا دشواری در نفس کشیدن", type: "somatic" },
    { text: "ترس از مرگ یا حادثه قریب‌الوقوع", type: "cognitive" },
    { text: "وحشت‌زدگی یا حمله وحشت", type: "cognitive" },
    { text: "احساس خفگی در گلو یا سینه", type: "somatic" },
    { text: "لرزش دست‌ها", type: "somatic" },
    { text: "احساس ناآرامی در بدن (بی‌قراری عضلانی)", type: "somatic" },
    { text: "نگرانی مداوم و کنترل‌نشده", type: "cognitive" },
    { text: "ترس از مکان‌های شلوغ یا باز", type: "cognitive" },
    { text: "اختلال در تمرکز به دلیل اضطراب", type: "cognitive" },
    { text: "تنیدگی در شکم یا حالت تهوع", type: "somatic" },
    { text: "احساس سردی یا لرز ناگهانی", type: "somatic" },
    { text: "سفتی یا درد عضلات ناشی از تنش", type: "somatic" }
  ];

  const options = [
    { value: 0, label: "اصلاً" },
    { value: 1, label: "کمی" },
    { value: 2, label: "متوسط" },
    { value: 3, label: "شدید" }
  ];

  // بررسی نتیجه قبلی
  useEffect(() => {
    if (hasResult && previousResult && !resultLoading && Object.keys(answers).length === 0 && !isCompleted) {
      setIsCompleted(true);
      // نمایش نتیجه قبلی
      if (previousResult.total_score !== undefined) {
        setSavedScore(previousResult.total_score);
      }
      // بازیابی answers از previousResult برای نمایش درست
      if (previousResult.answers && Array.isArray(previousResult.answers)) {
        const restoredAnswers = {};
        previousResult.answers.forEach((answer, index) => {
          restoredAnswers[index] = answer;
        });
        setAnswers(restoredAnswers);
      }
    }
  }, [hasResult, previousResult, resultLoading, isCompleted]);


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
    const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
    
    const somatic = [0, 1, 2, 5, 6, 7, 9, 12, 13, 14, 18, 19, 20]
      .reduce((sum, idx) => sum + (answers[idx] || 0), 0);
    
    const cognitive = [3, 4, 8, 10, 11, 15, 16, 17]
      .reduce((sum, idx) => sum + (answers[idx] || 0), 0);

    return { totalScore, somatic, cognitive };
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


  const getInterpretation = (score) => {
    if (score <= 9) {
      return {
        level: "سطح پایین",
        color: "#22c55e",
        desc: "نمره شما نشان می‌دهد که در این زمینه وضعیت خوبی دارید و علائم کمی مشاهده می‌شود.",
        details: "بر اساس پاسخ‌های شما، به نظر می‌رسد که در این حوزه عملکرد مناسبی دارید. این یک نشانه مثبت است و نشان‌دهنده سلامت روانی خوب در این بعد می‌باشد. با این حال، مهم است که به حفظ این وضعیت ادامه دهید و در صورت بروز هرگونه تغییر، به آن توجه کنید.",
        strengths: [
          "عملکرد مناسب در این حوزه",
          "نشانه‌های سلامت روانی مطلوب",
          "توانایی مقابله با چالش‌های روزمره",
          "کیفیت زندگی خوب",
          "سازگاری مناسب با محیط"
        ]
      };
    } else if (score <= 16) {
      return {
        level: "سطح خفیف",
        color: "#eab308",
        desc: "نشانه‌های اضطراب در سطح خفیف مشاهده می‌شود.",
        details: "نمره شما نشان می‌دهد که در برخی مواقع علائم اضطراب را تجربه می‌کنید. این طبیعی است و می‌تواند با تکنیک‌های ساده مدیریت شود.",
        strengths: []
      };
    } else if (score <= 25) {
      return {
        level: "سطح متوسط",
        color: "#f97316",
        desc: "اضطراب در سطح متوسط قرار دارد و نیاز به توجه دارد.",
        details: "نمره شما نشان می‌دهد که اضطراب به طور قابل توجهی بر زندگی شما تاثیر می‌گذارد. توصیه می‌شود که از تکنیک‌های مدیریت اضطراب استفاده کنید و در صورت نیاز با متخصص مشورت کنید.",
        strengths: []
      };
    } else {
      return {
        level: "سطح شدید",
        color: "#ef4444",
        desc: "اضطراب در سطح شدید است و نیاز به مراقبت تخصصی دارد.",
        details: "نمره شما نشان می‌دهد که اضطراب به طور شدید بر عملکرد روزانه شما تاثیر می‌گذارد. توصیه می‌شود که فوراً با متخصص سلامت روان مشورت کنید.",
        strengths: []
      };
    }
  };

  const getRecommendations = (score) => {
    if (score <= 9) {
      return [
        "ادامه شیوه زندگی فعلی و حفظ عادت‌های سالم",
        "توجه به علائم هشداردهنده و تغییرات احتمالی",
        "حفظ تعادل بین کار، استراحت و تفریح",
        "تقویت روابط اجتماعی و حمایت خانوادگی",
        "مراقبت منظم از سلامت جسمی و روانی"
      ];
    } else if (score <= 16) {
      return [
        "تمرین تکنیک‌های آرام‌سازی و تنفس عمیق",
        "فعالیت بدنی منظم (30 دقیقه روزانه)",
        "برنامه‌ریزی و مدیریت استرس",
        "محدود کردن مصرف کافئین و محرک‌ها",
        "توجه به الگوهای خواب و استراحت کافی"
      ];
    } else if (score <= 25) {
      return [
        "مشاوره با متخصص سلامت روان (CBT/ACT)",
        "برنامه‌ریزی منظم روزانه و ساختاردهی فعالیت‌ها",
        "تکنیک‌های ذهن‌آگاهی و مدیتیشن",
        "ورزش منظم و تغذیه سالم",
        "بررسی علل جسمی احتمالی با پزشک"
      ];
    } else {
      return [
        "ارجاع فوری به روان‌پزشک یا متخصص سلامت روان",
        "برنامه ایمنی و مدیریت بحران",
        "درمان ترکیبی (دارویی و روان‌درمانی)",
        "حمایت خانوادگی و نظارت نزدیک",
        "پیگیری منظم و ادامه درمان"
      ];
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
    const calculatedScores = calculateScores();
    const totalScore = savedScore !== null ? savedScore : (previousResult?.total_score !== undefined ? previousResult.total_score : calculatedScores.totalScore);
    const { somatic, cognitive } = calculatedScores;
    const interpretation = getInterpretation(totalScore);
    const recommendations = getRecommendations(totalScore);

    const chartData = {
      labels: ['نشانه‌های بدنی', 'نشانه‌های شناختی', 'نمره کل'],
      datasets: [{
        label: 'نمره',
        data: [somatic || 0, cognitive || 0, totalScore || 0],
        backgroundColor: [
          'rgba(147, 51, 234, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          (interpretation?.color || "#22c55e") + 'B3'
        ],
        borderColor: [
          'rgb(147, 51, 234)',
          'rgb(59, 130, 246)',
          interpretation?.color || "#22c55e"
        ],
        borderWidth: 2
      }]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'تحلیل نمرات اضطراب',
          color: '#e5e7eb',
          font: { size: 16 }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 63,
          ticks: { color: '#9ca3af' },
          grid: { color: '#374151' }
        },
        x: {
          ticks: { color: '#9ca3af' },
          grid: { color: '#374151' }
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
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست اضطراب بک (BAI)</h1>
                <p className="text-secondaryTextColor">ارزیابی سطح اضطراب شما</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
                <div className="text-4xl font-bold mb-2" style={{ color: interpretation?.color || "#22c55e" }}>
                  {toFarsiNumber(totalScore || 0)}
                </div>
                <div className="text-sm text-secondaryTextColor">از {toFarsiNumber(63)}</div>
              </div>

              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نشانه‌های بدنی</h3>
                <div className="text-4xl font-bold text-purple-500 mb-2">{toFarsiNumber(somatic || 0)}</div>
                <div className="text-sm text-secondaryTextColor">از {toFarsiNumber(39)}</div>
              </div>

              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نشانه‌های شناختی</h3>
                <div className="text-4xl font-bold text-blue-500 mb-2">{toFarsiNumber(cognitive || 0)}</div>
                <div className="text-sm text-secondaryTextColor">از {toFarsiNumber(24)}</div>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">سطح اضطراب</h3>
              <div className="flex items-center gap-4">
                <div 
                  className="text-2xl font-bold"
                  style={{ color: interpretation?.color || "#22c55e" }}
                >
                  {interpretation?.level || "نامشخص"}
                </div>
                <div className="text-secondaryTextColor">{interpretation?.desc || ""}</div>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار تحلیل</h3>
              <div className="w-full h-80">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توصیه‌های تخصصی</h3>
              <ul className="space-y-3">
                {recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                    <span className="text-secondaryTextColor">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">تفسیر نشانه‌ها</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-purple-400 mb-2">نشانه‌های بدنی (سوماتیک)</h4>
                  <p className="text-sm text-secondaryTextColor">
                    تپش قلب، تنگی نفس، تنش عضلانی، گیجی، لرزش - این علائم پاسخ بدن به استرس هستند. 
                    تکنیک‌های آرام‌سازی بدنی و تنفس می‌توانند کمک‌کننده باشند.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-blue-400 mb-2">نشانه‌های شناختی</h4>
                  <p className="text-sm text-secondaryTextColor">
                    نگرانی‌ها، افکار فاجعه‌ساز، ترس از دست دادن کنترل - این افکار قابل تغییر هستند. 
                    بازسازی شناختی و مواجهه با نگرانی‌ها می‌توانند موثر باشند.
                  </p>
                </div>
              </div>
            </div>

            {totalScore > 25 && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6">
                <h4 className="font-medium text-red-400 mb-3">⚠️ هشدارهای مهم</h4>
                <ul className="text-sm text-red-300 space-y-2">
                  <li>• افکار خودآسیب‌رسان یا ناامیدی شدید</li>
                  <li>• حملات وحشت مکرر و ناتوان‌کننده</li>
                  <li>• اختلال شدید عملکرد شغلی یا بین‌فردی</li>
                </ul>
                <p className="text-sm text-red-300 mt-3">
                  در صورت وجود هر یک از موارد بالا، لطفاً فوراً با متخصص سلامت روان تماس بگیرید.
                </p>
              </div>
            )}

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره تست</h4>
              <p className="text-sm text-blue-300">
                تست اضطراب بک (BAI) یک ابزار استاندارد برای ارزیابی شدت علائم اضطراب است. 
                این تست 21 نشانه رایج اضطراب را می‌سنجد و به دو دسته بدنی و شناختی تقسیم می‌شود.
                BAI توسط آرون بک در سال 1988 توسعه یافته و یکی از معتبرترین ابزارهای سنجش اضطراب است.
              </p>
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
              <h1 className="text-2xl font-bold text-primaryTextColor">تست اضطراب بک (BAI)</h1>
              <p className="text-secondaryTextColor">سوال {toFarsiNumber(currentQuestion + 1)} از {toFarsiNumber(questions.length)}</p>
            </div>
          </div>

          <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
            <h2 
              key={`question-title-${currentQuestion}`}
              className="text-lg font-semibold text-primaryTextColor mb-2"
              style={{
                opacity: 0,
                animation: `questionTitleSlideIn 0.5s ease-out 0.2s forwards`,
                animationFillMode: 'forwards',
              }}
            >
              در هفته گذشته، تا چه حد این علامت را تجربه کرده‌اید؟
            </h2>
            <h3 
              key={`question-text-${currentQuestion}`}
              className="text-xl font-bold text-primaryThemeColor mb-6"
              style={{
                opacity: 0,
                animation: `questionTextSlideIn 0.5s ease-out 0.4s forwards`,
                animationFillMode: 'forwards',
              }}
            >
              {questions[currentQuestion].text}
            </h3>

            <div className="space-y-3">
              {options.map((option, index) => (
                <button
                  key={`${currentQuestion}-${option.value}`}
                  onClick={() => handleAnswer(option.value)}
                  className="w-full p-4 text-right bg-secondaryThemeColor hover:bg-primaryThemeColor/10 rounded-xl border border-borderColor hover:border-primaryThemeColor/40"
                  style={{
                    opacity: 0,
                    animation: `testOptionFadeIn 0.4s ease-out ${0.6 + index * 0.1}s forwards`,
                    animationFillMode: 'forwards',
                  }}
                >
                  <span className="text-primaryTextColor font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="w-full bg-darkThemeColor rounded-2xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-secondaryTextColor">
                پیشرفت: {toFarsiNumber(Math.round(((currentQuestion + 1) / questions.length) * 100))}%
              </span>
              <div className="w-32 h-2 bg-secondaryThemeColor rounded-full overflow-hidden">
                <div
                  className="h-full bg-primaryThemeColor rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                ></div>
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








