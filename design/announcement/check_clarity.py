#!/usr/bin/env python3
"""Can a machine listener follow it? Transcribes one pass three ways and scores it against the script.

  clean    the master as rendered
  street   small speaker at a distance (250 Hz - 4 kHz, street echoes) + traffic noise, 6 dB below the voice
  loud     the same, noise only 3 dB below the voice

Each pass is followed by the first seconds of the next, as it sounds on repeat: a transcriber fed a pass
that ends in digital silence invents words for the last line, which no speaker on loop ever plays.

Word error rate is computed on normalised text (case, punctuation and number spellings folded), and a
list of key phrases must each be heard in every condition.
"""
import os
import re
import subprocess
import sys

import numpy as np
from faster_whisper import WhisperModel

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import build_psa as b  # noqa: E402

FF = os.path.join(HERE, 'ffmpeg')
# what to test: the lossless master by default, or any file given on the command line (e.g. the published MP3)
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(b.OUT, 'psa-master.wav')
WORK = os.path.join(HERE, 'work')
SR = 16000

NUM = {'0': 'zero', '4': 'four', '10': 'ten', '19': 'nineteen', '1034': 'ten thirty four', 'iv': 'four',
       '20': 'twenty', '1996': 'nineteen ninety six', '2007': 'two thousand and seven',
       '2019': 'two thousand and nineteen', '200000': 'two hundred thousand'}
KEY = ['public announcement', 'private citizen', 'not from the police', 'still being kept dark',
       'reported jeffrey epstein and ghislaine maxwell', 'nothing happened for a decade', 'immunity to co conspirators',
       'died in federal custody', 'serving twenty years', 'deliberately dark', 'every line of it can be checked',
       'its conclusion is this', 'functioned as deniable assets', 'it is not a document',
       'makes no claim that either of them was run by a handler', 'every claim in the report carries a grade',
       'choose one claim', 'send the correction', 'tell one person', 'obey legal orders',
       'does not ask you to disobey legal orders', 'not ask you to desert', 'inspector general',
       'section ten thirty four', 'do not send classified material', 'praise of men more than the praise of god',
       'read honestly', 'b as in bravo zero the number b as in bravo', 'the report is online b zero b dot dev']


def norm(s):
    s = s.lower().replace('defence', 'defense')
    s = re.sub(r'w{3}\.?', ' double u double u double u dot ', s)        # "www." as written
    s = re.sub(r'\bb0b\b', ' b zero b ', s)
    s = re.sub(r'\b(jeffery|geoffrey)\b', 'jeffrey', s)
    # ghee-LAYN written phonetically counts; the wrong sound ("gisley", "gisling") does not
    s = re.sub(r'\bg(h)?(ee|i)ll?(e|a|ei|ea|ai|ey|ay)?(a|i)?(n|ne)?\b(?= maxwell)', 'ghislaine', s)
    # at the faster pace base.en spells the same sound five ways (guilleen, guillain, gileigh, guillelle...);
    # any gil-/guil- spelling before maxwell is the right sound, the gis- spellings are the wrong one
    s = re.sub(r'\bgu?ill?[a-z]{0,6}\b(?= maxwell)', 'ghislaine', s)
    s = s.replace('.dev', ' dot dev ')
    s = re.sub(r'(\d),(\d)', r'\1\2', s)                             # 200,000 -> 200000
    s = re.sub(r'(\d+)', lambda m: ' %s ' % NUM.get(m.group(1), m.group(1)), s)
    s = re.sub(r'\bdouble[- ]?you\b|\bw\b', 'double u', s)
    s = s.replace('-', ' ')
    s = re.sub(r'\bd\W*e\W*v\b', 'dev', s)
    s = re.sub(r"[^a-z' ]+", ' ', s).replace("'", '')
    s = ' '.join(s.split())
    s = re.sub(r'\bbe zero be\b', 'b zero b', s)    # the letter B, written as heard (after punctuation is gone)
    s = re.sub(r'\bdot deve\b', 'dot dev', s)
    s = re.sub(r'\bon ?line ?b\b', 'online b', s)
    return s.replace('any one', 'anyone')


# Lines where a lost negation would invert the meaning. Each must be heard with a negation in the few words
# before it, every time it is heard at all.
# Windows are tight on purpose, so a "no" from the sentence before ("...is no defence.") cannot stand in.
NEGATED = [('either of them was run by a handler', 4), ('ask you to disobey legal orders', 2),
           ('ask you to desert', 2), ('send classified material', 2), ('from the police', 3)]
