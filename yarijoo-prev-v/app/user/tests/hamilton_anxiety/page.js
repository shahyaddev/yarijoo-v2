"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaBrain } from "react-icons/fa";
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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("hamilton_anxiety");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questionsData = useMemo(() => [
    { text: "خلق مضطرب: نگرانی، انتظار بدترین اتفاق، ترس", type: "psychic" },
    { text: "تنش: احساس تنش، خستگی، لرزش، گریه آسان، بی‌قراری", type: "psychic" },
    { text: "ترس‌ها: تاریکی، غریبه‌ها، تنها ماندن، حیوانات، ترافیک، جمعیت", type: "psychic" },
    { text: "بی‌خوابی: مشکل خوابیدن، خواب ناآرام، خواب ناکافی، خستگی صبح", type: "psychic" },
    { text: "شناختی: تمرکز ضعیف، حافظه ضعیف", type: "psychic" },
    { text: "خلق افسرده: از دست دادن علاقه، کمبود لذت، افسردگی، بیداری زود، نوسانات روزانه", type: "psychic" },
    { text: "عضلانی: درد و ناراحتی عضلات، سفتی، تکان عضلانی، دندان قروچه، صدای لرزان", type: "somatic" },
    { text: "حسی: زنگ گوش، تاری دید، گرگرفتگی یا سردی، احساس ضعف، احساس سوزن شدن", type: "somatic" },
    { text: "قلبی عروقی: تاکی‌کاردی، تپش، درد قفسه، نبض شدید، احساس ضعف", type: "somatic" },
    { text: "تنفسی: فشار قفسه سینه، احساس خفگی، آه کشیدن، تنگی نفس", type: "somatic" },
    { text: "گوارشی: مشکل بلع، باد، درد شکم، سوزش، احساس پری، تهوع، استفراغ، شل شدن مدفوع", type: "somatic" },
    { text: "ادراری تناسلی: تکرر ادرار، فوریت، بی‌قاعدگی، سردی، زودانزالی، نعوظ ضعیف", type: "somatic" },
    { text: "خودمختار: دهان خشک، سرخ شدن، رنگ پریدگی، تمایل به عرق، سرگیجه، سردرد تنشی", type: "somatic" },
    { text: "رفتار در مصاحبه: بی‌قرار، لرزش دست، اخم، چهره متشنج، آه کشیدن، رنگ پریدگی", type: "behavior" }
  ], []);

  const questions = useMemo(() => questionsData.map(q => q.text), [questionsData]);

  const options = useMemo(() => [
    { value: 0, label: "وجود ندارد" },
    { value: 1, label: "خفیف" },
    { value: 2, label: "متوسط" },
    { value: 3, label: "شدید" },
    { value: 4, label: "بسیار شدید" }
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
    let total = 0;
    let psychic = 0;
    let somatic = 0;

    questionsData.forEach((q, idx) => {
      const answer = answers[idx] || 0;
      total += answer;
      
      if (q.type === "psychic") {
        psychic += answer;
      } else if (q.type === "somatic") {
        somatic += answer;
      }
    });

    return { total, psychic, somatic };
  };

  const calculateScore = () => calculateScores().total;

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
    const { total } = scores;
    const maxScore = 56; // 14 questions * 4 points each

    if (total <= 17) {
      return {
        level: "اضطراب خفیف",
        color: "#22c55e",
        desc: "شما علائم اضطراب خفیفی دارید که معمولاً قابل کنترل است.",
        details: "نمره شما نشان می‌دهد که اضطراب در سطح خفیفی است و تأثیر محدودی بر عملکرد روزانه شما دارد. این سطح از اضطراب ممکن است طبیعی باشد و با تکنیک‌های ساده مدیریت استرس قابل کنترل است.",
        strengths: [
          "سطح پایین اضطراب",
          "عملکرد مناسب در زندگی روزمره",
          "کنترل نسبی بر علائم",
          "عدم اختلال جدی در فعالیت‌ها"
        ],
        recommendations: [
          "تمرین تکنیک‌های آرام‌سازی (نفس عمیق، مدیتیشن)",
          "ورزش منظم و فعالیت بدنی",
          "خواب کافی و منظم",
          "محدود کردن مصرف کافئین",
          "مدیریت زمان و کاهش استرس",
          "حفظ ارتباطات اجتماعی"
        ]
      };
    } else if (total <= 24) {
      return {
        level: "اضطراب متوسط",
        color: "#eab308",
        desc: "اضطراب شما در سطح متوسطی است که نیاز به توجه و مدیریت دارد.",
        details: "نمره شما نشان می‌دهد که اضطراب در سطح متوسطی قرار دارد و می‌تواند بر برخی از جنبه‌های زندگی روزمره شما تأثیر بگذارد. با مداخله مناسب و استفاده از تکنیک‌های درمانی، می‌توانید اضطراب را به طور مؤثری مدیریت کنید.",
        strengths: [
          "آگاهی از وضعیت اضطراب",
          "انگیزه برای بهبود",
          "امکان پاسخ به درمان",
          "برخی مهارت‌های مقابله"
        ],
        recommendations: [
          "مشاوره با روان‌شناس برای درمان شناختی-رفتاری (CBT)",
          "یادگیری تکنیک‌های مدیریت اضطراب",
          "برنامه‌ریزی برای کاهش عوامل استرس‌زا",
          "تمرینات ذهن‌آگاهی و مدیتیشن منظم",
          "درمان دارویی در صورت نیاز (با تجویز پزشک)",
          "گروه‌درمانی یا گروه‌های حمایتی"
        ]
      };
    } else if (total <= 30) {
      return {
        level: "اضطراب شدید",
        color: "#f97316",
        desc: "شما اضطراب شدیدی دارید که به طور قابل توجهی زندگی شما را تحت تأثیر قرار می‌دهد.",
        details: "نمره شما نشان‌دهنده اضطراب شدید است که می‌تواند تأثیر قابل توجهی بر عملکرد شغلی، روابط و کیفیت زندگی شما داشته باشد. این سطح از اضطراب نیازمند مداخله حرفه‌ای فوری است.",
        strengths: [
          "شناسایی مشکل",
          "جستجوی کمک حرفه‌ای",
          "پتانسیل بهبود با درمان مناسب"
        ],
        recommendations: [
          "مراجعه فوری به روان‌پزشک یا روان‌شناس بالینی",
          "درمان شناختی-رفتاری فشرده (CBT)",
          "درمان دارویی تحت نظارت پزشکی",
          "یادگیری تکنیک‌های پیشرفته مدیریت اضطراب",
          "بررسی و درمان اختلالات همزمان",
          "گروه‌درمانی تخصصی",
          "تغییرات سبک زندگی (رژیم غذایی، ورزش، خواب)"
        ]
      };
    } else {
      return {
        level: "اضطراب بسیار شدید",
        color: "#ef4444",
        desc: "شما اضطراب بسیار شدیدی دارید که نیاز به مداخله فوری و تخصصی دارد.",
        details: "نمره شما نشان‌دهنده اضطراب بسیار شدید است که به شدت بر تمام جنبه‌های زندگی شما تأثیر می‌گذارد. این وضعیت نیازمند مراقبت فوری و درمان تخصصی توسط متخصص سلامت روان است.",
        strengths: [
          "پذیرش شدت مشکل",
          "جستجوی کمک فوری",
          "آمادگی برای درمان فشرده"
        ],
        recommendations: [
          "مراجعه فوری و اورژانسی به روان‌پزشک",
          "برنامه درمانی جامع و فشرده",
          "درمان دارویی تحت نظارت دقیق پزشکی",
          "CBT تخصصی و فشرده",
          "احتمال بستری یا درمان سرپایی فشرده",
          "بررسی کامل علل و عوامل اضطراب",
          "حمایت کامل خانواده و دوستان",
          "پیگیری منظم و طولانی‌مدت"
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
      labels: ["نمره کل", "اضطراب روانی", "اضطراب جسمی", "حداکثر نمره"],
      datasets: [
        {
          label: "HAM-A Scores",
          data: [scores.total, scores.psychic, scores.somatic, 56],
          backgroundColor: [interpretation.color, "#3b82f6", "#10b981", "#64748b"],
          borderColor: [interpretation.color, "#2563eb", "#059669", "#475569"],
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
          text: "مقیاس اضطراب همیلتون (HAM-A)",
          font: { size: 14, family: "Vazirmatn" },
          color: "#e2e8f0"
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 56,
          ticks: { color: "#94a3b8", font: { family: "Vazirmatn" } },
          grid: { color: "#334155" }
        },
        x: {
          ticks: { color: "#94a3b8", font: { family: "Vazirmatn" } },
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
                <FaBrain className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج مقیاس اضطراب همیلتون</h1>
                <p className="text-secondaryTextColor">Hamilton Anxiety Rating Scale (HAM-A)</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-darkThemeColor rounded-xl p-3">
                <div className="text-xs text-secondaryTextColor mb-1">اضطراب روانی</div>
                <div className="text-xl font-bold text-blue-500">{scores.psychic}</div>
              </div>
              <div className="bg-darkThemeColor rounded-xl p-3">
                <div className="text-xs text-secondaryTextColor mb-1">اضطراب جسمی</div>
                <div className="text-xl font-bold text-green-500">{scores.somatic}</div>
              </div>
              <div className="bg-darkThemeColor rounded-xl p-3">
                <div className="text-xs text-secondaryTextColor mb-1">نمره کل</div>
                <div className="text-xl font-bold" style={{ color: interpretation.color }}>
                  {scores.total} از 56
                </div>
              </div>
            </div>

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سطح اضطراب</h3>
              <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>
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
              <FaBrain className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">مقیاس اضطراب همیلتون (HAM-A)</h1>
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