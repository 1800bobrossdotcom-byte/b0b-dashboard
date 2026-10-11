#!/usr/bin/env python3
"""Public announcement, looped. One calm voice, clear and direct, built to stand on its own.

  python3 build_psa.py            synthesise, master, and write out/
Outputs:
  out/psa-loop.mp3     one full pass (~4-5 min) - set any player to repeat
  out/psa-60min.mp3    the same pass repeated to a little over an hour
  out/psa-master.wav   the mastered pass, lossless
  script.txt           the words, exactly as spoken

Voice: Piper en_GB-cori-high (UK English, female). Its model card: trained on LibriVox
recordings, public domain - so the audio carries no voice licence.
The chime between sections is synthesised here; nothing is sampled.
"""
import hashlib
import json
import math
import os
import subprocess
import sys
import wave

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
FF = os.path.join(HERE, 'ffmpeg')
MODEL = os.path.join(HERE, 'voice', 'en_GB-cori-high.onnx')
OUT = os.path.join(HERE, 'out')
WORK = os.path.join(HERE, 'work')

LENGTH_SCALE = 1.12       # slower than default: deliberate, carries outdoors
GAP_SENTENCE = 0.45       # between sentences inside one line
GAP_LINE = 0.85           # between lines
GAP_BEFORE_CHIME = 0.55
GAP_AFTER_CHIME = 0.55
TAIL = 3.5                # silence at the end of a pass, before it repeats

SITE = ('The report is online. b0b.dev.', 'The report is online. b, zero, b, dot dev.')
SITE_SPELLED = ('Spelled out. B as in bravo. Zero, the number. B as in bravo.',
                'Spelled out. B, as in bravo. Zero, the number. B, as in bravo.')

# Each section is a list of lines; a line is either text, or (as printed, as spoken).
# Every statement about the report is the report's own (its masthead, Section I, the address
# "To those inside", the close). Keep "This message does not ask you to..." in any edit: see README.
# Put every safety-critical negation mid-sentence: at the start of a sentence it is the first thing
# noise erases ("never claims" was heard as "now claims"; "Nothing here asks" lost "Nothing").
SECTIONS = [
    ('Who this is from', [
        'This is a public announcement.',
        'It comes from a private citizen. It is not from any government, and it is not from the police.',
        'It is about a report. The report is free, it is public, and every line of it can be checked.',
        ('You can read it online. b0b.dev.', 'You can read it online. b, zero, b, dot dev.'),
    ]),
    ('What the report is', [
        'The report is a documented record of how institutions failed.',
        'It begins with the network around Jeffrey Epstein and Ghislaine Maxwell, and with the institutions '
        'that failed to stop it.',
        'Then it asks a larger question: whether the pattern is older than any single government, company, '
        'or family line.',
        'It follows that question through surveillance, finance, forced labour, active wars, and what '
        'declassified files reveal.',
        'And it comes with a map of the places it documents.',
    ]),
    ('How it works', [
        'Every claim in the report carries a grade.',
        'Documented means it is on the record. Attributed means the person making the claim is named. '
        'Labeled means it is a pattern or a hypothesis, and the report says so.',
        'Where the record is disputed, it says contested. Where a claim has no support, it says unsupported.',
        'Where the facts end, the report marks the boundary. It prints what it could not prove, and its '
        'corrections are listed in public.',
    ]),
    ('What it concludes', [
        'On one question, the report commits.',
        ('Its conclusion is this. Jeffrey Epstein and Ghislaine Maxwell functioned as deniable assets: an '
         'intelligence-useful role, under civilian cover.',
         # the comma keeps "functioned as" from being heard as "function does"
         'Its conclusion is this. Jeffrey Epstein and Ghislaine Maxwell functioned, as deniable assets: an '
         'intelligence-useful role, under civilian cover.'),
        'That is a judgment on the balance of the documented record. It is not a document, and the report '
        'says so.',
        'The report makes no claim that either of them was run by a handler. And it shows you what would '
        'lower its conclusion.',
    ]),
    ('The record', [
        'The record is deliberately dark.',
        'A review declared closed. Pages withheld and redacted. Reports kept under seal.',
    ]),
    ('What you can do', [
        'Here is what you can do.',
        'Read it. Choose one claim, and check its source.',
        'If it is wrong, send the correction. That is the first thing the report asks for. Corrections are '
        'worth more to it than agreement.',
        'If it holds, tell one person.',
    ]),
    ('To anyone who serves', [
        'To anyone who serves. In uniform. In an agency. In law enforcement.',
        'What the report documents has no hands of its own. Every capability runs because trained people '
        'operate it.',
        'Your duty is to obey legal orders. Under military law, obeying a clearly illegal order is no defence.',
        'This message does not ask you to disobey legal orders. It does not ask you to desert, to sabotage, '
        'to obstruct, or to leak.',
        'If you see wrongdoing, use the lawful channels: go to an Inspector General, or to a Member of Congress.',
        'For service members, federal law forbids reprisal for that. Title ten of the United States Code, '
        'section ten thirty-four.',
        'Wherever you serve, there is an oversight route. Use it. And do not send classified material to anyone.',
    ]),
    ('Close', [
        'The record already exists. The only open question is whether it is read honestly.',
        'This has been a public announcement, from a private citizen.',
        SITE,
        SITE_SPELLED,
        'Read the record yourself.',
        SITE,  # the same line as above, reused from the cache: that take is verified, a fresh one may not be
    ]),
]