NEG = {'not', 'no', 'never', 'nothing', 'dont', 'doesnt', 'isnt'}


def negations_lost(hyp):
    words, lost = hyp.split(), []
    for phrase, window in NEGATED:
        n = len(phrase.split())
        for i in range(len(words) - n + 1):
            if ' '.join(words[i:i + n]) == phrase and not NEG & set(words[max(0, i - window):i]):
                lost.append('NEGATION LOST: ...%s' % ' '.join(words[max(0, i - window):i + n]))
    return lost


def wer(ref, hyp):
    r, h = ref.split(), hyp.split()
    d = np.arange(len(h) + 1)
    for i in range(1, len(r) + 1):
        prev, d[0] = d.copy(), i
        for j in range(1, len(h) + 1):
            d[j] = min(prev[j] + 1, d[j - 1] + 1, prev[j - 1] + (r[i - 1] != h[j - 1]))
    return d[len(h)] / max(1, len(r))


def load16(path):
    raw = subprocess.run([FF, '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def looped(x, sec=6.0):
    return np.concatenate([x, x[:int(sec * SR)]])


def pink(n, rng):
    spec = np.fft.rfft(rng.standard_normal(n))
    f = np.fft.rfftfreq(n, 1 / SR)
    spec[1:] /= np.sqrt(f[1:])
    spec[0] = 0
    x = np.fft.irfft(spec, n)
    return x / np.std(x)


def street(snr_db, seed=7):
    speaker = os.path.join(WORK, 'speaker.wav')
    subprocess.run([FF, '-v', 'error', '-y', '-i', SRC, '-af',
                    'highpass=f=250,lowpass=f=4000,aecho=0.85:0.6:45|95:0.22|0.12', '-ar', str(SR), '-ac', '1',
                    speaker], check=True)
    x = looped(load16(speaker))
    rng = np.random.default_rng(seed)
    noise = 0.6 * pink(len(x), rng) + 0.4 * np.cumsum(rng.standard_normal(len(x)))  # pink + rumble
    noise -= np.convolve(noise, np.ones(4000) / 4000, mode='same')                   # keep the rumble audible, not DC
    noise /= np.std(noise)
    frame = 1600
    rms = np.sqrt(np.mean(x[:len(x) // frame * frame].reshape(-1, frame) ** 2, axis=1))
    active = rms[rms > np.max(rms) * 0.1]                                            # speech frames only
    noise *= np.sqrt(np.mean(active ** 2)) / 10 ** (snr_db / 20)
    y = x + noise
    return (y / np.max(np.abs(y)) * 0.9).astype(np.float32)


def main():
    ref = norm(' '.join(b.shown(l) for _, lines in b.SECTIONS for l in lines))
    model = WhisperModel('base.en', device='cpu', compute_type='int8')
    print('testing', os.path.relpath(SRC, HERE))
    # two independent noise recordings per noisy condition, so one unlucky draw cannot decide the result
    conds = [('clean', looped(load16(SRC))), ('street', street(6, 7)), ('street2', street(6, 11)),
             ('loud', street(3, 7)), ('loud2', street(3, 11))]
    fails = 0
    for name, audio in conds:
        segs, _ = model.transcribe(audio, language='en', beam_size=5, condition_on_previous_text=False)
        hyp = norm(' '.join(s.text for s in segs))
        cut = hyp.rfind(' this is a public announcement')          # the next pass begins: score this pass only
        scored = hyp[:cut] if cut > len(hyp) * 0.8 else hyp
        missing = [k for k in KEY if k not in hyp]
        missing += negations_lost(hyp)
        if hyp.count('b zero b dot dev') < 3:
            missing.append('the address heard three times (heard %d)' % hyp.count('b zero b dot dev'))
        fails += len(missing)
        print('%-6s  word error rate %4.1f%%   key phrases heard %d/%d%s' % (
            name, 100 * wer(ref, scored), len(KEY) - len(missing), len(KEY),
            ('   MISSING: ' + '; '.join(missing)) if missing else ''))
        with open(os.path.join(WORK, 'asr-%s.txt' % name), 'w') as f:
            f.write(hyp + '\n')
    sys.exit(1 if fails else 0)


if __name__ == '__main__':
    main()
