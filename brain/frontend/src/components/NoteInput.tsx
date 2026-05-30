'use client';

import { useState } from 'react';

interface NoteInputProps {
  onSubmit: (content: string) => void;
  disabled?: boolean;
}

export default function NoteInput({ onSubmit, disabled }: NoteInputProps) {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit(content);
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mb-8">
      <div className="flex flex-col gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Capture a thought..."
          className="w-full p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-32"
          disabled={disabled}
        />
        <button
          type="submit"
          disabled={disabled || !content.trim()}
          className="self-end px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Capture
        </button>
      </div>
    </form>
  );
}
