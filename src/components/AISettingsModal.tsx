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
    provider: 'gemini',
    apiKey: '',
    model: 'gemini-3-flash-preview',
    isConnected: true,
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

    if (!apiKey.trim() && provider === 'openai') {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto text-gray-900">
        <div className="flex items-start justify-between pb-3 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="px-2 py-0.5 rounded-md bg-[#FFE000] text-gray-950 text-[10px] font-black border border-gray-900/10">
                AI ENGINE
              </span>
              <span className="text-[10px] font-mono font-bold text-gray-500">PROVIDER SETTING</span>
            </div>
            <h3 className="text-base font-black text-gray-950">
              ChatGPT & Gemini AI 연동 설정
            </h3>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              스마트폰에서도 별도 앱 설치나 PC CLI 없이 API 키 하나로 즉시 연동됩니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Provider Radio Tabs */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-gray-900 block font-mono">
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
                    if (p.id === 'gemini') setModel('gemini-3-flash-preview');
                    if (p.id === 'openai') setModel('gpt-4o-mini');
                    setTestResult(null);
                  }}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                    isSelected
                      ? 'bg-amber-50 border-2 border-[#FFE000] text-gray-950 shadow-xs font-black'
                      : 'bg-white border-gray-200 text-gray-800 hover:border-gray-400'
                  }`}
                >
                  <span className="text-xl">{p.icon}</span>
                  <span className="text-xs font-black text-gray-950">{p.label}</span>
                  <span className="text-[10px] text-gray-600 font-bold">{p.sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Quick Guide Box */}
        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 leading-relaxed shadow-xs">
          <strong className="block font-black text-amber-950 mb-1 flex items-center gap-1 text-xs">
            📱 스마트폰 사용자는 어떻게 연동하나요?
          </strong>
          <p className="text-xs text-amber-900 leading-relaxed font-medium">
            모바일 폰에 Gemini나 ChatGPT 앱이 깔려있어도 외부 웹앱과의 보안 분리로 인해 앱 자동 로그인은 지원되지 않습니다.
            대신 <strong>PC CLI 없이</strong> 모바일 브라우저(Safari/Chrome)로 <strong>Google AI Studio</strong>에 접속하여 1초 만에 무료 키를 복사해 넣으시면 즉시 연동됩니다!
          </p>
        </div>

        {/* API Key Input (if not built_in) */}
        {provider !== 'built_in' && (
          <div className="space-y-3 pt-1 animate-fade-in">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-black text-gray-900 flex items-center gap-1.5 font-mono">
                  <Key className="w-3.5 h-3.5 text-red-600" />
                  {provider === 'gemini' ? 'Gemini API Key (기본 연동 완료)' : 'OpenAI API Key *'}
                </label>
                <a
                  href={
                    provider === 'gemini'
                      ? 'https://aistudio.google.com/app/apikey'
                      : 'https://platform.openai.com/api-keys'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-black text-red-600 hover:underline flex items-center gap-1"
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
                  provider === 'gemini' ? 'AQ.Ab... 또는 AIzaSy... (구글 계정 무료 발급)' : 'sk-proj-...'
                }
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono text-gray-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
              />
            </div>

            {/* Model Selection */}
            <div>
              <label className="text-xs font-black text-gray-900 block mb-1 font-mono">
                MODEL:
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-950 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
              >
                {provider === 'gemini' ? (
                  <>
                    <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite (⚡초고속 1초대 플래시 라이트 · 대화 추천)</option>
                    <option value="gemini-3-flash-preview">gemini-3-flash-preview (최신 플래시 · 기본형)</option>
                    <option value="gemini-3.5-flash">gemini-3.5-flash (차세대 고성능)</option>
                    <option value="gemini-flash-latest">gemini-flash-latest (항상 최신 Flash)</option>
                    <option value="gemini-pro-latest">gemini-pro-latest (심층 최고 성능 Pro)</option>
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
        <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 flex items-start gap-2 shadow-xs font-medium">
          <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p>
            입력하신 API 키는 서버에 저장되지 않고, 오직 사용자 본인 기기 브라우저(LocalStorage)에만 안전하게 보관됩니다.
          </p>
        </div>

        {/* Test Result Feedback */}
        {testResult && (
          <div
            className={`p-3 rounded-xl text-xs leading-relaxed flex items-start gap-2 shadow-xs animate-fade-in font-bold ${
              testResult.success
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-red-50 text-red-900 border border-red-200'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-gray-200">
          {provider !== 'built_in' ? (
            <button
              onClick={handleTestConnection}
              disabled={isTesting || !apiKey.trim()}
              className="px-3.5 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-300 font-black text-xs transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>{isTesting ? '테스트 중...' : '연결 테스트'}</span>
            </button>
          ) : (
            <span className="text-xs text-emerald-700 font-black flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              내장 AI 즉시 무료 사용 가능
            </span>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:text-gray-950 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2.5 bg-[#FFE000] hover:bg-[#FACC15] text-gray-950 font-black text-xs rounded-xl shadow-xs border border-gray-900/15 transition-all"
            >
              설정 저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
