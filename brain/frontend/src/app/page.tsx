'use client';

import { useEffect, useState, useCallback } from 'react';
import NoteInput from '@/components/NoteInput';
import NoteCard from '@/components/NoteCard';
import Sidebar from '@/components/Sidebar';
import { api, Note } from '@/utils/api';
import { useSSE } from '@/hooks/useSSE';
import { Inbox } from 'lucide-react';

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleNoteUpdated = useCallback((updatedNote: Note) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
    );
  }, []);

  useSSE(handleNoteUpdated);

  useEffect(() => {
    api.fetchNotes()
      .then(setNotes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCapture = async (content: string) => {
    // Optimistic Update
    const tempId = Math.random().toString(36).substring(7);
    const optimisticNote: Note = {
      id: tempId,
      content,
      status: 'PROCESSING',
      createdAt: new Date().toISOString(),
    };

    setNotes((prev) => [optimisticNote, ...prev]);

    try {
      const realNote = await api.createNote(content);
      // Replace optimistic note with real one
      setNotes((prev) =>
        prev.map((n) => (n.id === tempId ? realNote : n))
      );
    } catch (error) {
      console.error('Failed to capture note:', error);
      // Mark as failed in state
      setNotes((prev) =>
        prev.map((n) =>
          n.id === tempId ? { ...n, status: 'FAILED' } : n
        )
      );
    }
  };

  const filteredNotes = selectedCategory
    ? notes.filter((n) => n.category === selectedCategory || n.status === 'PROCESSING' || n.status === 'FAILED')
    : notes;

  return (
    <div className="flex h-screen bg-background font-sans overflow-hidden">
      <Sidebar 
        selectedCategory={selectedCategory} 
        onSelectCategory={setSelectedCategory} 
      />
      
      <main className="flex-1 overflow-y-auto scroll-smooth">
        <div className="max-w-3xl mx-auto px-6 py-16 sm:px-12">
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xl shadow-sm border border-border">
                {selectedCategory === 'Cooking' ? '🍳' : 
                 selectedCategory === 'Tech' ? '💻' : 
                 selectedCategory === 'Personal' ? '👤' : 
                 selectedCategory === 'Other' ? '📝' : '🧠'}
              </div>
              <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
                {selectedCategory ? selectedCategory : 'Secondary Brain'}
              </h1>
            </div>
            <p className="text-secondary-text text-lg font-medium max-w-xl">
              {selectedCategory 
                ? `Everything tagged as ${selectedCategory}. AI-organized and searchable.` 
                : 'Your digital extension for thoughts, ideas, and fleeting inspirations.'}
            </p>
          </header>

          <div className="sticky top-0 z-10 py-4 bg-background/80 backdrop-blur-md mb-8">
            <NoteInput onSubmit={handleCapture} />
          </div>

          <div className="flex flex-col gap-6">
            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-6 rounded-xl border border-border bg-white dark:bg-zinc-900 shadow-sm animate-pulse h-40" />
                ))}
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="text-center py-32 border-2 border-dashed border-border rounded-2xl bg-zinc-50/30 dark:bg-zinc-900/10">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4 text-zinc-400">
                  <Inbox className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">No notes yet</h3>
                <p className="text-secondary-text max-w-xs mx-auto text-sm">
                  {selectedCategory 
                    ? `You don't have any notes in the ${selectedCategory} category.` 
                    : 'Start by capturing a thought in the input field above!'}
                </p>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

