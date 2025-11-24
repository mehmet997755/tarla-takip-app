import { useEffect, useState } from 'react';

const STORAGE_KEY = 'darkMode';

export default function DarkModeToggle() {
  const [dark, setDark] = useState<boolean>(() => localStorage.getItem(STORAGE_KEY) === 'true');

  useEffect(() => {
    document.body.classList.toggle('dark', dark);
    document.body.classList.toggle('dark-mode', dark);
    localStorage.setItem(STORAGE_KEY, String(dark));
  }, [dark]);

  return (
    <button
      type="button"
      onClick={() => setDark((d) => !d)}
      className="rounded-full border border-gray-300 px-3 py-1 text-sm dark:border-gray-700"
    >
      {dark ? 'Aydınlık' : 'Karanlık'}
    </button>
  );
}
