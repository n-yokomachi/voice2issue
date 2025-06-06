'use client';

import { useState, useCallback } from 'react';
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import '../types/speech';

interface VoiceInputProps {
  onTranscriptChange: (transcript: string) => void;
  className?: string;
}

export default function VoiceInput({ onTranscriptChange, className }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

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
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'ja-JP';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptText = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptText;
        } else {
          interimTranscript += transcriptText;
        }
      }

      const newTranscript = transcript + finalTranscript + interimTranscript;
      setTranscript(newTranscript);
      onTranscriptChange(newTranscript);
    };

    recognition.onerror = (event) => {
      setError('音声認識エラーが発生しました');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [transcript, onTranscriptChange]);

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    onTranscriptChange('');
  }, [onTranscriptChange]);

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
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              音声を認識中...
            </p>
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
            {transcript && (
              <button
                onClick={clearTranscript}
                className="text-sm text-main-secondary hover:text-accent dark:text-main-light dark:hover:text-accent-light transition-colors duration-200"
              >
                クリア
              </button>
            )}
          </div>
          <textarea
            value={transcript}
            onChange={(e) => {
              setTranscript(e.target.value);
              onTranscriptChange(e.target.value);
            }}
            placeholder="音声入力の内容..."
            className="w-full h-32 px-3 py-2 border border-main-light dark:border-navy-accent rounded-md shadow-sm focus:ring-2 focus:ring-main-secondary focus:border-main-secondary bg-white dark:bg-navy-light text-main-primary dark:text-main-light placeholder-main-secondary/60 dark:placeholder-main-light/60 resize-none"
          />
        </div>
      </div>
    </div>
  );
} 