# Words the voice gets wrong. espeak says "GHIS-layn"; her name is /ɡiːˈleɪn/, ghee-LAYN. The page prints
# the spelling; the voice gets the phonemes. Check a new name with PiperVoice.phonemize() before trusting it.
PRONOUNCE = {'Ghislaine': '[[ɡiːlˈeɪn]]'}


def shown(line):
    return line[0] if isinstance(line, tuple) else line


def spoken(line):
    s = line[1] if isinstance(line, tuple) else line
    for word, ph in PRONOUNCE.items():
        s = s.replace(word, ph)
    return s


def trim(x, sr, thresh=0.006, pad=0.03, pad_end=0.12):
    """Cut leading/trailing near-silence from one synthesised sentence. The end keeps a longer pad:
    a soft final consonant (the v of "dev") sits below the threshold and was being cut off."""
    idx = np.nonzero(np.abs(x) > thresh)[0]
    if not len(idx):
        return x[:0]
    return x[max(0, idx[0] - int(pad * sr)):min(len(x), idx[-1] + int(pad_end * sr))]


def silence(sec, sr):
    return np.zeros(int(round(sec * sr)), dtype=np.float32)


def chime(sr):
    """Two soft bell notes a fourth apart (E5 then A5). Original; not an alert tone, not a station mark."""
    dur = 1.35
    t = np.arange(int(dur * sr)) / sr
    out = np.zeros_like(t)
    for f0, start in ((659.25, 0.0), (880.0, 0.20)):
        tt = t - start
        on = tt >= 0
        env = np.where(on, (1 - np.exp(-np.maximum(tt, 0) / 0.004)) * np.exp(-np.maximum(tt, 0) / 0.38), 0)
        tone = (np.sin(2 * np.pi * f0 * tt) + 0.28 * np.sin(2 * np.pi * 2 * f0 * tt)
                + 0.08 * np.sin(2 * np.pi * 3.01 * f0 * tt))
        out += np.where(on, tone, 0) * env
    out /= np.max(np.abs(out))
    return (out * 0.42).astype(np.float32)


def synth_line(voice, text, cfg, sr_expect):
    """One line -> float audio; Piper yields one chunk per sentence, joined here with our own gap."""
    key = hashlib.sha256(('%s|%s' % (LENGTH_SCALE, text)).encode()).hexdigest()[:20]
    cache = os.path.join(WORK, 'cache', key + '.npy')
    if os.path.exists(cache):
        return np.load(cache)
    parts = []
    for ch in voice.synthesize(text, syn_config=cfg):
        assert ch.sample_rate == sr_expect, ch.sample_rate
        seg = trim(ch.audio_float_array.astype(np.float32), ch.sample_rate)
        if len(seg):
            if parts:
                parts.append(silence(GAP_SENTENCE, sr_expect))
            parts.append(seg)
    y = np.concatenate(parts) if parts else silence(0.1, sr_expect)
    os.makedirs(os.path.dirname(cache), exist_ok=True)
    np.save(cache, y)
    return y


