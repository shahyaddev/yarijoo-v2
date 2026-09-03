"use client";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaSmile, FaFrown } from "react-icons/fa";
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { useTestResult } from "@/hooks/useTestResult";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const Page = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("panas");
  const [savedScore, setSavedScore] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
    {text:"علاقه‌مند",type:"PA"},{text:"پریشان",type:"NA"},{text:"هیجان‌زده",type:"PA"},{text:"ناراحت",type:"NA"},{text:"قوی",type:"PA"},
    {text:"گناهکار",type:"NA"},{text:"وحشت‌زده",type:"NA"},{text:"خصمانه",type:"NA"},{text:"مشتاق",type:"PA"},{text:"مغرور",type:"PA"},
    {text:"تحریک‌پذیر",type:"NA"},{text:"هوشیار",type:"PA"},{text:"شرمنده",type:"NA"},{text:"الهام‌گرفته",type:"PA"},{text:"عصبی",type:"NA"},
    {text:"مصمم",type:"PA"},{text:"توجه‌دار",type:"PA"},{text:"بی‌قرار",type:"NA"},{text:"فعال",type:"PA"},{text:"ترسیده",type:"NA"}
  ];

  const options = [{value:1,label:"خیلی کم"},{value:2,label:"کمی"},{value:3,label:"متوسط"},{value:4,label:"زیاد"},{value:5,label:"خیلی زیاد"}];

  // بررسی نتیجه قبلی
  useEffect(() => {
    if (hasResult && previousResult && !resultLoading) {
      setIsCompleted(true);
    }
  }, [hasResult, previousResult, resultLoading]);


  const handleAnswer = (value) => {
    setAnswers({...answers,[currentQuestion]:{value,type:questions[currentQuestion].type}});
    if (currentQuestion<questions.length-1) setCurrentQuestion(currentQuestion+1);
    else setIsCompleted(true);
  };

  const calculateScores = () => {
    const PA = Object.values(answers).filter(a=>a.type==='PA').reduce((sum,a)=>sum+a.value,0);
    const NA = Object.values(answers).filter(a=>a.type==='NA').reduce((sum,a)=>sum+a.value,0);
    return {PA,NA};
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


  const getInterpretation = (PA, NA) => {
    const PAInterpretation = PA < 25 ? {
      level: "پایین",
      color: "#eab308",
      desc: "عاطفه مثبت پایین است.",
      details: "عاطفه مثبت شما پایین است. ممکن است احساس شادی، انرژی و علاقه کمتری داشته باشید.",
      strengths: [],
      recommendations: [
        "افزایش فعالیت‌های لذت‌بخش",
        "تمرین قدردانی و مثبت‌اندیشی",
        "ورزش منظم",
        "تقویت روابط اجتماعی",
        "در صورت نیاز، مشاوره با روان‌شناس"
      ]
    } : PA < 35 ? {
      level: "متوسط",
      color: "#22c55e",
      desc: "عاطفه مثبت در محدوده متوسط است.",
      details: "عاطفه مثبت شما در محدوده متوسط است. می‌توانید احساس شادی و انرژی داشته باشید اما فضای بهبود وجود دارد.",
      strengths: [
        "برخی احساسات مثبت",
        "توانایی تجربه شادی"
      ],
      recommendations: [
        "افزایش فعالیت‌های لذت‌بخش",
        "تمرین قدردانی",
        "حفظ روابط مثبت"
      ]
    } : {
      level: "بالا",
      color: "#16a34a",
      desc: "عاطفه مثبت بالا است.",
      details: "عاطفه مثبت شما بالا است. شما احساس شادی، انرژی و علاقه بالایی دارید. این یک نشانه مثبت است.",
      strengths: [
        "احساسات مثبت قوی",
        "انرژی و شادی بالا",
        "علاقه و اشتیاق",
        "کیفیت زندگی خوب"
      ],
      recommendations: [
        "حفظ این سطح مثبت",
        "به اشتراک گذاری شادی",
        "کمک به دیگران"
      ]
    };

    const NAInterpretation = NA < 18 ? {
      level: "پایین",
      color: "#22c55e",
      desc: "عاطفه منفی پایین است.",
      details: "عاطفه منفی شما پایین است. این یک نشانه مثبت است و نشان می‌دهد که احساسات منفی کمی تجربه می‌کنید.",
      strengths: [
        "کنترل خوب احساسات منفی",
        "سطح اضطراب و استرس پایین",
        "سلامت روانی خوب"
      ],
      recommendations: [
        "حفظ این سطح",
        "ادامه مدیریت استرس"
      ]
    } : NA < 25 ? {
      level: "متوسط",
      color: "#eab308",
      desc: "عاطفه منفی در محدوده متوسط است.",
      details: "عاطفه منفی شما در محدوده متوسط است. ممکن است گاهی احساس اضطراب، ناراحتی یا استرس داشته باشید.",
      strengths: [
        "برخی مهارت‌های مقابله",
        "آگاهی از احساسات"
      ],
      recommendations: [
        "یادگیری تکنیک‌های مدیریت استرس",
        "تمرین ذهن‌آگاهی",
        "مشاوره در صورت نیاز"
      ]
    } : {
      level: "بالا",
      color: "#ef4444",
      desc: "عاطفه منفی بالا است.",
      details: "عاطفه منفی شما بالا است. ممکن است احساس اضطراب، ناراحتی، استرس یا خشم بالایی داشته باشید. این نیاز به توجه دارد.",
      strengths: [
        "شناسایی مشکل"
      ],
      recommendations: [
        "مراجعه به روان‌شناس یا روان‌پزشک",
        "درمان شناختی-رفتاری (CBT)",
        "یادگیری تکنیک‌های مدیریت استرس",
        "تمرین ذهن‌آگاهی",
        "ایجاد سیستم حمایتی قوی"
      ]
    };

    return {
      PA: PAInterpretation,
      NA: NAInterpretation
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
    const {PA,NA} = calculateScores();
    const interpretation = getInterpretation(PA, NA);
    const maxScore = 50;
    const radarData = {
      labels: ['عاطفه مثبت', 'عاطفه منفی'],
      datasets: [{
        label: 'نمرات',
        data: [PA, NA],
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderColor: 'rgb(34, 197, 94)',
        pointBackgroundColor: 'rgb(34, 197, 94)',
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
                <FaSmile className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج مقیاس PANAS</h1>
                <p className="text-secondaryTextColor">عاطفه مثبت و منفی</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
            key={`question-box-${currentQuestion}`}
            className="w-full bg-darkThemeColor rounded-2xl p-6"
          >
                <div className="flex items-center gap-3 mb-2">
                  <FaSmile className="text-green-400" />
                  <h3 className="text-sm font-medium text-secondaryTextColor">عاطفه مثبت</h3>
                </div>
                <div className="text-4xl font-bold text-green-400">{PA}</div>
              </div>
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <FaFrown className="text-red-400" />
                  <h3 className="text-sm font-medium text-secondaryTextColor">عاطفه منفی</h3>
                </div>
                <div className="text-4xl font-bold text-red-400">{NA}</div>
              </div>
            </div>
            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار</h3>
              <div className="w-full h-80">
                <Radar data={radarData} options={{
                  responsive: true, maintainAspectRatio: false,
                  scales: { r: { beginAtZero: true, max: 50, ticks: { color: '#9ca3af', backdropColor: 'transparent' }, grid: { color: '#374151' }, pointLabels: { color: '#e5e7eb', font: { size: 14 } } } },
                  plugins: { legend: { display: false } }
                }} />
              </div>
            </div>
            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">تفسیر نتایج</h3>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl" style={{backgroundColor: interpretation.PA.color + '20', borderLeft: `4px solid ${interpretation.PA.color}`}}>
                  <h4 className="font-semibold mb-2" style={{color: interpretation.PA.color}}>عاطفه مثبت: {interpretation.PA.level}</h4>
                  <p className="text-sm text-secondaryTextColor mb-1">{interpretation.PA.desc}</p>
                  {interpretation.PA.details && (
                    <p className="text-sm text-secondaryTextColor mt-2 leading-relaxed">{interpretation.PA.details}</p>
                  )}
                  <p className="text-xs text-secondaryTextColor mt-2">نمره شما: {PA} از {maxScore}</p>
                </div>
                
                <div className="p-4 rounded-xl" style={{backgroundColor: interpretation.NA.color + '20', borderLeft: `4px solid ${interpretation.NA.color}`}}>
                  <h4 className="font-semibold mb-2" style={{color: interpretation.NA.color}}>عاطفه منفی: {interpretation.NA.level}</h4>
                  <p className="text-sm text-secondaryTextColor mb-1">{interpretation.NA.desc}</p>
                  {interpretation.NA.details && (
                    <p className="text-sm text-secondaryTextColor mt-2 leading-relaxed">{interpretation.NA.details}</p>
                  )}
                  <p className="text-xs text-secondaryTextColor mt-2">نمره شما: {NA} از {maxScore}</p>
                </div>
              </div>
            </div>

            {((interpretation.PA.strengths && interpretation.PA.strengths.length > 0) || (interpretation.NA.strengths && interpretation.NA.strengths.length > 0)) && (
              <div className="bg-darkThemeColor rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نقاط قوت</h3>
                <ul className="space-y-2">
                  {[...(interpretation.PA.strengths || []), ...(interpretation.NA.strengths || [])].filter((v, i, a) => a.indexOf(v) === i).map((strength, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                      <span className="text-secondaryTextColor">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توصیه‌های تخصصی</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-green-400 mb-2">💚 تقویت عاطفه مثبت:</h4>
                  <ul className="space-y-2">
                    {interpretation.PA.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                        <span className="text-secondaryTextColor text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-red-400 mb-2">❤️ مدیریت عاطفه منفی:</h4>
                  <ul className="space-y-2">
                    {interpretation.NA.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="size-2 rounded-full bg-primaryThemeColor mt-2 flex-shrink-0"></div>
                        <span className="text-secondaryTextColor text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره PANAS</h4>
              <p className="text-sm text-blue-300">PANAS (Positive and Negative Affect Schedule) یک ابزار 20 سوالی معتبر برای سنجش عاطفه مثبت و منفی است. این دو بعد مستقل از هم هستند و هر دو برای سلامت روانی مهم هستند.</p>
            </div>
            <button onClick={()=>{setCurrentQuestion(0);setAnswers({});setIsCompleted(false);}} className="w-full h-12 bg-primaryThemeColor text-white rounded-xl font-medium hover:bg-primaryThemeColor/90 transition-colors">انجام مجدد</button>
          </div>
        </div>
            <button 
              onClick={async () => {
                await resetResult();
                setCurrentQuestion(0);
                setAnswers({});
                setIsCompleted(false);
                setSavedScore(null);
              }} 
              className="w-full h-12 bg-primaryThemeColor text-white rounded-xl font-medium hover:bg-primaryThemeColor/90 transition-colors"
            >
              انجام مجدد تست
            </button>

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
              <FaSmile className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">مقیاس عاطفه مثبت و منفی</h1>
              <p className="text-secondaryTextColor">سوال {currentQuestion+1} از {questions.length}</p>
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
            >در هفته گذشته چقدر این احساس را داشتید؟</h2>
            <h3 
              key={`question-text-${currentQuestion}`}
              className="text-xl font-bold text-primaryThemeColor mb-6"
              style={{
                opacity: 0,
                animation: `questionTextSlideIn 0.5s ease-out 0.4s forwards`,
                animationFillMode: 'forwards',
              }}
            >{questions[currentQuestion].text}</h3>
            <div className="space-y-3">
              {options.map((option, index) =>(
                <button key={`${currentQuestion}-${option.value}`} onClick={()=>handleAnswer(option.value)} className="w-full p-4 text-right bg-secondaryThemeColor hover:bg-primaryThemeColor/10 rounded-xl border border-borderColor hover:border-primaryThemeColor/40 transition-all"
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
              <span className="text-sm text-secondaryTextColor">پیشرفت: {Math.round(((currentQuestion+1)/questions.length)*100)}%</span>
              <div className="w-32 h-2 bg-secondaryThemeColor rounded-full overflow-hidden">
                <div className="h-full bg-primaryThemeColor rounded-full transition-all duration-300" style={{width:`${((currentQuestion+1)/questions.length)*100}%`}}></div>
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



