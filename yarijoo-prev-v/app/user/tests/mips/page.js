"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaUserTie } from "react-icons/fa";
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
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("mips");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questionsData = useMemo(() => [
    { text: "از بودن با مردم لذت می‌برم", scale: "extraversion" },
    { text: "تصمیمات را با منطق می‌گیرم", scale: "thinking" },
    { text: "برنامه‌های دقیق دارم", scale: "sensing" },
    { text: "انعطاف‌پذیر و خودجوش هستم", scale: "perceiving" },
    { text: "به جزئیات توجه می‌کنم", scale: "sensing" },
    { text: "به احساسات خود و دیگران توجه دارم", scale: "feeling" },
    { text: "به ایده‌ها و امکانات فکر می‌کنم", scale: "intuition" },
    { text: "ترجیح می‌دهم تنها باشم", scale: "introversion" },
    { text: "سریع تصمیم می‌گیرم", scale: "judging" },
    { text: "خلاق و نوآور هستم", scale: "intuition" }
  ], []);

  const questions = useMemo(() => questionsData.map(q => q.text), [questionsData]);

  const options = useMemo(() => [
    { value: 0, label: "نادرست" },
    { value: 1, label: "درست" }
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
    const scaleScores = {
      extraversion: 0,
      introversion: 0,
      sensing: 0,
      intuition: 0,
      thinking: 0,
      feeling: 0,
      judging: 0,
      perceiving: 0
    };

    questionsData.forEach((q, idx) => {
      const answer = answers[idx] || 0;
      scaleScores[q.scale] += answer;
    });

    const e_i = scaleScores.extraversion >= scaleScores.introversion ? "E" : "I";
    const s_n = scaleScores.sensing >= scaleScores.intuition ? "S" : "N";
    const t_f = scaleScores.thinking >= scaleScores.feeling ? "T" : "F";
    const j_p = scaleScores.judging >= scaleScores.perceiving ? "J" : "P";
    
    const personalityType = e_i + s_n + t_f + j_p;
    
    return { ...scaleScores, personalityType };
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
    const typeInfo = {
      ENFJ: { title: "معلم", desc: "شما فردی همدل، الهام‌بخش و رهبری طبیعی هستید.", color: "#22c55e" },
      ENFP: { title: "مبارز", desc: "شما فردی خلاق، پرانرژی و مشتاق هستید.", color: "#22c55e" },
      ENTJ: { title: "فرمانده", desc: "شما فردی مصمم، رهبری قوی و استراتژیست هستید.", color: "#22c55e" },
      ENTP: { title: "مناظره‌گر", desc: "شما فردی باهوش، خلاق و نوآور هستید.", color: "#22c55e" },
      ESFJ: { title: "مراقب", desc: "شما فردی گرم، مسئولیت‌پذیر و اجتماعی هستید.", color: "#22c55e" },
      ESFP: { title: "بازیگر", desc: "شما فردی شاد، خودجوش و دوست‌داشتنی هستید.", color: "#22c55e" },
      ESTJ: { title: "اجراکننده", desc: "شما فردی منظم، قابل اعتماد و رهبری طبیعی هستید.", color: "#22c55e" },
      ESTP: { title: "کارآفرین", desc: "شما فردی عمل‌گرا، ماجراجو و پرانرژی هستید.", color: "#22c55e" },
      INFJ: { title: "مدافع", desc: "شما فردی خلاق، مصمم و ایده‌آلیست هستید.", color: "#22c55e" },
      INFP: { title: "میانجی", desc: "شما فردی همدل، خلاق و ایده‌آلیست هستید.", color: "#22c55e" },
      INTJ: { title: "معمار", desc: "شما فردی استراتژیست، مستقل و مصمم هستید.", color: "#22c55e" },
      INTP: { title: "اندیشمند", desc: "شما فردی منطقی، کنجکاو و مستقل هستید.", color: "#22c55e" },
      ISFJ: { title: "محافظ", desc: "شما فردی گرم، مسئولیت‌پذیر و محافظ هستید.", color: "#22c55e" },
      ISFP: { title: "ماجراجو", desc: "شما فردی انعطاف‌پذیر، هنرمند و صلح‌طلب هستید.", color: "#22c55e" },
      ISTJ: { title: "منطقی", desc: "شما فردی عملی، قابل اعتماد و منظم هستید.", color: "#22c55e" },
      ISTP: { title: "متخصص", desc: "شما فردی عمل‌گرا، مستقل و تحلیل‌گر هستید.", color: "#22c55e" }
    };

    const info = typeInfo[scores.personalityType] || { title: "نوع شخصیت", desc: "نوع شخصیت شما مشخص شد.", color: "#eab308" };

    return {
      level: info.title,
      color: info.color,
      desc: info.desc,
      details: `نوع شخصیت شما ${scores.personalityType} است. ${info.desc} این تست بر اساس تئوری مایرز-بریگز است که 16 نوع شخصیت را شناسایی می‌کند.`,
      strengths: ["شناخت نوع شخصیت", "درک ترجیحات فردی", "بهبود روابط بین فردی"],
      recommendations: ["بررسی بیشتر ویژگی‌های نوع شخصیت خود", "استفاده از این شناخت برای بهبود روابط", "یادگیری نقاط قوت و ضعف نوع شخصیت خود"]
    };
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
      labels: ["برون‌گرایی", "درون‌گرایی", "حسی", "شهودی", "تفکری", "احساسی", "قضاوتی", "ادراکی"],
      datasets: [
        {
          label: "نمرات",
          data: [
            scores.extraversion,
            scores.introversion,
            scores.sensing,
            scores.intuition,
            scores.thinking,
            scores.feeling,
            scores.judging,
            scores.perceiving
          ],
          backgroundColor: "#22c55e",
          borderColor: "#16a34a",
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
          text: "نمرات مقیاس‌های شخصیتی",
          font: { size: 14, family: "Vazirmatn" },
          color: "#e2e8f0"
        }
      },
      scales: {
        y: { beginAtZero: true, max: 10, ticks: { color: "#94a3b8", font: { family: "Vazirmatn" } }, grid: { color: "#334155" } },
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
                <FaUserTie className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست شخصیت (MIPS)</h1>
                <p className="text-secondaryTextColor">Myers-Briggs Style Assessment</p>
              </div>
            </div>
            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">نوع شخصیت</h3>
              <div className="text-4xl font-bold mb-2" style={{ color: interpretation.color }}>{scores.personalityType}</div>
              <div className="text-lg font-semibold" style={{ color: interpretation.color }}>{interpretation.level}</div>
            </div>
            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">توضیحات</h3>
              <p className="text-secondaryTextColor leading-relaxed mb-4">{interpretation.desc}</p>
              <p className="text-secondaryTextColor leading-relaxed">{interpretation.details}</p>
            </div>
            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">نقاط قوت</h3>
              <ul className="list-disc list-inside space-y-2 text-secondaryTextColor">
                {interpretation.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-xl font-bold text-primaryThemeColor mb-4">توصیه‌ها</h3>
              <ul className="list-disc list-inside space-y-2 text-secondaryTextColor">
                {interpretation.recommendations.map((r, i) => <li key={i}>{r}</li>)}
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
              <FaUserTie className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">تست شخصیت (MIPS)</h1>
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
            >{questions[currentQuestion]}</h3>
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