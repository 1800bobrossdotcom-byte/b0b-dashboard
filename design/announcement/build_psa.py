#!/usr/bin/env python3
"""Public announcement, looped. Spoken word over a synthesised beat: it opens cold on the record, the beat comes in,
and it drops out for the lines that have to land.

  python3 build_psa.py            synthesise, master, and write out/
Outputs:
  out/psa-loop.mp3     one full pass (~3 min) - set any player to repeat; the last line runs into the first
  out/psa-60min.mp3    the same pass repeated to a little over an hour
  out/psa-master.wav   the mastered pass, lossless
  script.txt           the words, exactly as spoken

Voice: Piper en_GB-cori-high (UK English, female). Its model card: trained on LibriVox
recordings, public domain - so the audio carries no voice licence.
The beat and the hit it comes back in on are synthesised here; nothing is sampled.
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

LENGTH_SCALE = 1.0        # normal pace (the listening test decides)
GAP_SENTENCE = 0.34       # between sentences inside one line: fragments need air to land
GAP_LINE = 0.6            # between lines
GAP_SECTION = 1.1         # between sections: the beat carries the gap
GAP_DROP = 0.55           # silence either side of a line the music drops out for
TAIL = 1.2                # end of a pass, before it repeats
BPM = 84
MUSIC_DB = -9             # the beat between lines, relative to the voice's speech level
DUCK_DB = -10             # and how far it ducks under the voice

SITE = ('The report is online. b0b.dev.', 'The report is online. b, zero, b, dot dev.')
SITE_SPELLED = ('Spelled out. B as in bravo. Zero, the number. B as in bravo.',
                'Spelled out. B, as in bravo. Zero, the number. B, as in bravo.')

# Each section is a list of lines; a line is either text, or (as printed, as spoken).
# Every statement about the report is the report's own (its masthead, Section I, the address
# "To those inside", the close). Keep "This message does not ask you to..." in any edit: see README.
# Put every safety-critical negation mid-sentence: at the start of a sentence it is the first thing
# noise erases ("never claims" was heard as "now claims"; "Nothing here asks" lost "Nothing").
# Spoken word, not an advert. It opens cold on the record, a beat comes in, and the beat drops out for the
# lines that have to land. Every fact is the report's own (II, pattern five and the conclusion block; II on
# JPMorgan; the New Mexico suit, attributed to the state as the report does). No survivor is named.
SECTIONS = [
    ('Nineteen ninety-six', [
        'Nineteen ninety-six.',
        'A young woman goes to the police in New York. She reports Jeffrey Epstein and Ghislaine Maxwell.',
        'She is sent on to the FBI.',
        'And nothing happens. For ten years, nothing happens.',
    ]),
    ('The deal', [
        'Two thousand and seven.',
        'Federal prosecutors cut a deal. It grants immunity to people the government has not even named.',
        "The Justice Department's own review will later call it poor judgment.",
        'Thirteen months in a county jail. Out six days a week, on work release.',
    ]),
    ('The open door', [
        'Then ten years as a registered sex offender. Public record. Anyone can look it up.',
        'And heads of state, Nobel prize winners, cabinet officers, university presidents and the biggest '
        'banks in the country keep the door open.',
        'JPMorgan flags him, and keeps him, until two thousand and thirteen.',
        'The door stays open.',
    ]),
    ('The cell', [
        'Two thousand and nineteen.',
        'He is arrested, and charged with sex trafficking of minors.',
        'Five weeks later he is dead. In federal custody. Before any trial.',
        'No trial. No testimony. No cross-examination.',
    ]),
    ('The dark', [
        'Ghislaine Maxwell is convicted. Twenty years.',
        'The files? Some two hundred thousand pages, withheld or redacted.',
        'New Mexico says federal prosecutors told it to stand down. It handed over its whole file. '
        'Ten more requests, ignored or denied.',
    ]),
    ('The verse', [
        'Every one of those decisions had a person behind it. A signature. A desk.',
        'Two thousand years ago, it was written of rulers who believed, and would not say so.',
        'They loved the praise of men more than the praise of God.',
    ]),
    ('To those inside', [
        'So this is for you. If you work inside a police force. A bank. A university. An agency. A uniform.',
        'What that record documents has no hands of its own. It runs because trained people run it.',
        'Your duty is to obey legal orders. Under military law, obeying a clearly illegal order is no defence.',
        'This message does not ask you to disobey legal orders. It does not ask you to desert, to sabotage, '
        'to obstruct, or to leak.',
        'If you see wrongdoing, go to an Inspector General, or a Member of Congress. For service members, '
        'federal law forbids reprisal for that: title ten, section ten thirty-four.',
        'And do not send classified material to anyone.',
    ]),
    ('Close', [
        'To everyone else: keep looking.',
        'It is all written down. Dates. Documents. Sources. Every claim graded, every correction public.',
        "Read it. Check one line. If it's wrong, prove it. If it's right, say it out loud.",
        SITE,
        SITE_SPELLED,
        SITE,  # the same line as above, reused from the cache: that take is verified, a fresh one may not be
        'This has been a public announcement, from a private citizen. It is not from the government, and it '
        'is not from the police.',
        'Nineteen ninety-six. Nothing happened.',
        'Not this time.',
    ]),
]

COLD = {'Nineteen ninety-six'}          # sections with no music under them
DROP = {'The door stays open.', 'No trial. No testimony. No cross-examination.',
        'They loved the praise of men more than the praise of God.', 'Not this time.'}  # the beat cuts out
QUIET = {SITE[0], SITE_SPELLED[0]}   # the beat stops under the address too (no hit): single letters are fragile


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


def _band(x, sr, lo, hi):
    """Brick-wall band-pass by FFT; fine for short one-shot sounds."""
    f = np.fft.rfftfreq(len(x), 1 / sr)
    X = np.fft.rfft(x)
    X[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(X, len(x)).astype(np.float32)


def music(n, sr, bpm, seed=3):
    """A slow minor beat, all synthesised: kick, brushed snare, hats, bass, pad. A minor, F, C, G.
    Music only - nothing in it is an alert tone, a siren, or a lone sharp crack: every hit sits inside a
    steady groove, and the snare is soft-attacked and low-passed."""
    rng = np.random.default_rng(seed)
    beat = 60.0 / bpm
    out = np.zeros(n + int(3 * sr), np.float32)

    def add(sig, at):
        at = int(at)
        out[at:at + len(sig)] += sig[:max(0, len(out) - at)]

    t = np.arange(int(0.5 * sr)) / sr
    f = 48 + 80 * np.exp(-t / 0.035)
    kick = np.tanh(1.8 * np.sin(2 * np.pi * np.cumsum(f) / sr)) * np.exp(-t / 0.26)
    kick = (kick + 0.25 * np.sin(4 * np.pi * np.cumsum(f) / sr) * np.exp(-t / 0.1)).astype(np.float32)
    ts = np.arange(int(0.3 * sr)) / sr
    snare = (0.45 * np.sin(2 * np.pi * 185 * ts) * np.exp(-ts / 0.07)
             + _band(rng.standard_normal(len(ts)).astype(np.float32), sr, 700, 3200) * 0.35 * np.exp(-ts / 0.09))
    snare *= 1 - np.exp(-ts / 0.004)                                       # soft attack: a brush, not a crack
    th = np.arange(int(0.06 * sr)) / sr
    hat = _band(rng.standard_normal(len(th)).astype(np.float32), sr, 6000, 10500) * np.exp(-th / 0.018) * 0.12
    prog = [(110.0, 130.81, 164.81), (87.31, 110.0, 130.81), (130.81, 164.81, 196.0), (98.0, 123.47, 146.83)]
    nbeats = int((n / sr) / beat) + 2
    for k in range(nbeats):
        at = k * beat * sr
        bar, pos = (k // 4) % 4, k % 4
        root = prog[bar][0]
        if pos in (0, 2):
            add(kick, at)
        if pos == 1 and bar % 2:
            add(0.6 * kick, at + beat * sr / 2)
        if pos in (1, 3):
            add(snare, at)
        add(hat, at)
        add(0.55 * hat, at + beat * sr / 2)
        tb = np.arange(int(beat * sr)) / sr                                # bass: root on every beat
        note = sum(np.sin(2 * np.pi * h * root * tb) / h for h in range(1, 6))
        add((0.32 * np.tanh(1.5 * note) * np.exp(-tb / 0.35)).astype(np.float32), at)
        if pos == 0:                                                      # pad: the bar's chord, slow swell
            tp = np.arange(int(4 * beat * sr)) / sr
            env = np.minimum(1, tp / 0.6) * np.minimum(1, (4 * beat - tp) / 0.4)
            chord = sum(np.sin(2 * np.pi * 2 * fq * tp) + 0.4 * np.sin(2 * np.pi * 4 * fq * tp) for fq in prog[bar])
            add((0.05 * chord * env).astype(np.float32), at)
    out = out[:n]
    return (out / np.max(np.abs(out))).astype(np.float32)


def frames_to_samples(v, frame, n):
    return np.interp(np.arange(n), np.arange(len(v)) * frame + frame / 2, v).astype(np.float32)


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
    hit = chime(sr)

    timeline, pos = [], 0
    cold, drops, entries, quiet = [], [], [], []
    for i, (title, lines) in enumerate(SECTIONS):
        if i:
            timeline.append(silence(GAP_SECTION, sr)); pos += int(round(GAP_SECTION * sr))
        sec_start = pos
        for j, line in enumerate(lines):
            if j:
                timeline.append(silence(GAP_LINE, sr)); pos += int(round(GAP_LINE * sr))
            drop = shown(line) in DROP
            if drop:
                d0 = pos
                timeline.append(silence(GAP_DROP, sr)); pos += int(round(GAP_DROP * sr))
            y = synth_line(voice, spoken(line), cfg, sr)
            if shown(line) in QUIET:
                quiet.append((pos - int(0.25 * sr), pos + len(y) + int(0.2 * sr)))
            timeline.append(y); pos += len(y)
            if drop:
                timeline.append(silence(GAP_DROP, sr)); pos += int(round(GAP_DROP * sr))
                drops.append((d0, pos)); entries.append(pos)
        if title in COLD:
            cold.append((0 if i == 0 else sec_start, pos)); entries.append(pos)
    timeline.append(silence(TAIL, sr))
    voice_track = np.concatenate(timeline)
    n = len(voice_track)
    if drops and drops[-1][1] == pos:                           # the last line drops out: end on the hit
        drops[-1] = (drops[-1][0], n)                           # alone, so the loop runs into the cold open

    frame = int(0.01 * sr)
    nf = n // frame
    fr = np.sqrt(np.mean(voice_track[:nf * frame].reshape(nf, frame) ** 2, axis=1))
    speech = np.sqrt(np.mean(fr[fr > np.max(fr) * 0.1] ** 2))
    env, e = np.zeros(nf), 0.0                                  # duck: 20 ms attack, 300 ms release
    for k in range(nf):
        target = min(1.0, fr[k] / speech)
        e += (target - e) * (0.4 if target > e else 0.033)
        env[k] = e
    mask = np.ones(nf)
    for a0, a1 in cold + drops + quiet:
        mask[a0 // frame:a1 // frame + 1] = 0
    mask = np.convolve(mask, np.ones(6) / 6, mode='same')      # 60 ms ramps, no clicks
    beat = music(n, sr, BPM)
    act = np.abs(beat) > 0
    beat *= speech * 10 ** (MUSIC_DB / 20) / np.sqrt(np.mean(beat[act] ** 2))
    gain = frames_to_samples(mask * 10 ** (DUCK_DB * np.minimum(env, 1) / 20), frame, n)
    raw = voice_track + beat * gain
    hit_scaled = hit * speech * 1.1 / np.sqrt(np.mean(hit ** 2))
    for at in entries:                                          # the beat comes back in on a hit
        seg = raw[at:at + len(hit_scaled)]
        seg += hit_scaled[:len(seg)]
    raw = raw / max(1e-9, np.max(np.abs(raw))) * 0.9
    raw_path = os.path.join(WORK, 'pass-raw.wav')
    write_wav(raw_path, raw, sr)

    # Mastering for a speaker outdoors: cut rumble and mud, lift presence, steady the level,
    # then two-pass loudness normalisation to -12 LUFS with a -1.5 dBTP ceiling.
    shape = ('aresample=44100:resampler=soxr,highpass=f=45,'
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
        f.write('PUBLIC ANNOUNCEMENT - the words, exactly as spoken (spoken word over a beat; the beat drops out on the hard lines)\n\n')
        for title, lines in SECTIONS:
            f.write('[%s]\n' % title.upper())
            for line in lines:
                f.write(shown(line) + '\n')
            f.write('\n')
    print('pass %.1f s (%d:%02d); hour file = %d passes = %d:%02d' % (
        dur, dur // 60, dur % 60, reps, (dur * reps) // 60, (dur * reps) % 60))


if __name__ == '__main__':
    main()
