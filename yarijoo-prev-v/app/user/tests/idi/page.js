"use client";
import { useTestResult } from "@/hooks/useTestResult";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaUser } from "react-icons/fa";
import { Bar } from "react-chartjs-2";
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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("idi");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questionsData = useMemo(() => [
    { text: "هویت من روشن و مشخص است", status: "achieved" },
    { text: "می‌دانم در زندگی چه می‌خواهم", status: "achieved" },
    { text: "هنوز در حال کاوش و جستجو هستم", status: "moratorium" },
    { text: "سوالات زیادی درباره خودم دارم", status: "moratorium" },
    { text: "از مسیری که برایم تعیین شده پیروی می‌کنم", status: "foreclosed" },
    { text: "انتخاب‌های خانواده را می‌پذیرم", status: "foreclosed" },
    { text: "به مسائل هویتی فکر نمی‌کنم", status: "diffused" },
    { text: "هر چه باشد می‌پذیرم", status: "diffused" },
    { text: "تعهد محکمی به اهدافم دارم", status: "achieved" },
    { text: "ارزش‌های خودم را انتخاب کرده‌ام", status: "achieved" }
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
    const statuses = {
      achieved: 0,
      moratorium: 0,
      foreclosed: 0,
      diffused: 0
    };

    questionsData.forEach((q, idx) => {
      const answer = answers[idx] || 1;
      if (statuses[q.status] !== undefined) {
        statuses[q.status] += answer;
      }
    });

    // Find dominant status
    const dominant = Object.keys(statuses).reduce((a, b) => statuses[a] > statuses[b] ? a : b);
    const totalScore = Object.values(statuses).reduce((sum, val) => sum + val, 0);

    return { ...statuses, dominant, totalScore };
  };

  const getStatusInfo = (status) => {
    const statusInfo = {
      achieved: {
        title: "هویت دستیافته",
        desc: "شما هویت روشن و مشخصی دارید که از طریق کاوش و تعهد به آن رسیده‌اید.",
        color: "#22c55e",
        details: "این وضعیت نشان می‌دهد که شما یک هویت قوی و واضح دارید که از طریق کاوش فعال و انتخاب آگاهانه به دست آمده است. شما می‌دانید چه کسی هستید و چه می‌خواهید.",
        strengths: [
          "هویت روشن و مشخص",
          "آگاهی از ارزش‌ها و اهداف",
          "تعهد قوی به انتخاب‌ها",
          "رضایت از خود",
          "عملکرد مناسب در زندگی"
        ],
        recommendations: [
          "حفظ و تقویت هویت فعلی",
          "ادامه رشد و توسعه شخصی",
          "بازنگری دوره‌ای ارزش‌ها و اهداف",
          "کمک به دیگران در فرآیند شکل‌گیری هویت"
        ]
      },
      moratorium: {
        title: "هویت تعلیق (Moratorium)",
        desc: "شما در حال کاوش فعال هستید اما هنوز به هویت مشخصی نرسیده‌اید.",
        color: "#eab308",
        details: "این وضعیت نشان می‌دهد که شما در حال جستجو و کاوش فعال برای یافتن هویت خود هستید. این یک مرحله طبیعی و مهم از رشد شخصی است که می‌تواند به شکل‌گیری هویت سالم منجر شود.",
        strengths: [
          "کاوش فعال",
          "پذیرش تغییر",
          "کنجکاوی و یادگیری",
          "انعطاف‌پذیری"
        ],
        recommendations: [
          "ادامه کاوش و جستجو",
          "تجربه چیزهای جدید و متفاوت",
          "صحبت با افراد مختلف و یادگیری از آن‌ها",
          "تأمل و تفکر درباره تجربیات",
          "تعیین اهداف کوتاه‌مدت برای آزمایش",
          "مشاوره برای هدایت فرآیند کاوش"
        ]
      },
      foreclosed: {
        title: "هویت از پیش تعیین شده",
        desc: "شما هویتی دارید که از دیگران (مثل خانواده) گرفته‌اید بدون کاوش فعال.",
        color: "#f97316",
        details: "این وضعیت نشان می‌دهد که شما هویتی دارید که بدون کاوش فعال از دیگران (معمولاً خانواده) گرفته‌اید. این می‌تواند پایدار باشد اما ممکن است در آینده با چالش مواجه شود.",
        strengths: [
          "هویت مشخص",
          "تعهد به ارزش‌ها",
          "احساس تعلق"
        ],
        recommendations: [
          "شروع کاوش فعال درباره هویت",
          "بررسی ارزش‌ها و باورهای به ارث رسیده",
          "یافتن اینکه آیا این انتخاب‌ها واقعاً متعلق به خودتان است",
          "تجربه دیدگاه‌ها و ارزش‌های مختلف",
          "تصمیم‌گیری آگاهانه درباره اینکه چه کسی می‌خواهید باشید",
          "مشاوره برای هدایت فرآیند کاوش"
        ]
      },
      diffused: {
        title: "هویت پراکنده",
        desc: "شما هنوز هویت مشخصی ندارید و کاوش فعالی انجام نداده‌اید.",
        color: "#ef4444",
        details: "این وضعیت نشان می‌دهد که شما هنوز هویت مشخصی ندارید و کاوش فعالی برای یافتن آن انجام نداده‌اید. این می‌تواند باعث احساس سردرگمی و عدم قطعیت شود.",
        strengths: [
          "انعطاف‌پذیری",
          "پتانسیل برای رشد"
        ],
        recommendations: [
          "شروع فرآیند کاوش فعال",
          "تعیین اهداف کوچک و قابل دستیابی",
          "تجربه فعالیت‌ها و دیدگاه‌های مختلف",
          "صحبت با افراد مختلف و یادگیری از تجربیات آن‌ها",
          "تأمل درباره علایق، ارزش‌ها و اهداف",
          "مشاوره برای هدایت فرآیند شکل‌گیری هویت",
          "پذیرش اینکه کاوش زمان می‌برد",
          "شروع با سوالات اساسی: چه کسی هستم؟ چه چیزی برایم مهم است؟"
        ]
      }
    };
    return statusInfo[status];
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
    const statusInfo = getStatusInfo(scores.dominant);

    const chartData = {
      labels: ["دستیافته", "تعلیق", "از پیش تعیین شده", "پراکنده"],
      datasets: [
        {
          label: "نمرات وضعیت هویت",
          data: [
            scores.achieved,
            scores.moratorium,
            scores.foreclosed,
            scores.diffused
          ],
          backgroundColor: [
            "#22c55e",
            "#eab308",
            "#f97316",
            "#ef4444"
          ],
          borderColor: [
            "#16a34a",
            "#ca8a04",
            "#ea580c",
            "#dc2626"
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
          text: "وضعیت هویت (IDI)",
          font: { size: 14, family: "Vazirmatn" },
          color: "#e2e8f0"
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 50,
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
                <FaUser className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج پرسشنامه توسعه هویت</h1>
                <p className="text-secondaryTextColor">Identity Development Inventory (IDI)</p>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">وضعیت غالب</h3>
              <div className="text-4xl font-bold mb-2" style={{ color: statusInfo.color }}>
                {statusInfo.title}
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">توضیحات</h3>
              <p className="text-secondaryTextColor leading-relaxed mb-4">{statusInfo.desc}</p>
              <p className="text-secondaryTextColor leading-relaxed">{statusInfo.details}</p>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">نقاط قوت</h3>
              <ul className="list-disc list-inside space-y-2 text-secondaryTextColor">
                {statusInfo.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">توصیه‌ها</h3>
              <ul className="list-disc list-inside space-y-2 text-secondaryTextColor">
                {statusInfo.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">نمودار وضعیت‌های هویت</h3>
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
              <FaUser className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">پرسشنامه توسعه هویت (IDI)</h1>
              <p className="text-secondaryTextColor">سوال {currentQuestion + 1} از {questions.length}</p>
            </div>
          </div>

          <div className="w-full bg-darkThemeColor rounded-2xl p-6">
            <h3 className="text-xl font-bold text-primaryThemeColor mb-6">
              {questions[currentQuestion]}
            </h3>
            <div className="space-y-3">
              {options.map((option) => (
                <button
                  key={option.value}
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