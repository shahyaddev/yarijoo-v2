"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaStar } from "react-icons/fa";
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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("geas");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questionsData = useMemo(() => [
    { text: "مطمئنم که می‌توانم به اهدافم برسم", dimension: "magnitude" },
    { text: "در رسیدن به اهدافم موفق خواهم شد", dimension: "magnitude" },
    { text: "حتی اگر سخت باشد، به اهدافم می‌رسم", dimension: "strength" },
    { text: "با وجود موانع، ادامه می‌دهم", dimension: "strength" },
    { text: "اهداف در زمینه‌های مختلف دارم", dimension: "generality" },
    { text: "می‌توانم در موقعیت‌های مختلف موفق شوم", dimension: "generality" }
  ], []);

  const questions = useMemo(() => questionsData.map(q => q.text), [questionsData]);

  const options = useMemo(() => [
    { value: 1, label: "کاملاً مخالفم" },
    { value: 2, label: "مخالفم" },
    { value: 3, label: "کمی مخالفم" },
    { value: 4, label: "نه موافق نه مخالف" },
    { value: 5, label: "کمی موافقم" },
    { value: 6, label: "موافقم" },
    { value: 7, label: "کاملاً موافقم" }
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
    return Object.values(answers).reduce((sum, score) => sum + score, 0);
  };

  const calculateDimensions = () => {
    let magnitude = 0;
    let strength = 0;
    let generality = 0;
    
    questionsData.forEach((q, idx) => {
      const answer = answers[idx] || 1;
      if (q.dimension === "magnitude") magnitude += answer;
      else if (q.dimension === "strength") strength += answer;
      else if (q.dimension === "generality") generality += answer;
    });
    
    return { magnitude, strength, generality };
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
    if (score <= 12) {
      return {
        level: "خودکارآمدی بسیار پایین",
        color: "#dc2626",
        desc: "سطح خودکارآمدی شما بسیار پایین است. شما به توانایی‌های خود برای رسیدن به اهداف باور ندارید.",
        details: "نمره شما نشان می‌دهد که باور بسیار ضعیفی به توانایی‌های خود دارید. این می‌تواند منجر به اجتناب از چالش‌ها، تسلیم سریع و عدم تلاش کافی شود. خودکارآمدی پایین یکی از عوامل اصلی شکست در دستیابی به اهداف است.",
        strengths: [
          "آگاهی از وضعیت فعلی خود",
          "امکان تقویت خودکارآمدی",
          "توانایی یادگیری مهارت‌های جدید"
        ],
        recommendations: [
          "مشاوره با روان‌درمانگر برای تقویت خودکارآمدی",
          "شروع با اهداف بسیار کوچک و آسان",
          "ثبت و جشن گرفتن هر موفقیت کوچک",
          "یادآوری موفقیت‌های گذشته",
          "الگوبرداری از افراد موفق",
          "تمرین مهارت‌های جدید با صبر و حوصله",
          "پرهیز از مقایسه با دیگران",
          "تقویت گفتمان درونی مثبت"
        ]
      };
    } else if (score <= 21) {
      return {
        level: "خودکارآمدی پایین",
        color: "#f59e0b",
        desc: "خودکارآمدی شما در سطح پایینی قرار دارد. شما اغلب به توانایی‌های خود شک می‌کنید.",
        details: "شما باور کافی به توانایی‌های خود برای انجام کارها و رسیدن به اهداف ندارید. این می‌تواند باعث شود از فرصت‌ها استفاده نکنید و زودتر از موعد تسلیم شوید.",
        strengths: [
          "برخی باورهای مثبت نسبت به توانایی‌ها",
          "تمایل به بهبود",
          "پتانسیل برای رشد خودکارآمدی"
        ],
        recommendations: [
          "تعیین اهداف واقع‌بینانه و قابل دستیابی",
          "شکستن اهداف بزرگ به قدم‌های کوچک",
          "یادگیری از موفقیت‌های دیگران (مدل‌سازی)",
          "دریافت بازخورد مثبت و تشویق",
          "تمرین مهارت‌های مورد نیاز",
          "کاهش استرس و اضطراب",
          "ایجاد تجربیات موفقیت",
          "چالش کردن افکار منفی خودکارآمدی"
        ]
      };
    } else if (score <= 30) {
      return {
        level: "خودکارآمدی متوسط",
        color: "#eab308",
        desc: "خودکارآمدی شما در سطح متوسطی است. در برخی موقعیت‌ها به خود اطمینان دارید و در برخی دیگر شک می‌کنید.",
        details: "شما باور متوسطی به توانایی‌های خود دارید. این سطح کافی برای انجام کارهای معمولی است، اما برای چالش‌های بزرگ و دستیابی به اهداف مهم نیاز به تقویت دارد.",
        strengths: [
          "باور نسبی به توانایی‌های خود",
          "موفقیت در برخی زمینه‌ها",
          "توانایی رویارویی با چالش‌های متوسط",
          "انگیزه برای پیشرفت"
        ],
        recommendations: [
          "تقویت مستمر خودکارآمدی در زمینه‌های مختلف",
          "تجربه موفقیت‌های بیشتر (Mastery Experiences)",
          "مشاهده موفقیت دیگران (Vicarious Experience)",
          "دریافت تشویق و ترغیب لفظی (Verbal Persuasion)",
          "مدیریت حالات فیزیولوژیکی و هیجانی",
          "تعیین اهداف چالش‌برانگیزتر به تدریج",
          "یادگیری مهارت‌های جدید"
        ]
      };
    } else if (score <= 36) {
      return {
        level: "خودکارآمدی خوب",
        color: "#10b981",
        desc: "شما خودکارآمدی خوبی دارید. به توانایی‌های خود اعتماد دارید و می‌توانید چالش‌ها را با موفقیت انجام دهید.",
        details: "باور قوی شما به توانایی‌های خود باعث می‌شود چالش‌ها را بپذیرید، در برابر شکست‌ها مقاوم باشید و به اهداف خود برسید. خودکارآمدی بالا یکی از مهم‌ترین عوامل موفقیت در زندگی است.",
        strengths: [
          "اعتماد قوی به توانایی‌های خود",
          "پذیرش چالش‌های جدید",
          "مقاومت در برابر موانع",
          "انگیزه بالا برای دستیابی به اهداف",
          "بازیابی سریع پس از شکست"
        ],
        recommendations: [
          "حفظ و تقویت سطح فعلی",
          "پذیرش چالش‌های بزرگ‌تر",
          "کمک به دیگران برای تقویت خودکارآمدی‌شان",
          "اشتراک تجربیات موفق",
          "ادامه یادگیری و رشد",
          "منتورینگ و مربیگری دیگران"
        ]
      };
    } else {
      return {
        level: "خودکارآمدی بسیار بالا",
        color: "#22c55e",
        desc: "شما خودکارآمدی عالی و استثنایی دارید! به توانایی‌های خود اطمینان کامل دارید.",
        details: "نمره شما نشان‌دهنده باور قوی و استوار به توانایی‌های خود در ابعاد مختلف (Magnitude, Strength, Generality) است. این سطح از خودکارآمدی با موفقیت استثنایی، پایداری فوق‌العاده، و دستیابی به اهداف چالش‌برانگیز همراه است.",
        strengths: [
          "اعتماد کامل به توانایی‌های خود",
          "پذیرش چالش‌های بسیار سخت",
          "مقاومت استثنایی در برابر شکست",
          "انگیزه و اراده فوق‌العاده",
          "موفقیت در زمینه‌های متنوع",
          "الهام‌بخشی برای دیگران"
        ],
        recommendations: [
          "حفظ این سطح عالی از خودکارآمدی",
          "پذیرش اهداف بزرگ و تحول‌آفرین",
          "رهبری و الگو بودن برای دیگران",
          "مربیگری و منتورینگ",
          "اشتراک استراتژی‌های موفقیت خود",
          "کمک به جامعه با استفاده از توانایی‌های خود"
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
    const dimensions = calculateDimensions();
    const interpretation = getInterpretation(score);

    const chartData = {
      labels: ["نمره کل", "Magnitude", "Strength", "Generality"],
      datasets: [
        {
          label: "خودکارآمدی",
          data: [score, dimensions.magnitude, dimensions.strength, dimensions.generality],
          backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"],
          borderColor: ["#2563eb", "#059669", "#d97706", "#7c3aed"],
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
          text: "تحلیل سه بعدی خودکارآمدی (GEAS)",
          font: { size: 14, family: "Vazirmatn" },
          color: "#e2e8f0"
        }
      },
      scales: {
        y: {
          beginAtZero: true,
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
                <FaStar className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج مقیاس خودکارآمدی عمومی</h1>
                <p className="text-secondaryTextColor">General Self-Efficacy (GEAS)</p>
              </div>
            </div>

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل</h3>
              <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>
                {score} از 42
              </div>
              <div className="text-lg font-semibold mb-4" style={{ color: interpretation.color }}>
                {interpretation.level}
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-secondaryThemeColor rounded-xl p-4">
                  <div className="text-sm text-secondaryTextColor mb-1">Magnitude</div>
                  <div className="text-2xl font-bold text-green-500">{dimensions.magnitude}</div>
                  <div className="text-xs text-secondaryTextColor mt-1">بزرگی اهداف</div>
                </div>
                <div className="bg-secondaryThemeColor rounded-xl p-4">
                  <div className="text-sm text-secondaryTextColor mb-1">Strength</div>
                  <div className="text-2xl font-bold text-orange-500">{dimensions.strength}</div>
                  <div className="text-xs text-secondaryTextColor mt-1">قدرت باور</div>
                </div>
                <div className="bg-secondaryThemeColor rounded-xl p-4">
                  <div className="text-sm text-secondaryTextColor mb-1">Generality</div>
                  <div className="text-2xl font-bold text-purple-500">{dimensions.generality}</div>
                  <div className="text-xs text-secondaryTextColor mt-1">تعمیم‌پذیری</div>
                </div>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">سه بعد خودکارآمدی</h3>
              <div className="space-y-3 text-secondaryTextColor">
                <p><strong className="text-green-500">Magnitude (بزرگی):</strong> سطح دشواری کارهایی که باور دارید می‌توانید انجام دهید</p>
                <p><strong className="text-orange-500">Strength (قدرت):</strong> قدرت باور شما به توانایی‌هایتان، حتی در مواجهه با موانع</p>
                <p><strong className="text-purple-500">Generality (تعمیم):</strong> دامنه موقعیت‌هایی که در آن‌ها به خود اطمینان دارید</p>
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
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">نمودار ابعاد خودکارآمدی</h3>
              <div style={{ height: "300px" }}>
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">چهار منبع خودکارآمدی (Bandura)</h3>
              <ol className="list-decimal list-inside space-y-2 text-secondaryTextColor">
                <li><strong>تجربیات موفقیت (Mastery):</strong> قوی‌ترین منبع - موفقیت‌های واقعی</li>
                <li><strong>مشاهده دیگران (Modeling):</strong> دیدن موفقیت افراد مشابه</li>
                <li><strong>ترغیب لفظی (Persuasion):</strong> تشویق و بازخورد مثبت</li>
                <li><strong>حالات فیزیولوژیکی:</strong> مدیریت استرس و هیجانات</li>
              </ol>
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
              <FaStar className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">مقیاس خودکارآمدی عمومی</h1>
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
