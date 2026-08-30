#!/usr/bin/env python3
"""Sound bed for the site-introduction reel.

No voiceover. A soft chime marks each numbered step, keys tap while the search
box types, ticks run while prices roll, and cards click as they land.
Times mirror render_site_intro.swift.
"""
import math
import random
import struct
import sys
import wave

SR = 44100
DURATION = 27.7
N = int(SR * DURATION)
buf = [0.0] * N
random.seed(31)


def add(sig, at):
    i0 = int(at * SR)
    for k, v in enumerate(sig):
        j = i0 + k
        if 0 <= j < N:
            buf[j] += v


def key_tap(amp=0.24, pitch=1.0):
    d = 0.042
    n = int(SR * d)
    out = [0.0] * n
    f = 2400 * pitch
    prev = 0.0
    for i in range(n):
        t = i / SR
        env = math.exp(-t / 0.0055)
        nz = random.uniform(-1, 1)
        hp = nz - prev
        prev = nz
        out[i] = (hp * 0.75 + math.sin(2 * math.pi * f * t) * math.exp(-t / 0.0032) * 0.45) * env * amp
    return out


def tick(amp=0.11, f=1600):
    d = 0.033
    n = int(SR * d)
    out = [0.0] * n
    prev = 0.0
    for i in range(n):
        t = i / SR
        env = math.exp(-t / 0.005) * (1 - math.exp(-t / 0.0004))
        nz = random.uniform(-1, 1)
        hp = nz - prev
        prev = nz
        out[i] = (math.sin(2 * math.pi * f * t) * 0.7 + hp * 0.4) * env * amp
    return out


def ui_click(amp=0.24, f=900, tau=0.018):
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
        out[i] = (tone + hp * 0.3) * env * amp
    return out


def pop(amp=0.28, f0=440, f1=1000, d=0.14):
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


def chime(amp=0.22, root=660.0):
    """Two-note rise marking a new step in the tour."""
    d = 0.34
    n = int(SR * d)
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        u = t / d
        f = root if u < 0.42 else root * 1.335
        env = math.exp(-((t % (d * 0.42)) / 0.085)) * (1 - math.exp(-t / 0.002))
        out[i] = (math.sin(2 * math.pi * f * t) * 0.8
                  + math.sin(2 * math.pi * f * 2 * t) * 0.16) * env * amp
    return out


def whoosh(amp=0.13, d=0.45):
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


# ---- intro --------------------------------------------------------------
add(pop(amp=0.28, f0=460, f1=980, d=0.15), 0.20)
add(ui_click(amp=0.22, f=760, tau=0.024), 0.56)
add(ui_click(amp=0.14, f=1180, tau=0.014), 1.22)
add(ui_click(amp=0.14, f=1080, tau=0.014), 1.36)

# ---- one chime per numbered step ---------------------------------------
for i, at in enumerate([3.40, 7.45, 12.05, 16.25, 19.65]):
    add(chime(amp=0.20, root=620 + i * 34), at)

# ---- 1 search -----------------------------------------------------------
for k in range(6):
    add(key_tap(amp=0.22 + random.uniform(-0.03, 0.03),
                pitch=1.0 + random.uniform(-0.12, 0.12)), 4.02 + k * 0.105)
for k, at in enumerate([4.80, 4.95, 5.10, 5.25]):
    add(ui_click(amp=0.12, f=1350 + k * 60, tau=0.012), at)
for k, at in enumerate([5.25, 5.40, 5.55]):
    add(ui_click(amp=0.11, f=1250 + k * 50, tau=0.012), at)
add(pop(amp=0.26, f0=500, f1=1060, d=0.16), 5.82)

# ---- 2 compare ----------------------------------------------------------
add(ui_click(amp=0.20, f=980, tau=0.016), 8.08)
add(ui_click(amp=0.20, f=880, tau=0.016), 8.33)
for k in range(7):
    add(tick(amp=0.10, f=1500 + random.uniform(-160, 240)), 8.20 + k * 0.08)
add(pop(amp=0.30, f0=460, f1=1040, d=0.17), 9.46)

# ---- 3 price history ----------------------------------------------------
add(whoosh(amp=0.11, d=0.55), 12.72)
for k in range(5):
    add(tick(amp=0.09, f=1400 + k * 70), 12.80 + k * 0.13)
add(pop(amp=0.28, f0=520, f1=1080, d=0.17), 13.76)

# ---- 4 live deals -------------------------------------------------------
for k, at in enumerate([16.55, 16.77, 16.99]):
    add(ui_click(amp=0.18, f=1000 - k * 60, tau=0.016), at)
add(pop(amp=0.22, f0=560, f1=1100, d=0.14), 17.46)

# ---- 5 trending + guides ------------------------------------------------
for k, at in enumerate([19.95, 20.15, 20.35]):
    add(ui_click(amp=0.17, f=1080 - k * 50, tau=0.015), at)
for k, at in enumerate([21.10, 21.26]):
    add(ui_click(amp=0.12, f=1300 - k * 60, tau=0.012), at)
add(ui_click(amp=0.12, f=1220, tau=0.012), 21.76)

# ---- 6 free + outro -----------------------------------------------------
EVENTS = [
    (23.05, pop(amp=0.26, f0=480, f1=1000, d=0.14)),
    (23.30, pop(amp=0.26, f0=580, f1=1140, d=0.14)),
    (25.00, whoosh(amp=0.14, d=0.62)),
    (25.55, ui_click(amp=0.24, f=700, tau=0.026)),
    (26.05, pop(amp=0.26, f0=500, f1=1100)),
]
for at, sig in EVENTS:
    add(sig, at)

peak = max(abs(v) for v in buf) or 1.0
gain = 0.82 / peak
out_path = sys.argv[1] if len(sys.argv) > 1 else "marketing/assets/intro-sfx.wav"
with wave.open(out_path, "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(b"".join(
        struct.pack("<h", max(-32768, min(32767, int(v * gain * 32767)))) for v in buf
    ))
print(out_path, "peak=%.3f" % peak)
