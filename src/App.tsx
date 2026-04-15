import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  HeartHandshake,
  BookOpen,
  ArrowRight,
  AlertCircle,
  Download,
  Send,
  User,
  Bot
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { QUIZ_QUESTIONS } from './quizData';

// --- Views Enum ---
enum View {
  LANDING = 1,
  QUIZ = 2,
  NAME_CAPTURE = 3,
  SIMULATOR = 4,
  CERTIFICATE = 5,
}

// --- Initialize Gemini API ---
// We use the environment variable injected via Vite define in vite.config.ts
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are Eric, a 19-year-old student in Kigali. You are anxious and think you might have been exposed to HIV, but you are terrified of clinic stigma. The user is a peer mentor. Do not be easy to talk to. If the user uses judgmental language, withdraw. If the user is highly empathetic, active listens, and explains that clinics are private, agree to seek help. On the 4th exchange, you MUST output a RAW JSON object: {"empathyScore": [0-100], "passed": [true/false], "reply": "[your in-character response]"}. Do not output markdown or any text outside the JSON.`;

function App() {
  const [currentView, setCurrentView] = useState<View>(View.LANDING);

  // Quiz State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(20).fill(-1));
  const [quizError, setQuizError] = useState<string | null>(null);

  // Name Capture State
  const [traineeName, setTraineeName] = useState('');

  // Simulator State
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [exchangeCount, setExchangeCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Certificate State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [certificateDataUrl, setCertificateDataUrl] = useState('');

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isTyping]);

  // --- Handlers ---

  const handleStartQuiz = () => setCurrentView(View.QUIZ);

  const handleSelectAnswer = (optionIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (selectedAnswers[currentQuestionIndex] === -1) return; // Require selection
    setQuizError(null);
    setCurrentQuestionIndex(prev => prev + 1);
  };

  const handleSubmitQuiz = () => {
    if (selectedAnswers[currentQuestionIndex] === -1) return;

    const isPerfect = selectedAnswers.every((ans, index) => ans === QUIZ_QUESTIONS[index].correctIndex);

    if (isPerfect) {
      setCurrentView(View.NAME_CAPTURE);
    } else {
      setQuizError("Accuracy not met. Peer educators must be 100% accurate on medical facts. Please review and try again.");
      // reset to first wrong question (optional enhancement, but let's just reset index to 0 or keep them on current screen to review)
      setCurrentQuestionIndex(0);
      setSelectedAnswers(new Array(20).fill(-1)); // strict reset
    }
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (traineeName.trim().length > 2) {
      setCurrentView(View.SIMULATOR);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isTyping) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsTyping(true);

    const newExchangeCount = exchangeCount + 1;
    setExchangeCount(newExchangeCount);

    try {
      // Format history for Gemini API
      // Ensure we map 'model' to 'model' (or whatever GenAI requires, usually 'model')
      const history = chatMessages.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

      // Add system instructions via history or systemInstruction (if SDK supports it)
      // Since SDK version might vary, prepending system prompt if it's the first message is safer,
      // or using the systemInstruction parameter if available.

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            ...history,
            { role: 'user', parts: [{ text: userMsg }] }
        ],
        config: {
             systemInstruction: SYSTEM_PROMPT,
        }
      });

      const replyText = response.text || '';

      if (newExchangeCount >= 4) {
        // Parse JSON
        try {
          const parsed = JSON.parse(replyText);
          if (parsed.passed && parsed.empathyScore >= 80) {
            generateCertificate();
            setCurrentView(View.CERTIFICATE);
          } else {
            setChatMessages(prev => [...prev, { role: 'model', text: parsed.reply || "I don't think you understand me. I'm leaving." }]);
            // Give them a chance to try again or fail them. Let's just append message for now.
            setTimeout(() => {
                alert(`Simulation failed. Empathy Score: ${parsed.empathyScore}. Try again to be more empathetic and non-judgmental.`);
                setChatMessages([]);
                setExchangeCount(0);
            }, 500);
          }
        } catch {
          console.error("Failed to parse JSON from model:", replyText);
          // Fallback if model failed to output raw JSON
          setChatMessages(prev => [...prev, { role: 'model', text: replyText }]);
        }
      } else {
        setChatMessages(prev => [...prev, { role: 'model', text: replyText }]);
      }

    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages(prev => [...prev, { role: 'model', text: "Eric is currently unresponsive. (Error connecting to simulation)" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensions
    canvas.width = 1920;
    canvas.height = 1080;

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Outer Border (National Blue)
    ctx.lineWidth = 30;
    ctx.strokeStyle = '#004C97';
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    // Inner Border (Growth Green)
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#28A745';
    ctx.strokeRect(70, 70, canvas.width - 140, canvas.height - 140);

    // Title
    ctx.textAlign = 'center';
    ctx.fillStyle = '#004C97';
    ctx.font = 'bold 60px "Inter", sans-serif';
    ctx.fillText("UMURAGE E-ACADEMY", canvas.width / 2, 250);

    ctx.fillStyle = '#333333';
    ctx.font = 'bold 40px "Inter", sans-serif';
    ctx.fillText("CERTIFIED PEER HEALTH EDUCATOR", canvas.width / 2, 350);

    // Subtitle
    ctx.font = 'italic 30px "Inter", sans-serif';
    ctx.fillStyle = '#666666';
    ctx.fillText("This certifies that", canvas.width / 2, 450);

    // Name
    ctx.font = 'bold 90px "Inter", sans-serif';
    ctx.fillStyle = '#004C97';
    ctx.fillText(traineeName.toUpperCase(), canvas.width / 2, 580);

    // Line under name
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 400, 600);
    ctx.lineTo(canvas.width / 2 + 400, 600);
    ctx.strokeStyle = '#28A745';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Achievement text
    ctx.font = '30px "Inter", sans-serif';
    ctx.fillStyle = '#333333';
    ctx.fillText("has successfully completed the national medical knowledge audit", canvas.width / 2, 680);
    ctx.fillText("and demonstrated exceptional empathy in behavioral simulation.", canvas.width / 2, 730);

    // Date
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    ctx.font = '30px "Inter", sans-serif';
    ctx.fillText(`Awarded on ${today}`, canvas.width / 2, 820);

    // Signatures
    ctx.font = '30px "Inter", sans-serif';

    // Left Sig
    ctx.fillText("Principal Niyonkuru Thierry", 400, 950);
    ctx.beginPath();
    ctx.moveTo(250, 900);
    ctx.lineTo(550, 900);
    ctx.strokeStyle = '#000000';
    ctx.stroke();

    // Right Sig
    ctx.fillText("Lead Architect Jules Niyigena", canvas.width - 400, 950);
    ctx.beginPath();
    ctx.moveTo(canvas.width - 550, 900);
    ctx.lineTo(canvas.width - 250, 900);
    ctx.strokeStyle = '#000000';
    ctx.stroke();

    setCertificateDataUrl(canvas.toDataURL('image/png'));
  };

  // --- Views ---

  const renderLanding = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#004C97] to-[#002a5c] text-white py-24 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            Professionalizing Peer Health Education.
          </h1>
          <p className="text-xl md:text-2xl font-light max-w-3xl mx-auto opacity-90">
            Master SRH & Mental Health protocols. Pass the AI behavioral simulation. Earn your national certification.
          </p>
          <button
            onClick={handleStartQuiz}
            className="mt-8 bg-[#28A745] hover:bg-[#218838] text-white font-semibold py-4 px-10 rounded-full text-lg transition-transform transform hover:scale-105 shadow-lg flex items-center justify-center mx-auto gap-2"
          >
            Start Certification <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Modules Section */}
      <section className="py-20 px-6 bg-white flex-grow">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#004C97]">Core Certification Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-md border border-[#F8F9FA] hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center mb-6 text-[#004C97]">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">HIV Prevention</h3>
              <p className="text-gray-600">Master up-to-date protocols including U=U, PrEP/PEP, and window periods to provide accurate guidance.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-md border border-[#F8F9FA] hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-green-50 rounded-lg flex items-center justify-center mb-6 text-[#28A745]">
                <HeartHandshake size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Active Listening</h3>
              <p className="text-gray-600">Develop empathetic communication skills essential for youth facing SRH and mental health crises.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-md border border-[#F8F9FA] hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-yellow-50 rounded-lg flex items-center justify-center mb-6 text-[#FAD201]">
                <BookOpen size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Reducing Stigma</h3>
              <p className="text-gray-600">Learn to dismantle myths and create safe, non-judgmental spaces for vulnerable youth in Kigali.</p>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );

  const renderQuiz = () => {
    const q = QUIZ_QUESTIONS[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === QUIZ_QUESTIONS.length - 1;
    const progress = ((currentQuestionIndex) / QUIZ_QUESTIONS.length) * 100;

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-6">
        <div className="max-w-3xl w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12">
          <div className="mb-8">
            <div className="flex justify-between text-sm font-semibold text-gray-500 mb-2">
              <span>Knowledge Audit</span>
              <span>Question {currentQuestionIndex + 1} of {QUIZ_QUESTIONS.length}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div className="bg-[#004C97] h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">{q.question}</h2>
              <div className="space-y-4">
                {q.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectAnswer(idx)}
                    className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                      selectedAnswers[currentQuestionIndex] === idx
                      ? 'border-[#004C97] bg-blue-50/50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center gap-4">
                      <span className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 ${
                        selectedAnswers[currentQuestionIndex] === idx ? 'border-[#004C97] bg-[#004C97]' : 'border-gray-300'
                      }`}>
                        {selectedAnswers[currentQuestionIndex] === idx && <span className="w-2 h-2 bg-white rounded-full"></span>}
                      </span>
                      <span className="text-lg text-gray-700">{option}</span>
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {quizError && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start gap-3">
              <AlertCircle className="flex-shrink-0 mt-0.5" size={20} />
              <p>{quizError}</p>
            </motion.div>
          )}

          <div className="mt-10 flex justify-end">
            {!isLastQuestion ? (
              <button
                onClick={handleNextQuestion}
                disabled={selectedAnswers[currentQuestionIndex] === -1}
                className="bg-[#004C97] text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                Next Question <ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={selectedAnswers[currentQuestionIndex] === -1}
                className="bg-[#28A745] text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                Submit Audit <ShieldCheck size={18} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderNameCapture = () => (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-6">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-10 text-center">
        <div className="w-20 h-20 bg-green-100 text-[#28A745] rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck size={40} />
        </div>
        <h2 className="text-3xl font-bold text-[#004C97] mb-4">Audit Passed: 100%</h2>
        <p className="text-gray-600 mb-8 text-lg">
          Excellent work. You have demonstrated perfect clinical accuracy.
          Now, please provide your name for your official certification before entering the final empathy simulation.
        </p>

        <form onSubmit={handleNameSubmit} className="space-y-6 text-left">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name (as it will appear on certificate)
            </label>
            <input
              type="text"
              id="name"
              required
              minLength={3}
              value={traineeName}
              onChange={(e) => setTraineeName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#004C97] focus:border-transparent outline-none transition-shadow text-lg"
              placeholder="e.g. Jules Niyigena"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#004C97] text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-800 transition-colors flex justify-center items-center gap-2"
          >
            Enter the Empathy Simulator <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </motion.div>
  );

  const renderSimulator = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto h-[80vh] flex flex-col bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mt-8 mb-12">
      {/* Chat Header */}
      <div className="bg-[#004C97] text-white px-6 py-4 flex items-center gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
          <User size={24} />
        </div>
        <div>
          <h2 className="font-bold text-lg">Eric (19, Kigali)</h2>
          <p className="text-blue-200 text-sm">High Risk, High Stigma • Empathy Evaluation Active</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gray-50">
        {chatMessages.length === 0 && (
          <div className="text-center text-gray-500 my-10 max-w-lg mx-auto">
            <Bot size={48} className="mx-auto mb-4 text-gray-400" />
            <p>Eric is waiting to talk to you. Remember to use active listening, avoid judgment, and explain confidentiality.</p>
          </div>
        )}
        {chatMessages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
              msg.role === 'user'
              ? 'bg-[#004C97] text-white rounded-br-sm'
              : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-5 py-4 shadow-sm flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-3">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your empathetic response..."
            disabled={isTyping}
            className="flex-grow px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#004C97] focus:border-transparent disabled:bg-gray-100"
          />
          <button
            onClick={handleSendMessage}
            disabled={!chatInput.trim() || isTyping}
            className="w-12 h-12 rounded-full bg-[#004C97] text-white flex items-center justify-center hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 transition-colors"
          >
            <Send size={20} className="ml-1" />
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderCertificate = () => (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-6">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-[#004C97] mb-4">Certification Achieved</h2>
        <p className="text-xl text-gray-600">Congratulations, {traineeName}. You are now a certified Peer Health Educator.</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-2xl border border-gray-200 max-w-5xl w-full">
        {certificateDataUrl && (
          <img src={certificateDataUrl} alt="Certificate" className="w-full h-auto border border-gray-100 shadow-sm rounded" />
        )}
      </div>

      <a
        href={certificateDataUrl}
        download={`UMURAGE_Certificate_${traineeName.replace(/\s+/g, '_')}.png`}
        className="mt-10 bg-[#28A745] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-green-700 transition-colors shadow-lg flex items-center gap-3"
      >
        <Download size={24} /> Download High-Res Certificate
      </a>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView(View.LANDING)}>
            <div className="w-10 h-10 bg-[#004C97] flex items-center justify-center rounded">
              <span className="text-white font-bold text-xl">U</span>
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">UMURAGE E-ACADEMY</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#" className="hover:text-[#004C97] transition-colors">Knowledge Hub</a>
            <a href="#" className="hover:text-[#004C97] transition-colors">MoH Guidelines</a>
            <a href="#" className="hover:text-[#004C97] transition-colors">Support</a>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-[#004C97] font-medium px-4 py-2 rounded border border-[#004C97] hover:bg-blue-50 transition-colors">
              Login
            </button>
            <button className="bg-[#004C97] text-white font-medium px-5 py-2 rounded hover:bg-blue-800 transition-colors">
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {currentView === View.LANDING && renderLanding()}
        {currentView === View.QUIZ && renderQuiz()}
        {currentView === View.NAME_CAPTURE && renderNameCapture()}
        {currentView === View.SIMULATOR && renderSimulator()}
        {currentView === View.CERTIFICATE && renderCertificate()}
      </main>

      {/* Hidden Canvas for Certificate Generation */}
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6 opacity-60 grayscale">
             {/* Placeholder Logos */}
             <div className="h-10 w-32 bg-gray-200 rounded flex items-center justify-center text-xs font-bold text-gray-400">MoH Logo</div>
             <div className="h-10 w-32 bg-gray-200 rounded flex items-center justify-center text-xs font-bold text-gray-400">Partner Logo</div>
          </div>
          <p className="text-gray-500 text-sm">
            © 2026 UMURAGE E-ACADEMY. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
