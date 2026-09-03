"use client";
import { useTestResult } from "@/hooks/useTestResult";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaUserCheck } from "react-icons/fa";
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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("hisd");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questionsData = useMemo(() => [
    { text: "خودم را شناخته‌ام", level: "identity_achievement" },
    { text: "می‌دانم چه کسی هستم", level: "identity_achievement" },
    { text: "هنوز در حال کشف خودم هستم", level: "moratorium" },
    { text: "سوالاتی درباره هویتم دارم", level: "moratorium" },
    { text: "ارزش‌های خانواده را پذیرفته‌ام", level: "foreclosure" },
    { text: "از مسیری که دیگران تعیین کردند پیروی می‌کنم", level: "foreclosure" },
    { text: "درباره هویتم فکر نمی‌کنم", level: "diffusion" },
    { text: "هویت برایم مهم نیست", level: "diffusion" },
    { text: "اهداف روشنی دارم", level: "identity_achievement" },
    { text: "تعهد به انتخاب‌هایم دارم", level: "identity_achievement" }
  ], []);

  const questions = useMemo(() => questionsData.map(q => q.text), [questionsData]);

  const options = useMemo(() => [
    { value: 1, label: "هرگز" },
    { value: 2, label: "به ندرت" },
    { value: 3, label: "گاهی" },
    { value: 4, label: "اغلب" },
    { value: 5, label: "همیشه" }
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
    const levelScores = {
      identity_achievement: 0,
      moratorium: 0,
      foreclosure: 0,
      diffusion: 0
    };

    questionsData.forEach((q, idx) => {
      const answer = answers[idx] || 1;
      levelScores[q.level] += answer;
    });

    const dominant = Object.keys(levelScores).reduce((a, b) => levelScores[a] > levelScores[b] ? a : b);
    return { ...levelScores, dominant };
  };

  const getStatusInfo = (level) => {
    const statusInfo = {
      identity_achievement: {
        title: "هویت دستیافته",
        color: "#22c55e",
        desc: "شما هویت روشن و مشخصی دارید که از طریق کاوش و تعهد به آن رسیده‌اید.",
        details: "این وضعیت نشان می‌دهد که شما یک هویت قوی و واضح دارید که از طریق کاوش فعال و انتخاب آگاهانه به دست آمده است. شما می‌دانید چه کسی هستید و چه می‌خواهید.",
        strengths: ["هویت روشن و مشخص", "آگاهی از ارزش‌ها و اهداف", "تعهد قوی به انتخاب‌ها"],
        recommendations: ["حفظ و تقویت هویت فعلی", "ادامه رشد و توسعه شخصی", "کمک به دیگران در فرآیند شکل‌گیری هویت"]
      },
      moratorium: {
        title: "هویت تعلیق",
        color: "#eab308",
        desc: "شما در حال کاوش فعال هستید اما هنوز به هویت مشخصی نرسیده‌اید.",
        details: "این وضعیت نشان می‌دهد که شما در حال جستجو و کاوش فعال برای یافتن هویت خود هستید. این یک مرحله طبیعی و مهم از رشد شخصی است.",
        strengths: ["کاوش فعال", "پذیرش تغییر", "کنجکاوی"],
        recommendations: ["ادامه کاوش و جستجو", "تجربه چیزهای جدید", "مشاوره برای هدایت فرآیند کاوش"]
      },
      foreclosure: {
        title: "هویت از پیش تعیین شده",
        color: "#f97316",
        desc: "شما هویتی دارید که از دیگران (مثل خانواده) گرفته‌اید بدون کاوش فعال.",
        details: "این وضعیت نشان می‌دهد که شما هویتی دارید که بدون کاوش فعال از دیگران گرفته‌اید. ممکن است در آینده با چالش مواجه شود.",
        strengths: ["هویت مشخص", "تعهد به ارزش‌ها"],
        recommendations: ["شروع کاوش فعال درباره هویت", "بررسی ارزش‌ها و باورهای به ارث رسیده", "تصمیم‌گیری آگاهانه"]
      },
      diffusion: {
        title: "هویت پراکنده",
        color: "#ef4444",
        desc: "شما هنوز هویت مشخصی ندارید و کاوش فعالی انجام نداده‌اید.",
        details: "این وضعیت نشان می‌دهد که شما هنوز هویت مشخصی ندارید. این می‌تواند باعث احساس سردرگمی شود.",
        strengths: ["انعطاف‌پذیری"],
        recommendations: ["شروع فرآیند کاوش فعال", "تعیین اهداف کوچک", "مشاوره برای هدایت فرآیند شکل‌گیری هویت"]
      }
    };
    return statusInfo[level];
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
            scores.identity_achievement,
            scores.moratorium,
            scores.foreclosure,
            scores.diffusion
          ],
          backgroundColor: ["#22c55e", "#eab308", "#f97316", "#ef4444"],
          borderColor: ["#16a34a", "#ca8a04", "#ea580c", "#dc2626"],
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
          text: "وضعیت هویت (HISD)",
          font: { size: 14, family: "Vazirmatn" },
          color: "#e2e8f0"
        }
      },
      scales: {
        y: { beginAtZero: true, max: 20, ticks: { color: "#94a3b8", font: { family: "Vazirmatn" } }, grid: { color: "#334155" } },
        x: { ticks: { color: "#94a3b8", font: { family: "Vazirmatn", size: 9 } }, grid: { color: "#334155" } }
      }
    };

    return (
      <div className="w-full flex flex-col items-center">
        <Header /><MobileHeader />
        <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 mt-4 lg:mt-24 px-4">
          <Sidebar />
          <div className="w-full flex flex-col gap-6 h-auto bg-secondaryThemeColor rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="size-16 rounded-2xl bg-primaryThemeColor/15 text-primaryThemeColor flex items-center justify-center border border-primaryThemeColor/20">
                <FaUserCheck className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج پرسشنامه توسعه هویت</h1>
                <p className="text-secondaryTextColor">HISD Scale</p>
              </div>
            </div>
            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">وضعیت غالب</h3>
              <div className="text-4xl font-bold mb-2" style={{ color: statusInfo.color }}>{statusInfo.title}</div>
            </div>
            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">توضیحات</h3>
              <p className="text-secondaryTextColor leading-relaxed mb-4">{statusInfo.desc}</p>
              <p className="text-secondaryTextColor leading-relaxed">{statusInfo.details}</p>
            </div>
            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">نقاط قوت</h3>
              <ul className="list-disc list-inside space-y-2 text-secondaryTextColor">
                {statusInfo.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">توصیه‌ها</h3>
              <ul className="list-disc list-inside space-y-2 text-secondaryTextColor">
                {statusInfo.recommendations.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">نمودار</h3>
              <div style={{ height: "300px" }}><Bar data={chartData} options={chartOptions} /></div>
            </div>
            <button onClick={() => { setCurrentQuestion(0); setAnswers({}); setIsCompleted(false); }} className="w-full h-12 bg-primaryThemeColor text-white rounded-xl font-medium hover:bg-primaryThemeColor/90 transition-colors">انجام مجدد تست</button>
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
              <FaUserCheck className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">پرسشنامه توسعه هویت (HISD)</h1>
              <p className="text-secondaryTextColor">سوال {currentQuestion + 1} از {questions.length}</p>
            </div>
          </div>
          <div className="w-full bg-darkThemeColor rounded-2xl p-6">
            <h3 className="text-xl font-bold text-primaryThemeColor mb-6">{questions[currentQuestion]}</h3>
            <div className="space-y-3">
              {options.map((option) => (
                <button key={option.value} onClick={() => handleAnswer(option.value)} className="w-full p-4 text-right bg-secondaryThemeColor hover:bg-primaryThemeColor/10 rounded-xl border border-borderColor hover:border-primaryThemeColor/40 transition-all">
                  <span className="text-primaryTextColor font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="w-full bg-darkThemeColor rounded-2xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-secondaryTextColor">پیشرفت: {Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-secondaryThemeColor rounded-full overflow-hidden">
              <div className="h-full bg-primaryThemeColor rounded-full transition-all duration-300" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}></div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TestPage;