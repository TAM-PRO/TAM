export const generatePlayerHTML = (nodesData: any, apiKey: string) => {
    const jsonString = JSON.stringify(nodesData, null, 2);
    
    return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>מערכת איתור ופתרון תקלות</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin><\/script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin><\/script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
    <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js"><\/script>
    <style>
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInFromBottom { from { transform: translateY(1rem); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes zoomIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes pulseBorder { 0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); } 70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); } 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); } }
        .animate-in { animation-fill-mode: both; } .fade-in { animation-name: fadeIn; } .slide-in-from-bottom-4 { animation-name: slideInFromBottom; } .zoom-in-95 { animation-name: zoomIn; } .duration-300 { animation-duration: 300ms; } .duration-500 { animation-duration: 500ms; } .active-node { animation: pulseBorder 2s infinite; }
        body { font-family: system-ui, -apple-system, sans-serif; }
        model-viewer { width: 100%; height: 300px; background-color: #f1f5f9; border-radius: 0.75rem; outline: none; }
    </style>
</head>
<body class="bg-slate-50 text-slate-800">
    <div id="root"></div>
    <script>
        window.__FLOW_DATA__ = ${jsonString};
        window.__GEMINI_API_KEY__ = "${apiKey}";
    <\/script>
    <script type="text/babel">
        const { useState, useEffect, useRef } = React;
        const nodes = window.__FLOW_DATA__;

        // --- Icons ---
        const AlertCircle = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
        const CheckCircle2 = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>;
        const ChevronRight = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
        const Zap = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
        const RotateCcw = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>;
        const Network = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/></svg>;
        const MapPin = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
        const MessageSquare = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
        const X = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
        const Send = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
        const Search = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
        const ZoomIn = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>;
        const ZoomOut = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>;

        const MediaViewer = ({ media }) => {
            if (!media || media.type === 'none' || !media.url) return null;
            return (
                <div className="w-full mb-6 rounded-xl overflow-hidden border border-slate-200 shadow-md bg-white">
                    {media.type === 'image' && <img src={media.url} className="w-full h-auto max-h-[350px] object-contain bg-slate-100" />}
                    {media.type === 'video' && <video src={media.url} controls className="w-full h-auto max-h-[350px] bg-black">הדפדפן לא תומך בוידאו.</video>}
                    {media.type === '3d' && (
                        <div className="relative w-full h-[300px]">
                            <model-viewer src={media.url} auto-rotate camera-controls shadow-intensity="1"></model-viewer>
                            <div className="absolute top-2 left-2 bg-slate-800/70 text-white text-xs px-2 py-1 rounded shadow pointer-events-none">🖱️ גרור כדי לסובב</div>
                        </div>
                    )}
                </div>
            );
        };

        const FlowEdge = ({ label, colorClass = "text-slate-500 border-slate-200" }) => (
          <div className="flex flex-col items-center">
            <div className="w-px h-6 bg-slate-300"></div>
            {label && <div className={\`text-xs font-bold px-2 py-0.5 bg-white border rounded-full z-10 my-1 \${colorClass} max-w-[120px] text-center shadow-sm\`}>{label}</div>}
            {label && <div className="w-px h-6 bg-slate-300"></div>}
            <div className="w-2 h-2 border-b-2 border-r-2 border-slate-400 transform rotate-45 -mt-1.5 mb-2"></div>
          </div>
        );

        const TreeNode = ({ stepId, visited = [], currentStepId, searchQuery }) => {
          if (!stepId || !nodes[stepId] || visited.includes(stepId)) return null;
          const newVisited = [...visited, stepId];
          const isCurrent = currentStepId === stepId;
          const step = nodes[stepId];

          const isMatch = searchQuery && (
            (step.title && step.title.includes(searchQuery)) || 
            (step.text && step.text.includes(searchQuery)) ||
            (step.name && step.name.includes(searchQuery))
          );

          const YouAreHereBadge = () => isCurrent && (
            <div className="absolute -top-3 -right-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md z-20 animate-in zoom-in-95">
              <MapPin className="w-3 h-3" /> אתה כאן
            </div>
          );

          if (step.type === 'end') {
            const colors = step.endType === 'success' ? 'bg-emerald-100 border-emerald-500 text-emerald-800 ring-emerald-200' : 'bg-rose-100 border-rose-500 text-rose-800 ring-rose-200';
            const Icon = step.endType === 'success' ? CheckCircle2 : AlertCircle;
            return (
              <div className="flex flex-col items-center px-2">
                <div className={\`relative p-3 rounded-xl border-2 shadow-sm flex items-center gap-2 font-bold text-sm transition-all duration-300 \${isCurrent ? \`\${colors} ring-4 scale-110 shadow-lg\` : (isMatch ? 'bg-yellow-100 border-yellow-500 text-yellow-800 ring-4 ring-yellow-200' : \`\${colors} opacity-80\`)}\`}>
                  {YouAreHereBadge()} <Icon className="w-4 h-4" /> {step.text}
                </div>
              </div>
            );
          }

          return (
            <div className="flex flex-col items-center px-2">
              <div className={\`bg-white border-2 p-4 rounded-xl shadow-md w-48 md:w-56 lg:w-64 text-center text-sm relative z-10 transition-all duration-300 \${isCurrent ? 'border-blue-500 ring-4 ring-blue-200 scale-105 shadow-xl font-bold active-node' : (isMatch ? 'border-yellow-500 ring-4 ring-yellow-200 bg-yellow-50' : 'border-slate-300')}\`}>
                {YouAreHereBadge()}
                {step.text}
              </div>

              {step.type === 'question' && (
                <div className="flex gap-4 mt-2 items-start relative">
                  <div className="absolute top-0 left-1/4 right-1/4 h-px bg-slate-300"></div>
                  <div className="flex-1 flex flex-col items-center pt-2">
                    <FlowEdge label={step.yesLabel || "כן"} colorClass="text-emerald-600 border-emerald-200 bg-emerald-50" />
                    <TreeNode stepId={step.yesTarget} visited={newVisited} currentStepId={currentStepId} searchQuery={searchQuery} />
                  </div>
                  <div className="flex-1 flex flex-col items-center pt-2">
                    <FlowEdge label={step.noLabel || "לא"} colorClass="text-rose-600 border-rose-200 bg-rose-50" />
                    <TreeNode stepId={step.noTarget} visited={newVisited} currentStepId={currentStepId} searchQuery={searchQuery} />
                  </div>
                </div>
              )}

              {step.type === 'action' && (
                <div className="flex flex-col items-center pt-2">
                  <FlowEdge label={step.nextLabel || "המשך"} />
                  <TreeNode stepId={step.nextTarget} visited={newVisited} currentStepId={currentStepId} searchQuery={searchQuery} />
                </div>
              )}

              {step.type === 'menu' && (
                <div className="flex flex-wrap justify-center gap-4 mt-4 pt-2 relative">
                  <div className="absolute top-0 left-10 right-10 h-px bg-slate-300"></div>
                  {step.options && step.options.map((opt, idx) => (
                    <div key={idx} className="flex flex-col items-center pt-2">
                      <FlowEdge label={opt.label} colorClass="text-blue-600 border-blue-200 text-[10px]" />
                      <TreeNode stepId={opt.targetId} visited={newVisited} currentStepId={currentStepId} searchQuery={searchQuery} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        };

        const Chatbot = ({ currentStepId }) => {
            const [isOpen, setIsOpen] = useState(false);
            const [messages, setMessages] = useState([{ role: 'model', text: 'שלום! אני העוזר החכם. איך אפשר לעזור לך עם התקלה הנוכחית?' }]);
            const [input, setInput] = useState('');
            const [isLoading, setIsLoading] = useState(false);
            const messagesEndRef = useRef(null);

            const scrollToBottom = () => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            };

            useEffect(() => {
                scrollToBottom();
            }, [messages, isOpen]);

            const handleSend = async () => {
                if (!input.trim() || isLoading) return;
                
                const userMsg = input.trim();
                setInput('');
                setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
                setIsLoading(true);

                try {
                    const currentStep = nodes[currentStepId];
                    const systemPrompt = \`אתה עוזר חכם למערכת איתור תקלות. 
המשתמש נמצא כעת בשלב: "\${currentStep?.title || ''}" - "\${currentStep?.text || ''}".
עץ התקלות המלא הוא: \${JSON.stringify(nodes)}.
ענה בעברית, בצורה תמציתית וברורה, ועזור למשתמש להבין מה עליו לעשות בשלב זה או פתור לו את הבעיה.\`;

                    const response = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent?key=\${window.__GEMINI_API_KEY__}\`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [
                                { role: 'user', parts: [{ text: systemPrompt }] },
                                ...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
                                { role: 'user', parts: [{ text: userMsg }] }
                            ],
                            generationConfig: { temperature: 0.7 }
                        })
                    });

                    const data = await response.json();
                    if (data.candidates && data.candidates[0].content.parts[0].text) {
                        setMessages(prev => [...prev, { role: 'model', text: data.candidates[0].content.parts[0].text }]);
                    } else {
                        setMessages(prev => [...prev, { role: 'model', text: 'מצטער, אירעה שגיאה בקבלת התשובה.' }]);
                    }
                } catch (error) {
                    console.error(error);
                    setMessages(prev => [...prev, { role: 'model', text: 'מצטער, אירעה שגיאה בתקשורת עם השרת.' }]);
                } finally {
                    setIsLoading(false);
                }
            };

            return (
                <div className="fixed bottom-6 left-6 z-50">
                    {!isOpen ? (
                        <button 
                            onClick={() => setIsOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
                        >
                            <MessageSquare className="w-6 h-6" />
                        </button>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-80 sm:w-96 h-[500px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
                            <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-yellow-300" />
                                    <h3 className="font-bold">עוזר חכם (Gemini)</h3>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="text-blue-100 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={\`flex \${msg.role === 'user' ? 'justify-end' : 'justify-start'}\`}>
                                        <div className={\`max-w-[80%] p-3 rounded-2xl \${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'}\`}>
                                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                            
                            <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
                                <input 
                                    type="text" 
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleSend()}
                                    placeholder="שאל שאלה..."
                                    className="flex-1 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl px-4 py-2 text-sm outline-none transition-all"
                                />
                                <button 
                                    onClick={handleSend}
                                    disabled={isLoading || !input.trim()}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl p-2 transition-colors flex items-center justify-center"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            );
        };

        function App() {
          const [history, setHistory] = useState(['start']);
          const [searchQuery, setSearchQuery] = useState('');
          const [zoom, setZoom] = useState(1);
          const [isDragging, setIsDragging] = useState(false);
          const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
          const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });
          const containerRef = useRef(null);

          const currentStepId = history[history.length - 1];
          const step = nodes[currentStepId] || null;

          const navigateTo = (targetId) => {
            if(targetId && nodes[targetId]) {
                setHistory([...history, targetId]);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          };
          const goBack = () => { if (history.length > 1) setHistory(history.slice(0, -1)); };
          const startOver = () => setHistory(['start']);

          const handleMouseDown = (e) => {
            setIsDragging(true);
            setDragStart({ x: e.clientX, y: e.clientY });
            if (containerRef.current) {
              setScrollStart({ x: containerRef.current.scrollLeft, y: containerRef.current.scrollTop });
            }
          };

          const handleMouseMove = (e) => {
            if (!isDragging || !containerRef.current) return;
            const dx = e.clientX - dragStart.x;
            const dy = e.clientY - dragStart.y;
            containerRef.current.scrollLeft = scrollStart.x - dx;
            containerRef.current.scrollTop = scrollStart.y - dy;
          };

          const handleMouseUp = () => setIsDragging(false);

          if (!step) return <div className="p-10 text-center">הצומת לא נמצא. אנא בדוק את ההגדרות.</div>;

          return (
            <div className="min-h-screen flex flex-col relative pb-20">
              <header className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-40">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                  <div className="flex items-center gap-3"><Zap className="w-6 h-6 text-yellow-400" /><h1 className="text-xl font-bold">מערכת איתור ופתרון תקלות</h1></div>
                  <button onClick={startOver} className="flex items-center gap-2 text-sm bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700"><RotateCcw className="w-4 h-4" /><span className="hidden sm:inline">התחל מחדש</span></button>
                </div>
              </header>

              <main className="max-w-[1600px] w-full mx-auto p-4 py-8 flex flex-col lg:flex-row gap-8 items-start flex-1">
                <div className="w-full lg:w-5/12 xl:w-4/12 flex flex-col gap-6 lg:sticky lg:top-24 z-10">
                  {history.length > 1 && (
                    <div className="flex items-center justify-between bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 animate-in fade-in">
                      <button onClick={goBack} className="text-slate-500 hover:text-blue-600 flex items-center gap-1 font-medium"><ChevronRight className="w-5 h-5" />חזור לשלב הקודם</button>
                    </div>
                  )}

                  <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                    {step.type !== 'end' && (
                      <div className="bg-blue-50/50 p-5 border-b border-blue-100 flex items-center gap-4">
                        <div className="bg-blue-100 p-2.5 rounded-full text-blue-600 shrink-0"><AlertCircle className="w-6 h-6" /></div>
                        <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight">{step.title}</h2>
                      </div>
                    )}

                    <div className="p-6 md:p-8">
                      <MediaViewer media={step.media} />
                      
                      {step.type === 'menu' && (
                        <div className="space-y-6">
                          <h3 className="text-lg md:text-xl font-medium text-slate-700 mb-6">{step.text}</h3>
                          <div className="grid grid-cols-1 gap-3">
                            {step.options?.map((opt, idx) => (
                              <button key={idx} onClick={() => navigateTo(opt.targetId)} className="flex items-center gap-4 p-4 text-right rounded-xl border-2 border-slate-100 hover:border-blue-400 hover:bg-blue-50 transition-all group shadow-sm">
                                <div className="bg-slate-100 p-2 rounded-lg text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600"><ChevronRight className="w-5 h-5" /></div>
                                <span className="font-medium flex-1 text-slate-700 group-hover:text-blue-800">{opt.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {step.type === 'action' && (
                        <div className="space-y-8 text-center py-4">
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 inline-block w-full">
                            <p className="text-lg text-amber-900 font-medium leading-relaxed" style={{whiteSpace: 'pre-line'}}>{step.text}</p>
                          </div>
                          <button onClick={() => navigateTo(step.nextTarget)} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 px-8 rounded-xl shadow-md transition-all text-lg w-full sm:w-auto">{step.nextLabel || "המשך לשלב הבא"}</button>
                        </div>
                      )}

                      {step.type === 'question' && (
                        <div className="space-y-8 py-2">
                          <h3 className="text-xl md:text-2xl font-medium text-slate-800 text-center leading-relaxed" style={{whiteSpace: 'pre-line'}}>{step.text}</h3>
                          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
                            <button onClick={() => navigateTo(step.yesTarget)} className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 border-2 border-emerald-500 hover:bg-emerald-500 hover:text-white font-bold py-3.5 px-6 rounded-xl transition-all text-lg shadow-sm"><CheckCircle2 className="w-6 h-6" />{step.yesLabel || "כן"}</button>
                            <button onClick={() => navigateTo(step.noTarget)} className="flex-1 flex items-center justify-center gap-2 bg-rose-50 text-rose-700 border-2 border-rose-500 hover:bg-rose-500 hover:text-white font-bold py-3.5 px-6 rounded-xl transition-all text-lg shadow-sm"><AlertCircle className="w-6 h-6" />{step.noLabel || "לא"}</button>
                          </div>
                        </div>
                      )}

                      {step.type === 'end' && (
                        <div className="text-center py-8 space-y-6 animate-in zoom-in-95 duration-500">
                          <div className={\`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 \${step.endType === 'success' ? 'bg-emerald-100 text-emerald-500' : 'bg-rose-100 text-rose-500'}\`}>
                            {step.endType === 'success' ? <CheckCircle2 className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
                          </div>
                          <h2 className={\`text-2xl font-bold \${step.endType === 'success' ? 'text-emerald-600' : 'text-rose-600'}\`}>{step.title}</h2>
                          <div className="bg-slate-50 p-4 rounded-xl inline-block mt-2 border border-slate-200">
                            <p className="text-lg text-slate-800 whitespace-pre-line">{step.text}</p>
                          </div>
                          <div className="pt-6"><button onClick={startOver} className="text-blue-600 hover:text-blue-800 font-medium underline">התחל תהליך מחדש</button></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-7/12 xl:w-8/12 bg-white rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-8 flex flex-col z-0 h-[800px] overflow-hidden">
                  <div className="mb-4 flex flex-col sm:flex-row justify-between items-center border-b border-slate-100 pb-4 gap-4">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2"><Network className="w-6 h-6 text-blue-500" />תרשים זרימה</h2>
                    
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="relative flex-1 sm:w-64">
                        <input 
                          type="text" 
                          placeholder="חיפוש בתרשים..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-4 pr-10 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl text-sm outline-none transition-all"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                      </div>
                      
                      <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                        <button onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} className="p-1.5 hover:bg-white rounded shadow-sm text-slate-600"><ZoomOut className="w-4 h-4" /></button>
                        <span className="text-xs font-medium w-8 text-center">{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-1.5 hover:bg-white rounded shadow-sm text-slate-600"><ZoomIn className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-auto cursor-grab active:cursor-grabbing bg-slate-50/50 rounded-xl border border-slate-100 relative" id="diagram-container" ref={containerRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                    <div className="min-w-max p-8 flex justify-center items-start transition-transform duration-200 origin-top" style={{ transform: \`scale(\${zoom})\` }}>
                      <TreeNode stepId="start" currentStepId={currentStepId} searchQuery={searchQuery} />
                    </div>
                  </div>
                </div>
              </main>
              
              <Chatbot currentStepId={currentStepId} />
            </div>
          );
        }
        const root = ReactDOM.createRoot(document.getElementById('root')); root.render(<App />);
    <\/script>
</body>
</html>`;
};
