'use client';

import React, { useState } from 'react';
import { AISettings, UserStats } from '@/types';
import {
  Sparkles,
  Key,
  Cpu,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  Zap,
} from 'lucide-react';

interface AISettingsModalProps {
  stats: UserStats;
  onUpdateStats: (newStats: Partial<UserStats>) => void;
  onClose: () => void;
}

export const AISettingsModal: React.FC<AISettingsModalProps> = ({
  stats,
  onUpdateStats,
  onClose,
}) => {
  const currentSettings: AISettings = stats.aiSettings || {
    provider: 'built_in',
    apiKey: '',
    model: 'gemini-2.0-flash',
    isConnected: false,
  };

  const [provider, setProvider] = useState<'built_in' | 'gemini' | 'openai'>(
    currentSettings.provider
  );
  const [apiKey, setApiKey] = useState(currentSettings.apiKey);
  const [model, setModel] = useState(currentSettings.model);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(
    null
  );

  const handleTestConnection = async () => {
    if (provider === 'built_in') {
      setTestResult({
        success: true,
        message: '내장 시뮬레이터 엔진은 API 키 없이 즉시 100% 무료로 작동합니다.',
      });
      return;
    }

    if (!apiKey.trim()) {
      setTestResult({
        success: false,
        message: 'API 키를 입력해 주세요.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey: apiKey.trim(),
          model,
          currentLevel: 'N5',
          levelProgress: 15,
          history: [],
          userMessage: 'こんにちは！接続テストです。',
        }),
      });

      const data = await res.json();
      if (res.ok && data.japanese) {
        setTestResult({
          success: true,
          message: `연결 성공! AI 응답: "${data.japanese}"`,
        });
        // Save connection state
        onUpdateStats({
          aiSettings: {
            provider,
            apiKey: apiKey.trim(),
            model,
            isConnected: true,
          },
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || '연결에 실패했습니다. API 키를 다시 확인해 주세요.',
        });
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        message: e.message || '네트워크 오류가 발생했습니다.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onUpdateStats({
      aiSettings: {
        provider,
        apiKey: apiKey.trim(),
        model,
        isConnected: testResult?.success || currentSettings.isConnected,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-xs font-bold">
                AI 연결 설정
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              ChatGPT & Gemini AI 연동
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Google Gemini 또는 OpenAI ChatGPT API를 연동하여 더 풍부한 1:1 회화를 즐겨보세요.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center text-sm font-bold hover:bg-slate-200"
          >
            ✕
          </button>
        </div>

        {/* Provider Radio Tabs */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            사용할 AI 엔진 선택:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'gemini', label: 'Google Gemini', icon: '✨' },
              { id: 'openai', label: 'ChatGPT', icon: '🤖' },
              { id: 'built_in', label: '내장 시뮬레이터', icon: '⚡' },
            ].map((p) => {
              const isSelected = provider === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setProvider(p.id as any);
                    if (p.id === 'gemini') setModel('gemini-2.0-flash');
                    if (p.id === 'openai') setModel('gpt-4o-mini');
                    setTestResult(null);
                  }}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md font-bold'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                  }`}
                >
                  <span className="text-xl">{p.icon}</span>
                  <span className="text-xs font-bold">{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* API Key Input (if not built_in) */}
        {provider !== 'built_in' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-500" />
                  {provider === 'gemini' ? 'Gemini API Key' : 'OpenAI API Key'} *
                </label>
                <a
                  href={
                    provider === 'gemini'
                      ? 'https://aistudio.google.com/app/apikey'
                      : 'https://platform.openai.com/api-keys'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>{provider === 'gemini' ? '무료 키 발급 (Google AI Studio)' : '키 발급 (OpenAI)'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={
                  provider === 'gemini' ? 'AIzaSy...' : 'sk-proj-...'
                }
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Model Selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                사용 모델 (Model)
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {provider === 'gemini' ? (
                  <>
                    <option value="gemini-2.0-flash">gemini-2.0-flash (초고속 추천 / 최신)</option>
                    <option value="gemini-1.5-flash">gemini-1.5-flash (빠르고 안정적)</option>
                    <option value="gemini-1.5-pro">gemini-1.5-pro (최고 성능)</option>
                  </>
                ) : (
                  <>
                    <option value="gpt-4o-mini">gpt-4o-mini (가볍고 경제적 추천)</option>
                    <option value="gpt-4o">gpt-4o (최고 성능 플래그십)</option>
                  </>
                )}
              </select>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 flex items-start gap-2">
          <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p>
            입력하신 API 키는 서버에 영구 저장되지 않으며, 사용자 본인의 브라우저 로컬 저장소(LocalStorage)에만 안전하게 보관됩니다.
          </p>
        </div>

        {/* Test Result Feedback */}
        {testResult && (
          <div
            className={`p-3.5 rounded-xl text-xs leading-relaxed flex items-start gap-2 ${
              testResult.success
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {provider !== 'built_in' ? (
            <button
              onClick={handleTestConnection}
              disabled={isTesting || !apiKey.trim()}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition-colors flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>{isTesting ? '테스트 중...' : '연결 테스트'}</span>
            </button>
          ) : (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              무료 사용 준비 완료
            </span>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              설정 저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
