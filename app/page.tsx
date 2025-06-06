'use client';

import { useState, useCallback } from 'react';
import { RocketLaunchIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import Header from '../components/Header';
import VoiceInput from '../components/VoiceInput';
import SettingsModal from '../components/SettingsModal';

type SettingsFormData = {
  githubRepository: string;
  anthropicApiKey: string;
  demoMode?: boolean;
};

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [settings, setSettings] = useState<SettingsFormData | null>(null);
  const [isCreatingIssue, setIsCreatingIssue] = useState(false);
  const [creationStep, setCreationStep] = useState('');
  const [creationProgress, setCreationProgress] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);

  const handleTranscriptChange = useCallback((newTranscript: string) => {
    setTranscript(newTranscript);
  }, []);

  const handleSettingsSave = useCallback((newSettings: SettingsFormData) => {
    setSettings(newSettings);
    // TODO: 暗号化してlocalStorageに保存
    console.log('Settings saved:', newSettings);
  }, []);

  const handleCreateIssue = useCallback(async () => {
    // デモモード時は音声入力なしでもOK
    if (!settings?.demoMode && !transcript.trim()) {
      alert('音声入力の内容が空です');
      return;
    }

    // デモモードでない場合のみ設定チェック
    if (!settings?.demoMode) {
      if (!settings?.githubRepository) {
        alert('GitHubリポジトリが設定されていません（デモモードを有効にするか設定を入力してください）');
        setIsSettingsOpen(true);
        return;
      }

      if (!settings?.anthropicApiKey) {
        alert('Anthropic API Keyが設定されていません（デモモードを有効にするか設定を入力してください）');
        setIsSettingsOpen(true);
        return;
      }
    }

    setIsCreatingIssue(true);
    try {
      // TODO: Mastraワークフローを呼び出し
      // シミュレーション - 段階的な進捗表示
      const isDemoMode = settings?.demoMode;
      const actualTranscript = transcript.trim() || (isDemoMode ? 'ユーザー管理画面で、ユーザーの一覧を表示する機能を追加したいです。管理者がユーザーを検索したり、並び替えたりできるようにして、各ユーザーの詳細情報も確認できるようにしてください。' : '');
      
      console.log('Creating issue from transcript:', actualTranscript);
      console.log('Using settings:', settings);
      
      setCreationStep('音声内容を解析中...');
      setCreationProgress(25);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (isDemoMode) {
        setCreationStep('デモモード: 要件整理をシミュレーション...');
      } else {
        setCreationStep('Claude APIで要件整理中...');
      }
      setCreationProgress(50);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (isDemoMode) {
        setCreationStep('デモモード: Issue作成をシミュレーション...');
      } else {
        setCreationStep('GitHub Issueを作成中...');
      }
      setCreationProgress(75);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setCreationStep('完了しました！');
      setCreationProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 完了モーダル表示
      setShowCelebration(true);
    } catch (error) {
      alert('Issue作成に失敗しました');
      console.error('Issue creation error:', error);
    } finally {
      setIsCreatingIssue(false);
      setCreationStep('');
      setCreationProgress(0);
    }
  }, [transcript, settings]);

  return (
    <div className="min-h-full flex flex-col">
      {/* ヘッダー */}
      <Header onSettingsClick={() => setIsSettingsOpen(true)} />
      
      {/* デモモードバッジ */}
      {settings?.demoMode && (
        <div className="bg-gradient-to-r from-accent/10 to-accent-light/10 dark:from-accent/20 dark:to-accent-light/20 border-b border-accent/20 dark:border-accent/30">
          <div className="max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-white">
                  🎭 デモモード
                </span>
                <span className="text-sm text-accent dark:text-accent-light">
                  設定なしでテスト実行中
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* メインコンテンツ */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* 音声入力コンポーネント */}
          <VoiceInput onTranscriptChange={handleTranscriptChange} />
          


          {/* Issue作成ボタン */}
          <div className="text-center space-y-4">
            <button
              onClick={handleCreateIssue}
              disabled={(!settings?.demoMode && !transcript.trim()) || isCreatingIssue}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-accent to-accent-dark hover:from-accent-light hover:to-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-light disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-accent disabled:hover:to-accent-dark transition-all duration-200 shadow-lg"
            >
              {isCreatingIssue ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {creationStep || 'Creating...'}
                </>
              ) : (
                <>
                  <RocketLaunchIcon className="h-5 w-5 mr-2" />
                  Create Issue
                </>
              )}
            </button>
            
            {/* 進捗バー */}
            {isCreatingIssue && (
              <div className="max-w-md mx-auto">
                <div className="bg-main-light/20 dark:bg-navy-light/20 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-accent to-accent-dark h-full transition-all duration-300 ease-out"
                    style={{ width: `${creationProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-main-secondary dark:text-main-light mt-2">
                  {creationProgress}% 完了
                </p>
              </div>
            )}
          </div>

          {/* 使い方 */}
          <div className="bg-gradient-to-r from-main-light/20 to-main-secondary/10 dark:from-navy-primary/30 dark:to-navy-secondary/20 border border-main-light/50 dark:border-navy-light/30 rounded-xl shadow-sm">
            <button
              onClick={() => setShowHowTo(!showHowTo)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gradient-to-r hover:from-main-light/30 hover:to-main-secondary/20 dark:hover:from-navy-secondary/40 dark:hover:to-navy-light/20 transition-all duration-200 rounded-xl"
            >
              <h3 className="text-sm font-semibold text-main-primary dark:text-main-light">
                使い方
              </h3>
              {showHowTo ? (
                <ChevronUpIcon className="h-4 w-4 text-main-secondary dark:text-main-secondary" />
              ) : (
                <ChevronDownIcon className="h-4 w-4 text-main-secondary dark:text-main-secondary" />
              )}
            </button>
            {showHowTo && (
              <div className="px-4 pb-4 border-t border-main-light/30 dark:border-navy-light/30">
                <ol className="list-decimal list-inside space-y-2 text-sm text-main-primary dark:text-main-light pt-4">
                  <li className="hover:text-accent dark:hover:text-accent-light transition-colors cursor-default">設定で Repository と API Key を入力</li>
                  <li className="hover:text-accent dark:hover:text-accent-light transition-colors cursor-default">マイクボタンで音声入力</li>
                  <li className="hover:text-accent dark:hover:text-accent-light transition-colors cursor-default">機能を自然な言葉で説明</li>
                  <li className="hover:text-accent dark:hover:text-accent-light transition-colors cursor-default">Issue作成ボタンで完了</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-white dark:bg-navy-primary border-t border-main-light/50 dark:border-navy-light/50">
        <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-main-secondary dark:text-main-light">
            Voice 2 Issue - Built by yokomachi
          </p>
        </div>
      </footer>

      {/* 完了モーダル */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 背景オーバーレイ */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCelebration(false)}
          ></div>
          
          {/* モーダルコンテンツ */}
          <div className="relative bg-white dark:bg-navy-primary border border-main-light/50 dark:border-navy-light/30 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                         {/* ヘッダー */}
             <div className="bg-main-primary dark:bg-navy-secondary p-6 text-center">
               <div className="text-white">
                 <div className="text-4xl mb-2">✓</div>
                 <h2 className="text-2xl font-bold">Done</h2>
               </div>
             </div>
            
                         {/* コンテンツ */}
             <div className="p-6 space-y-4">
               {/* Issue URL */}
               <div className="text-center">
                 <p className="text-sm text-main-secondary dark:text-main-light mb-2">
                   Issue URL
                 </p>
                 <a
                   href={settings?.demoMode 
                     ? "https://example.com/issues/123" 
                     : `https://github.com/${settings?.githubRepository || 'owner/repo'}/issues/123`}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="inline-flex items-center space-x-2 px-4 py-2 bg-main-light/10 dark:bg-navy-light/20 border border-main-light/30 dark:border-navy-light/30 rounded-lg hover:bg-main-light/20 dark:hover:bg-navy-light/30 transition-colors duration-200 text-main-primary dark:text-main-light text-sm"
                 >
                   <span>
                     {settings?.demoMode 
                       ? "example.com/issues/123" 
                       : `github.com/${settings?.githubRepository || 'owner/repo'}/issues/123`}
                   </span>
                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                   </svg>
                 </a>
               </div>
               
               {/* アクションボタン */}
               <div className="flex justify-center">
                 <button
                   onClick={() => setShowCelebration(false)}
                   className="px-6 py-2 bg-main-primary dark:bg-navy-light text-white rounded-lg hover:bg-main-secondary dark:hover:bg-navy-accent transition-colors duration-200 font-medium"
                 >
                   閉じる
                 </button>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* 設定モーダル */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSettingsSave}
        initialValues={settings || undefined}
      />
    </div>
  );
}
