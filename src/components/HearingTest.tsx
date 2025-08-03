import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Volume2, VolumeX, MessageCircle, MapPin, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface HearingTestProps {
  onBackToIntro: () => void;
}

interface TestQuestion {
  id: number;
  frequency: string;
  audioLevel: string;
  instruction: string;
  audioSrc: string;
  volume: number;
}

const frequencies = [
  { frequency: "500 Hz", audioSrc: "/500hz.mp3" },
  { frequency: "1000 Hz", audioSrc: "/1000hz.mp3" },
  { frequency: "4000 Hz", audioSrc: "/4000hz.mp3" },
];
// Ses seviyeleri: %80, %40, %20
const volumes = [0.8, 0.4, 0.2];

const testQuestions: TestQuestion[] = frequencies.flatMap((f, i) =>
  volumes.map((v, j) => ({
    id: i * volumes.length + j + 1,
    frequency: f.frequency,
    audioLevel: `${Math.round(v * 100)}% ses seviyesi`,
    instruction: `Bu sesi duyabiliyor musunuz? Duyuyorsanız 'Evet' butonuna basın.`,
    audioSrc: f.audioSrc,
    volume: v,
  }))
);

const surveyQuestions = [
  {
    id: "q1",
    text: "Konuşmaları takip etmek zor olduğu için, sosyal ortamlardan uzaklaşma eğilimindeyim."
  },
  {
    id: "q2",
    text: "Restoran gibi yerlerde ve partilerde konuşmaları işitmekte zorlanıyorum."
  },
  {
    id: "q3",
    text: "İşitme duyumu iyileştirmem benim için önemli"
  }
];
const likertOptions = [
  { value: "1", label: "Hiç katılmıyorum" },
  { value: "2", label: "Katılmıyorum" },
  { value: "3", label: "Kararsızım" },
  { value: "4", label: "Katılıyorum" },
  { value: "5", label: "Tamamen katılıyorum" },
];

const CONTACT_EMAIL = "berkay489@gmail.com";

// Frekans türü ve renk eşlemesi
const frequencyMeta = {
  "500 Hz": { label: "Düşük Frekans", color: "#22c55e" }, // yeşil
  "1000 Hz": { label: "Orta Frekans", color: "#f59e42" }, // turuncu
  "4000 Hz": { label: "Yüksek Frekans", color: "#ef4444" }, // kırmızı
};

// Volume bar bileşeni (Oticon tarzı kutucuklar)
function VolumeBar({ level }: { level: number }) {
  // level: 0.8 -> 4 tık, 0.4 -> 2 tık, 0.2 -> 1 tık
  const ticks = 5;
  const active = Math.round(level * ticks);
  return (
    <div className="flex gap-1 justify-center items-center mt-2">
      {[...Array(ticks)].map((_, i) => (
        <div
          key={i}
          className={`w-4 h-6 rounded-sm border ${i < active ? 'bg-primary border-primary' : 'bg-muted border-border'}`}
        />
      ))}
    </div>
  );
}

// Süre formatlayıcı
function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Header bar for all pages
const HeaderBar = () => (
  <header className="w-full border-b border-border shadow-sm flex items-center justify-start py-4 px-4 fixed top-0 left-0 z-50" style={{height: '120px', background: 'rgba(247,247,247,1)'}}>
    <img src="/logonuz.png" alt="İzmirses İşitme Cihazları" className="h-24 object-contain" />
  </header>
);


