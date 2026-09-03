"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaHeart } from "react-icons/fa";
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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("ahs");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questionsData = useMemo(() => [
    { text: "می‌توانم راه‌های زیادی برای حل مشکل فکر کنم", reverse: false, subscale: "pathways" },
    { text: "با انرژی به دنبال اهدافم می‌روم", reverse: false, subscale: "agency" },
    { text: "احساس خستگی دارم", reverse: true, subscale: "agency" },
    { text: "راه‌های متعددی برای دور زدن مشکل وجود دارد", reverse: false, subscale: "pathways" },
    { text: "به اهداف که تعیین کرده‌ام می‌رسم", reverse: false, subscale: "agency" },
    { text: "نگران سلامتی‌ام هستم", reverse: true, subscale: "agency" },
    { text: "حتی وقتی دیگران تسلیم می‌شوند، من راهی پیدا می‌کنم", reverse: false, subscale: "pathways" },
    { text: "نمی‌دانم چطور به اهدافم برسم", reverse: true, subscale: "pathways" },
    { text: "در گذشته به موفقیت رسیده‌ام", reverse: false, subscale: "agency" },
    { text: "به اهداف که تعیین کرده‌ام می‌رسم", reverse: false, subscale: "agency" },
    { text: "اهداف فعلی‌ام را دنبال می‌کنم", reverse: false, subscale: "agency" },
    { text: "راه‌های متعدد برای حل دارم", reverse: false, subscale: "pathways" }
  ], []);

  const questions = useMemo(() => questionsData.map(q => q.text), [questionsData]);

  const options = useMemo(() => [
    { value: 1, label: "کاملاً نادرست" },
    { value: 2, label: "نادرست" },
    { value: 3, label: "کمی نادرست" },
    { value: 4, label: "کمی درست" },
    { value: 5, label: "درست" },
    { value: 6, label: "بیشتر درست" },
    { value: 7, label: "کاملاً درست" },
    { value: 8, label: "قطعاً درست" }
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
        total += (9 - answer);
      } else {
        total += answer;
      }
    });
    return total;
  };

  const calculateSubscales = () => {
    let pathways = 0;
    let agency = 0;
    
    questionsData.forEach((q, idx) => {
      const answer = answers[idx] || 1;
      const score = q.reverse ? (9 - answer) : answer;

      
      if (q.subscale === "pathways") {
        pathways += score;
      } else {
        agency += score;
      }
    });
    
    return { pathways, agency };
  };

  // ذخیره نتیجه بعد از تکمیل
  useEffect(() => {
    const saveResultToServer = async () => {
      if (isCompleted && !hasResult && Object.keys(answers).length === questions.length) {
        
        const score = calculateScore();
        const interpretation = getInterpretation(score);
        
        try {
          // تبدیل answers به آرایه
          const answersArray = questions.map((q, idx) => {
            const answer = answers[idx];
            if (answer !== undefined) {
              return answer;
            }
            return 0;
          });

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
    if (score <= 38) {
      return {
        level: "امید بسیار پایین",
        color: "#dc2626",
        desc: "سطح امید شما بسیار پایین است. شما احساس ناامیدی از دستیابی به اهداف می‌کنید و مشکل در دیدن راه‌های پیش رو دارید.",
        details: "نمره شما نشان می‌دهد که هم در تفکر راه‌ها (Pathway Thinking) و هم در اراده و انگیزه (Agency Thinking) دچار مشکل جدی هستید. این وضعیت می‌تواند با افسردگی، اضطراب و احساس درماندگی همراه باشد.",
        strengths: [
          "آگاهی از وضعیت فعلی خود",
          "شجاعت برای تکمیل این آزمون",
          "امکان بازیابی و رشد امید"
        ],
        recommendations: [
          "مشاوره فوری با روان‌درمانگر متخصص در Hope Therapy",
          "غربالگری برای افسردگی و اضطراب",
          "شروع با اهداف بسیار کوچک و قابل دستیابی",
          "تمرین روزانه فکر کردن به راه‌های مختلف برای حل مسائل",
          "نوشتن موفقیت‌های گذشته (حتی کوچک‌ترین‌ها)",
          "جستجوی حمایت اجتماعی قوی",
          "پرهیز از ایزوله شدن",
          "شرکت در گروه‌های حمایتی"
        ]
      };
    } else if (score <= 48) {
      return {
        level: "امید پایین",
        color: "#f59e0b",
        desc: "سطح امید شما پایین است. گاهی احساس ناامیدی می‌کنید و دیدن راه‌های مختلف برای رسیدن به اهداف برایتان دشوار است.",
        details: "شما در یکی یا هر دو جنبه امید (راه‌ها یا اراده) دچار ضعف هستید. این می‌تواند منجر به تسلیم سریع، اجتناب از اهداف چالش‌برانگیز و کاهش کیفیت زندگی شود.",
        strengths: [
          "برخی جنبه‌های امید هنوز باقی است",
          "ظرفیت برای رشد و تقویت امید",
          "تمایل به بهبود",
          "برخی اهداف را دنبال می‌کنید"
        ],
        recommendations: [
          "مشاوره با روان‌درمانگر برای تقویت امید",
          "تمرین روزانه تعیین اهداف کوچک و دستیابی به آن‌ها",
          "فکر کردن به حداقل 2-3 راه برای هر هدف",
          "ثبت و جشن گرفتن موفقیت‌های روزانه",
          "یادآوری موفقیت‌های گذشته",
          "تقویت باور به توانایی‌های خود",
          "شناسایی و چالش کردن افکار منفی",
          "زمان گذراندن با افراد امیدوار"
        ]
      };
    } else if (score <= 58) {
      return {
        level: "امید متوسط",
        color: "#eab308",
        desc: "امید شما در سطح متوسطی قرار دارد. گاهی امیدوار هستید و گاهی احساس ناامیدی می‌کنید.",
        details: "شما توانایی نسبی در تفکر راه‌ها و اراده برای اقدام دارید، اما این توانایی‌ها هنوز به اندازه کافی قوی نیستند. با تمرین و تلاش می‌توانید سطح امید خود را به طور قابل توجهی افزایش دهید.",
        strengths: [
          "توانایی نسبی در دیدن راه‌های مختلف",
          "انگیزه متوسط برای تلاش",
          "تجربه برخی موفقیت‌ها",
          "پیگیری برخی اهداف",
          "انعطاف‌پذیری نسبی"
        ],
        recommendations: [
          "تقویت هر دو جنبه امید (راه‌ها و اراده)",
          "تمرین روزانه Pathway Thinking: برای هر مشکل 3 راه فکر کنید",
          "تمرین Agency Thinking: تکرار جملات تقویت‌کننده خود",
          "تعیین اهداف SMART (مشخص، قابل اندازه‌گیری، قابل دستیابی)",
          "شرکت در کارگاه‌های آموزشی امید",
          "خواندن کتاب‌های مرتبط با امید و موفقیت",
          "ایجاد برنامه عملی برای اهداف"
        ]
      };
    } else if (score <= 70) {
      return {
        level: "امید خوب",
        color: "#10b981",
        desc: "سطح امید شما خوب است. شما به اهداف خود باور دارید، راه‌های مختلف می‌بینید و انگیزه لازم برای تلاش را دارید.",
        details: "شما در هر دو جنبه امید (Pathways و Agency) عملکرد خوبی دارید. این سطح از امید با موفقیت بیشتر، سلامت روانی بهتر و رضایت از زندگی همراه است.",
        strengths: [
          "توانایی خوب در دیدن راه‌های متعدد",
          "انگیزه و اراده قوی برای اقدام",
          "مقاومت در برابر موانع",
          "خوش‌بینی فعال",
          "دستیابی به اکثر اهداف",
          "انعطاف‌پذیری در استراتژی‌ها"
        ],
        recommendations: [
          "حفظ و تقویت سطح فعلی امید",
          "قرار دادن اهداف چالش‌برانگیزتر",
          "کمک به دیگران برای تقویت امیدشان",
          "تسهیم تجربیات موفق خود",
          "توجه به تعادل کار-زندگی",
          "ادامه یادگیری و رشد",
          "الگوبرداری از افراد موفق‌تر"
        ]
      };
    } else {
      return {
        level: "امید بسیار بالا",
        color: "#22c55e",
        desc: "شما سطح امید بسیار بالایی دارید! این یکی از قوی‌ترین دارایی‌های روانشناختی شماست.",
        details: "نمره عالی شما نشان می‌دهد که هم در تفکر راه‌ها (Pathway Thinking) و هم در اراده و عاملیت (Agency Thinking) بسیار قوی هستید. این سطح از امید با موفقیت استثنایی، سلامت روانی عالی، مقاومت بالا در برابر استرس و رضایت زیاد از زندگی همراه است.",
        strengths: [
          "تفکر خلاق و متنوع برای یافتن راه‌های مختلف",
          "اراده و انگیزه فوق‌العاده قوی",
          "پایداری و پشتکار بسیار بالا",
          "خوش‌بینی فعال و عملگرا",
          "مقاومت استثنایی در برابر موانع",
          "انعطاف‌پذیری عالی",
          "الهام‌بخش برای دیگران"
        ],
        recommendations: [
          "حفظ این سطح عالی از امید در دوره‌های سخت",
          "تعیین اهداف بزرگ و چالش‌برانگیز",
          "منتور و الگو بودن برای دیگران",
          "اشتراک تجربیات و استراتژی‌های خود",
          "کمک به افراد با امید پایین",
          "نوشتن و به اشتراک گذاری داستان موفقیت خود",
          "شرکت در پروژه‌های اجتماعی مثبت",
          "ادامه یادگیری و رشد مداوم"
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
    const subscales = calculateSubscales();
    const interpretation = getInterpretation(score);

    const chartData = {
      labels: ["نمره کل شما", "Pathways (راه‌ها)", "Agency (اراده)", "حداکثر"],
      datasets: [
        {
          label: "امید",
          data: [score, subscales.pathways, subscales.agency, 96],
          backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#22c55e"],
          borderColor: ["#2563eb", "#059669", "#d97706", "#16a34a"],
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
          text: "تحلیل امید - نظریه اسنایدر",
          font: { size: 14, family: "Vazirmatn" },
          color: "#e2e8f0"
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 96,
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
                <FaHeart className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج مقیاس امید بزرگسالان</h1>
                <p className="text-secondaryTextColor">Adult Hope Scale (Snyder)</p>
              </div>
            </div>

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نمره کل امید</h3>
              <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>
                {score} از 96
              </div>
              <div className="text-lg font-semibold mb-4" style={{ color: interpretation.color }}>
                {interpretation.level}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-secondaryThemeColor rounded-xl p-4">
                  <div className="text-sm text-secondaryTextColor mb-1">Pathways (راه‌ها)</div>
                  <div className="text-2xl font-bold text-green-500">{subscales.pathways}</div>
                  <div className="text-xs text-secondaryTextColor mt-1">توانایی فکر کردن راه‌های مختلف</div>
                </div>
                <div className="bg-secondaryThemeColor rounded-xl p-4">
                  <div className="text-sm text-secondaryTextColor mb-1">Agency (اراده)</div>
                  <div className="text-2xl font-bold text-orange-500">{subscales.agency}</div>
                  <div className="text-xs text-secondaryTextColor mt-1">انگیزه و اراده برای عمل</div>
                </div>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">نظریه امید اسنایدر</h3>
              <p className="text-secondaryTextColor leading-relaxed mb-3">
                <span className="font-semibold text-primaryThemeColor">امید = Pathways (راه‌ها) + Agency (اراده)</span>
              </p>
              <p className="text-secondaryTextColor leading-relaxed mb-2">
                <strong>Pathways:</strong> توانایی شناختی فکر کردن راه‌های مختلف برای دستیابی به اهداف
              </p>
              <p className="text-secondaryTextColor leading-relaxed">
                <strong>Agency:</strong> انگیزه و اراده برای پیگیری اهداف - "می‌توانم"، "انجام خواهم داد"
              </p>
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
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">نمودار تحلیل امید</h3>
              <div style={{ height: "300px" }}>
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">نکته مهم</h3>
              <p className="text-secondaryTextColor leading-relaxed">
                امید یک <strong>مهارت شناختی قابل یادگیری</strong> است، نه یک ویژگی ثابت شخصیتی. 
                <span className="text-primaryThemeColor font-bold"> شما می‌توانید امیدوارتر شوید!</span>
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
              <FaHeart className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">مقیاس امید بزرگسالان</h1>
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
            <div className="grid grid-cols-2 gap-3">
              {options.map((option, index) => (
                <button
                  key={`${currentQuestion}-${option.value}`}
                  onClick={() => handleAnswer(option.value)}
                  className="p-4 text-center bg-secondaryThemeColor hover:bg-primaryThemeColor/10 rounded-xl border border-borderColor hover:border-primaryThemeColor/40 transition-all"
                >
                  <span className="text-primaryTextColor font-medium text-sm">{option.label}</span>
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
