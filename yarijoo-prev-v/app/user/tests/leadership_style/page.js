"use client";

import { useTestResult } from "@/hooks/useTestResult";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaBrain } from "react-icons/fa";
import { Bar, Radar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler);

const TestPage = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("leadership_style");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
  { text: "تصمیمات را بدون مشورت می‌گیرم", type: "autocratic" },
  { text: "کنترل کامل می‌خواهم", type: "autocratic" },
  { text: "دستورات واضح می‌دهم", type: "autocratic" },
  { text: "از تیم نظر می‌خواهم", type: "democratic" },
  { text: "تصمیمات را با گروه می‌گیرم", type: "democratic" },
  { text: "به نظرات همه گوش می‌دهم", type: "democratic" },
  { text: "آزادی عمل کامل به تیم می‌دهم", type: "laissez_faire" },
  { text: "تیم خودشان تصمیم می‌گیرند", type: "laissez_faire" },
  { text: "کمتر دخالت می‌کنم", type: "laissez_faire" },
  { text: "تیم را الهام می‌بخشم", type: "transformational" },
  { text: "چشم‌انداز جذاب ارائه می‌دهم", type: "transformational" },
  { text: "به رشد فردی توجه می‌کنم", type: "transformational" },
  { text: "پاداش و تنبیه استفاده می‌کنم", type: "transactional" },
  { text: "بر اساس عملکرد ارزیابی می‌کنم", type: "transactional" },
  { text: "اهداف واضح تعیین می‌کنم", type: "transactional" },
  { text: "با مثال رهبری می‌کنم", type: "servant" },
  { text: "نیازهای تیم را اولویت می‌دهم", type: "servant" },
  { text: "به رشد دیگران کمک می‌کنم", type: "servant" }
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
    const scores = { autocratic: 0, democratic: 0, laissez_faire: 0, transformational: 0, transactional: 0, servant: 0 };
    questions.forEach((q, index) => {
      if (answers[index]) {
        scores[q.type] += answers[index].value || 0;
      }
    });
    return scores;
  };

  const getDominantStyle = (scores) => {
    const maxScore = Math.max(...Object.values(scores));
    for (const [style, score] of Object.entries(scores)) {
      if (score === maxScore) return style;
    }
    return "democratic";
  };

  const getStyleInfo = (style, scores) => {
    const styles = {
      autocratic: {
        title: "سبک مستبدانه",
        persian: "مستبدانه",
        color: "#ef4444",
        desc: "شما سبک رهبری مستبدانه دارید. تصمیمات را به تنهایی می‌گیرید و کنترل کامل دارید.",
        details: "رهبران مستبد تصمیمات را به تنهایی می‌گیرند و کنترل کامل دارند. این سبک در شرایط بحرانی یا زمانی که تصمیم‌گیری سریع لازم است مؤثر است اما می‌تواند خلاقیت و انگیزه تیم را کاهش دهد.",
        strengths: ["تصمیم‌گیری سریع", "کنترل بالا", "کارایی در بحران"],
        recommendations: [
          "**تعادل**: ترکیب با سبک دموکراتیک",
          "**مشورت**: گاهی از تیم نظر بخواهید",
          "**اعتماد**: اعتماد بیشتر به تیم"
        ]
      },
      democratic: {
        title: "سبک دموکراتیک",
        persian: "دموکراتیک",
        color: "#22c55e",
        desc: "شما سبک رهبری دموکراتیک دارید. از تیم نظر می‌خواهید و تصمیمات را با مشارکت می‌گیرید.",
        details: "رهبران دموکراتیک از تیم نظر می‌خواهند و تصمیمات را با مشارکت می‌گیرند. این سبک خلاقیت، انگیزه و رضایت تیم را افزایش می‌دهد.",
        strengths: ["خلاقیت بالا", "رضایت تیم", "مشارکت مؤثر", "انگیزه بالا"],
        recommendations: [
          "**حفظ این سبک**: ادامه سبک دموکراتیک",
          "**تسهیلگری**: بهبود مهارت‌های تسهیلگری",
          "**تصمیم‌گیری گروهی**: تقویت مهارت‌های تصمیم‌گیری گروهی"
        ]
      },
      laissez_faire: {
        title: "سبک آزادگذار",
        persian: "آزادگذار",
        color: "#eab308",
        desc: "شما سبک رهبری آزادگذار دارید. آزادی عمل زیادی به تیم می‌دهید و کمتر دخالت می‌کنید.",
        details: "رهبران آزادگذار آزادی عمل زیادی به تیم می‌دهند و کمتر دخالت می‌کنند. این سبک برای تیم‌های متخصص و خودمختار مؤثر است اما نیاز به هدایت و راهنمایی دارد.",
        strengths: ["استقلال تیم", "خلاقیت", "انگیزه ذاتی"],
        recommendations: [
          "**هدایت**: هدایت و راهنمایی بیشتر",
          "**نظارت**: نظارت منظم بر پیشرفت",
          "**پشتیبانی**: پشتیبانی از تیم"
        ]
      },
      transformational: {
        title: "سبک تحول‌گرا",
        persian: "تحول‌گرا",
        color: "#3b82f6",
        desc: "شما سبک رهبری تحول‌گرا دارید. تیم را الهام می‌بخشید و به رشد فردی توجه می‌کنید.",
        details: "رهبران تحول‌گرا تیم را الهام می‌بخشند، چشم‌انداز جذاب ارائه می‌دهند و به رشد فردی توجه می‌کنند. این سبک برای تغییرات بزرگ و ایجاد انگیزه مؤثر است.",
        strengths: ["الهام‌بخشی", "چشم‌انداز روشن", "توسعه فردی", "انگیزه بالا"],
        recommendations: [
          "**حفظ این سبک**: ادامه رهبری تحول‌گرا",
          "**ارتباط**: ارتباط مؤثر با تیم",
          "**توسعه**: توسعه مهارت‌های رهبری"
        ]
      },
      transactional: {
        title: "سبک مبادله‌ای",
        persian: "مبادله‌ای",
        color: "#f59e0b",
        desc: "شما سبک رهبری مبادله‌ای دارید. از پاداش و تنبیه استفاده می‌کنید و بر اساس عملکرد ارزیابی می‌کنید.",
        details: "رهبران مبادله‌ای از پاداش و تنبیه استفاده می‌کنند و بر اساس عملکرد ارزیابی می‌کنند. این سبک برای اهداف مشخص و کوتاه‌مدت مؤثر است.",
        strengths: ["وضوح اهداف", "پاسخگویی", "عملکرد محوری"],
        recommendations: [
          "**تعادل**: ترکیب با سبک تحول‌گرا",
          "**انگیزه ذاتی**: ایجاد انگیزه ذاتی در تیم",
          "**ارتباط**: ارتباط بیشتر با تیم"
        ]
      },
      servant: {
        title: "سبک خدمتگزار",
        persian: "خدمتگزار",
        color: "#8b5cf6",
        desc: "شما سبک رهبری خدمتگزار دارید. نیازهای تیم را اولویت می‌دهید و به رشد دیگران کمک می‌کنید.",
        details: "رهبران خدمتگزار نیازهای تیم را اولویت می‌دهند و به رشد دیگران کمک می‌کنند. این سبک برای ایجاد محیط کاری مثبت و توسعه تیم مؤثر است.",
        strengths: ["خدمت به دیگران", "توسعه تیم", "محیط مثبت", "اعتماد بالا"],
        recommendations: [
          "**حفظ این سبک**: ادامه رهبری خدمتگزار",
          "**تعادل**: تعادل بین خدمت و رهبری",
          "**مرزها**: حفظ مرزهای سالم"
        ]
      }
    };
    return styles[style] || styles.democratic;
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
    const styleInfo = getStyleInfo(dominantStyle, scores);

    const radarData = {
      labels: ['مستبدانه', 'دموکراتیک', 'آزادگذار', 'تحول‌گرا', 'مبادله‌ای', 'خدمتگزار'],
      datasets: [{
        label: 'سبک‌های رهبری',
        data: [scores.autocratic, scores.democratic, scores.laissez_faire, scores.transformational, scores.transactional, scores.servant],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgb(59, 130, 246)',
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(59, 130, 246)'
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
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست سبک رهبری</h1>
                <p className="text-secondaryTextColor">تحلیل نتایج شما</p>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">سبک غالب رهبری</h3>
              <div className="text-2xl font-bold mb-2" style={{ color: styleInfo.color }}>{styleInfo.title}</div>
              <div className="text-sm text-secondaryTextColor mb-4">{styleInfo.desc}</div>
              <p className="text-sm text-secondaryTextColor">{styleInfo.details}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-darkThemeColor rounded-2xl p-4">
                <h4 className="text-sm font-medium text-secondaryTextColor mb-2">مستبدانه</h4>
                <div className="text-2xl font-bold mb-1" style={{ color: '#ef4444' }}>{scores.autocratic}</div>
                <div className="text-xs text-secondaryTextColor">از 15</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-4">
                <h4 className="text-sm font-medium text-secondaryTextColor mb-2">دموکراتیک</h4>
                <div className="text-2xl font-bold mb-1" style={{ color: '#22c55e' }}>{scores.democratic}</div>
                <div className="text-xs text-secondaryTextColor">از 15</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-4">
                <h4 className="text-sm font-medium text-secondaryTextColor mb-2">آزادگذار</h4>
                <div className="text-2xl font-bold mb-1" style={{ color: '#eab308' }}>{scores.laissez_faire}</div>
                <div className="text-xs text-secondaryTextColor">از 15</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-4">
                <h4 className="text-sm font-medium text-secondaryTextColor mb-2">تحول‌گرا</h4>
                <div className="text-2xl font-bold mb-1" style={{ color: '#3b82f6' }}>{scores.transformational}</div>
                <div className="text-xs text-secondaryTextColor">از 15</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-4">
                <h4 className="text-sm font-medium text-secondaryTextColor mb-2">مبادله‌ای</h4>
                <div className="text-2xl font-bold mb-1" style={{ color: '#f59e0b' }}>{scores.transactional}</div>
                <div className="text-xs text-secondaryTextColor">از 15</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-4">
                <h4 className="text-sm font-medium text-secondaryTextColor mb-2">خدمتگزار</h4>
                <div className="text-2xl font-bold mb-1" style={{ color: '#8b5cf6' }}>{scores.servant}</div>
                <div className="text-xs text-secondaryTextColor">از 15</div>
              </div>
            </div>

            {styleInfo.strengths && styleInfo.strengths.length > 0 && (
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نقاط قوت</h3>
                <ul className="space-y-2">
                  {styleInfo.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-3">
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
                {styleInfo.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                    <span className="text-secondaryTextColor text-sm" dangerouslySetInnerHTML={{ __html: rec.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار سبک‌های رهبری</h3>
              <div className="w-full h-80">
                <Radar data={radarData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    r: {
                      beginAtZero: true,
                      max: 15,
                      ticks: { color: '#9ca3af', stepSize: 5 },
                      grid: { color: '#374151' },
                      pointLabels: { color: '#e5e7eb' }
                    }
                  },
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'سبک‌های رهبری شما', color: '#e5e7eb', font: { size: 16 } }
                  }
                }} />
              </div>
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
              <h1 className="text-2xl font-bold text-primaryTextColor">تست LEADERSHIP_STYLE</h1>
              <p className="text-secondaryTextColor">سوال {currentQuestion + 1} از {questions.length}</p>
            </div>
          </div>

          <div className="w-full bg-darkThemeColor rounded-2xl p-6">
            <h3 className="text-xl font-bold text-primaryThemeColor mb-6">{questions[currentQuestion].text}</h3>
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