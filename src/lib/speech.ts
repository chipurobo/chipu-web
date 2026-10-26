/**
 * Read-aloud voice for young learners.
 *
 * Browsers list every voice the device has, and the default one is often the
 * flattest: Microsoft David or Zira on Windows, plain Samantha on a Mac. macOS
 * also ships joke voices (Zarvox, Bubbles, Bad News) and old Eloquence voices
 * (Eddy, Flo, Grandpa) that sound robotic to a child. This picks the most
 * natural English voice available, preferring Kenyan English when the device
 * has it, and speaks a sentence at a time so there is a natural pause between
 * ideas. Chrome also cuts off long utterances after about 15 seconds; short
 * ones avoid that.
 *
 * Screen readers (VoiceOver, NVDA, JAWS) use the learner's own voice and
 * settings, which we cannot and should not change. For them the warmth has
 * to come from the words, so keep spoken copy short, friendly and
 * conversational.
 */

const ROBOTIC = /\b(albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|fred|junior|ralph|kathy|eddy|flo|grandma|grandpa|reed|rocko|sandy|shelley|david|mark|zira|hazel|george)\b/i;
const NATURAL = /\b(natural|neural|online|premium|siri)\b/i;
const ENHANCED = /\b(enhanced|google)\b/i;
/**
 * Clear, warm voices that read well to children, best first. Asilia and
 * Chilemba are Microsoft's Kenyan English voices; Ava, Zoe and Samantha are
 * the friendliest on a Mac.
 */
const WARM = ['asilia', 'chilemba', 'ava', 'zoe', 'samantha', 'jenny', 'aria', 'sonia', 'libby', 'allison', 'susan', 'serena', 'kate', 'tessa', 'karen', 'moira', 'natasha', 'clara', 'emma', 'michelle', 'daniel'];

export function scoreVoice(voice: Pick<SpeechSynthesisVoice, 'name' | 'lang'>): number {
  const lang = voice.lang.replace('_', '-').toLowerCase();
  if (!lang.startsWith('en')) return -1;
  let score = 0;
  if (ROBOTIC.test(voice.name)) score -= 20;
  if (NATURAL.test(voice.name)) score += 12;
  else if (ENHANCED.test(voice.name)) score += 7;
  const warm = WARM.findIndex((name) => new RegExp(`\\b${name}\\b`, 'i').test(voice.name));
  if (warm >= 0) score += 4 - warm / WARM.length;
  if (lang === 'en-ke') score += 5;
  else if (['en-gb', 'en-za', 'en-us', 'en-ie', 'en-au'].includes(lang)) score += 1;
  return score;
}

export function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  let best: SpeechSynthesisVoice | undefined;
  let bestScore = -1;
  for (const voice of voices) {
    const score = scoreVoice(voice);
    if (score > bestScore) { best = voice; bestScore = score; }
  }
  return best;
}

/** "Hi! Ready? Let's go." → ["Hi!", "Ready?", "Let's go."] */
export function sentences(text: string): string[] {
  return (text.match(/[^.!?]+[.!?]*/g) ?? []).map((part) => part.trim()).filter(Boolean);
}

/** Voices load after the page in Chrome and Edge, so wait for them briefly. */
function voices(): Promise<SpeechSynthesisVoice[]> {
  const synth = window.speechSynthesis;
  const now = synth.getVoices();
  if (now.length) return Promise.resolve(now);
  return new Promise((resolve) => {
    const done = () => { synth.removeEventListener('voiceschanged', done); resolve(synth.getVoices()); };
    synth.addEventListener('voiceschanged', done);
    window.setTimeout(done, 800);
  });
}

/**
 * Speaks the text a sentence at a time in a friendly voice. Returns a stop
 * function. `onDone` runs once, when speech ends or is stopped.
 */
export function speak(text: string, onDone: () => void): () => void {
  const synth = window.speechSynthesis;
  let stopped = false;
  let finished = false;
  const finish = () => { if (!finished) { finished = true; onDone(); } };

  synth.cancel();
  // A short pause lets a screen reader finish saying the button name before
  // the read-aloud voice starts, so the two do not talk over each other.
  const start = window.setTimeout(async () => {
    const voice = pickVoice(await voices());
    if (stopped) return;
    const parts = sentences(text);
    if (!parts.length) { finish(); return; }
    parts.forEach((part, index) => {
      const utterance = new SpeechSynthesisUtterance(part);
      if (voice) { utterance.voice = voice; utterance.lang = voice.lang; }
      // A touch slower and brighter than the default reads as calm and
      // encouraging rather than flat. Questions and cheers lift a little more.
      utterance.rate = 0.92;
      utterance.pitch = /[!?]$/.test(part) ? 1.15 : 1.07;
      if (index === parts.length - 1) { utterance.onend = finish; utterance.onerror = finish; }
      synth.speak(utterance);
    });
  }, 350);

  return () => {
    stopped = true;
    window.clearTimeout(start);
    synth.cancel();
    finish();
  };
}
