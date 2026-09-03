"use client";
import { useTestResult } from "@/hooks/useTestResult";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaUsers } from "react-icons/fa";
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const Page = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("disc");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
    {text:"در موقعیت‌های مبهم سریع تصمیم می‌گیرم",domain:"D"},
    {text:"برای رسیدن به نتیجه، ریسک را می‌پذیرم",domain:"D"},
    {text:"در بحث‌ها موضع خود را قاطعانه بیان می‌کنم",domain:"D"},
    {text:"ترجیح می‌دهم کنترل امور در دستم باشد",domain:"D"},
    {text:"سرعت عمل برایم مهم‌تر از جزییات است",domain:"D"},
    {text:"در برابر فشار، به جلو می‌روم نه عقب",domain:"D"},
    {text:"در مواجهه با موانع، رویکرد تهاجمی می‌گیرم",domain:"D"},
    {text:"از تعامل با افراد جدید انرژی می‌گیرم",domain:"I"},
    {text:"با داستان‌گویی و مثال دیگران را متقاعد می‌کنم",domain:"I"},
    {text:"فضای مثبت و شاد ایجاد می‌کنم",domain:"I"},
    {text:"به‌راحتی شبکه ارتباطی می‌سازم",domain:"I"},
    {text:"در جمع، ابراز وجود برایم ساده است",domain:"I"},
    {text:"به فرصت‌های تازه با هیجان پاسخ می‌دهم",domain:"I"},
    {text:"برای انگیزش دیگران از تشویق استفاده می‌کنم",domain:"I"},
    {text:"ثبات و پیش‌بینی‌پذیری را ارزشمند می‌دانم",domain:"S"},
    {text:"در تغییرات ناگهانی مضطرب می‌شوم",domain:"S",reverse:true},
    {text:"با آرامش و حوصله کارها را پیش می‌برم",domain:"S"},
    {text:"به جای شتاب، دنبال هماهنگی تیمی هستم",domain:"S"},
    {text:"به ندرت واکنش تند نشان می‌دهم",domain:"S"},
    {text:"پیش از تغییر، نیاز به زمان تطبیق دارم",domain:"S"},
    {text:"در تعارض‌ها، رویکرد مسالمت‌آمیز دارم",domain:"S"},
    {text:"به جزییات و کیفیت اجرای کار حساس هستم",domain:"C"},
    {text:"ترجیح می‌دهم قبل از اقدام، استانداردها را روشن کنم",domain:"C"},
    {text:"با داده‌ها و شواهد تصمیم می‌گیرم",domain:"C"},
    {text:"از اشتباهات جلوگیری می‌کنم حتی اگر زمان‌بر باشد",domain:"C"},
    {text:"بازخورد انتقادی را ارزشمند می‌دانم",domain:"C"},
    {text:"برای هر کار، معیار سنجش تعریف می‌کنم",domain:"C"},
    {text:"وقتی کیفیت پایین است، به‌صراحت مطرح می‌کنم",domain:"C"}
  ];

  const options = [{value:1,label:"کاملاً مخالفم"},{value:2,label:"مخالفم"},{value:3,label:"نه موافق نه مخالف"},{value:4,label:"موافقم"},{value:5,label:"کاملاً موافقم"}];

  // بررسی نتیجه قبلی
  useEffect(() => {
    if (hasResult && previousResult && !resultLoading) {
      setIsCompleted(true);
    }
  }, [hasResult, previousResult, resultLoading]);


  const handleAnswer = (value) => {
    const q = questions[currentQuestion];
    const actualValue = q.reverse ? (6 - value) : value;
    setAnswers({...answers,[currentQuestion]:{value:actualValue,domain:q.domain}});
    if (currentQuestion<questions.length-1) setCurrentQuestion(currentQuestion+1);
    else setIsCompleted(true);
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
    const scores = {D:0,I:0,S:0,C:0};
    const counts = {D:0,I:0,S:0,C:0};
    Object.values(answers).forEach(a => {
      scores[a.domain] += a.value;
      counts[a.domain]++;
    });
    return {
      D: counts.D > 0 ? Math.round((scores.D/(counts.D*5))*100) : 0,
      I: counts.I > 0 ? Math.round((scores.I/(counts.I*5))*100) : 0,
      S: counts.S > 0 ? Math.round((scores.S/(counts.S*5))*100) : 0,
      C: counts.C > 0 ? Math.round((scores.C/(counts.C*5))*100) : 0
    };
  };

  const getDominantType = (scores) => {
    const sorted = Object.entries(scores).sort((a,b) => b[1]-a[1]);
    return sorted[0][0];
  };

  const getTypeInfo = (type) => {
    const types = {
      D: {
        title:"Dominance (تسلط)",
        color:"#ef4444",
        desc:"قاطع، رقابتی، نتیجه‌گرا",
        strengths:["تصمیم‌گیری سریع","پذیرش چالش‌ها","رهبری قاطع","هدف‌گرایی بالا","شجاعت در ریسک‌پذیری"],
        weaknesses:["بی‌صبری","کم توجهی به احساسات دیگران","تمایل به کنترل بیش از حد","عدم تحمل کندی"],
        ideal_env:["محیط‌های چالش‌برانگیز","موقعیت‌های رهبری","پروژه‌های نتیجه‌محور","فضاهای رقابتی"],
        communication:"مستقیم و روشن صحبت کنید، به نتایج تمرکز کنید، زمان آن‌ها را تلف نکنید"
      },
      I: {
        title:"Influence (تأثیرگذاری)",
        color:"#eab308",
        desc:"اجتماعی، متقاعدکننده، مثبت‌نگر",
        strengths:["ارتباط عالی با دیگران","خوش‌بینی و انرژی بخشی","توانایی ترغیب و الهام‌بخشی","خلاقیت در ارتباطات","ایجاد فضای مثبت"],
        weaknesses:["گاهی سطحی نگری","اجتناب از تعارض","بیش از حد خوش‌بین","کم توجهی به جزئیات"],
        ideal_env:["کار تیمی و اجتماعی","فروش و بازاریابی","ارائه و سخنرانی","محیط‌های خلاقانه"],
        communication:"با حرارت و مثبت صحبت کنید، به ایده‌ها و احساساتشان توجه کنید، فضای شاد ایجاد کنید"
      },
      S: {
        title:"Steadiness (ثبات)",
        color:"#22c55e",
        desc:"آرام، حامی، صبور",
        strengths:["صبر و حوصله بالا","حمایتگر و وفادار","گوش دادن فعال","ایجاد ثبات و هماهنگی","قابل اتکا و مطمئن"],
        weaknesses:["مقاومت در برابر تغییر","اجتناب از تعارض","سختی در گفتن نه","نیاز زیاد به تایید"],
        ideal_env:["محیط‌های باثبات","کار تیمی هماهنگ","نقش‌های حمایتی","روال‌های مشخص"],
        communication:"با آرامش و صبر صحبت کنید، احساسات را تایید کنید، زمان برای تطبیق با تغییرات بدهید"
      },
      C: {
        title:"Conscientiousness (دقت)",
        color:"#3b82f6",
        desc:"تحلیلگر، دقیق، سیستماتیک",
        strengths:["دقت و توجه به جزئیات","تفکر تحلیلی قوی","پایبندی به استانداردها","سیستماتیک و منظم","کیفیت‌گرایی"],
        weaknesses:["تردید بیش از حد","انتقاد زیاد از خود و دیگران","کمال‌گرایی","کندی در تصمیم‌گیری"],
        ideal_env:["کارهای تحلیلی","محیط‌های ساختاریافته","پروژه‌های دقیق","نقش‌های کیفیت‌محور"],
        communication:"با داده و منطق صحبت کنید، جزئیات را توضیح دهید، به دقت و کیفیت احترام بگذارید"
      }
    };
    return types[type];
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
    const dominantType = getDominantType(scores);
    const typeInfo = getTypeInfo(dominantType);

    const radarData = {
      labels: ['تسلط (D)', 'تأثیر (I)', 'ثبات (S)', 'دقت (C)'],
      datasets: [{
        label: 'پروفایل DISC',
        data: [scores.D, scores.I, scores.S, scores.C],
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgb(99, 102, 241)',
        pointBackgroundColor: ['#ef4444', '#eab308', '#22c55e', '#3b82f6'],
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
                <FaUsers className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج تست DISC</h1>
                <p className="text-secondaryTextColor">پروفایل رفتاری شما</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primaryThemeColor/20 to-primaryThemeColor/5 rounded-2xl p-6 border-2" style={{borderColor:typeInfo.color+'50'}}>
              <div className="text-center">
                <div className="text-5xl font-bold mb-3" style={{color:typeInfo.color}}>{dominantType}</div>
                <h2 className="text-2xl font-bold text-primaryTextColor mb-2">{typeInfo.title}</h2>
                <p className="text-lg text-secondaryTextColor">{typeInfo.desc}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(scores).map(([key,score]) => {
                const info = getTypeInfo(key);
                return (
                  <div key={key} className="bg-darkThemeColor rounded-2xl p-4">
                    <h3 className="text-xs font-medium text-secondaryTextColor mb-2">{key}</h3>
                    <div className="text-3xl font-bold mb-1" style={{color:info.color}}>{score}%</div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{width:`${score}%`,backgroundColor:info.color}}></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار DISC</h3>
              <div className="w-full h-96">
                <Radar data={radarData} options={{
                  responsive: true, maintainAspectRatio: false,
                  scales: {r:{beginAtZero:true,max:100,ticks:{color:'#9ca3af',backdropColor:'transparent',stepSize:20},grid:{color:'#374151'},pointLabels:{color:'#e5e7eb',font:{size:14}}}},
                  plugins: {legend:{display:false}}
                }} />
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">تفسیر کامل تیپ {dominantType}</h3>
              <p className="text-secondaryTextColor mb-4">{typeInfo.desc}</p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-primaryTextColor mb-2">📝 توضیحات:</h4>
                  <p className="text-sm text-secondaryTextColor leading-relaxed">
                    تیپ {typeInfo.title} با نمره {scores[dominantType]}% از {dominantType} شما را توصیف می‌کند. 
                    این پروفایل نشان می‌دهد که شما تمایل به {typeInfo.desc} دارید و در محیط‌های {typeInfo.ideal_env.slice(0, 2).join(' و ')} عملکرد بهتری خواهید داشت.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-primaryTextColor mb-2">💪 نقاط قوت:</h4>
                  <ul className="space-y-1 text-sm text-secondaryTextColor">
                    {typeInfo.strengths.map((s,i)=><li key={i}>• {s}</li>)}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-primaryTextColor mb-2">⚠️ نقاط ضعف:</h4>
                  <ul className="space-y-1 text-sm text-secondaryTextColor">
                    {typeInfo.weaknesses.map((w,i)=><li key={i}>• {w}</li>)}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-primaryTextColor mb-2">🎯 محیط ایده‌آل:</h4>
                  <ul className="space-y-1 text-sm text-secondaryTextColor">
                    {typeInfo.ideal_env.map((e,i)=><li key={i}>• {e}</li>)}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-primaryTextColor mb-2">💬 نحوه ارتباط با این تیپ:</h4>
                  <p className="text-sm text-secondaryTextColor">{typeInfo.communication}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-primaryTextColor mb-2">💡 توصیه‌های توسعه:</h4>
                  <ul className="space-y-1 text-sm text-secondaryTextColor">
                    <li>• تمرکز بر تقویت نقاط قوت خود</li>
                    <li>• کار بر روی بهبود نقاط ضعف</li>
                    <li>• جستجوی محیط‌های کاری که با پروفایل شما سازگار است</li>
                    <li>• یادگیری نحوه ارتباط مؤثر با تیپ‌های دیگر</li>
                    <li>• استفاده از نقاط قوت در موقعیت‌های مناسب</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">توضیح ابعاد چهارگانه</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500 mt-1"></div>
                  <div><strong className="text-red-400">D (Dominance):</strong> <span className="text-secondaryTextColor">قاطعیت، رقابت، نتیجه‌گرایی - نمره شما: {scores.D}%</span></div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mt-1"></div>
                  <div><strong className="text-yellow-400">I (Influence):</strong> <span className="text-secondaryTextColor">اجتماعی، خوش‌بین، متقاعدکننده - نمره شما: {scores.I}%</span></div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 mt-1"></div>
                  <div><strong className="text-green-400">S (Steadiness):</strong> <span className="text-secondaryTextColor">صبور، حامی، قابل اعتماد - نمره شما: {scores.S}%</span></div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mt-1"></div>
                  <div><strong className="text-blue-400">C (Conscientiousness):</strong> <span className="text-secondaryTextColor">دقیق، تحلیلگر، سیستماتیک - نمره شما: {scores.C}%</span></div>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره DISC</h4>
              <p className="text-sm text-blue-300">
                مدل DISC یک ابزار ارزیابی رفتاری است که چهار بعد اصلی رفتار را می‌سنجد: 
                تسلط، تأثیرگذاری، ثبات و دقت. این مدل در محیط‌های کاری و تیمی بسیار کاربرد دارد.
              </p>
            </div>

            <button onClick={()=>{setCurrentQuestion(0);setAnswers({});setIsCompleted(false);}} className="w-full h-12 bg-primaryThemeColor text-white rounded-xl font-medium hover:bg-primaryThemeColor/90 transition-colors">انجام مجدد تست</button>
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
              <FaUsers className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primaryTextColor">تست DISC</h1>
              <p className="text-secondaryTextColor">سوال {currentQuestion+1} از {questions.length}</p>
            </div>
          </div>
          <div className="w-full bg-darkThemeColor rounded-2xl p-6">
            <h3 className="text-xl font-bold text-primaryThemeColor mb-6">{questions[currentQuestion].text}</h3>
            <div className="space-y-3">
              {options.map((option)=>(
                <button key={option.value} onClick={()=>handleAnswer(option.value)} className="w-full p-4 text-right bg-secondaryThemeColor hover:bg-primaryThemeColor/10 rounded-xl border border-borderColor hover:border-primaryThemeColor/40 transition-all">
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