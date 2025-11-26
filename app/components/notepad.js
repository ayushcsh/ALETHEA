"use client";
import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Save, Download } from "lucide-react";

export default function Notepad() {
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem("notepadText", text);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDownload = () => {
    console.log("Downloading...");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "note.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  // load saved text if any
  React.useEffect(() => {
    const savedText = localStorage.getItem("notepadText");
    if (savedText) setText(savedText);
  }, []);

  return (
    <div className="flex flex-col items-center bg-[#0e0e0e] p-2 rounded-2xl shadow-lg max-w-[48vw] min-h-[95vh]">
      <h2 className="text-lg font-semibold mb-4 text-white">📝 Notepad</h2>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your thoughts here..."
        className="w-full h-[77vh] bg-[#1a1a1a] text-gray-200 p-3 rounded-lg resize-none outline-none font-[Arial]"
      />

      <div className="flex justify-between w-full mt-4">
        <Button
          onClick={handleSave}
          className="bg-[#222] z-50  hover:bg-[#333] text-white flex items-center gap-2"
        >
          <Save size={16}/> Save
        </Button>
        <Button
          onClick={handleDownload}
          className="bg-[#d13902] z-50 hover:bg-[#e64b0a] text-white flex items-center gap-2"
        >
          <Download size={16} /> Download
        </Button>
      </div>

      {saved && (
        <p className="text-green-500  text-sm">✅ Saved locally!</p>
      )}
    </div>
  );
}
