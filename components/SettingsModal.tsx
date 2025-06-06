'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const createSettingsSchema = (demoMode?: boolean) => z.object({
  githubRepository: demoMode 
    ? z.string().optional() 
    : z.string()
        .min(1, 'GitHubリポジトリは必須です')
        .regex(/^[\w.-]+\/[\w.-]+$/, '形式: owner/repo'),
  anthropicApiKey: demoMode 
    ? z.string().optional() 
    : z.string().min(1, 'Anthropic API Keyは必須です'),
  demoMode: z.boolean().optional().default(false),
});

type SettingsFormData = {
  githubRepository: string;
  anthropicApiKey: string;
  demoMode?: boolean;
};

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: SettingsFormData) => void;
  initialValues?: Partial<SettingsFormData>;
}

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialValues 
}: SettingsModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch
  } = useForm<SettingsFormData>({
    defaultValues: initialValues,
    mode: 'onChange',
  });

  const watchedValues = watch();
  const demoMode = watchedValues.demoMode;

  const onSubmit = (data: SettingsFormData) => {
    onSave(data);
    onClose();
  };



  const handleClose = () => {
    reset(initialValues);
    onClose();
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={handleClose}
                  >
                    <span className="sr-only">閉じる</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-0 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                      設定
                    </Dialog.Title>

                    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
                      {/* GitHub Repository設定 */}
                      <div>
                        <label htmlFor="githubRepository" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          GitHubリポジトリ
                        </label>
                        <input
                          {...register('githubRepository')}
                          type="text"
                          placeholder="owner/repository"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                        />
                        {errors.githubRepository && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {errors.githubRepository.message}
                          </p>
                        )}
                      </div>

                      {/* Anthropic API Key設定 */}
                      <div>
                        <label htmlFor="anthropicApiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Anthropic API Key
                        </label>
                        <input
                          {...register('anthropicApiKey')}
                          type="password"
                          placeholder="sk-ant-api03-..."
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                        />
                        {errors.anthropicApiKey && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {errors.anthropicApiKey.message}
                          </p>
                        )}
                      </div>

                      {/* デモモード設定 */}
                      <div>
                        <div className="flex items-center justify-between">
                          <div>
                            <label htmlFor="demoMode" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              デモモード
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              リポジトリやAPIキーなしでテスト実行
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              {...register('demoMode')}
                              type="checkbox"
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 dark:peer-focus:ring-accent/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent"></div>
                          </label>
                        </div>
                      </div>

                      {/* 使い方の説明 */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                          <li>• Repository: owner/repo形式</li>
                          <li>• API Key: <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="underline">Anthropic Console</a>で取得</li>
                          <li>• デモモード: 設定不要でテスト可能</li>
                        </ul>
                      </div>

                      {/* ボタン */}
                      <div className="mt-6 flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-3 sm:space-y-0">
                        <button
                          type="button"
                          onClick={handleClose}
                          className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          キャンセル
                        </button>
                        <button
                          type="submit"
                          className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          保存
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 