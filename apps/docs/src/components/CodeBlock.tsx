"use client";

import React, { useState } from 'react';
import { DocumentDuplicateIcon, CheckIcon } from '@heroicons/react/24/outline';

interface CodeBlockProps {
  code: string;
  language: string;
  title?: string;
  subtitle?: string;
}

export function CodeBlock({ code, language, title, subtitle }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <div className="relative rounded-xl overflow-hidden bg-slate-900 my-6 not-prose shadow-sm border border-slate-800">
      {(title || subtitle) && (
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800">
          {title && <div className="text-slate-300 text-sm font-mono mb-1">{title}</div>}
          {subtitle && <div className="text-slate-500 text-xs font-mono">{subtitle}</div>}
        </div>
      )}
      
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-800">
        <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">{language}</span>
        <button
          onClick={handleCopy}
          className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <CheckIcon className="w-4 h-4 text-white" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <DocumentDuplicateIcon className="w-4 h-4" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono text-slate-50 m-0">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
