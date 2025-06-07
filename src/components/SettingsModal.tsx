'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';

type SettingsFormData = {
  githubRepository: string;
  githubToken: string;
  anthropicApiKey: string;
  demoMode?: boolean;
};

type SettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: SettingsFormData) => void;
  initialValues?: SettingsFormData;
};

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialValues 
}: SettingsModalProps) {
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<SettingsFormData>({
    defaultValues: initialValues || {
      githubRepository: '',
      githubToken: '',
      anthropicApiKey: '',
      demoMode: false,
    }
  });

  const demoMode = watch('demoMode');

  const onSubmit = (data: SettingsFormData) => {
    onSave(data);
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
                  >
                    設定
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={handleClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        {...register('demoMode')}
                        type="checkbox"
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        デモモード (設定不要でテスト実行)
                      </span>
                    </label>
                  </div>

                  {!demoMode && (
                    <>
                      <div>
                        <label htmlFor="githubRepository" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          GitHub Repository
                        </label>
                        <input
                          {...register('githubRepository', { 
                            required: !demoMode ? 'リポジトリ名は必須です' : false,
                            pattern: {
                              value: /^[\w\-\.]+\/[\w\-\.]+$/,
                              message: 'owner/repo の形式で入力してください'
                            }
                          })}
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

                      <div>
                        <label htmlFor="githubToken" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          GitHub Personal Access Token
                        </label>
                        <input
                          {...register('githubToken')}
                          type="password"
                          placeholder="ghp_..."
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                        />
                        {errors.githubToken && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {errors.githubToken.message}
                          </p>
                        )}
                      </div>

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

                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                          <li>• Repository: owner/repo形式</li>
                          <li>• GitHub Token: <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="underline">GitHub Settings</a>で発行（repo権限必要）</li>
                          <li>• API Key: <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="underline">Anthropic Console</a>で取得</li>
                          <li>• デモモード: 設定不要でテスト可能</li>
                        </ul>
                      </div>
                    </>
                  )}

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
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 