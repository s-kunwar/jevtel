import { useEffect, useMemo, useState } from 'react';
import { Shield } from 'lucide-react';
import { INTEL_HARDWARE_URLS, PORTRAIT_AVATAR_MAP, TINY_SWORDS_AVATARS, TINY_SWORDS_UI } from '../game/assets';
import { gameAudio } from '../game/audio';
import type { DialogueChoice, DialogueStep } from '../game/types';

interface DialogueModalProps {
  step: DialogueStep;
  onAdvance: () => void;
  onSelectChoice: (choice: DialogueChoice) => void;
}

export function DialogueModal({ step, onAdvance, onSelectChoice }: DialogueModalProps) {
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [visibleChars, setVisibleChars] = useState(0);
  const [imgErr, setImgErr] = useState(false);

  const sentences = useMemo(() => {
    const parts = step.text
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    return parts.length > 0 ? parts : [step.text];
  }, [step.text]);

  const currentSentence = sentences[sentenceIndex] ?? step.text;
  const isTypingDone = visibleChars >= currentSentence.length;
  const isLastSentence = sentenceIndex >= sentences.length - 1;

  const fallbackInfo = PORTRAIT_AVATAR_MAP[step.portrait];
  const avatarIdx = step.avatarIdx ?? fallbackInfo.avatarIdx;
  const ribbonColor = step.factionColor ?? fallbackInfo.ribbonColor;
  const portraitUrl =
    step.portrait === 'trap_laptop'
      ? INTEL_HARDWARE_URLS.trapLaptop
      : TINY_SWORDS_AVATARS[Math.max(0, Math.min(24, avatarIdx - 1))];
  const hardwareBadgeUrl =
    step.portrait === 'trap_laptop'
      ? INTEL_HARDWARE_URLS.trapLaptop
      : step.portrait === 'laptop_mascot'
        ? INTEL_HARDWARE_URLS.aiPc
        : INTEL_HARDWARE_URLS.chip;

  useEffect(() => {
    setSentenceIndex(0);
    setVisibleChars(0);
    setImgErr(false);
  }, [step]);

  useEffect(() => {
    setVisibleChars(0);
    const interval = window.setInterval(() => {
      setVisibleChars((prev) => {
        if (prev >= currentSentence.length) {
          window.clearInterval(interval);
          return prev;
        }
        if (prev % 3 === 0) {
          const pitch =
            step.portrait === 'lag_titan'
              ? 240
              : step.portrait === 'npu_sentinel'
                ? 440
                : step.portrait === 'arc_warden'
                  ? 560
                  : 500;
          gameAudio.playDialogueBlip(pitch);
        }
        return prev + 2;
      });
    }, 18);

    return () => window.clearInterval(interval);
  }, [step, sentenceIndex, currentSentence]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      if (!isTypingDone) {
        if (['Space', 'Enter', 'KeyE'].includes(e.code)) {
          e.preventDefault();
          setVisibleChars(currentSentence.length);
        }
        return;
      }

      if (!isLastSentence) {
        if (['Space', 'Enter', 'KeyE'].includes(e.code)) {
          e.preventDefault();
          setSentenceIndex((prev) => prev + 1);
          setVisibleChars(0);
        }
        return;
      }

      if (step.choices && step.choices.length > 0) {
        if (e.code === 'Digit1' && step.choices[0]) {
          e.preventDefault();
          onSelectChoice(step.choices[0]);
        } else if (e.code === 'Digit2' && step.choices[1]) {
          e.preventDefault();
          onSelectChoice(step.choices[1]);
        } else if (e.code === 'Digit3' && step.choices[2]) {
          e.preventDefault();
          onSelectChoice(step.choices[2]);
        } else if (e.code === 'Enter' && step.choices.length === 1) {
          e.preventDefault();
          onSelectChoice(step.choices[0]);
        }
      } else if (['Space', 'Enter', 'KeyE'].includes(e.code)) {
        e.preventDefault();
        onAdvance();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isTypingDone, isLastSentence, currentSentence, step, onAdvance, onSelectChoice]);

  const handlePrimaryClick = () => {
    if (!isTypingDone) {
      setVisibleChars(currentSentence.length);
    } else if (!isLastSentence) {
      setSentenceIndex((prev) => prev + 1);
      setVisibleChars(0);
    } else {
      onAdvance();
    }
  };

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 flex justify-center p-3 md:p-5">
      <div className="ts-wood-panel w-full max-w-4xl">
        {/* Faction Color Ribbon Header */}
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-1">
          <div className={`ts-ribbon ts-ribbon-${ribbonColor} inline-flex items-center gap-2 font-display text-sm font-bold tracking-wide md:text-base`}>
            <img src={hardwareBadgeUrl} alt="" referrerPolicy="no-referrer" className="pixelated h-5 w-5" />
            <span>{step.speaker}</span>
          </div>
          <span className="font-mono-tabular text-xs font-semibold text-[#FDE68A] drop-shadow">
            {step.role}
          </span>
        </div>

        {/* Parchment Paper Body */}
        <div className="ts-paper-panel">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {/* Tiny Swords Avatar / Pixel Trap Laptop Portrait */}
            <div className="ts-special-panel relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden sm:h-28 sm:w-28">
              {!imgErr ? (
                <img
                  src={portraitUrl}
                  alt={step.speaker}
                  referrerPolicy="no-referrer"
                  onError={() => setImgErr(true)}
                  className="pixelated h-full w-full object-contain"
                />
              ) : (
                <Shield className="h-10 w-10 text-sky-300" />
              )}
            </div>

            {/* Parchment Dialogue Copy + Choices */}
            <div className="min-w-0 flex-1">
              <p className="min-h-[3.5rem] text-sm font-medium leading-relaxed text-[#2B1B12] md:text-base">
                {currentSentence.slice(0, visibleChars)}
              </p>

              {isTypingDone && isLastSentence && step.choices && step.choices.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {step.choices.map((choice, idx) => (
                    <button
                      key={choice.label}
                      type="button"
                      onClick={() => onSelectChoice(choice)}
                      className="ts-btn-blue flex w-full items-center gap-3 text-left font-display text-sm font-bold text-white"
                    >
                      <kbd className="shrink-0 rounded bg-[#153c44] px-2 py-0.5 font-mono-tabular text-xs font-bold text-[#FDE68A]">
                        {idx + 1}
                      </kbd>
                      <span>{choice.label}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="font-mono-tabular text-xs font-semibold text-[#6E492D]">
                    {sentences.length > 1 ? `Sentence ${sentenceIndex + 1} / ${sentences.length}` : ''}
                  </span>
                  <button
                    type="button"
                    onClick={handlePrimaryClick}
                    className="ts-btn-blue inline-flex items-center gap-2 font-display text-xs font-bold text-white whitespace-nowrap shrink-0"
                  >
                    <img
                      src={TINY_SWORDS_UI.icons.play}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="pixelated h-4 w-4"
                    />
                    <span>{!isTypingDone ? 'Skip' : !isLastSentence ? 'Next' : 'Continue'}</span>
                    <kbd className="font-mono-tabular text-[11px] text-[#FDE68A]">[E]</kbd>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
