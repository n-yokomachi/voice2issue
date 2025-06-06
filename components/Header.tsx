'use client';

import { Cog6ToothIcon, MicrophoneIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from './ThemeProvider';

// GitHub SVGアイコン
const GitHubIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
      clipRule="evenodd"
    />
  </svg>
);

interface HeaderProps {
  onSettingsClick: () => void;
}

export default function Header({ onSettingsClick }: HeaderProps) {
  const { isDarkMode, setTheme } = useTheme();

  const toggleDarkMode = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <header className="bg-white dark:bg-navy-primary shadow-lg border-b border-main-light/30 dark:border-navy-light/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 min-h-[64px]">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-base-primary to-main-primary rounded-lg shadow-md">
              <MicrophoneIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-main-primary to-base-primary bg-clip-text text-transparent dark:bg-none dark:text-main-light">
              Voice 2 Issue
            </h1>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* GitHubリンク */}
            <a
              href="https://github.com/n-yokomachi/voice2issue"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 text-main-primary dark:text-main-light hover:text-accent dark:hover:text-accent-light transition-colors duration-200"
            >
              <GitHubIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </a>

            {/* ダークモードトグル */}
            <button
              onClick={toggleDarkMode}
              className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 text-main-primary dark:text-main-light hover:text-accent dark:hover:text-accent-light transition-colors duration-200"
            >
              {isDarkMode ? (
                <SunIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <MoonIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>
            
            {/* 設定ボタン */}
            <button
              onClick={onSettingsClick}
              className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 border border-main-light dark:border-navy-light rounded-md shadow-sm text-main-primary dark:text-main-light bg-white/80 dark:bg-navy-secondary/50 hover:bg-main-light/20 dark:hover:bg-navy-light/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-all duration-200"
            >
                              <Cog6ToothIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 