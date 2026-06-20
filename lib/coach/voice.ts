let lastSpoken = 0;
let muted = false;

const MIN_GAP_MS = 2500;

export function setVoiceMuted(value: boolean): void {
  muted = value;
}

export function isVoiceMuted(): boolean {
  return muted;
}

export function speak(text: string, priority = false): void {
  if (muted || typeof window === "undefined" || !window.speechSynthesis) return;

  const now = Date.now();
  if (!priority && now - lastSpoken < MIN_GAP_MS) return;

  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 1.05;
  utter.pitch = 1;
  window.speechSynthesis.speak(utter);
  lastSpoken = now;
}

export function speakRep(count: number): void {
  speak(`${count}`, true);
}

export function speakSetComplete(set: number): void {
  speak(`Set ${set} complete. Rest.`, true);
}

export function speakRestDone(): void {
  speak("Rest over. Next set.", true);
}
