import React, { useState, useEffect } from 'react';
import { Plus, Trash, Download, Image as ImageIcon, Settings, Search, Eye, Edit, FileSpreadsheet, Upload } from 'lucide-react';
import { generatePlayerHTML } from './playerTemplate';
import { downloadExcelTemplate, parseExcelFile } from './excelUtils';
import { Chatbot } from './Chatbot';

export default function App() {
  const loadInitialData = () => {
    const saved = localStorage.getItem('troubleshooter_data');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return {
      "start": {
        id: "start",
        name: "מסך פתיחה",
        title: "בחירת תקלה",
        type: "menu",
        text: "במה אוכל לעזור לך היום?",
        options: [],
        media: { type: "none", url: "" }
      }
    };
  };

  const [nodes, setNodes] = useState<any>(loadInitialData);
  const [selectedId, setSelectedId] = useState("start");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    localStorage.setItem('troubleshooter_data', JSON.stringify(nodes));
  }, [nodes]);

  const exportHTML = () => {
    const apiKey = process.env.GEMINI_API_KEY || '';
    const htmlContent = generatePlayerHTML(nodes, apiKey);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'troubleshooter.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const addNode = () => {
    const newId = "node_" + Date.now().toString().slice(-6);
    setNodes({
      ...nodes,
      [newId]: {
        id: newId,
        name: "שלב חדש",
        title: "כותרת לשלב",
        type: "question",
        text: "תאר את הבעיה/שאלה כאן...",
        yesLabel: "כן", yesTarget: "",
        noLabel: "לא", noTarget: "",
        media: { type: "none", url: "" }
      }
    });
    setSelectedId(newId);
  };

  const deleteNode = (id: string) => {
    if (id === "start") return alert("לא ניתן למחוק את מסך הפתיחה (start)");
    if (!confirm("האם אתה בטוח שברצונך למחוק שלב זה?")) return;
    const newNodes = { ...nodes };
    delete newNodes[id];
    setNodes(newNodes);
    setSelectedId("start");
  };

  const updateNode = (field: string, value: any) => {
    setNodes((prev: any) => ({
      ...prev,
      [selectedId]: { ...prev[selectedId], [field]: value }
    }));
  };

  const updateMedia = (field: string, value: any) => {
    setNodes((prev: any) => ({
      ...prev,
      [selectedId]: {
        ...prev[selectedId],
        media: { ...(prev[selectedId].media || { type: 'none', url: '' }), [field]: value }
      }
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const newNodes = await parseExcelFile(file);
      setNodes(newNodes);
      setSelectedId("start");
      alert("הקובץ נטען בהצלחה!");
    } catch (error: any) {
      alert("שגיאה בטעינת הקובץ: " + error.message);
    }
  };

  const activeNode = nodes[selectedId];

  const nodeOptions = Object.values(nodes).map((n: any) => (
    <option key={n.id} value={n.id}>{n.name} (ID: {n.id})</option>
  ));

  const filteredNodes = Object.values(nodes).filter((node: any) =>
    node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.text?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden text-slate-800" dir="rtl">
      {/* Sidebar */}
      <div className="w-80 bg-slate-900 text-white flex flex-col h-full border-l border-slate-700">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6" />
            <h1 className="font-bold text-lg">מחולל תקלות</h1>
          </div>
        </div>

        <div className="p-4 border-b border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="חיפוש שלבים..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border-none rounded-lg py-2 pr-10 pl-4 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <h2 className="text-xs uppercase text-slate-400 font-bold mb-3 tracking-wider">כל השלבים בעץ</h2>
          {filteredNodes.map((node: any) => (
            <button
              key={node.id}
              onClick={() => setSelectedId(node.id)}
              className={`w-full text-right p-3 rounded-lg text-sm flex justify-between items-center transition-colors ${selectedId === node.id ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              <span className="truncate pr-2">{node.name}</span>
              {node.id === "start" && <span className="bg-blue-800 text-[10px] px-2 py-0.5 rounded">ראשי</span>}
            </button>
          ))}
          {filteredNodes.length === 0 && (
            <div className="text-center text-slate-500 text-sm py-4">לא נמצאו תוצאות</div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 space-y-3">
          <button onClick={addNode} className="w-full bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors">
            <Plus className="w-5 h-5" /> צור שלב חדש
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
        {/* Topbar */}
        <div className="bg-white p-4 shadow-sm border-b flex justify-between items-center z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isPreviewMode ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {isPreviewMode ? <Edit className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              {isPreviewMode ? 'חזור לעריכה' : 'תצוגה מקדימה'}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={downloadExcelTemplate} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors">
              <FileSpreadsheet className="w-5 h-5" />
              הורד תבנית Excel
            </button>
            <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors cursor-pointer">
              <Upload className="w-5 h-5" />
              ייבא מ-Excel
              <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileUpload} />
            </label>
            <button onClick={exportHTML} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-bold shadow-md transition-transform hover:scale-105">
              <Download className="w-5 h-5" />
              יצא וסיים (הורד HTML)
            </button>
          </div>
        </div>

        {/* Editor or Preview */}
        {isPreviewMode ? (
          <div className="flex-1 overflow-hidden relative">
            <iframe
              srcDoc={generatePlayerHTML(nodes, process.env.GEMINI_API_KEY || '')}
              className="w-full h-full border-none"
              title="Preview"
            />
          </div>
        ) : (
          activeNode ? (
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-3xl mx-auto space-y-8 pb-20">
                {/* General Settings */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold flex items-center gap-2"><span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">1</span> הגדרות בסיסיות</h3>
                    {activeNode.id !== "start" && (
                      <button onClick={() => deleteNode(activeNode.id)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors" title="מחק שלב">
                        <Trash className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">שם פנימי (לא יוצג למשתמש)</label>
                      <input type="text" value={activeNode.name || ""} onChange={e => updateNode('name', e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="לדוגמה: בדיקת כבל רשת" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">כותרת החלונית (תוצג למעלה)</label>
                      <input type="text" value={activeNode.title || ""} onChange={e => updateNode('title', e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="לדוגמה: איתור תקלות תקשורת" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">סוג השלב (קובע את הכפתורים שיוצגו)</label>
                    <select value={activeNode.type} onChange={e => updateNode('type', e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50">
                      <option value="question">שאלה (כן / לא)</option>
                      <option value="action">פעולה לביצוע (כפתור "המשך" יחיד)</option>
                      <option value="menu">תפריט בחירה (מספר אפשרויות לניווט)</option>
                      <option value="end">מסך סיום (סוף התהליך)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">תוכן השלב (השאלה / ההנחיה למשתמש)</label>
                    <textarea rows={3} value={activeNode.text || ""} onChange={e => updateNode('text', e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-y" placeholder="הקלד כאן את השאלה או הפעולה שעל המשתמש לבצע..."></textarea>
                  </div>
                </div>

                {/* Media Settings */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
                  <h3 className="text-lg font-bold flex items-center gap-2"><span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">2</span> מדיה להמחשה (אופציונלי)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">סוג מדיה</label>
                      <select value={activeNode.media?.type || "none"} onChange={e => updateMedia('type', e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50">
                        <option value="none">ללא מדיה</option>
                        <option value="image">תמונה (.jpg, .png, .gif)</option>
                        <option value="video">וידאו (.mp4)</option>
                        <option value="3d">מודל תלת מימדי (.glb)</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1 flex justify-between">
                        <span>נתיב לקובץ (URL או קובץ מקומי)</span>
                        <span className="text-slate-400 text-xs">דוגמה: images/photo.jpg</span>
                      </label>
                      <div className="flex gap-2">
                        <div className="bg-slate-100 border border-slate-300 rounded-lg px-3 flex items-center text-slate-500"><ImageIcon className="w-5 h-5" /></div>
                        <input type="text" value={activeNode.media?.url || ""} onChange={e => updateMedia('url', e.target.value)} disabled={activeNode.media?.type === "none"} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100 disabled:opacity-50" dir="ltr" placeholder="./images/your_file.jpg" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Routing Settings */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-200 bg-blue-50/30 space-y-5">
                  <h3 className="text-lg font-bold flex items-center gap-2"><span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">3</span> לאן ממשיכים מכאן?</h3>

                  {activeNode.type === 'question' && (
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                        <label className="block font-bold text-emerald-800 mb-2">תשובה חיובית (כן)</label>
                        <input type="text" value={activeNode.yesLabel || "כן"} onChange={e => updateNode('yesLabel', e.target.value)} className="w-full mb-2 p-2 text-sm border border-emerald-200 rounded outline-none focus:ring-1 focus:ring-emerald-400" placeholder="טקסט כפתור (ברירת מחדל: כן)" />
                        <select value={activeNode.yesTarget || ""} onChange={e => updateNode('yesTarget', e.target.value)} className="w-full p-2 text-sm border border-emerald-200 rounded outline-none focus:ring-1 focus:ring-emerald-400">
                          <option value="">-- בחר לאן לעבור --</option>
                          {nodeOptions}
                        </select>
                      </div>
                      <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                        <label className="block font-bold text-rose-800 mb-2">תשובה שלילית (לא)</label>
                        <input type="text" value={activeNode.noLabel || "לא"} onChange={e => updateNode('noLabel', e.target.value)} className="w-full mb-2 p-2 text-sm border border-rose-200 rounded outline-none focus:ring-1 focus:ring-rose-400" placeholder="טקסט כפתור (ברירת מחדל: לא)" />
                        <select value={activeNode.noTarget || ""} onChange={e => updateNode('noTarget', e.target.value)} className="w-full p-2 text-sm border border-rose-200 rounded outline-none focus:ring-1 focus:ring-rose-400">
                          <option value="">-- בחר לאן לעבור --</option>
                          {nodeOptions}
                        </select>
                      </div>
                    </div>
                  )}

                  {activeNode.type === 'action' && (
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                      <label className="block font-bold text-slate-800 mb-2">לאן עוברים לאחר הלחיצה?</label>
                      <input type="text" value={activeNode.nextLabel || "המשך לשלב הבא"} onChange={e => updateNode('nextLabel', e.target.value)} className="w-full mb-3 p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-400" placeholder="טקסט כפתור המשך" />
                      <select value={activeNode.nextTarget || ""} onChange={e => updateNode('nextTarget', e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-400">
                        <option value="">-- בחר לאן לעבור --</option>
                        {nodeOptions}
                      </select>
                    </div>
                  )}

                  {activeNode.type === 'menu' && (
                    <div>
                      <label className="block font-bold text-slate-800 mb-3">אפשרויות לבחירה:</label>
                      <div className="space-y-3 mb-4">
                        {(activeNode.options || []).map((opt: any, idx: number) => (
                          <div key={idx} className="flex gap-2 items-center bg-white p-2 rounded-lg border border-slate-200">
                            <input type="text" value={opt.label} onChange={e => {
                              const newOpts = [...activeNode.options];
                              newOpts[idx].label = e.target.value;
                              updateNode('options', newOpts);
                            }} className="flex-1 p-2 text-sm border border-slate-300 rounded outline-none focus:border-blue-400" placeholder="טקסט האפשרות (למשל: תקלת וידאו)" />

                            <select value={opt.targetId || ""} onChange={e => {
                              const newOpts = [...activeNode.options];
                              newOpts[idx].targetId = e.target.value;
                              updateNode('options', newOpts);
                            }} className="flex-1 p-2 text-sm border border-slate-300 rounded outline-none focus:border-blue-400">
                              <option value="">-- יעד --</option>
                              {nodeOptions}
                            </select>

                            <button onClick={() => {
                              const newOpts = activeNode.options.filter((_: any, i: number) => i !== idx);
                              updateNode('options', newOpts);
                            }} className="p-2 text-rose-500 hover:bg-rose-50 rounded"><Trash className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => {
                        const newOpts = [...(activeNode.options || []), { label: "", targetId: "" }];
                        updateNode('options', newOpts);
                      }} className="text-sm bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium">+ הוסף אפשרות בחירה</button>
                    </div>
                  )}

                  {activeNode.type === 'end' && (
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                      <label className="block font-bold text-slate-800 mb-2">סטטוס סיום:</label>
                      <select value={activeNode.endType || "success"} onChange={e => updateNode('endType', e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-400">
                        <option value="success">הצלחה (ירוק - הבעיה נפתרה)</option>
                        <option value="error">כישלון / הפניה לתמיכה (אדום - נדרשת מעורבות טכנאי)</option>
                      </select>
                      <p className="text-xs text-slate-500 mt-2">מסך זה לא יוביל לשלבים נוספים, אלא יציג הודעת סיום ויאפשר למשתמש להתחיל את התהליך מחדש.</p>
                    </div>
                  )}

                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">בחר שלב מהרשימה בצד ימין או צור שלב חדש</div>
          )
        )}
      </div>
      <Chatbot nodes={nodes} currentStepId={selectedId} />
    </div>
  );
}