export const HearingTest = ({ onBackToIntro }: HearingTestProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0); // 0-100
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [testCompleted, setTestCompleted] = useState(false);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [surveySent, setSurveySent] = useState(false);
  const { register, handleSubmit, reset, formState } = useForm();
  const [sending, setSending] = useState(false);
  // Anket stepper state
  const [surveyStep, setSurveyStep] = useState(0); // 0,1,2 sorular, 3 teşekkür, 4 iletişim
  const [surveyAnswers, setSurveyAnswers] = useState<{ [k: string]: string }>({});
  const [showContact, setShowContact] = useState(false);
  const [showDealers, setShowDealers] = useState(false);
  const [showContactThanks, setShowContactThanks] = useState(false);

  const progress = ((currentQuestion + 1) / testQuestions.length) * 100;

  // Otomatik ses oynatma ve progress bar güncelleme
  useEffect(() => {
    if (testCompleted) return;
    const audio = new Audio(testQuestions[currentQuestion].audioSrc);
    audio.volume = testQuestions[currentQuestion].volume;
    audioRef.current = audio;
    setIsPlaying(true);
    audio.onloadedmetadata = () => {
      setAudioDuration(audio.duration - 10 > 0 ? audio.duration - 10 : audio.duration);
      audio.currentTime = 10; // 10. saniyeden başlat
      audio.play();
    };
    audio.ontimeupdate = () => {
      if (audio.duration > 0) {
        setAudioProgress(((audio.currentTime - 10 > 0 ? audio.currentTime - 10 : 0) / (audio.duration - 10 > 0 ? audio.duration - 10 : audio.duration)) * 100);
      }
    };
    audio.onended = () => {
      setIsPlaying(false);
      setAudioProgress(100);
    };
    toast({
      title: "Ses çalıyor",
      description: `${testQuestions[currentQuestion].frequency} - ${testQuestions[currentQuestion].audioLevel} frekansta test sesi`,
      duration: 3000,
    });
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion]);

  const handleAnswer = (canHear: boolean) => {
    // Always stop audio immediately
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = ""; // force unload
    }
    setIsPlaying(false);
    setAudioProgress(0);
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = canHear;
    setAnswers(newAnswers);
    if (currentQuestion < testQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setTestCompleted(true);
      showResults(newAnswers);
    }
  };

  const showResults = (testAnswers: boolean[]) => {
    const heardCount = testAnswers.filter(answer => answer).length;
    const percentage = (heardCount / testAnswers.length) * 100;
    
    let resultMessage = "";
    if (percentage >= 80) {
      resultMessage = "İşitmeniz normal görünüyor.";
    } else if (percentage >= 50) {
      resultMessage = "Hafif bir işitme kaybı olabilir.";
    } else {
      resultMessage = "Bir uzmanla görüşmenizi öneririz.";
    }

    toast({
      title: "Test tamamlandı!",
      description: `${heardCount}/3 sesi duydunuz. ${resultMessage}`,
      duration: 5000,
    });
  };

  const resetTest = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setTestCompleted(false);
    setIsPlaying(false);
  };

  const onSubmitForm = async (data: any) => {
    setSending(true);
    // Test ve anket sonuçlarını hazırla
    const answersSummary = answers
      .map((ans, i) => `${testQuestions[i].frequency} - ${testQuestions[i].audioLevel}: ${ans ? "Evet" : "Hayır"}`)
      .join("\n");
    const surveyData = Object.entries(surveyAnswers)
      .map(([k, v]) => {
        const q = surveyQuestions.find(q => q.id === k);
        const opt = likertOptions.find(o => o.value === v);
        return `${q?.text}: ${opt?.label}`;
      })
      .join("\n");

    const payload = {
      answers: answersSummary,
      survey: surveyData,
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      comment: data.comment || '',
    };

    try {
      // Örnek: /api/send-results endpointine POST
      await fetch("/api/send-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setSurveySent(true);
      reset();
      toast({
        title: "Teşekkürler!",
        description: "Sonuçlarınız başarıyla gönderildi.",
        duration: 5000,
      });
    } catch (e) {
      toast({
        title: "Hata",
        description: "Sonuçlar gönderilemedi. Lütfen tekrar deneyin.",
        duration: 5000,
      });
    } finally {
      setSending(false);
    }
  };

  if (testCompleted && !showContact && !showDealers) {
    // Stepper: sırayla 3 soru, sonra teşekkür, sonra iletişim
    if (surveyStep < surveyQuestions.length) {
      const q = surveyQuestions[surveyStep];
      return (
        <>
          <HeaderBar />
          <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center p-4" style={{paddingTop: '140px'}}>
            <Card className="bg-gradient-card shadow-strong border border-border p-0 md:p-0 overflow-hidden rounded-2xl max-w-xl w-full hover:shadow-medium transition-all duration-300">
              {/* Header */}
              <div className="w-full bg-gradient-primary py-6 px-8 flex flex-col items-center justify-center">
                <span className="inline-flex items-center gap-2 bg-accent px-6 py-3 rounded-full mb-2">
                  <span className="text-2xl font-extrabold text-[#232323] tracking-tight">Kısa Anket</span>
                </span>
              </div>
              <form className="p-8 md:p-12" onSubmit={e => { e.preventDefault(); if (surveyAnswers[q.id]) setSurveyStep(surveyStep + 1); }}>
                <div className="mb-8">
                  <label className="block mb-6 font-semibold text-xl text-foreground text-center">{q.text}</label>
                  <RadioGroup className="grid grid-cols-2 md:grid-cols-5 gap-4 justify-center" value={surveyAnswers[q.id] || ""} onValueChange={v => setSurveyAnswers(a => ({ ...a, [q.id]: v }))}>
                    {likertOptions.map(opt => (
                      <label key={opt.value} className="flex flex-col items-center gap-2 bg-accent/60 rounded-xl p-4 cursor-pointer shadow-soft hover:shadow-medium transition-all duration-200 border border-border">
                        <RadioGroupItem value={opt.value} />
                        <span className="text-sm font-medium text-accent-foreground">{opt.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
                <Button type="submit" variant="oticon" className="w-full h-12 text-lg font-semibold shadow-medium" disabled={!surveyAnswers[q.id]}>Sonraki</Button>
              </form>
            </Card>
          </div>
        </>
      );
    }
    if (surveyStep === surveyQuestions.length) {
      return (
        <>
          <HeaderBar />
          <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center p-4" style={{paddingTop: '140px'}}>
            <Card className="bg-gradient-card shadow-strong border border-border p-0 md:p-0 overflow-hidden rounded-2xl max-w-xl w-full hover:shadow-medium transition-all duration-300 text-center">
              <div className="w-full bg-gradient-primary py-8 px-8 flex flex-col items-center justify-center">
                <h2 className="text-5xl font-extrabold text-white mb-0">Teşekkürler!</h2>
              </div>
              <div className="p-8 md:p-12">
                <p className="text-lg text-muted-foreground mb-8">Yanıtlarınız başarıyla kaydedildi.</p>
                <Button onClick={() => setShowContact(true)} variant="oticon" className="w-full h-12 text-lg font-semibold shadow-medium">Sonraki</Button>
              </div>
            </Card>
          </div>
        </>
      );
    }
  }

  // Şube bilgileri
  const dealerInfo = [
    {
      name: "Alsancak Şubesi",
      address: "Örnekli Sesova Mahallesi, Örnek Yankı Sokak No:ÖR/01, 00000 Alsancak / İzmir",
      phone: "0 (532) 237 38 79",
      email: "info@isletmeadi.com",
      mapUrl: "https://maps.app.goo.gl/grb59UjR9ErViYZP7"
    },
    {
      name: "Gaziemir Şubesi",
      address: "Örnekli Sesova Mahallesi, Örnek Yankı Sokak No:ÖR/01, 00000 Gaziemir / İzmir",
      phone: "0 (532) 237 38 79",
      email: "info@isletmeadi.com",
      mapUrl: "https://maps.app.goo.gl/grb59UjR9ErViYZP7"
    }
  ];

  // Final sayfası - test ve anket tamamlandıktan sonra
  if (testCompleted && showContact && !showDealers) {
    // Test ve anket sonuçlarını string olarak hazırla
    const testResultsString = answers
      .map((ans, i) => `${testQuestions[i].frequency}-${testQuestions[i].audioLevel}:${ans ? "Duydu" : "Duymadı"}`)
      .join("; ");
    const surveyResultsString = Object.entries(surveyAnswers)
      .map(([k, v]) => {
        const q = surveyQuestions.find(q => q.id === k);
        const opt = likertOptions.find(o => o.value === v);
        return `${q?.text}:${opt?.label}`;
      })
      .join("; ");

    // İletişim formunun olduğu ekranda, teşekkür mesajını popup/overlay olarak göster:
    // 1. Mesaj sayfanın üzerinde floating olarak gösterilsin
    // 2. Otomatik kaybolma olmasın, sadece kapat butonuna tıklayınca kaybolsun
    // 3. Mesaj ayrı sayfa taklidi yapmasın, sadece popup gibi görünsün

    // Form submit fonksiyonunda setTimeout kaldırılacak:
    // setShowContactThanks(true);
    // form.reset();
    // setTimeout(() => {
    //   setShowContactThanks(false);
    // }, 3500); // Bu satır kaldırılacak

    // Teşekkür mesajı popup olarak gösterilecek:
    if (showContactThanks) {
      return (
        <>
          <HeaderBar />
          <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center p-4" style={{paddingTop: '140px'}}>
            <Card className="bg-gradient-card shadow-strong border border-border p-0 md:p-0 overflow-hidden rounded-2xl max-w-xl w-full hover:shadow-medium transition-all duration-300 text-center">
              <div className="w-full bg-gradient-primary py-8 px-8 flex flex-col items-center justify-center">
                <h2 className="text-5xl font-extrabold text-white mb-0">Teşekkürler!</h2>
              </div>
              <div className="p-8 md:p-12">
                <p className="text-lg text-muted-foreground mb-8">İletişim formunuz başarıyla gönderildi. En kısa sürede sizinle iletişime geçilecektir.</p>
                <Button onClick={() => setShowContactThanks(false)} variant="oticon" className="w-full h-12 text-lg font-semibold shadow-medium">Kapat</Button>
              </div>
            </Card>
          </div>
        </>
      );
    }

    return (
      <>
        {/* Teşekkür popup overlay */}
        {showContactThanks && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center shadow-2xl">
              <h3 className="text-3xl font-bold mb-4">Teşekkürler!</h3>
              <p className="text-lg text-muted-foreground mb-6">İletişim formunuz başarıyla gönderildi. En kısa sürede sizinle iletişime geçilecektir.</p>
              <Button onClick={() => setShowContactThanks(false)} variant="oticon" className="w-full h-12 text-lg font-semibold shadow-medium">Kapat</Button>
            </div>
          </div>
        )}
        <HeaderBar />
        <div className="min-h-screen bg-gradient-subtle" style={{paddingTop: '140px'}}>
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-foreground mb-4">Test Tamamlandı!</h1>
                <p className="text-lg text-muted-foreground">Bizimle iletişime geçin veya en yakın şubemizi bulun</p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Sol taraf - İletişim Formu */}
                <Card className="bg-gradient-card shadow-strong border border-border p-8">
                  <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-primary bg-clip-text text-transparent">İletişim Formu</h2>
                  <form action="https://formsubmit.co/hearingtest@izygrow.com" method="POST" className="space-y-6" target="_blank"
                    onSubmit={e => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const formData = new FormData(form);
                      // Dinamik form oluştur
                      const newForm = document.createElement('form');
                      newForm.action = "https://formsubmit.co/hearingtest@izygrow.com";
                      newForm.method = "POST";
                      newForm.target = "_blank";
                      for (const [key, value] of formData.entries()) {
                        const input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = key;
                        input.value = String(value);
                        newForm.appendChild(input);
                      }
                      document.body.appendChild(newForm);
                      newForm.submit();
                      document.body.removeChild(newForm);
                      setShowContactThanks(true);
                      form.reset();
                    }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-2 font-medium text-foreground">Ad Soyad *</label>
                        <Input 
                          name="name"
                          placeholder="Adınız Soyadınız" 
                          required 
                          className="h-12"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 font-medium text-foreground">E-posta</label>
                        <Input 
                          name="email"
                          type="email" 
                          placeholder="ornek@email.com" 
                          className="h-12"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block mb-2 font-medium text-foreground">Telefon *</label>
                      <Input 
                        name="phone"
                        type="tel" 
                        placeholder="0555 123 45 67" 
                        required
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 font-medium text-foreground">Mesajınız</label>
                      <Textarea 
                        name="comment"
                        placeholder="Test sonuçlarım hakkında bilgi almak istiyorum..." 
                        rows={4}
                      />
                    </div>
                    <input type="hidden" name="test_sonuclari" value={testResultsString} />
                    <input type="hidden" name="anket_sonuclari" value={surveyResultsString} />
                    <button 
                      type="submit" 
                      className="w-full h-12 text-lg font-semibold shadow-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
                    >
                      Formu Gönder
                    </button>
                  </form>
                </Card>

                {/* Sağ taraf - İletişim Seçenekleri */}
                <div className="space-y-6">
                  {/* WhatsApp Butonu */}
                  <Card className="bg-gradient-card shadow-strong border border-border p-6 hover:shadow-medium transition-all duration-300">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-soft">
                        <MessageCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">WhatsApp ile Ulaşın</h3>
                        <p className="text-muted-foreground">Anında destek alın</p>
                      </div>
                    </div>
                    <Button 
                      variant="default" 
                      className="w-full h-12 bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => window.open("https://api.whatsapp.com/send/?phone=905322373879&text=%C3%9Cr%C3%BCnleriniz+hakk%C4%B1nda+daha+fazla+bilgi+almak+istiyorum.&type=phone_number&app_absent=0", "_blank")}
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      WhatsApp ile Mesaj Gönder
                    </Button>
                  </Card>

                  {/* Şubeler Butonu */}
                  <Card className="bg-gradient-card shadow-strong border border-border p-6 hover:shadow-medium transition-all duration-300">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center shadow-soft">
                        <MapPin className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">Şubelerimiz</h3>
                        <p className="text-muted-foreground">Size en yakın şubeyi bulun</p>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="oticon" className="w-full h-12">
                          <MapPin className="w-5 h-5 mr-2" />
                          Şube Bilgilerini Görüntüle
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold">Şubelerimiz</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-6 mt-6">
                          {dealerInfo.map((dealer, index) => (
                            <Card key={index} className="p-6 border border-border bg-gradient-card shadow-soft hover:shadow-medium transition-all duration-300">
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0 shadow-soft">
                                  <MapPin className="w-5 h-5 text-primary-foreground" />
                                </div>
                                 <div className="flex-1">
                                   <h3 className="text-lg font-bold text-foreground mb-2">
                                     {dealer.name}
                                   </h3>
                                   <div className="space-y-2 text-sm">
                                     <div className="flex items-center justify-between">
                                       <p className="text-muted-foreground">
                                         <strong>Adres:</strong> {dealer.address}
                                       </p>
                                       <Button
                                         variant="outline"
                                         size="sm"
                                         onClick={() => window.open(dealer.mapUrl, "_blank")}
                                         className="ml-2 h-8 px-3"
                                       >
                                         <MapPin className="w-4 h-4 mr-1" />
                                         Yol Tarifi
                                       </Button>
                                     </div>
                                     <p className="text-muted-foreground">
                                       <strong>Telefon:</strong> 
                                       <a href={`tel:${dealer.phone}`} className="text-primary hover:underline ml-1">
                                         {dealer.phone}
                                       </a>
                                     </p>
                                     <p className="text-muted-foreground">
                                       <strong>E-posta:</strong> 
                                       <a href={`mailto:${dealer.email}`} className="text-primary hover:underline ml-1">
                                         {dealer.email}
                                       </a>
                                     </p>
                                   </div>
                                 </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </Card>

                  {/* Geri dön butonu */}
                  <div className="text-center">
                    <Button onClick={onBackToIntro} variant="ghost" className="text-muted-foreground hover:text-foreground">
                      ← Ana sayfaya dön
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Her adım tam ekran kart olarak, otomatik ses ve progress bar ile
  return (
    <>
      <HeaderBar />
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4" style={{paddingTop: '140px', paddingBottom: '60px'}}>
        <div className="w-full max-w-2xl mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">
                Soru {currentQuestion + 1} / {testQuestions.length}
              </span>
              <span className="text-sm text-muted-foreground">
                %{Math.round(progress)} tamamlandı
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          {/* Test Card */}
          <Card className="bg-gradient-card shadow-strong border border-border p-0 md:p-0 overflow-hidden rounded-2xl max-w-xl mx-auto hover:shadow-medium transition-all duration-300">
            {/* Renkli üst şerit */}
            <div style={{ background: frequencyMeta[testQuestions[currentQuestion].frequency].color, height: 12 }} />
            <div className="p-8 md:p-12 flex flex-col gap-8">
              <div className="flex flex-col items-center gap-3">
                <div className="inline-flex items-center gap-2 bg-accent px-4 py-2 rounded-full">
                  <Volume2 className="w-5 h-5 text-accent-foreground" />
                  <span className="text-base font-medium text-accent-foreground">
                    {testQuestions[currentQuestion].frequency} - {testQuestions[currentQuestion].audioLevel}
                  </span>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full mt-1" style={{ background: frequencyMeta[testQuestions[currentQuestion].frequency].color, color: testQuestions[currentQuestion].frequency === '1000 Hz' ? '#333' : '#fff' }}>
                  {frequencyMeta[testQuestions[currentQuestion].frequency].label}
                </span>
                <VolumeBar level={testQuestions[currentQuestion].volume} />
              </div>
              <h2 className="text-2xl font-bold text-foreground text-center">İşitme Testi</h2>
              <p className="text-muted-foreground max-w-md mx-auto text-center text-lg">
                {testQuestions[currentQuestion].instruction}
              </p>
              {/* Audio Progress Bar & Controls */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-full max-w-xs">
                  <Progress value={audioProgress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{formatTime(audioRef.current?.currentTime ? Math.max(audioRef.current.currentTime - 10, 0) : 0)}</span>
                    <span>{formatTime(audioDuration)}</span>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    if (audioRef.current) {
                      if (isPlaying) {
                        audioRef.current.pause();
                        setIsPlaying(false);
                      } else {
                        audioRef.current.currentTime = 10;
                        audioRef.current.play();
                        setIsPlaying(true);
                      }
                    }
                  }}
                  variant="oticon"
                  className="w-40 h-14 rounded-full text-lg shadow-medium mt-2"
                >
                  {isPlaying ? (
                    <VolumeX className="w-8 h-8" />
                  ) : (
                    <Volume2 className="w-8 h-8" />
                  )}
                  {isPlaying ? " Durdur" : " Tekrar Çal"}
                </Button>
              </div>
              {/* Answer Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 max-w-md mx-auto">
                <Button
                  onClick={() => handleAnswer(true)}
                  variant="oticon"
                  size="lg"
                  className="flex-1 h-14 text-lg font-semibold"
                >
                  Evet, Duyuyorum
                </Button>
                <Button
                  onClick={() => handleAnswer(false)}
                  variant="outline"
                  size="lg"
                  className="flex-1 h-14 text-lg font-semibold"
                >
                  Hayır, Duymuyorum
                </Button>
              </div>
              {/* Back Button */}
              <div className="pt-4 text-center">
                <Button onClick={onBackToIntro} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  ← Ana sayfaya dön
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
    </>
  );
};
