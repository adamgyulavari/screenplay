// Helper function to get Tailwind color classes
export const getColorClasses = (color: string) => {
  const colorMap: Record<string, { from: string; to: string }> = {
    blue: { from: 'from-blue-500', to: 'to-blue-700' },
    green: { from: 'from-green-500', to: 'to-green-700' },
    purple: { from: 'from-purple-500', to: 'to-purple-700' },
    red: { from: 'from-red-500', to: 'to-red-700' },
    yellow: { from: 'from-yellow-500', to: 'to-yellow-700' },
    pink: { from: 'from-pink-500', to: 'to-pink-700' },
    indigo: { from: 'from-indigo-500', to: 'to-indigo-700' },
    teal: { from: 'from-teal-500', to: 'to-teal-700' },
    orange: { from: 'from-orange-500', to: 'to-orange-700' },
    cyan: { from: 'from-cyan-500', to: 'to-cyan-700' },
    emerald: { from: 'from-emerald-500', to: 'to-emerald-700' },
    rose: { from: 'from-rose-500', to: 'to-rose-700' },
    violet: { from: 'from-violet-500', to: 'to-violet-700' },
    sky: { from: 'from-sky-500', to: 'to-sky-700' },
    lime: { from: 'from-lime-500', to: 'to-lime-700' },
    amber: { from: 'from-amber-500', to: 'to-amber-700' },
    fuchsia: { from: 'from-fuchsia-500', to: 'to-fuchsia-700' },
    slate: { from: 'from-slate-500', to: 'to-slate-700' },
    zinc: { from: 'from-zinc-500', to: 'to-zinc-700' },
    neutral: { from: 'from-neutral-500', to: 'to-neutral-700' },
    stone: { from: 'from-stone-500', to: 'to-stone-700' },
    gray: { from: 'from-gray-500', to: 'to-gray-700' }
  };
  
  return colorMap[color] || colorMap.blue;
}; 
