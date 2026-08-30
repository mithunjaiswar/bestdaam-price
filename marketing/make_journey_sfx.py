#!/usr/bin/env python3
"""Synthesise the UI sound bed for the deal-journey reel.

No voiceover. Only diegetic interface sound: a phone ring at the hook,
keyboard taps while the URL is typed, a scroll pass, and click/tap sounds
when something is touched or lands. Event times mirror render_deal_journey.swift.
"""
import math
import random
import struct
import sys
import wave

SR = 44100
DURATION = 18.7
N = int(SR * DURATION)
buf = [0.0] * N
random.seed(11)


def add(sig, at):
    i0 = int(at * SR)
    for k, v in enumerate(sig):
        j = i0 + k
        if 0 <= j < N:
            buf[j] += v


def key_tap(amp=0.28, pitch=1.0):
    """Short crisp keyboard tap."""
    d = 0.042
    n = int(SR * d)
    out = [0.0] * n
    f = 2400 * pitch
    prev = 0.0
    for i in range(n):
        t = i / SR
        env = math.exp(-t / 0.0055)
        nz = random.uniform(-1, 1)
        hp = nz - prev          # highpass keeps it clicky, not thuddy
        prev = nz
        tone = math.sin(2 * math.pi * f * t) * math.exp(-t / 0.0032)
        out[i] = (hp * 0.75 + tone * 0.45) * env * amp
    return out


def ui_click(amp=0.30, f=900, bright=1.0, tau=0.018):
    d = 0.10
    n = int(SR * d)
    out = [0.0] * n
    prev = 0.0
    for i in range(n):
        t = i / SR
        env = math.exp(-t / tau) * (1 - math.exp(-t / 0.0008))
        tone = math.sin(2 * math.pi * f * t) * 0.8 + math.sin(2 * math.pi * f * 2 * t) * 0.22
        nz = random.uniform(-1, 1)
        hp = nz - prev
        prev = nz
        out[i] = (tone + hp * 0.32 * bright) * env * amp
    return out


def finger_tap(amp=0.34):
    """Duller, lower tap — a fingertip touching the screen."""
    d = 0.16
    n = int(SR * d)
    out = [0.0] * n
    lp = 0.0
    for i in range(n):
        t = i / SR
        env = math.exp(-t / 0.030) * (1 - math.exp(-t / 0.0012))
        nz = random.uniform(-1, 1)
        lp += (nz - lp) * 0.22
        body = math.sin(2 * math.pi * 300 * t) * 0.9 + math.sin(2 * math.pi * 168 * t) * 0.5
        out[i] = (body + lp * 0.5) * env * amp
    return out


def pop(amp=0.30, f0=420, f1=980, d=0.14):
    n = int(SR * d)
    out = [0.0] * n
    ph = 0.0
    for i in range(n):
        t = i / SR
        u = t / d
        f = f0 + (f1 - f0) * (1 - math.exp(-u * 4))
        ph += 2 * math.pi * f / SR
        env = math.exp(-t / 0.038) * (1 - math.exp(-t / 0.0015))
        out[i] = math.sin(ph) * env * amp
    return out


def phone_ring(amp=0.26):
    """Two-tone chirp pair — a soft modern ringtone, not a bell."""
    out = []
    for burst in range(2):
        d = 0.26
        n = int(SR * d)
        seg = [0.0] * n
        for i in range(n):
            t = i / SR
            u = t / d
            # step up between two notes mid-burst
            f = 784.0 if u < 0.5 else 988.0
            env = (math.sin(math.pi * min(1.0, u * 2 if u < 0.5 else (u - 0.5) * 2)) ** 1.2)
            seg[i] = (math.sin(2 * math.pi * f * t) * 0.75
                      + math.sin(2 * math.pi * f * 2 * t) * 0.18) * env * amp
        out.extend(seg)
        out.extend([0.0] * int(SR * 0.10))
    return out


def whoosh(amp=0.15, d=0.55):
    n = int(SR * d)
    out = [0.0] * n
    lp = 0.0
    for i in range(n):
        t = i / SR
        u = t / d
        env = math.sin(math.pi * u) ** 1.7
        nz = random.uniform(-1, 1)
        lp += (nz - lp) * 0.055
        out[i] = lp * env * amp * 6.0
    return out


# ---- phone call hook ---------------------------------------------------
add(phone_ring(amp=0.26), 0.20)
add(phone_ring(amp=0.20), 1.35)
add(pop(amp=0.22, f0=520, f1=980, d=0.12), 0.64)      # speech bubble appears

# ---- typing "pricevichar" into the address bar (3.70 -> 4.60) ----------
for k in range(6):
    add(key_tap(amp=0.25 + random.uniform(-0.04, 0.04),
                pitch=1.0 + random.uniform(-0.13, 0.13)),
        3.70 + k * 0.150)

# ---- discrete UI events ------------------------------------------------
EVENTS = [
    (3.92, ui_click(amp=0.14, f=1450, tau=0.011)),    # suggestion row drops in
    (4.72, ui_click(amp=0.30, f=760, tau=0.022)),     # enter / navigate
    (5.28, whoosh(amp=0.10, d=0.40)),                 # page paints
    (7.00, whoosh(amp=0.12, d=0.50)),                 # scroll
    (7.85, whoosh(amp=0.10, d=0.45)),                 # scroll settles
    (10.90, finger_tap(amp=0.36)),                    # taps the first offer
    (11.10, pop(amp=0.28, f0=480, f1=1060, d=0.16)),  # card lifts out
    (14.14, pop(amp=0.30, f0=620, f1=1180, d=0.17)),  # confirm tick
    (14.68, ui_click(amp=0.16, f=1200, tau=0.013)),   # trust chip 1
    (14.94, ui_click(amp=0.16, f=1120, tau=0.013)),   # trust chip 2
    (15.20, ui_click(amp=0.16, f=1280, tau=0.013)),   # trust chip 3
    (16.60, whoosh(amp=0.14, d=0.62)),                # iris wipe
    (17.12, ui_click(amp=0.24, f=700, tau=0.026)),    # logo lands
    (17.62, pop(amp=0.26, f0=500, f1=1100)),          # CTA pill
]
for at, sig in EVENTS:
    add(sig, at)

# ---- normalise & write -------------------------------------------------
peak = max(abs(v) for v in buf) or 1.0
gain = 0.82 / peak
out_path = sys.argv[1] if len(sys.argv) > 1 else "marketing/assets/journey-sfx.wav"
with wave.open(out_path, "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(b"".join(
        struct.pack("<h", max(-32768, min(32767, int(v * gain * 32767)))) for v in buf
    ))
print(out_path, "peak=%.3f" % peak)
