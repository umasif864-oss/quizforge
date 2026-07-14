'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onTextExtracted: (text: string) => void;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

function FileIcon({ type }: { type: 'pdf' | 'docx' | 'file' }) {
  const color = type === 'pdf' ? '#C1443C' : type === 'docx' ? '#2F6F4E' : '#6B7280';
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" stroke={color} strokeWidth="1.5" fill="white" />
      <path d="M15 2v5h5" stroke={color} strokeWidth="1.5" fill="none" />
    </svg>
  );
}

export default function FileUpload({ onTextExtracted }: FileUploadProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [mode, setMode] = useState<'upload' | 'paste'>('upload');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setError(null);
    setFileName(file.name);
    setStatus('loading');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/parse-document', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to read the document.');
      }

      onTextExtracted(data.text);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }, [onTextExtracted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
  });

  const handlePasteSubmit = () => {
    if (pastedText.trim()) {
      onTextExtracted(pastedText.trim());
      setStatus('success');
      setFileName('Pasted text');
    }
  };

  const extension: 'pdf' | 'docx' | 'file' = fileName?.toLowerCase().endsWith('.pdf')
    ? 'pdf'
    : fileName?.toLowerCase().endsWith('.docx')
    ? 'docx'
    : 'file';

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Folder tabs */}
      <div className="flex gap-1">
        <button
          onClick={() => setMode('upload')}
          className={`px-5 py-2.5 rounded-t-lg text-sm font-medium transition-colors ${
            mode === 'upload' ? 'bg-white text-[#1E2A38] relative z-10' : 'bg-[#EFE9D8] text-[#6B7280] hover:text-[#1E2A38]'
          }`}
        >
          Upload a file
        </button>
        <button
          onClick={() => setMode('paste')}
          className={`px-5 py-2.5 rounded-t-lg text-sm font-medium transition-colors ${
            mode === 'paste' ? 'bg-white text-[#1E2A38] relative z-10' : 'bg-[#EFE9D8] text-[#6B7280] hover:text-[#1E2A38]'
          }`}
        >
          Paste text instead
        </button>
      </div>

      <div className="bg-white rounded-b-lg rounded-tr-lg border border-[#D9D0BC] p-6 -mt-px relative z-0">
        {mode === 'upload' ? (
          <div
            {...getRootProps()}
            className={`relative overflow-hidden rounded-xl p-10 text-center cursor-pointer border-2 border-dashed transition-all duration-200 ${
              isDragActive
                ? 'border-[#2F6F4E] bg-[#F5D53C]/10 scale-[1.01]'
                : status === 'error'
                ? 'border-[#C1443C]/40 bg-[#C1443C]/5'
                : 'border-[#D9D0BC] bg-[#FAF6ED] hover:border-[#2F6F4E]/50'
            }`}
          >
            {/* paper dog-ear corner */}
            <div
              className="absolute top-0 right-0 w-6 h-6"
              style={{ background: 'linear-gradient(135deg, transparent 50%, #EFE9D8 50%)' }}
            />
            <input {...getInputProps()} />

            {status === 'loading' && (
              <div className="flex flex-col items-center gap-3">
                <p className="text-[#445064] text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
                  Reading {fileName}…
                </p>
                <div className="w-48 h-[2px] bg-[#D9D0BC] rounded-full overflow-hidden">
                  <div className="h-full bg-[#2F6F4E]" style={{ animation: 'drawLine 1.4s ease-in-out infinite alternate' }} />
                </div>
              </div>
            )}

            {status === 'success' && fileName && (
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-14 h-14 rounded-full border-2 border-[#C1443C] flex items-center justify-center"
                  style={{ animation: 'stampIn 0.5s ease-out', transform: 'rotate(-8deg)' }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="#C1443C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-xs tracking-widest uppercase text-[#C1443C] font-medium" style={{ fontFamily: 'var(--font-mono)' }}>
                  Reviewed
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <FileIcon type={extension} />
                  <span className="text-sm text-[#1E2A38]" style={{ fontFamily: 'var(--font-mono)' }}>
                    {fileName}
                  </span>
                </div>
                <p className="text-xs text-[#6B7280] mt-2">Drop another file to replace it</p>
              </div>
            )}

            {status === 'idle' && !isDragActive && (
              <div className="flex flex-col items-center gap-2">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" className="mb-1">
                  <path d="M12 16V4M12 4l-4 4M12 4l4 4" stroke="#2F6F4E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" stroke="#2F6F4E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-[#1E2A38] font-medium" style={{ fontFamily: 'var(--font-display)' }}>
                  Drag a PDF or Word document here
                </p>
                <p className="text-[#6B7280] text-sm">or click to choose a file from your computer</p>
              </div>
            )}

            {isDragActive && (
              <p className="text-[#2F6F4E] font-medium">Drop it — I'm ready</p>
            )}

            {status === 'error' && (
              <p className="text-[#1E2A38] text-sm">Try dragging a file here again</p>
            )}
          </div>
        ) : (
          <div>
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste your text here…"
              className="w-full h-48 p-4 border border-[#D9D0BC] rounded-lg resize-none bg-[#FAF6ED] text-[#1E2A38] focus:outline-none focus:border-[#2F6F4E] focus:ring-1 focus:ring-[#2F6F4E]"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: 1.6 }}
            />
            <button
              onClick={handlePasteSubmit}
              disabled={!pastedText.trim()}
              className="mt-3 px-5 py-2.5 bg-[#2F6F4E] text-white rounded-lg text-sm font-medium hover:bg-[#24573D] disabled:bg-[#D9D0BC] disabled:text-[#9A9282] transition-colors"
            >
              Use this text
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 pl-3 border-l-2 border-[#C1443C] text-sm text-[#C1443C]">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}