def write_wav(path, x, sr):
    x = np.clip(x, -1, 1)
    with wave.open(path, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes((x * 32767).astype('<i2').tobytes())


def run(args):
    r = subprocess.run([FF, '-hide_banner', '-nostdin', '-y'] + args, capture_output=True, text=True)
    if r.returncode:
        sys.exit('ffmpeg failed:\n' + r.stderr[-2000:])
    return r.stderr


def main():
    from piper import PiperVoice, SynthesisConfig  # here, so publish.py can read SECTIONS without Piper
    os.makedirs(OUT, exist_ok=True)
    os.makedirs(WORK, exist_ok=True)
    voice = PiperVoice.load(MODEL)
    sr = voice.config.sample_rate
    cfg = SynthesisConfig(length_scale=LENGTH_SCALE)
    bell = chime(sr)

    timeline = []
    for i, (title, lines) in enumerate(SECTIONS):
        if i:
            timeline.append(silence(GAP_BEFORE_CHIME, sr))
        timeline += [bell, silence(GAP_AFTER_CHIME, sr)]
        for j, line in enumerate(lines):
            if j:
                timeline.append(silence(GAP_LINE, sr))
            timeline.append(synth_line(voice, spoken(line), cfg, sr))
    timeline.append(silence(TAIL, sr))
    raw = np.concatenate(timeline)
    raw_path = os.path.join(WORK, 'pass-raw.wav')
    write_wav(raw_path, raw / max(1e-9, np.max(np.abs(raw))) * 0.9, sr)

    # Mastering for a speaker outdoors: cut rumble and mud, lift presence, steady the level,
    # then two-pass loudness normalisation to -14 LUFS with a -1.5 dBTP ceiling.
    shape = ('aresample=44100:resampler=soxr,highpass=f=110,'
             'equalizer=f=250:t=q:w=1.0:g=-2,equalizer=f=3200:t=q:w=1.2:g=3,'
             'acompressor=threshold=-22dB:ratio=3:attack=6:release=160:makeup=3')
    meas = run(['-i', raw_path, '-af', shape + ',loudnorm=I=-14:TP=-1.5:LRA=7:print_format=json', '-f', 'null', '-'])
    m = json.loads(meas[meas.rindex('{'):meas.rindex('}') + 1])
    norm = ('loudnorm=I=-14:TP=-1.5:LRA=7:linear=true:measured_I=%s:measured_TP=%s:measured_LRA=%s:'
            'measured_thresh=%s:offset=%s' % (m['input_i'], m['input_tp'], m['input_lra'],
                                              m['input_thresh'], m['target_offset']))
    master = os.path.join(OUT, 'psa-master.wav')
    run(['-i', raw_path, '-af', shape + ',' + norm + ',alimiter=limit=0.84:level=false',
         '-ar', '44100', '-ac', '1', '-c:a', 'pcm_s16le', master])

    dur = float(subprocess.run([FF.replace('ffmpeg', 'ffprobe'), '-v', 'error', '-show_entries', 'format=duration',
                                '-of', 'csv=p=0', master], capture_output=True, text=True).stdout.strip())
    tags = ['-metadata', 'title=Public announcement', '-metadata', 'comment=Voice: Piper en_GB-cori-high (public-domain LibriVox data)']
    run(['-i', master, '-c:a', 'libmp3lame', '-b:a', '128k', '-ac', '1'] + tags + [os.path.join(OUT, 'psa-loop.mp3')])
    reps = math.ceil(3600 / dur)
    run(['-stream_loop', str(reps - 1), '-i', master, '-c:a', 'libmp3lame', '-b:a', '64k', '-ac', '1'] + tags
        + [os.path.join(OUT, 'psa-60min.mp3')])

    with open(os.path.join(HERE, 'script.txt'), 'w', encoding='utf-8') as f:
        f.write('PUBLIC ANNOUNCEMENT - the words, exactly as spoken (a chime opens each section)\n\n')
        for title, lines in SECTIONS:
            f.write('[%s]\n' % title.upper())
            for line in lines:
                f.write(shown(line) + '\n')
            f.write('\n')
    print('pass %.1f s (%d:%02d); hour file = %d passes = %d:%02d' % (
        dur, dur // 60, dur % 60, reps, (dur * reps) // 60, (dur * reps) % 60))


if __name__ == '__main__':
    main()
