"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaBalanceScale } from "react-icons/fa";
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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("emotional_balance_spindiner");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questionsData = useMemo(() => [
    { text: "من معمولاً احساس شادی و رضایت می‌کنم", reverse: false },
    { text: "وقتی مشکلی پیش می‌آید، به راحتی ناراحت می‌شوم", reverse: true },
    { text: "من اغلب احساس امیدواری و خوشبینی دارم", reverse: false },
    { text: "در موقعیت‌های استرس‌زا به راحتی مضطرب می‌شوم", reverse: true },
    { text: "من معمولاً احساس آرامش و تعادل دارم", reverse: false },
    { text: "وقتی کسی مرا ناراحت می‌کند، مدت زیادی عصبانی می‌مانم", reverse: true },
    { text: "من اغلب احساس قدردانی و شکرگزاری می‌کنم", reverse: false },
    { text: "در مواجهه با تغییرات، احساس ترس و نگرانی می‌کنم", reverse: true },
    { text: "من معمولاً احساس اعتماد به نفس و اطمینان دارم", reverse: false },
    { text: "وقتی کارها طبق برنامه پیش نمی‌رود، به راحتی ناامید می‌شوم", reverse: true },
    { text: "من اغلب احساس رضایت از زندگی دارم", reverse: false },
    { text: "در روابط با دیگران، اغلب احساس ناامنی می‌کنم", reverse: true },
    { text: "من معمولاً احساس انرژی و انگیزه دارم", reverse: false },
    { text: "وقتی کسی از من انتقاد می‌کند، به راحتی ناراحت می‌شوم", reverse: true },
    { text: "من اغلب احساس شادی و خوشحالی می‌کنم", reverse: false },
    { text: "در موقعیت‌های جدید، احساس اضطراب و نگرانی می‌کنم", reverse: true },
    { text: "من معمولاً احساس صلح و آرامش درونی دارم", reverse: false },
    { text: "وقتی مشکلی پیش می‌آید، به راحتی احساس درماندگی می‌کنم", reverse: true },
    { text: "من اغلب احساس قدردانی از چیزهای خوب زندگی می‌کنم", reverse: false },
    { text: "در روابط عاطفی، اغلب احساس ناامنی و ترس می‌کنم", reverse: true },
    { text: "من معمولاً احساس رضایت از خودم دارم", reverse: false },
    { text: "وقتی کسی مرا رد می‌کند، به راحتی احساس بی‌ارزشی می‌کنم", reverse: true },
    { text: "من اغلب احساس امید و خوشبینی نسبت به آینده دارم", reverse: false },
    { text: "در موقعیت‌های اجتماعی، اغلب احساس نگرانی و اضطراب می‌کنم", reverse: true },
    { text: "من معمولاً احساس تعادل و هماهنگی درونی دارم", reverse: false }
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

  const calculateScore = () => {
    let total = 0;
    questionsData.forEach((q, idx) => {
      const answer = answers[idx] || 1;
      if (q.reverse) {
        total += (6 - answer);
      } else {
        total += answer;
      }
    });
    return total;
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


  const getInterpretation = (score) => {
    if (score <= 50) {
      return {
        level: "عدم تعادل عاطفی شدید",
        color: "#dc2626",
        desc: "شما دچار عدم تعادل عاطفی قابل توجهی هستید. احساسات منفی به طور مکرر و شدید تجربه می‌کنید.",
        details: "نمره شما نشان می‌دهد که تنظیم احساسات برای شما بسیار دشوار است و احساسات منفی مانند اضطراب، ناامیدی و خشم به طور مکرر و شدید تجربه می‌کنید. این وضعیت نیازمند مداخله حرفه‌ای است.",
        strengths: [
          "آگاهی از وجود مشکل",
          "شجاعت برای شناخت احساسات",
          "امکان بهبود با درمان مناسب"
        ],
        recommendations: [
          "مراجعه فوری به روان‌درمانگر",
          "آموزش مهارت‌های تنظیم هیجان (DBT)",
          "تمرینات ذهن‌آگاهی روزانه",
          "یادگیری تکنیک‌های آرام‌سازی",
          "بررسی نیاز به درمان دارویی",
          "شرکت در گروه‌های حمایتی",
          "ورزش منظم برای کاهش استرس",
          "بهبود الگوهای خواب"
        ]
      };
    } else if (score <= 75) {
      return {
        level: "عدم تعادل عاطفی متوسط",
        color: "#f59e0b",
        desc: "شما دچار عدم تعادل عاطفی متوسطی هستید. گاهی کنترل احساسات برایتان دشوار می‌شود.",
        details: "تنظیم احساسات برای شما در برخی موقعیت‌ها چالش‌برانگیز است. شما ممکن است دچار نوسانات خلقی شوید و در مواجهه با استرس یا تغییرات دچار واکنش‌های شدید عاطفی شوید.",
        strengths: [
          "توانایی نسبی در تنظیم احساسات",
          "برخی لحظات آرامش و تعادل",
          "آگاهی از نیاز به بهبود",
          "انگیزه برای یادگیری"
        ],
        recommendations: [
          "مشاوره برای یادگیری مهارت‌های تنظیم هیجان",
          "تمرین تکنیک‌های ذهن‌آگاهی",
          "یادگیری مهارت‌های مقابله‌ای سالم",
          "تمرین تنفس عمیق و آرام‌سازی",
          "نوشتن احساسات (journaling)",
          "شناسایی محرک‌های احساسی",
          "ایجاد شبکه حمایت اجتماعی",
          "ورزش منظم"
        ]
      };
    } else if (score <= 100) {
      return {
        level: "تعادل عاطفی نسبی",
        color: "#eab308",
        desc: "شما تعادل عاطفی نسبی دارید، اما هنوز فضای بهبود وجود دارد.",
        details: "شما توانایی نسبتاً خوبی در مدیریت احساسات دارید، اما در برخی موقعیت‌های چالش‌برانگیز ممکن است دچار نوسان عاطفی شوید. با تقویت مهارت‌ها می‌توانید به تعادل بهتری برسید.",
        strengths: [
          "توانایی خوب در تنظیم احساسات",
          "کنترل نسبی بر واکنش‌های عاطفی",
          "توانایی بازیابی پس از استرس",
          "آگاهی از احساسات خود"
        ],
        recommendations: [
          "تقویت مهارت‌های ذهن‌آگاهی",
          "تمرین پذیرش احساسات",
          "یادگیری استراتژی‌های مقابله‌ای پیشرفته‌تر",
          "تقویت روابط حمایتی",
          "حفظ روتین سالم",
          "تمرینات خودشناسی"
        ]
      };
    } else if (score <= 112) {
      return {
        level: "تعادل عاطفی خوب",
        color: "#10b981",
        desc: "شما تعادل عاطفی خوبی دارید. اکثر اوقات احساسات خود را به خوبی مدیریت می‌کنید.",
        details: "شما مهارت‌های خوبی در تنظیم احساسات، مدیریت استرس و حفظ خلق مثبت دارید. احساسات منفی را به طور سالم پردازش می‌کنید و به سرعت به حالت تعادل باز می‌گردید.",
        strengths: [
          "کنترل خوب بر احساسات",
          "مقاومت در برابر استرس",
          "خلق مثبت و پایدار",
          "توانایی بازیابی سریع",
          "مهارت‌های مقابله‌ای سالم",
          "خودآگاهی عاطفی بالا"
        ],
        recommendations: [
          "حفظ و تقویت مهارت‌های فعلی",
          "کمک به دیگران در یادگیری تنظیم هیجان",
          "ادامه تمرینات ذهن‌آگاهی",
          "چالش‌های جدید برای رشد",
          "حفظ تعادل کار-زندگی",
          "توجه به سلامت جسمی"
        ]
      };
    } else {
      return {
        level: "تعادل عاطفی عالی",
        color: "#22c55e",
        desc: "شما تعادل عاطفی عالی دارید! احساسات خود را به طور ماهرانه مدیریت می‌کنید و خلق مثبت و پایداری دارید.",
        details: "نمره عالی شما نشان می‌دهد که در تنظیم احساسات، مدیریت استرس و حفظ خلق مثبت بسیار ماهر هستید. شما نمونه‌ای از سلامت روانی و تعادل عاطفی هستید.",
        strengths: [
          "مهارت استثنایی در تنظیم احساسات",
          "مقاومت بسیار بالا در برابر استرس",
          "خلق مثبت و پایدار",
          "بازیابی بسیار سریع از مشکلات",
          "خودآگاهی عاطفی عالی",
          "مهارت‌های مقابله‌ای پیشرفته",
          "الهام‌بخش برای دیگران"
        ],
        recommendations: [
          "ادامه مسیر فعلی",
          "الگو و منتور بودن برای دیگران",
          "اشتراک تجربیات و مهارت‌ها",
          "کمک به افراد با مشکلات تنظیم هیجان",
          "ادامه یادگیری و رشد",
          "توجه به ابعاد دیگر سلامت"
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
    // استفاده از نمره ذخیره شده یا محاسبه شده
    const score = savedScore !== null ? savedScore : (previousResult?.total_score !== undefined ? previousResult.total_score : calculateScore());
    const interpretation = getInterpretation(score);

    const chartData = {
      labels: ["نمره شما", "حداقل", "متوسط", "حداکثر"],
      datasets: [
        {
          label: "تعادل عاطفی",
          data: [score, 25, 75, 125],
          backgroundColor: ["#3b82f6", "#dc2626", "#eab308", "#22c55e"],
          borderColor: ["#2563eb", "#b91c1c", "#ca8a04", "#16a34a"],
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
          text: "مقیاس تعادل عاطفی",
          font: { size: 14, family: "Vazirmatn" },
          color: "#e2e8f0"
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 125,
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
                <FaBalanceScale className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست تعادل عاطفی</h1>
                <p className="text-secondaryTextColor">Emotional Balance Scale</p>
              </div>
            </div>

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
              <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>
                {score} از 125
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
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">نمودار تعادل عاطفی</h3>
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
              <FaBalanceScale className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">تست تعادل عاطفی</h1>
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
