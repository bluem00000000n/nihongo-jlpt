'use client';

import React from 'react';

interface FuriganaTextProps {
  japanese: string;
  ruby?: { kanji: string; furigana: string }[];
  romaji?: string;
  showFurigana?: boolean;
  showRomaji?: boolean;
  className?: string;
}

export const FuriganaText: React.FC<FuriganaTextProps> = ({
  japanese,
  ruby,
  romaji,
  showFurigana = true,
  showRomaji = false,
  className = '',
}) => {
  // If no ruby breakdown provided, display plain text
  if (!ruby || ruby.length === 0 || !showFurigana) {
    return (
      <div className={`inline-flex flex-col ${className}`}>
        <span className="font-medium text-slate-800 dark:text-slate-100">{japanese}</span>
        {showRomaji && romaji && (
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">{romaji}</span>
        )}
      </div>
    );
  }

  // Render text with ruby tags for furigana
  // Replace kanji segments with ruby
  const renderedElements: React.ReactNode[] = [];
  let remainingText = japanese;

  ruby.forEach((item, index) => {
    const kanjiIndex = remainingText.indexOf(item.kanji);
    if (kanjiIndex !== -1) {
      // Leading plain text
      if (kanjiIndex > 0) {
        renderedElements.push(
          <span key={`text-${index}`} className="align-middle">
            {remainingText.substring(0, kanjiIndex)}
          </span>
        );
      }
      // Ruby segment
      renderedElements.push(
        <ruby key={`ruby-${index}`} className="ruby-text mx-0.5 align-middle">
          {item.kanji}
          <rt className="text-[11px] font-normal text-indigo-600 dark:text-indigo-400 select-none">
            {item.furigana}
          </rt>
        </ruby>
      );
      remainingText = remainingText.substring(kanjiIndex + item.kanji.length);
    }
  });

  if (remainingText.length > 0) {
    renderedElements.push(
      <span key="tail" className="align-middle">
        {remainingText}
      </span>
    );
  }

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <span className="font-medium text-slate-800 dark:text-slate-100 text-lg leading-relaxed">
        {renderedElements}
      </span>
      {showRomaji && romaji && (
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">{romaji}</span>
      )}
    </div>
  );
};
