'use client';

import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Smartphone,
  Apple,
  X,
  Volume2,
  RefreshCw,
} from 'lucide-react';

interface MicrophonePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGranted: () => void;
  featureName?: string;
}

export const MicrophonePermissionModal: React.FC<MicrophonePermissionModalProps> = ({
  isOpen,
  onClose,
  onGranted,
  featureName = '콜 모드 (음성 통화)',
}) => {
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('ios');
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [requestState, setRequestState] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/.test(ua);

    // Detect In-App browsers (KakaoTalk, Line, Naver, Instagram, FB)
    const inApp = /KAKAOTALK|NAVER|Line|Instagram|FB_IAB|FB4A|FBAN/i.test(ua);
    setIsInAppBrowser(inApp);

    if (isIOS) {
      setDeviceType('ios');
    } else if (isAndroid) {
      setDeviceType('android');
    } else {
      setDeviceType('desktop');
    }
  }, []);

  if (!isOpen) return null;

  // Request microphone permission via user gesture
  const handleRequestPermission = async () => {
    setRequestState('requesting');
    setErrorMessage('');

    if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setRequestState('denied');
      setErrorMessage('현재 브라우저 환경에서 마이크 기능을 지원하지 않습니다. Safari 또는 Chrome 브라우저를 이용해 주세요.');
      return;
    }

    try {
      // Direct user gesture audio stream request
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop all tracks so mic doesn't stay green in status bar
      stream.getTracks().forEach((track) => track.stop());

      // Audio context unlock for iOS Safari
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          if (ctx.state === 'suspended') {
            await ctx.resume();
          }
        }
      } catch {}

      setRequestState('granted');
      setTimeout(() => {
        onGranted();
        onClose();
      }, 700);
    } catch (err: any) {
      console.warn('Microphone permission request error:', err);
      setRequestState('denied');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('마이크 권한이 차단되어 있습니다. 아래 안내에 따라 브라우저 설정에서 [허용]으로 변경해 주세요.');
      } else if (err.name === 'NotFoundError') {
        setErrorMessage('연결된 마이크 기기를 찾을 수 없습니다. 이어폰 또는 마이크 연결 상태를 확인해 주세요.');
      } else {
        setErrorMessage('마이크 권한을 활성화할 수 없습니다. 아래 브라우저 설정 가이드를 확인해 주세요.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-[#FAF9F5] dark:bg-[#1C1B19] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200/90 dark:border-stone-800 flex flex-col max-h-[90vh] overflow-hidden transition-all duration-300"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header */}
        <div className="p-5 pb-3 border-b border-stone-200/70 dark:border-stone-800 flex items-center justify-between bg-white/70 dark:bg-stone-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 leading-tight">
                마이크 권한 허용 안내
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {featureName}을(를) 위한 음성 인식
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-stone-800 dark:text-stone-200 text-sm">
          {/* In-App Browser Warning Alert */}
          {isInAppBrowser && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
                <span className="font-bold block text-sm mb-0.5">⚠️ 카카오톡/인앱 브라우저 감지</span>
                인앱 브라우저 환경에서는 마이크 음성 인식이 제한될 수 있습니다.
                화면 우측 하단 <strong>[···]</strong> 메뉴에서 <strong>&apos;다른 브라우저(Safari/Chrome)로 열기&apos;</strong>를 권장합니다.
              </div>
            </div>
          )}

          {/* Intro Description */}
          <div className="bg-white dark:bg-stone-900/70 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300 leading-relaxed shadow-sm">
            일본어 발음을 실시간으로 듣고 맞춤 피드백과 통화를 진행하기 위해 <strong>마이크 접근 권한</strong>이 필요합니다.
            권한은 오직 본 기기 내 실시간 일본어 대화에만 사용되며 외부로 저장되지 않습니다.
          </div>

          {/* OS Platform Selector Tabs */}
          <div className="flex rounded-xl bg-stone-200/60 dark:bg-stone-800/60 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setDeviceType('ios')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
                deviceType === 'ios'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm font-bold'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Apple className="w-3.5 h-3.5" />
              <span>Apple (iOS / Safari)</span>
            </button>
            <button
              type="button"
              onClick={() => setDeviceType('android')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
                deviceType === 'android'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm font-bold'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>안드로이드 (Chrome)</span>
            </button>
          </div>

          {/* iOS Guide */}
          {deviceType === 'ios' && (
            <div className="bg-white dark:bg-stone-900/80 rounded-2xl p-4 border border-stone-200/80 dark:border-stone-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-stone-100">
                <span className="w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-xs">
                  🍎
                </span>
                <span>iPhone / iPad (Safari) 권한 허용 3단계:</span>
              </div>
              <ol className="space-y-2.5 text-xs text-stone-600 dark:text-stone-300">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span>
                    Safari 화면 상단 주소창 좌측의 <strong>&apos;가A&apos;</strong> 또는 <strong>&apos;aA&apos;</strong> 아이콘을 탭합니다.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span>
                    메뉴에서 <strong>&apos;웹사이트 설정&apos;</strong> (또는 설정)을 선택합니다.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <span>
                    <strong>&apos;마이크&apos;</strong> 항목을 <strong>[허용]</strong>으로 변경 후 아래 버튼을 눌러주세요.
                  </span>
                </li>
              </ol>
            </div>
          )}

          {/* Android Guide */}
          {deviceType === 'android' && (
            <div className="bg-white dark:bg-stone-900/80 rounded-2xl p-4 border border-stone-200/80 dark:border-stone-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-stone-100">
                <span className="w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-xs">
                  🤖
                </span>
                <span>Android (Chrome / 삼성인터넷) 권한 허용 3단계:</span>
              </div>
              <ol className="space-y-2.5 text-xs text-stone-600 dark:text-stone-300">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span>
                    Chrome 상단 주소창 좌측의 <strong>자물쇠 🔒</strong> 또는 <strong>설정 슬라이더 아이콘</strong>을 탭합니다.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span>
                    <strong>&apos;권한&apos;</strong> 또는 <strong>&apos;사이트 설정&apos;</strong>을 터치합니다.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <span>
                    <strong>&apos;마이크&apos;</strong> 스위치를 <strong>[허용]</strong>으로 켠 뒤 아래 버튼을 누릅니다.
                  </span>
                </li>
              </ol>
            </div>
          )}

          {/* Error Message if Denied */}
          {errorMessage && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <MicOff className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success indicator */}
          {requestState === 'granted' && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 font-bold animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>마이크 연결 완료! 대화를 시작합니다.</span>
            </div>
          )}
        </div>

        {/* Footer Action Buttons */}
        <div className="p-4 border-t border-stone-200/80 dark:border-stone-800 bg-white/70 dark:bg-stone-900/60 flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={handleRequestPermission}
            disabled={requestState === 'requesting' || requestState === 'granted'}
            className="flex-2 py-3 px-5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold shadow-md shadow-rose-900/20 flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-60"
          >
            {requestState === 'requesting' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>권한 확인 중...</span>
              </>
            ) : requestState === 'granted' ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>허용되었습니다!</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>마이크 권한 허용하기</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
