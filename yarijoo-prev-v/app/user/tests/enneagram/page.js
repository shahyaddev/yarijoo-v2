"use client";
import { useTestResult } from "@/hooks/useTestResult";
import Header from "@/components/header/Header";
import MobileHeader from "@/components/header/MobileHeader";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/user/Sidebar";
import Footer from "@/components/footer/Footer";
import { FaStar } from "react-icons/fa";
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const Page = () => {
  const { previousResult, loading: resultLoading, saveResult, resetResult, hasResult } = useTestResult("enneagram");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
    {text:"برای درست انجام شدن کارها معیارهای بالایی دارم",type:1},
    {text:"وقتی نظم رعایت نمی‌شود آشفته می‌شوم",type:1},
    {text:"اغلب خودم را اصلاح و بهبود می‌دهم",type:1},
    {text:"وقتی کسی استانداردها را نادیده می‌گیرد، انتقاد می‌کنم",type:1},
    {text:"کمک به دیگران مرا انگیزه‌مند می‌کند",type:2},
    {text:"گاهی نیازهای خودم را فدای دیگران می‌کنم",type:2},
    {text:"دوست دارم مورد نیاز و ضروری باشم",type:2},
    {text:"در ارتباطات، به احساسات حساس هستم",type:2},
    {text:"به موفقیت و پیشرفت اهمیت می‌دهم",type:3},
    {text:"تصویر خوبی از خودم به دیگران ارائه می‌دهم",type:3},
    {text:"کارآمد و هدف‌مند هستم",type:3},
    {text:"رقابت مرا تحریک می‌کند",type:3},
    {text:"احساسات عمیق و پیچیده دارم",type:4},
    {text:"گاهی احساس تفاوت با دیگران می‌کنم",type:4},
    {text:"به زیبایی و معنا توجه دارم",type:4},
    {text:"خلاقیت و بیان خود برایم مهم است",type:4},
    {text:"قبل از اقدام، تحقیق و تحلیل می‌کنم",type:5},
    {text:"دانش و درک عمیق برایم ارزشمند است",type:5},
    {text:"گاهی انزوا را به تعامل ترجیح می‌دهم",type:5},
    {text:"پیچیدگی‌های فکری مرا جذب می‌کند",type:5},
    {text:"نسبت به خطرات احتیاط می‌کنم",type:6},
    {text:"به تعهد و وفاداری اهمیت می‌دهم",type:6},
    {text:"گاهی شک و تردید دارم",type:6},
    {text:"می‌خواهم احساس امنیت کنم",type:6},
    {text:"از تنوع و تجربه‌های جدید لذت می‌برم",type:7},
    {text:"دوست دارم شاد و هیجان‌زده باشم",type:7},
    {text:"گاهی از تعهد طفره می‌روم",type:7},
    {text:"خوش‌بین و مثبت‌نگر هستم",type:7},
    {text:"دوست دارم کنترل داشته باشم",type:8},
    {text:"برای عدالت و حقیقت می‌ایستم",type:8},
    {text:"قوی و مستقل هستم",type:8},
    {text:"ضعف را نمی‌پذیرم",type:8},
    {text:"آرامش و صلح برایم مهم است",type:9},
    {text:"از تعارض اجتناب می‌کنم",type:9},
    {text:"با همه کنار می‌آیم",type:9},
    {text:"گاهی نیازهایم را نادیده می‌گیرم",type:9}
  ];

  const options = [{value:1,label:"کاملاً مخالفم"},{value:2,label:"مخالفم"},{value:3,label:"نه موافق نه مخالف"},{value:4,label:"موافقم"},{value:5,label:"کاملاً موافقم"}];

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
    const scores = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
    const counts = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
    Object.values(answers).forEach(a => {
      scores[a.type] += a.value;
      counts[a.type]++;
    });
    const result = {};
    for(let i=1; i<=9; i++) {
      result[i] = counts[i] > 0 ? Math.round((scores[i]/(counts[i]*5))*100) : 0;
    }
    return result;
  };

  const getDominantType = (scores) => {
    return Object.entries(scores).sort((a,b) => b[1]-a[1])[0][0];
  };

  const getTypeInfo = (type) => {
    const types = {
      1: {title:"اصلاح‌گر (Reformer)",color:"#3b82f6",strengths:["اصول‌گرا","منظم","با وجدان","مسئولیت‌پذیر"],weaknesses:["کمال‌گرا","انتقادی","سختگیر"],motivation:"درست بودن و بهبود دنیا"},
      2: {title:"یاور (Helper)",color:"#22c55e",strengths:["دلسوز","مراقب","سخاوتمند","همدل"],weaknesses:["فراموش کردن نیازهای خود","نیاز به تایید"],motivation:"دوست داشته شدن و کمک به دیگران"},
      3: {title:"موفق (Achiever)",color:"#eab308",strengths:["هدف‌گرا","کارآمد","انگیزه‌مند","انطباق‌پذیر"],weaknesses:["بیش از حد کارگرا","وابسته به تایید دیگران"],motivation:"موفقیت و ارزشمند بودن"},
      4: {title:"فردگرا (Individualist)",color:"#a855f7",strengths:["خلاق","عمیق","معنادار","اصیل"],weaknesses:["خودمحور","افسرده","حسود"],motivation:"منحصربه‌فرد بودن و یافتن هویت"},
      5: {title:"پژوهشگر (Investigator)",color:"#06b6d4",strengths:["تحلیلگر","مستقل","نوآور","دانش‌پژوه"],weaknesses:["انزواطلب","گوشه‌گیر","جدا از احساسات"],motivation:"دانستن و درک عمیق"},
      6: {title:"وفادار (Loyalist)",color:"#f97316",strengths:["متعهد","قابل اعتماد","مسئول","محتاط"],weaknesses:["مضطرب","شکاک","بی‌اعتماد"],motivation:"امنیت و حمایت"},
      7: {title:"شادی‌طلب (Enthusiast)",color:"#f59e0b",strengths:["خوش‌بین","ماجراجو","شاد","خلاق"],weaknesses:["پراکنده","سطحی","فراری از درد"],motivation:"شادی و آزادی"},
      8: {title:"رهبر (Challenger)",color:"#ef4444",strengths:["قوی","قاطع","محافظ","عادل"],weaknesses:["تهاجمی","کنترل‌گر","لجباز"],motivation:"قدرت و کنترل"},
      9: {title:"آشتی‌جو (Peacemaker)",color:"#84cc16",strengths:["آرام","قابل قبول","صبور","حمایتگر"],weaknesses:["انفعالی","فراموش کردن خود","اجتناب از تعارض"],motivation:"صلح و هماهنگی"}
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
      labels: ['تیپ 1','تیپ 2','تیپ 3','تیپ 4','تیپ 5','تیپ 6','تیپ 7','تیپ 8','تیپ 9'],
      datasets: [{
        label: 'پروفایل',
        data: [scores[1],scores[2],scores[3],scores[4],scores[5],scores[6],scores[7],scores[8],scores[9]],
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        borderColor: 'rgb(168, 85, 247)',
        pointBackgroundColor: 'rgb(168, 85, 247)',
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
                <h1 className="text-2xl font-bold text-primaryTextColor">نتایج انیاگرام</h1>
                <p className="text-secondaryTextColor">تیپ شخصیتی شما</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primaryThemeColor/20 to-primaryThemeColor/5 rounded-2xl p-6 border-2" style={{borderColor:typeInfo.color+'50'}}>
              <div className="text-center">
                <div className="text-6xl font-bold mb-3" style={{color:typeInfo.color}}>{dominantType}</div>
                <h2 className="text-2xl font-bold text-primaryTextColor mb-2">{typeInfo.title}</h2>
                <p className="text-lg text-secondaryTextColor mb-4">انگیزه اصلی: {typeInfo.motivation}</p>
              </div>
              
              <div className="mt-6 space-y-4">
                <div>
                  <h4 className="font-semibold text-primaryTextColor mb-2">💪 نقاط قوت:</h4>
                  <div className="flex flex-wrap gap-2">
                    {typeInfo.strengths.map((s,i)=><span key={i} className="px-3 py-1 bg-green-900/30 text-green-400 rounded-full text-sm">{s}</span>)}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-primaryTextColor mb-2">⚠️ چالش‌ها:</h4>
                  <div className="flex flex-wrap gap-2">
                    {typeInfo.weaknesses.map((w,i)=><span key={i} className="px-3 py-1 bg-red-900/30 text-red-400 rounded-full text-sm">{w}</span>)}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">نمودار انیاگرام</h3>
              <div className="w-full h-96">
                <Radar data={radarData} options={{
                  responsive: true, maintainAspectRatio: false,
                  scales: {r:{beginAtZero:true,max:100,ticks:{color:'#9ca3af',backdropColor:'transparent',stepSize:20},grid:{color:'#374151'},pointLabels:{color:'#e5e7eb',font:{size:12}}}},
                  plugins: {legend:{display:false}}
                }} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {Object.entries(scores).map(([type,score]) => {
                const info = getTypeInfo(type);
                return (
                  <div key={type} className="bg-darkThemeColor rounded-xl p-3">
                    <div className="text-2xl font-bold mb-1" style={{color:info.color}}>{type}</div>
                    <div className="text-xs text-secondaryTextColor mb-2">{info.title}</div>
                    <div className="text-lg font-bold" style={{color:info.color}}>{score}%</div>
                  </div>
                );
              })}
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">📝 تفسیر کامل تیپ {dominantType}</h3>
              <p className="text-secondaryTextColor leading-relaxed mb-4">
                تیپ {typeInfo.title} با نمره {scores[dominantType]}% تیپ غالب شخصیت شماست. 
                این تیپ نشان می‌دهد که انگیزه اصلی شما {typeInfo.motivation} است.
              </p>
              <p className="text-secondaryTextColor leading-relaxed">
                هر تیپ در انیاگرام نقاط قوت و چالش‌های منحصر به فرد خود را دارد. 
                شناخت این تیپ می‌تواند به شما در درک بهتر خود و بهبود روابط کمک کند.
              </p>
            </div>

            <div className="bg-darkThemeColor rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primaryTextColor mb-4">💡 توصیه‌های توسعه</h3>
              <ul className="space-y-2 text-secondaryTextColor">
                <li>• تمرکز بر تقویت نقاط قوت تیپ خود</li>
                <li>• کار بر روی چالش‌ها و محدودیت‌های تیپ</li>
                <li>• یادگیری در مورد تیپ‌های دیگر برای بهبود ارتباطات</li>
                <li>• استفاده از نقاط قوت تیپ در موقعیت‌های مناسب</li>
                <li>• خودآگاهی بیشتر از الگوهای رفتاری تیپ</li>
              </ul>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="font-medium text-blue-400 mb-3">💡 درباره انیاگرام</h4>
              <p className="text-sm text-blue-300">
                انیاگرام یک سیستم 9 تیپی شخصیت است که انگیزه‌ها، ترس‌ها و الگوهای رفتاری را می‌شناسد. 
                هر تیپ نقاط قوت و چالش‌های منحصر به فرد خود را دارد.
              </p>
            </div>

            <button onClick={()=>{setCurrentQuestion(0);setAnswers({});setIsCompleted(false);}} className="w-full h-12 bg-primaryThemeColor text-white rounded-xl font-medium hover:bg-primaryThemeColor/90 transition-colors">انجام مجدد</button>
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
              <h1 className="text-2xl font-bold text-primaryTextColor">تست انیاگرام</h1>
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