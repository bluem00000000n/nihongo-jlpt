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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FAF7F0] dark:bg-[#1E1D1B] rounded-2xl shadow-2xl border border-[#E2D9C8] dark:border-stone-800 max-w-md w-full p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between pb-3 border-b border-dashed border-[#DDD5C5] dark:border-stone-800">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="px-1.5 py-0.2 rounded-xs bg-[#FFE000] text-stone-900 text-[9px] font-extrabold shadow-xs">
                LOFT AI ENGINE
              </span>
              <span className="text-[10px] font-mono text-stone-500">PROVIDER SETTING</span>
            </div>
            <h3 className="text-base font-extrabold text-stone-900 dark:text-white">
              ChatGPT & Gemini AI 연동 설정
            </h3>
            <p className="text-[11px] text-stone-500 mt-0.5">
              스마트폰에서도 별도 앱 설치나 PC CLI 없이 API 키 하나로 즉시 연동됩니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center text-xs font-bold hover:bg-stone-300"
          >
            ✕
          </button>
        </div>

        {/* Provider Radio Tabs */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block font-mono">
            SELECT ENGINE:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'gemini', label: 'Google Gemini', sub: '무료 추천', icon: '✨' },
              { id: 'openai', label: 'ChatGPT', sub: 'OpenAI', icon: '🤖' },
              { id: 'built_in', label: '내장 AI', sub: '즉시 사용', icon: '⚡' },
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
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                    isSelected
                      ? 'bg-[#FFE000] text-stone-900 border-stone-900 shadow-xs font-extrabold'
                      : 'bg-white dark:bg-stone-850 border-[#DDD5C5] dark:border-stone-750 text-stone-700 dark:text-stone-300 hover:border-stone-800'
                  }`}
                >
                  <span className="text-lg">{p.icon}</span>
                  <span className="text-xs font-bold">{p.label}</span>
                  <span className="text-[9px] opacity-75">{p.sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Quick Guide Box */}
        <div className="p-3 bg-[#FEF9C3] dark:bg-[#2C2718] rounded-xl border border-[#FDE047] dark:border-yellow-900/60 text-xs text-stone-800 dark:text-stone-200 leading-relaxed shadow-xs">
          <strong className="block font-bold text-amber-900 dark:text-amber-300 mb-1 flex items-center gap-1">
            📱 스마트폰 사용자는 어떻게 연동하나요?
          </strong>
          <p className="text-[11px] leading-relaxed">
            모바일 폰에 Gemini나 ChatGPT 앱이 깔려있어도 외부 웹앱과의 보안 분리로 인해 앱 자동 로그인은 지원되지 않습니다.
            대신 <strong>PC CLI 없이</strong> 모바일 브라우저(Safari/Chrome)로 <strong>Google AI Studio</strong>에 접속하여 1초 만에 무료 키를 복사해 넣으시면 즉시 연동됩니다!
          </p>
        </div>

        {/* API Key Input (if not built_in) */}
        {provider !== 'built_in' && (
          <div className="space-y-3 pt-1 animate-fade-in">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5 font-mono">
                  <Key className="w-3.5 h-3.5 text-[#D93829]" />
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
                  className="text-[11px] font-extrabold text-[#D93829] hover:underline flex items-center gap-1"
                >
                  <span>{provider === 'gemini' ? '100% 무료 키 발급 (Google AI Studio)' : 'API 키 발급 (OpenAI)'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={
                  provider === 'gemini' ? 'AIzaSy... (구글 계정 무료 발급)' : 'sk-proj-...'
                }
                className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-[#DDD5C5] dark:border-stone-700 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-stone-800"
              />
            </div>

            {/* Model Selection */}
            <div>
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1 font-mono">
                MODEL:
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-[#DDD5C5] dark:border-stone-700 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-stone-800"
              >
                {provider === 'gemini' ? (
                  <>
                    <option value="gemini-2.0-flash">gemini-2.0-flash (초고속 도쿄 표준어 추천)</option>
                    <option value="gemini-1.5-flash">gemini-1.5-flash (안정적)</option>
                    <option value="gemini-1.5-pro">gemini-1.5-pro (심층 분석 최고 성능)</option>
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
        <div className="p-2.5 rounded-lg bg-white dark:bg-stone-850 border border-[#DDD5C5] dark:border-stone-750 text-[10px] text-stone-500 flex items-start gap-2 shadow-xs">
          <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
          <p>
            입력하신 API 키는 서버에 저장되지 않고, 오직 사용자 본인 기기 브라우저(LocalStorage)에만 안전하게 보관됩니다.
          </p>
        </div>

        {/* Test Result Feedback */}
        {testResult && (
          <div
            className={`p-3 rounded-lg text-xs leading-relaxed flex items-start gap-2 shadow-xs animate-fade-in ${
              testResult.success
                ? 'bg-[#ECFDF5] dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-200'
                : 'bg-[#FFF1F2] dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border border-rose-200'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#D93829] shrink-0 mt-0.5" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-between gap-2.5 pt-2 border-t border-[#E5DEC9] dark:border-stone-800">
          {provider !== 'built_in' ? (
            <button
              onClick={handleTestConnection}
              disabled={isTesting || !apiKey.trim()}
              className="px-3 py-2 rounded-lg bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-[#DDD5C5] font-extrabold text-xs hover:bg-[#F2ECE1] transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>{isTesting ? '테스트 중...' : '연결 테스트'}</span>
            </button>
          ) : (
            <span className="text-xs text-emerald-700 dark:text-emerald-300 font-extrabold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              내장 AI 즉시 무료 사용 가능
            </span>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-lg text-xs font-semibold text-stone-500 hover:text-stone-800"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#FFE000] hover:bg-[#FACC15] text-stone-900 font-extrabold text-xs rounded-lg shadow-xs border border-stone-800/20"
            >
              설정 저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
