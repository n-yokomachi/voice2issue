'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import '@/types/speech';

interface VoiceInputProps {
  onTranscriptChange: (transcript: string) => void;
  transcript?: string; // 親から渡される現在のtranscript値
  className?: string;
}

export default function VoiceInput({ onTranscriptChange, transcript = '', className }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState(''); // 確定されたテキスト
  const [interimTranscript, setInterimTranscript] = useState(''); // 一時的なテキスト
  const [error, setError] = useState<string | null>(null);
  
  // refを使って音声認識オブジェクトと停止フラグを管理
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const shouldStopRef = useRef(false);
  // finalTranscriptの最新値を保持するためのref
  const finalTranscriptRef = useRef('');
  
  // finalTranscriptとrefを同期
  useEffect(() => {
    finalTranscriptRef.current = finalTranscript;
  }, [finalTranscript]);

  // 親から渡されるtranscriptと内部状態を同期
  useEffect(() => {
    if (transcript !== finalTranscript + interimTranscript) {
      setFinalTranscript(transcript);
      setInterimTranscript('');
      finalTranscriptRef.current = transcript;
    }
  }, [transcript, finalTranscript, interimTranscript]);

  // 音声認識開始
  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('お使いのブラウザは音声認識に対応していません');
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SpeechRecognition) {
      setError('音声認識機能が利用できません');
      return;
    }

    shouldStopRef.current = false;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.lang = 'ja-JP';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      // 今回のセッションで新しく追加された結果のみを処理
      let sessionFinalTranscript = '';
      let sessionInterimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptText = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          sessionFinalTranscript += transcriptText;
        } else {
          sessionInterimTranscript += transcriptText;
        }
      }

              // 新しい確定テキストがある場合は既存のfinalTranscriptに追加
        if (sessionFinalTranscript) {
          const updatedFinalTranscript = finalTranscriptRef.current + sessionFinalTranscript;
          setFinalTranscript(updatedFinalTranscript);
          finalTranscriptRef.current = updatedFinalTranscript;
          
          // 確定テキストが追加されたら一時テキストをクリア
          setInterimTranscript(sessionInterimTranscript);
          
          // 親コンポーネントに送信
          onTranscriptChange((updatedFinalTranscript + sessionInterimTranscript).trim());
        } else {
          // 一時的なテキストのみ更新
          setInterimTranscript(sessionInterimTranscript);
          
          // 親コンポーネントに送信（既存のfinalTranscript + 新しいinterimTranscript）
          onTranscriptChange((finalTranscriptRef.current + sessionInterimTranscript).trim());
        }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setError(`音声認識エラー: ${event.error}`);
      
      // ネットワークエラーの場合は再試行
      if (event.error === 'network' && !shouldStopRef.current) {
        setTimeout(() => {
          if (!shouldStopRef.current) {
            startListening();
          }
        }, 1000);
      } else {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      // 手動停止でない場合は自動再開
      if (!shouldStopRef.current && isListening) {
        console.log('Auto-restarting speech recognition...');
        setTimeout(() => {
          if (!shouldStopRef.current) {
            startListening();
          }
        }, 100);
      } else {
        setIsListening(false);
        setInterimTranscript('');
      }
    };

    try {
      recognition.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      setError('音声認識の開始に失敗しました');
      setIsListening(false);
    }
  }, [isListening, onTranscriptChange]);

  // 音声認識停止
  const stopListening = useCallback(() => {
    shouldStopRef.current = true;
    setIsListening(false);
    setInterimTranscript('');
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Failed to stop recognition:', error);
      }
    }
  }, []);

  // テキストクリア
  const clearTranscript = useCallback(() => {
    setFinalTranscript('');
    setInterimTranscript('');
    finalTranscriptRef.current = '';
    onTranscriptChange('');
  }, [onTranscriptChange]);

  // 表示用の完全なテキスト
  const displayTranscript = finalTranscript + interimTranscript;

  return (
    <div className={clsx('w-full max-w-2xl mx-auto', className)}>
      <div className="bg-white dark:bg-navy-secondary rounded-xl shadow-xl border border-main-light/50 dark:border-navy-light p-6">
        {/* 音声入力ボタン */}
        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={isListening ? stopListening : startListening}
            className={clsx(
              'flex items-center justify-center w-20 h-20 rounded-full transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 shadow-lg',
              isListening
                ? 'bg-gradient-to-br from-accent to-accent-dark hover:from-accent-light hover:to-accent focus:ring-accent-light animate-pulse'
                : 'bg-gradient-to-br from-base-primary to-main-primary hover:from-main-secondary hover:to-base-primary focus:ring-main-secondary'
            )}
          >
            {isListening ? (
              <StopIcon className="h-8 w-8 text-white" />
            ) : (
              <MicrophoneIcon className="h-8 w-8 text-white" />
            )}
          </button>

          {isListening && (
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                音声を認識中...
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                会話の間が空いても自動的に再開されます
              </p>
            </div>
          )}
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mt-4 p-3 bg-gradient-to-r from-accent/10 to-accent-light/10 dark:bg-accent/20 border border-accent/30 dark:border-accent/50 rounded-md">
            <p className="text-sm text-accent dark:text-accent-light font-medium">{error}</p>
          </div>
        )}

        {/* 認識結果表示 */}
        <div className="mt-6">
          <div className="flex justify-end items-center mb-2">
            {displayTranscript && (
              <button
                onClick={clearTranscript}
                className="text-sm text-main-secondary hover:text-accent dark:text-main-light dark:hover:text-accent-light transition-colors duration-200"
              >
                クリア
              </button>
            )}
          </div>
          <div className="relative">
            <textarea
              value={displayTranscript}
              onChange={(e) => {
                const newValue = e.target.value;
                setFinalTranscript(newValue);
                finalTranscriptRef.current = newValue;
                setInterimTranscript('');
                onTranscriptChange(newValue);
              }}
              placeholder="音声入力の内容..."
              className="w-full h-32 px-3 py-2 border border-main-light dark:border-navy-accent rounded-md shadow-sm focus:ring-2 focus:ring-main-secondary focus:border-main-secondary bg-white dark:bg-navy-light text-main-primary dark:text-main-light placeholder-main-secondary/60 dark:placeholder-main-light/60 resize-none"
            />
            {/* 一時的なテキストのハイライト表示 */}
            {interimTranscript && (
              <div className="absolute bottom-2 right-2 text-xs text-accent dark:text-accent-light bg-white dark:bg-navy-primary px-2 py-1 rounded shadow">
                認識中...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 