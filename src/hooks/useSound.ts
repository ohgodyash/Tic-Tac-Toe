import { useCallback, useRef, useState } from "react";

export function useSound() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [enabled, setEnabled] = useState(true);

  const ensureAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new Ctx();
    }
    void audioCtxRef.current.resume();
  }, []);

  const tone = useCallback(
    (freq: number, ms: number, type: OscillatorType = "sine", gain = 0.08) => {
      if (!enabled) return;
      ensureAudio();
      const ctx = audioCtxRef.current!;
      const t0 = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(gain, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + ms / 1000);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + ms / 1000);
    },
    [enabled, ensureAudio]
  );

  const playClick = useCallback(() => {
    tone(520, 70, "triangle", 0.06);
    window.setTimeout(() => tone(780, 55, "sine", 0.045), 35);
  }, [tone]);

  const playWin = useCallback(() => {
    const notes = [659, 784, 988];
    notes.forEach((f, i) => {
      window.setTimeout(() => tone(f, 120, "sine", 0.06), i * 120);
    });
  }, [tone]);

  const playDraw = useCallback(() => {
    tone(320, 170, "sine", 0.045);
    window.setTimeout(() => tone(250, 160, "triangle", 0.04), 120);
  }, [tone]);

  const toggle = useCallback(() => {
    setEnabled((e) => !e);
  }, []);

  return { enabled, toggle, playClick, playWin, playDraw };
}
