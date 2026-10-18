#!/usr/bin/env python3
"""Public announcement, looped. One voice, hard and direct, built to stand on its own and to cut through a street.

  python3 build_psa.py            synthesise, master, and write out/
Outputs:
  out/psa-loop.mp3     one full pass (~3 min) - set any player to repeat
  out/psa-60min.mp3    the same pass repeated to a little over an hour
  out/psa-master.wav   the mastered pass, lossless
  script.txt           the words, exactly as spoken

Voice: Piper en_GB-cori-high (UK English, female). Its model card: trained on LibriVox
recordings, public domain - so the audio carries no voice licence.
The sting between sections and the pulse under the voice are synthesised here; nothing is sampled.
Neither is an alert tone, a siren, or anything that could be mistaken for a gunshot or a blast in a crowd.
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

LENGTH_SCALE = 1.0        # normal pace: urgent, still clear outdoors (the listening test decides)
GAP_SENTENCE = 0.28       # between sentences inside one line
GAP_LINE = 0.5            # between lines
GAP_BEFORE_CHIME = 0.3
GAP_AFTER_CHIME = 0.2
TAIL = 2.0                # silence at the end of a pass, before it repeats
BED_DB = -21              # the pulse under the voice, relative to the voice's speech level

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
        'It comes from a private citizen. It is not from the government, and it is not from the police.',
        'It is about crimes that institutions were told about, and a record that is still being kept dark.',
    ]),
    ('The record', [
        'In nineteen ninety-six, a woman reported Jeffrey Epstein and Ghislaine Maxwell to the police, and was '
        'sent on to the FBI. Nothing happened for a decade.',
        'In two thousand and seven, federal prosecutors signed a deal. It gave immunity to co-conspirators the '
        'government had not even named.',
        'After a sex-offence conviction, he kept his access to the powerful for another ten years.',
        'In two thousand and nineteen, he died in federal custody, awaiting trial.',
        'Ghislaine Maxwell was convicted. She is serving twenty years.',
        'And the record is deliberately dark. A review declared closed. Some two hundred thousand pages '
        'withheld or redacted. Reports kept under seal.',
    ]),
    ('What the report is', [
        'There is a report that puts that record in one place, with its sources named.',
        'It is free. It is public. And every line of it can be checked.',
        ('Read it online. b0b.dev.', 'Read it online. b, zero, b, dot dev.'),
        'It starts with Epstein and Maxwell. Then it follows the money, the surveillance, the forced labour, '
        'the wars, and the files that are still withheld.',
    ]),
    ('What it concludes', [
        'On one question, the report commits.',
        ('Its conclusion is this. Jeffrey Epstein and Ghislaine Maxwell functioned as deniable assets: an '
         'intelligence-useful role, under civilian cover.',
         # the comma keeps "functioned as" from being heard as "function does"
         'Its conclusion is this. Jeffrey Epstein and Ghislaine Maxwell functioned, as deniable assets: an '
         'intelligence-useful role, under civilian cover.'),
        'That is a judgment on the documented record. It is not a document, and the report says so.',
        'It makes no claim that either of them was run by a handler. And it tells you what would bring its '
        'conclusion down.',
    ]),
    ('How it works', [
        'Every claim in the report carries a grade. Documented. Attributed. Labeled. Contested. Unsupported.',
        'It prints what it could not prove. It publishes its own corrections.',
        'It asks you to check it, not to trust it.',
    ]),
    ('What you do now', [
        'So here is what you do.',
        'Read it. Choose one claim. Check its source.',
        'If it is wrong, prove it, and send the correction.',
        'If it holds, say so. Tell one person. Today.',
    ]),
    ('To anyone who serves', [
        'To anyone who serves. In uniform. In an agency. In law enforcement.',
        'What the report documents has no hands of its own. Every capability runs because trained people '
        'operate it. People like you.',
        'Your duty is to obey legal orders. Under military law, obeying a clearly illegal order is no defence.',
        'This message does not ask you to disobey legal orders. It does not ask you to desert, to sabotage, '
        'to obstruct, or to leak.',
        'If you see wrongdoing, use the lawful channels: an Inspector General, or a Member of Congress.',
        'For service members, federal law forbids reprisal for that. Title ten of the United States Code, '
        'section ten thirty-four.',
        'Wherever you serve, there is an oversight route. Use it. And do not send classified material to anyone.',
    ]),
    ('Close', [
        'The report opens with a line from the Gospel of John. For they loved the praise of men more than the '
        'praise of God.',
        'The record already exists. The only question left is whether it is read honestly.',
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
    """The section sting: a low A-minor stab, fast attack, short decay, with a soft high tick on top.
    Tonal on purpose - a documentary hit, not an alert tone (no 853/960 Hz pair, no sweep), and nothing
    with the noise burst of a gunshot or a blast, which has no place in a crowd."""
    dur = 1.1
    t = np.arange(int(dur * sr)) / sr
    env = (1 - np.exp(-t / 0.006)) * np.exp(-t / 0.32)
    out = np.zeros_like(t)
    for f0, amp in ((110.0, 1.0), (164.81, 0.55), (220.0, 0.7), (261.63, 0.35), (329.63, 0.25)):
        out += amp * (np.sin(2 * np.pi * f0 * t) + 0.3 * np.sin(2 * np.pi * 2 * f0 * t))
    out *= env
    tick_env = np.exp(-t / 0.012)
    out += 0.35 * np.sin(2 * np.pi * 1760.0 * t) * tick_env
    out /= np.max(np.abs(out))
    return (out * 0.55).astype(np.float32)


def bed(n, sr):
    """A low pulse under the whole pass: an A2 tone shaped like a heartbeat at 72 per minute.
    It sits at 110-330 Hz, under the speech band, and it is mixed well below the voice."""
    t = np.arange(n) / sr
    period = 60.0 / 72
    ph = np.mod(t, period)
    beat = np.exp(-ph / 0.09) + 0.6 * np.exp(-np.maximum(ph - 0.24, 0) / 0.09) * (ph >= 0.24)
    tone = (np.sin(2 * np.pi * 110.0 * t) + 0.45 * np.sin(2 * np.pi * 220.0 * t)
            + 0.15 * np.sin(2 * np.pi * 330.0 * t))
    drone = 0.25 * (np.sin(2 * np.pi * 110.0 * t) + 0.5 * np.sin(2 * np.pi * 164.81 * t))
    x = tone * beat + drone * (0.6 + 0.4 * np.sin(2 * np.pi * t / 7.0))
    return (x / np.max(np.abs(x))).astype(np.float32)


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
    voice_track = np.concatenate(timeline)
    frame = int(0.1 * sr)
    rms = np.sqrt(np.mean(voice_track[:len(voice_track) // frame * frame].reshape(-1, frame) ** 2, axis=1))
    speech = np.sqrt(np.mean(rms[rms > np.max(rms) * 0.1] ** 2))
    pulse = bed(len(voice_track), sr)
    pulse *= speech * 10 ** (BED_DB / 20) / np.sqrt(np.mean(pulse ** 2))
    raw = voice_track + pulse
    raw_path = os.path.join(WORK, 'pass-raw.wav')
    write_wav(raw_path, raw / max(1e-9, np.max(np.abs(raw))) * 0.9, sr)

    # Mastering for a speaker outdoors: cut rumble and mud, lift presence, steady the level,
    # then two-pass loudness normalisation to -12 LUFS with a -1.5 dBTP ceiling.
    shape = ('aresample=44100:resampler=soxr,highpass=f=110,'
             'equalizer=f=250:t=q:w=1.0:g=-2,equalizer=f=3200:t=q:w=1.2:g=4,'
             'acompressor=threshold=-24dB:ratio=4:attack=4:release=120:makeup=4')
    meas = run(['-i', raw_path, '-af', shape + ',loudnorm=I=-12:TP=-1.5:LRA=6:print_format=json', '-f', 'null', '-'])
    m = json.loads(meas[meas.rindex('{'):meas.rindex('}') + 1])
    norm = ('loudnorm=I=-12:TP=-1.5:LRA=6:linear=true:measured_I=%s:measured_TP=%s:measured_LRA=%s:'
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
        f.write('PUBLIC ANNOUNCEMENT - the words, exactly as spoken (a low sting opens each section)\n\n')
        for title, lines in SECTIONS:
            f.write('[%s]\n' % title.upper())
            for line in lines:
                f.write(shown(line) + '\n')
            f.write('\n')
    print('pass %.1f s (%d:%02d); hour file = %d passes = %d:%02d' % (
        dur, dur // 60, dur % 60, reps, (dur * reps) // 60, (dur * reps) % 60))


if __name__ == '__main__':
    main()
