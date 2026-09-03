"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaLightbulb } from "react-icons/fa";
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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("mhs");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questionsData = useMemo(() => [
    { text: "می‌توانم راه‌های مختلف برای حل مشکلات فکر کنم", component: "pathways" },
    { text: "با انرژی به دنبال اهدافم می‌روم", component: "agency" },
    { text: "راه‌های زیادی برای دور زدن مشکل وجود دارد", component: "pathways" },
    { text: "به اهدافی که تعیین کرده‌ام می‌رسم", component: "agency" },
    { text: "حتی وقتی دیگران تسلیم می‌شوند، راهی پیدا می‌کنم", component: "pathways" },
    { text: "در گذشته موفق بوده‌ام", component: "agency" }
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

  const calculateScores = () => {
    let pathways = 0;
    let agency = 0;

    questionsData.forEach((q, idx) => {
      const answer = answers[idx] || 1;
      if (q.component === "pathways") {
        pathways += answer;
      } else if (q.component === "agency") {
        agency += answer;
      }
    });

    const totalScore = pathways + agency;
    const pathwaysMean = pathways / 3; // 3 questions
    const agencyMean = agency / 3; // 3 questions
    const totalMean = totalScore / 6;

    return { pathways, agency, totalScore, pathwaysMean, agencyMean, totalMean };
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


  const getInterpretation = (scores) => {
    const { totalMean, pathwaysMean, agencyMean } = scores;
    
    if (totalMean >= 5.5) {
      return {
        level: "امید بالا",
        color: "#22c55e",
        desc: "شما سطح بالایی از امید دارید. شما راه‌های مؤثر برای دستیابی به اهدافتان می‌بینید و انرژی و انگیزه لازم برای دنبال کردن آن‌ها را دارید.",
        details: "امید بالای شما نشان می‌دهد که شما هم توانایی پیدا کردن راه‌های دستیابی به اهداف (Pathways) و هم انگیزه و انرژی لازم برای دنبال کردن آن‌ها (Agency) را دارید. این سطح از امید با موفقیت بیشتر، رضایت از زندگی بالاتر و سلامت روان بهتر همراه است.",
        strengths: [
          "توانایی بالا در پیدا کردن راه‌های دستیابی به اهداف",
          "انگیزه و انرژی قوی برای دنبال کردن اهداف",
          "نگرش مثبت به آینده",
          "مقاومت در برابر چالش‌ها",
          "عملکرد بالا",
          "رضایت از زندگی"
        ],
        recommendations: [
          "حفظ و تقویت سطح فعلی امید",
          "تعیین اهداف چالش‌برانگیزتر برای رشد مداوم",
          "به اشتراک‌گذاری راه‌بردهای موفقیت با دیگران",
          "ادامه سرمایه‌گذاری در مهارت‌های حل مسئله",
          "کمک به دیگران در توسعه امیدواری"
        ]
      };
    } else if (totalMean >= 4.0) {
      return {
        level: "امید متوسط",
        color: "#eab308",
        desc: "شما سطح متوسطی از امید دارید. در برخی زمینه‌ها خوب عمل می‌کنید اما در برخی دیگر می‌توانید بهبود پیدا کنید.",
        details: "امید متوسط شما نشان می‌دهد که در برخی موقعیت‌ها می‌توانید راه‌های مؤثر پیدا کنید و انگیزه داشته باشید، اما هنوز زمینه‌هایی وجود دارند که نیاز به تقویت دارند. با تمرین و یادگیری می‌توانید امید خود را افزایش دهید.",
        strengths: [
          "برخی مهارت‌های پیدا کردن راه‌های حل مسئله",
          "وجود انگیزه پایه",
          "پتانسیل برای بهبود"
        ],
        recommendations: [
          "تمرین مهارت‌های حل مسئله برای تقویت Pathways",
          "افزایش انگیزه از طریق تعیین اهداف کوچک و قابل دستیابی",
          "تمرین شناسایی راه‌های متعدد برای حل مشکلات",
          "جشن گرفتن موفقیت‌های کوچک",
          "یادگیری از تجربیات موفق گذشته",
          "یافتن الهام از افراد موفق",
          "مشاوره برای تقویت امیدواری در صورت نیاز"
        ]
      };
    } else {
      return {
        level: "امید پایین",
        color: "#ef4444",
        desc: "سطح امید شما پایین است. ممکن است در پیدا کردن راه‌های دستیابی به اهداف یا داشتن انگیزه لازم برای دنبال کردن آن‌ها با مشکل روبرو شوید.",
        details: "امید پایین شما می‌تواند نشان‌دهنده مشکلاتی در پیدا کردن راه‌های مؤثر برای دستیابی به اهداف (Pathways) یا نداشتن انگیزه و انرژی لازم برای دنبال کردن آن‌ها (Agency) باشد. این وضعیت می‌تواند منجر به احساس ناامیدی، افسردگی و کاهش عملکرد شود.",
        strengths: [
          "آگاهی از وضعیت",
          "تمایل به بهبود"
        ],
        recommendations: [
          "مشاوره با روان‌شناس برای بررسی علل زمینه‌ای (افسردگی، اضطراب)",
          "درمان Hope Therapy برای بازیابی امید",
          "شروع با اهداف بسیار کوچک و قابل دستیابی",
          "یادگیری و تمرین مهارت‌های حل مسئله گام به گام",
          "شناسایی و جشن گرفتن هر پیشرفت کوچک",
          "یافتن الهام و حمایت از دیگران",
          "تمرین نگرش مثبت و تفکر امیدوارانه",
          "یادگیری از تجربیات موفق گذشته (حتی کوچک)",
          "در صورت نیاز، بررسی احتمال افسردگی"
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
      labels: ["راه‌ها (Pathways)", "عاملیت (Agency)", "نمره کل"],
      datasets: [
        {
          label: "نمرات",
          data: [scores.pathwaysMean.toFixed(2), scores.agencyMean.toFixed(2), scores.totalMean.toFixed(2)],
          backgroundColor: [
            "rgba(34, 197, 94, 0.5)",
            "rgba(59, 130, 246, 0.5)",
            interpretation.color + "B3"
          ],
          borderColor: [
            "rgb(34, 197, 94)",
            "rgb(59, 130, 246)",
            interpretation.color
          ],
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
          text: "مقیاس امید (MHS)",
          font: { size: 14, family: "Vazirmatn" },
          color: "#e2e8f0"
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 7,
          ticks: { color: "#94a3b8", font: { family: "Vazirmatn" } },
          grid: { color: "#334155" }
        },
        x: {
          ticks: { color: "#94a3b8", font: { family: "Vazirmatn", size: 10 } },
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
                <FaLightbulb className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج مقیاس امید</h1>
                <p className="text-secondaryTextColor">Mental Hope Scale (MHS)</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-darkThemeColor rounded-xl p-3">
                <div className="text-xs text-secondaryTextColor mb-1">راه‌ها</div>
                <div className="text-xl font-bold text-green-500">{scores.pathwaysMean.toFixed(2)}</div>
              </div>
              <div className="bg-darkThemeColor rounded-xl p-3">
                <div className="text-xs text-secondaryTextColor mb-1">عاملیت</div>
                <div className="text-xl font-bold text-blue-500">{scores.agencyMean.toFixed(2)}</div>
              </div>
              <div className="bg-darkThemeColor rounded-xl p-3">
                <div className="text-xs text-secondaryTextColor mb-1">میانگین کل</div>
                <div className="text-xl font-bold" style={{ color: interpretation.color }}>{scores.totalMean.toFixed(2)}</div>
              </div>
            </div>

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سطح امید</h3>
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
              <FaLightbulb className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">مقیاس امید (MHS)</h1>
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