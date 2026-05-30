'use client';

interface SidebarProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const CATEGORIES = [
  { id: 'Work', name: 'Work', icon: '💼' },
  { id: 'Personal', name: 'Personal', icon: '👤' },
  { id: 'Idea', name: 'Idea', icon: '💡' },
  { id: 'Task', name: 'Task', icon: '✅' },
  { id: 'Study', name: 'Study', icon: '📚' },
];

export default function Sidebar({ selectedCategory, onSelectCategory }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-screen sticky top-0 bg-white dark:bg-zinc-950 px-4 py-8">
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest px-2 mb-4">
          Collections
        </h2>
        <nav className="space-y-1">
          <button
            onClick={() => onSelectCategory(null)}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedCategory === null
                ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <span className="text-lg">🧠</span>
            <span>All Notes</span>
          </button>
          
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <span className="text-lg">{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto pt-8 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
                JD
            </div>
            <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">John Doe</span>
                <span className="text-[10px] text-zinc-500">Free Plan</span>
            </div>
        </div>
      </div>
    </aside>
  );
}
