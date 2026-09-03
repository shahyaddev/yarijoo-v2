"use client";

import { useTestResult } from "@/hooks/useTestResult";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaHeart } from "react-icons/fa";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TestPage = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("love_language");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
    { text: "وقتی همسرم کمکم می‌کند، احساس عشق می‌کنم", type: "acts_of_service" },
    { text: "هدایای کوچک نشان عشق هستند", type: "gifts" },
    { text: "وقت گذراندن با همسرم مهم است", type: "quality_time" },
    { text: "نوازش و لمس نشان عشق است", type: "physical_touch" },
    { text: "کلمات تشویق برایم مهم است", type: "words_of_affirmation" },
    { text: "دوست دارم همسرم کارهایم را انجام دهد", type: "acts_of_service" },
    { text: "هدیه به من نشان می‌دهد به من فکر می‌کند", type: "gifts" },
    { text: "توجه کامل همسرم را می‌خواهم", type: "quality_time" },
    { text: "دست دادن و بغل کردن برایم مهم است", type: "physical_touch" },
    { text: "تعریف و تمجید برایم اهمیت دارد", type: "words_of_affirmation" },
    { text: "وقتی همسرم کارهای خانه انجام می‌دهد، خوشحالم", type: "acts_of_service" },
    { text: "هدایای غیرمنتظره دوست دارم", type: "gifts" },
    { text: "گفتگوی عمیق برایم ارزشمند است", type: "quality_time" },
    { text: "نزدیکی فیزیکی نشان عشق است", type: "physical_touch" },
    { text: "کلمات محبت‌آمیز برایم مهم است", type: "words_of_affirmation" },
    { text: "کمک در کارها نشان توجه است", type: "acts_of_service" },
    { text: "هدیه یادگار عشق است", type: "gifts" },
    { text: "وقت با هم بودن طلاست", type: "quality_time" },
    { text: "لمس و نوازش احساس امنیت می‌دهد", type: "physical_touch" },
    { text: "شنیدن \"دوستت دارم\" مهم است", type: "words_of_affirmation" }
  ]

  const options = [
  {
    "value": 1,
    "label": "خیلی کم"
  },
  {
    "value": 2,
    "label": "کم"
  },
  {
    "value": 3,
    "label": "متوسط"
  },
  {
    "value": 4,
    "label": "زیاد"
  },
  {
    "value": 5,
    "label": "خیلی زیاد"
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
          const answersArray = questions.map((q, idx) => {
            const answer = answers[idx];
            if (typeof answer === 'object' && answer.value !== undefined) return answer.value;
            return answer !== undefined ? answer : 0;
          });

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
    const wordsOfAffirmation = [4, 9, 14, 19].reduce((sum, idx) => sum + (answers[idx]?.value || 0), 0);
    const qualityTime = [2, 7, 12, 17].reduce((sum, idx) => sum + (answers[idx]?.value || 0), 0);
    const receivingGifts = [1, 6, 11, 16].reduce((sum, idx) => sum + (answers[idx]?.value || 0), 0);
    const actsOfService = [0, 5, 10, 15].reduce((sum, idx) => sum + (answers[idx]?.value || 0), 0);
    const physicalTouch = [3, 8, 13, 18].reduce((sum, idx) => sum + (answers[idx]?.value || 0), 0);
    
    return { wordsOfAffirmation, qualityTime, receivingGifts, actsOfService, physicalTouch };
  };

  const getDominantLanguage = (scores) => {
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    return sorted[0][0];
  };

  const getLanguageInfo = (language) => {
    const languages = {
      wordsOfAffirmation: {
        title: "کلمات تأییدکننده",
        persian: "کلمات تأییدکننده",
        color: "#3b82f6",
        desc: "احساس عشق را از طریق کلمات محبت‌آمیز، تعریف و تحسین دریافت می‌کنید.",
        needs: ["کلمات محبت: 'دوستت دارم'، 'عالی هستی'", "تعریف: تحسین تلاش‌ها و ویژگی‌ها", "تشویق: حمایت کلامی", "پیام‌های عاشقانه: نوشتن یا گفتن احساسات"],
        give: ["تعریف کردن منظم", "نوشتن یادداشت‌های عاشقانه", "بیان قدردانی", "پیام‌های محبت‌آمیز"]
      },
      qualityTime: {
        title: "زمان با کیفیت",
        persian: "زمان با کیفیت",
        color: "#22c55e",
        desc: "احساس عشق را از طریق توجه کامل و زمان اختصاصی دریافت می‌کنید.",
        needs: ["توجه انحصاری: زمانی که تمام توجه روی شماست", "فعالیت مشترک: انجام کارها با هم", "گفتگوی عمیق: صحبت‌های واقعی و معنادار", "حضور: حضور ذهنی کامل"],
        give: ["گذراندن زمان بدون حواس‌پرتی", "گوش دادن فعال", "خاموش کردن گوشی", "برنامه‌ریزی قرارهای منظم"]
      },
      receivingGifts: {
        title: "دریافت هدیه",
        persian: "دریافت هدیه",
        color: "#a855f7",
        desc: "احساس عشق را از طریق هدایا (نمادهای فیزیکی عشق) دریافت می‌کنید.",
        needs: ["هدایای فکری: هدایایی که نشان می‌دهد فکرتان را می‌کنند", "سورپرایز: غافلگیری‌های کوچک", "یادبودها: چیزهایی که خاطره بسازند"],
        give: ["هدیه دادن منظم (کوچک یا بزرگ)", "یادآوری مناسبت‌ها", "خرید چیزهایی که دوست دارند"]
      },
      actsOfService: {
        title: "خدمات و کارها",
        persian: "خدمات و کارها",
        color: "#eab308",
        desc: "احساس عشق را از طریق کمک در کارها و خدمات دریافت می‌کنید.",
        needs: ["کمک در کارهای روزمره", "انجام کارها بدون درخواست", "کاهش بار مسئولیت", "حمایت عملی"],
        give: ["انجام کارهای خانه", "کمک در پروژه‌ها", "کاهش فشار کاری", "حمایت عملی در مشکلات"]
      },
      physicalTouch: {
        title: "تماس فیزیکی",
        persian: "تماس فیزیکی",
        color: "#ef4444",
        desc: "احساس عشق را از طریق تماس فیزیکی (لمس، بغل، بوسه) دریافت می‌کنید.",
        needs: ["لمس فیزیکی منظم", "بغل و در آغوش گرفتن", "نزدیکی فیزیکی", "تماس غیرجنسی محبت‌آمیز"],
        give: ["لمس منظم و محبت‌آمیز", "بغل کردن روزانه", "دست دادن در مکان‌های عمومی", "نوازش و ماساژ"]
      }
    };
    return languages[language] || languages.wordsOfAffirmation;
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
    const dominantLanguage = getDominantLanguage(scores);
    const languageInfo = getLanguageInfo(dominantLanguage);

    const chartData = {
      labels: ['کلمات تأییدکننده', 'زمان با کیفیت', 'دریافت هدیه', 'خدمات و کارها', 'تماس فیزیکی'],
      datasets: [{
        label: 'نمرات زبان‌های عشق',
        data: [
          scores.wordsOfAffirmation,
          scores.qualityTime,
          scores.receivingGifts,
          scores.actsOfService,
          scores.physicalTouch
        ],
        backgroundColor: [
          '#3b82f6',
          '#22c55e',
          '#a855f7',
          '#eab308',
          '#ef4444'
        ],
        borderColor: [
          '#2563eb',
          '#16a34a',
          '#9333ea',
          '#ca8a04',
          '#dc2626'
        ],
        borderWidth: 2
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
                <FaHeart className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست 5 زبان عشق</h1>
                <p className="text-secondaryTextColor">تحلیل نتایج شما</p>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-sm font-medium text-secondaryTextColor mb-2">زبان عشق اصلی شما</h3>
              <div className="text-3xl font-bold mb-2" style={{ color: languageInfo.color }}>{languageInfo.persian}</div>
              <p className="text-secondaryTextColor mt-2">{languageInfo.desc}</p>
              <p className="text-secondaryTextColor mt-3 leading-relaxed">
                زبان عشق شما {languageInfo.persian} با نمره {scores[dominantLanguage]} از 20 است. 
                این بدان معناست که شما عشق را عمدتاً از طریق {languageInfo.persian} دریافت و درک می‌کنید.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-darkThemeColor rounded-2xl p-4">
                <h4 className="text-xs font-medium text-secondaryTextColor mb-1">کلمات</h4>
                <div className="text-xl font-bold mb-1" style={{ color: "#3b82f6" }}>{scores.wordsOfAffirmation}</div>
                <div className="text-xs text-secondaryTextColor">از 20</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-4">
                <h4 className="text-xs font-medium text-secondaryTextColor mb-1">زمان</h4>
                <div className="text-xl font-bold mb-1" style={{ color: "#22c55e" }}>{scores.qualityTime}</div>
                <div className="text-xs text-secondaryTextColor">از 20</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-4">
                <h4 className="text-xs font-medium text-secondaryTextColor mb-1">هدیه</h4>
                <div className="text-xl font-bold mb-1" style={{ color: "#a855f7" }}>{scores.receivingGifts}</div>
                <div className="text-xs text-secondaryTextColor">از 20</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-4">
                <h4 className="text-xs font-medium text-secondaryTextColor mb-1">خدمات</h4>
                <div className="text-xl font-bold mb-1" style={{ color: "#eab308" }}>{scores.actsOfService}</div>
                <div className="text-xs text-secondaryTextColor">از 20</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-4">
                <h4 className="text-xs font-medium text-secondaryTextColor mb-1">لمس</h4>
                <div className="text-xl font-bold mb-1" style={{ color: "#ef4444" }}>{scores.physicalTouch}</div>
                <div className="text-xs text-secondaryTextColor">از 20</div>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار مقایسه زبان‌های عشق</h3>
              <div className="w-full h-80">
                <Bar data={chartData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: true, position: 'top', labels: { color: '#e5e7eb' } },
                    title: { display: true, text: 'نمرات 5 زبان عشق', color: '#e5e7eb', font: { size: 16 } }
                  },
                  scales: {
                    y: { beginAtZero: true, max: 20, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                  }
                }} />
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">آنچه نیاز دارید:</h3>
              <ul className="space-y-2">
                {languageInfo.needs.map((need, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="size-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: languageInfo.color }}></div>
                    <span className="text-secondaryTextColor text-sm">{need}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">چگونه عشق بدهید:</h3>
              <ul className="space-y-2">
                {languageInfo.give.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="size-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: languageInfo.color }}></div>
                    <span className="text-secondaryTextColor text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره 5 زبان عشق</h4>
              <p className="text-sm text-blue-300">
                تست 5 زبان عشق توسط گری چپمن طراحی شده است. هر فرد یک زبان عشق اصلی دارد که از طریق آن عشق را بهتر درک و دریافت می‌کند.
                شناخت زبان عشق خود و شریکتان می‌تواند کیفیت رابطه را بهبود بخشد.
              </p>
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
              <FaHeart className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">تست 5 زبان عشق</h1>
              <p className="text-secondaryTextColor">سوال {currentQuestion + 1} از {questions.length}</p>
            </div>
          </div>

          <div className="w-full bg-darkThemeColor rounded-2xl p-6">
            <h3 className="text-xl font-bold text-primaryThemeColor mb-6">{questions[currentQuestion].text || questions[currentQuestion]}</h3>
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