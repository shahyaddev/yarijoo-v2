"use client";

import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaStar } from "react-icons/fa";
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { useTestResult } from "@/hooks/useTestResult";


ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const Page = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("big5");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  // Big5: O=Openness, C=Conscientiousness, E=Extraversion, A=Agreeableness, N=Neuroticism
  const questions = [
    { text: "از ایده‌ها و دیدگاه‌های نو استقبال می‌کنم", domain: "O", reverse: false },
    { text: "به جزئیات و زمان‌بندی کارها بسیار پایبندم", domain: "C", reverse: false },
    { text: "در جمع‌ها به راحتی صحبت می‌کنم", domain: "E", reverse: false },
    { text: "برای احساسات دیگران حساس و پاسخگو هستم", domain: "A", reverse: false },
    { text: "اغلب دچار نگرانی یا تنش می‌شوم", domain: "N", reverse: false },
    { text: "از هنر، موسیقی یا ادبیات لذت عمیق می‌برم", domain: "O", reverse: false },
    { text: "گاه کارهایم را بدون برنامه‌ریزی رها می‌کنم", domain: "C", reverse: true },
    { text: "ترجیح می‌دهم شنونده باشم تا سخن‌گو", domain: "E", reverse: true },
    { text: "به آسانی با افراد جدید کنار می‌آیم", domain: "A", reverse: false },
    { text: "در مواجهه با استرس، به‌سرعت آشفته می‌شوم", domain: "N", reverse: false }
  ];
  
  // ساده‌سازی برای 10 سوال اول - در واقعیت باید 50 سوال باشد
  const totalQuestions = 50;
  const questionsToShow = questions.slice(0, Math.min(10, totalQuestions));

  const options = [
    { value: 1, label: "کاملاً مخالفم" },
    { value: 2, label: "مخالفم" },
    { value: 3, label: "نه موافق نه مخالف" },
    { value: 4, label: "موافقم" },
    { value: 5, label: "کاملاً موافقم" }
  ];

  // بررسی نتیجه قبلی
  useEffect(() => {
    if (hasResult && previousResult && !resultLoading) {
      setIsCompleted(true);
    }
  }, [hasResult, previousResult, resultLoading]);


  const handleAnswer = (value) => {
    const q = questionsToShow[currentQuestion];
    const actualValue = q.reverse ? (6 - value) : value;
    const newAnswers = { ...answers, [currentQuestion]: { value: actualValue, domain: q.domain } };
    setAnswers(newAnswers);
    
    if (currentQuestion < questionsToShow.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const calculateScores = () => {
    const scores = { O: 0, C: 0, E: 0, A: 0, N: 0 };
    const counts = { O: 0, C: 0, E: 0, A: 0, N: 0 };
    
    Object.values(answers).forEach(answer => {
      scores[answer.domain] += answer.value;
      counts[answer.domain]++;
    });
    
    // نرمال‌سازی به درصد
    return {
      O: counts.O > 0 ? Math.round((scores.O / (counts.O * 5)) * 100) : 0,
      C: counts.C > 0 ? Math.round((scores.C / (counts.C * 5)) * 100) : 0,
      E: counts.E > 0 ? Math.round((scores.E / (counts.E * 5)) * 100) : 0,
      A: counts.A > 0 ? Math.round((scores.A / (counts.A * 5)) * 100) : 0,
      N: counts.N > 0 ? Math.round((scores.N / (counts.N * 5)) * 100) : 0
    };
  };

  const getDimensionLabel = (key) => {
    const labels = {
      O: "گشودگی به تجربه",
      C: "وظیفه‌شناسی",
      E: "برونگرایی",
      A: "سازگاری",
      N: "روان‌رنجوری"
    };
    return labels[key];
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


  const getInterpretation = (score, domain) => {
    const domainLabels = {
      'O': 'گشودگی به تجربه',
      'C': 'وظیفه‌شناسی',
      'E': 'برونگرایی',
      'A': 'سازگاری',
      'N': 'روان‌رنجوری'
    };
    
    if (domain === 'N') {
      if (score < 30) {
        return { 
          level: "پایین", 
          color: "#22c55e", 
          desc: "سطح پایین روان‌رنجوری",
          details: "شما سطح پایینی از روان‌رنجوری دارید که نشان‌دهنده ثبات عاطفی و مقاومت در برابر استرس است. این یک نشانه مثبت از سلامت روانی است.",
          strengths: [
            "ثبات عاطفی بالا",
            "مقاومت در برابر استرس",
            "نگرانی کم",
            "آرامش بیشتر",
            "کنترل بهتر احساسات"
          ],
          recommendations: [
            "حفظ این سطح از ثبات عاطفی",
            "تمرین مدیتیشن برای حفظ آرامش",
            "مدیریت استرس برای جلوگیری از افزایش روان‌رنجوری",
            "حفظ سبک زندگی سالم"
          ]
        };
      }
      if (score < 50) {
        return { 
          level: "متوسط-پایین", 
          color: "#84cc16", 
          desc: "سطح متوسط-پایین روان‌رنجوری",
          details: "شما سطح متوسط-پایینی از روان‌رنجوری دارید. گاهی ممکن است نگران باشید اما به طور کلی ثبات عاطفی مناسبی دارید.",
          strengths: [
            "ثبات عاطفی نسبی",
            "کنترل مناسب احساسات",
            "برخی مهارت‌های مقابله"
          ],
          recommendations: [
            "تقویت مهارت‌های مدیریت استرس",
            "تمرین ذهن‌آگاهی",
            "یادگیری تکنیک‌های آرام‌سازی"
          ]
        };
      }
      if (score < 70) {
        return { 
          level: "متوسط", 
          color: "#eab308", 
          desc: "سطح متوسط روان‌رنجوری",
          details: "شما سطح متوسطی از روان‌رنجوری دارید. ممکن است گاهی نگرانی یا اضطراب داشته باشید که می‌تواند بر عملکرد شما تأثیر بگذارد.",
          strengths: [
            "آگاهی از احساسات",
            "برخی مهارت‌های مقابله"
          ],
          recommendations: [
            "درمان شناختی-رفتاری (CBT)",
            "یادگیری تکنیک‌های مدیریت اضطراب",
            "تمرین ذهن‌آگاهی و آرام‌سازی",
            "مشاوره در صورت نیاز"
          ]
        };
      }
      return { 
        level: "بالا", 
        color: "#ef4444", 
        desc: "سطح بالا روان‌رنجوری",
        details: "شما سطح بالایی از روان‌رنجوری دارید که نشان‌دهنده حساسیت زیاد به استرس، نگرانی و اضطراب است. این می‌تواند به شدت بر عملکرد و کیفیت زندگی شما تأثیر بگذارد.",
        strengths: [
          "آگاهی از مشکل"
        ],
        recommendations: [
          "مراجعه به روان‌شناس یا روان‌پزشک",
          "درمان شناختی-رفتاری (CBT) برای مدیریت اضطراب",
          "تمرین منظم ذهن‌آگاهی و آرام‌سازی",
          "مدیریت استرس",
          "درمان دارویی در صورت نیاز (با تجویز پزشک)"
        ]
      };
    } else {
      const dimensionLabel = domainLabels[domain] || getDimensionLabel(domain);
      if (score < 30) {
        return { 
          level: "پایین", 
          color: "#eab308", 
          desc: `سطح پایین ${dimensionLabel}`,
          details: `شما سطح پایینی از ${dimensionLabel} دارید. این می‌تواند در برخی موقعیت‌ها محدودیت ایجاد کند.`,
          strengths: [
            "انعطاف‌پذیری در سبک",
            "توانایی سازگاری"
          ],
          recommendations: [
            `توسعه مهارت‌های مرتبط با ${dimensionLabel}`,
            "یادگیری و تمرین",
            "کار بر روی بهبود این بعد"
          ]
        };
      }
      if (score < 50) {
        return { 
          level: "متوسط-پایین", 
          color: "#84cc16", 
          desc: `سطح متوسط-پایین ${dimensionLabel}`,
          details: `شما سطح متوسط-پایینی از ${dimensionLabel} دارید. با توسعه بیشتر می‌توانید بهبود یابید.`,
          strengths: [
            "برخی مهارت‌های پایه",
            "پتانسیل رشد"
          ],
          recommendations: [
            `توسعه بیشتر ${dimensionLabel}`,
            "یادگیری مهارت‌های جدید",
            "تمرین منظم"
          ]
        };
      }
      if (score < 70) {
        return { 
          level: "متوسط", 
          color: "#22c55e", 
          desc: `سطح متوسط ${dimensionLabel}`,
          details: `شما سطح متوسطی از ${dimensionLabel} دارید که مناسب است. با تمرین می‌توانید بهتر شوید.`,
          strengths: [
            "عملکرد مناسب",
            "مهارت‌های پایه قوی"
          ],
          recommendations: [
            `حفظ و تقویت ${dimensionLabel}`,
            "ادامه یادگیری",
            "تمرین مستمر"
          ]
        };
      }
      return { 
        level: "بالا", 
        color: "#16a34a", 
        desc: `سطح بالا ${dimensionLabel}`,
        details: `شما سطح بالایی از ${dimensionLabel} دارید. این یک نقطه قوت مهم است که می‌تواند در موفقیت شما کمک کند.`,
        strengths: [
          `${dimensionLabel} قوی`,
          "نقاط قوت قابل توجه",
          "عملکرد عالی"
        ],
        recommendations: [
          `حفظ و استفاده از ${dimensionLabel} بالا`,
          "کمک به دیگران در توسعه این مهارت",
          "استفاده مؤثر از نقاط قوت"
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

    const radarData = {
      labels: ['گشودگی', 'وظیفه‌شناسی', 'برونگرایی', 'سازگاری', 'روان‌رنجوری'],
      datasets: [{
        label: 'شخصیت شما',
        data: [scores.O, scores.C, scores.E, scores.A, scores.N],
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgb(99, 102, 241)',
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(99, 102, 241)',
        borderWidth: 3
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
                <FaStar className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست شخصیت Big Five</h1>
                <p className="text-secondaryTextColor">پنج عامل بزرگ شخصیت</p>
              </div>
            </div>

            <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار شخصیت</h3>
              <div className="w-full h-96">
                <Radar data={radarData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    r: {
                      beginAtZero: true,
                      max: 100,
                      ticks: { color: '#9ca3af', backdropColor: 'transparent', stepSize: 20 },
                      grid: { color: '#374151' },
                      pointLabels: { color: '#e5e7eb', font: { size: 14 } }
                    }
                  },
                  plugins: { legend: { display: false } }
                }} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(scores).map(([key, score]) => {
                const interp = getInterpretation(score, key);
                return (
                  <div key={key} className="bg-darkThemeColor rounded-2xl p-6">
                    <h3 className="text-sm font-medium text-secondaryTextColor mb-2">{getDimensionLabel(key)}</h3>
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-bold" style={{ color: interp.color }}>{score}%</div>
                      <div className="flex-1">
                        <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${score}%`, backgroundColor: interp.color }}></div>
                        </div>
                        <div className="text-xs mt-1" style={{ color: interp.color }}>{interp.level}</div>
                        <div className="text-xs text-secondaryTextColor mt-1">{interp.desc}</div>
                        {interp.details && (
                          <div className="text-xs text-secondaryTextColor mt-2">{interp.details}</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">تحلیل جزئی‌تر</h3>
              <div className="space-y-6">
                {Object.entries(scores).map(([key, score]) => {
                  const interp = getInterpretation(score, key);
                  return (
                    <div key={key} className="border-b border-gray-700 pb-4 last:border-b-0">
                      <h4 className="font-semibold text-primaryTextColor mb-2">{getDimensionLabel(key)} ({key})</h4>
                      {interp.details && (
                        <p className="text-sm text-secondaryTextColor mb-3">{interp.details}</p>
                      )}
                      {interp.strengths && interp.strengths.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-xs font-semibold text-green-400 mb-1">نقاط قوت:</h5>
                          <ul className="list-disc list-inside text-xs text-secondaryTextColor space-y-1">
                            {interp.strengths.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {interp.recommendations && interp.recommendations.length > 0 && (
                        <div>
                          <h5 className="text-xs font-semibold text-blue-400 mb-1">توصیه‌ها:</h5>
                          <ul className="list-disc list-inside text-xs text-secondaryTextColor space-y-1">
                            {interp.recommendations.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توضیح ابعاد</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-blue-400 mb-1">گشودگی به تجربه (Openness)</h4>
                  <p className="text-sm text-secondaryTextColor">خلاقیت، کنجکاوی، تخیل و علاقه به هنر و ایده‌های جدید</p>
                </div>
                <div>
                  <h4 className="font-medium text-green-400 mb-1">وظیفه‌شناسی (Conscientiousness)</h4>
                  <p className="text-sm text-secondaryTextColor">نظم، مسئولیت‌پذیری، برنامه‌ریزی و پشتکار</p>
                </div>
                <div>
                  <h4 className="font-medium text-yellow-400 mb-1">برونگرایی (Extraversion)</h4>
                  <p className="text-sm text-secondaryTextColor">انرژی در جمع، اجتماعی بودن و گرم بودن</p>
                </div>
                <div>
                  <h4 className="font-medium text-purple-400 mb-1">سازگاری (Agreeableness)</h4>
                  <p className="text-sm text-secondaryTextColor">همدلی، همکاری، مهربانی و اعتماد</p>
                </div>
                <div>
                  <h4 className="font-medium text-red-400 mb-1">روان‌رنجوری (Neuroticism)</h4>
                  <p className="text-sm text-secondaryTextColor">نگرانی، حساسیت عاطفی و واکنش به استرس</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره Big Five</h4>
              <p className="text-sm text-blue-300">
                مدل Big Five یا پنج عامل بزرگ، یکی از معتبرترین مدل‌های شخصیت در روانشناسی است. 
                این مدل پنج بعد اصلی شخصیت را اندازه‌گیری می‌کند که تحقیقات گسترده نشان داده‌اند 
                در فرهنگ‌ها و زمان‌های مختلف پایدار هستند.
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
              <FaStar className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">تست شخصیت Big Five</h1>
              <p className="text-secondaryTextColor">سوال {currentQuestion + 1} از {questionsToShow.length}</p>
            </div>
          </div>

          <div className="w-full bg-darkThemeColor rounded-2xl p-6">
            <h2 
              key={`question-title-${currentQuestion}`}
              className="text-lg font-semibold text-primaryTextColor mb-2"
              style={{
                opacity: 0,
                animation: `questionTitleSlideIn 0.5s ease-out 0.2s forwards`,
                animationFillMode: 'forwards',
              }}
            >تا چه حد با این عبارت موافقید؟</h2>
            <h3 
              key={`question-text-${currentQuestion}`}
              className="text-xl font-bold text-primaryThemeColor mb-6"
              style={{
                opacity: 0,
                animation: `questionTextSlideIn 0.5s ease-out 0.4s forwards`,
                animationFillMode: 'forwards',
              }}
            >{questionsToShow[currentQuestion].text}</h3>
            <div className="space-y-3">
              {options.map((option, index) => (
                <button key={`${currentQuestion}-${option.value}`} onClick={() => handleAnswer(option.value)} className="w-full p-4 text-right bg-secondaryThemeColor hover:bg-primaryThemeColor/10 rounded-xl border border-borderColor hover:border-primaryThemeColor/40 transition-all"
                  style={{
                    opacity: 0,
                    animation: `testOptionFadeIn 0.4s ease-out ${0.6 + index * 0.1}s forwards`,
                    animationFillMode: 'forwards',
                  }}>
                  <span className="text-primaryTextColor font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="w-full bg-darkThemeColor rounded-2xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-secondaryTextColor">پیشرفت: {Math.round(((currentQuestion + 1) / questionsToShow.length) * 100)}%</span>
              <div className="w-32 h-2 bg-secondaryThemeColor rounded-full overflow-hidden">
                <div className="h-full bg-primaryThemeColor rounded-full transition-all duration-300" style={{ width: `${((currentQuestion + 1) / questionsToShow.length) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Page;







