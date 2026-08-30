#!/usr/bin/env python3
"""Sound bed for the top-3 price-gaps reel.

No voiceover. Card slides, a short tick run while each price rolls up, and a
thump when the gap badge lands. Times mirror render_top3_gaps.swift.
"""
import math
import random
import struct
import sys
import wave

SR = 44100
DURATION = 21.1
N = int(SR * DURATION)
buf = [0.0] * N
random.seed(23)


def add(sig, at):
    i0 = int(at * SR)
    for k, v in enumerate(sig):
        j = i0 + k
        if 0 <= j < N:
            buf[j] += v


def tick(amp=0.13, f=1650):
    d = 0.035
    n = int(SR * d)
    out = [0.0] * n
    prev = 0.0
    for i in range(n):
        t = i / SR
        env = math.exp(-t / 0.0055) * (1 - math.exp(-t / 0.0004))
        nz = random.uniform(-1, 1)
        hp = nz - prev
        prev = nz
        out[i] = (math.sin(2 * math.pi * f * t) * 0.7 + hp * 0.4) * env * amp
    return out


def ui_click(amp=0.28, f=880, tau=0.02):
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


def thump(amp=0.34):
    """Low landing hit for the gap badge."""
    d = 0.30
    n = int(SR * d)
    out = [0.0] * n
    ph = 0.0
    for i in range(n):
        t = i / SR
        f = 170 * math.exp(-t / 0.09) + 62
        ph += 2 * math.pi * f / SR
        env = math.exp(-t / 0.075) * (1 - math.exp(-t / 0.002))
        out[i] = math.sin(ph) * env * amp
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


# ---- hook ---------------------------------------------------------------
add(pop(amp=0.26, f0=460, f1=900, d=0.13), 0.26)
add(pop(amp=0.26, f0=560, f1=1080, d=0.13), 0.64)
add(ui_click(amp=0.14, f=1150, tau=0.014), 1.18)

# ---- the three deals ----------------------------------------------------
# card slide, ticks while the two prices roll, thump when the gap lands
for start in (3.00, 8.20, 13.00):
    add(whoosh(amp=0.12, d=0.40), start - 0.05)
    for k in range(9):
        add(tick(amp=0.11 + random.uniform(-0.02, 0.02),
                 f=1500 + random.uniform(-180, 260)),
            start + 0.30 + k * 0.075)
    add(ui_click(amp=0.20, f=980, tau=0.016), start + 1.05)   # best-price badge
    add(thump(amp=0.32), start + 1.28)                        # gap badge lands
    add(ui_click(amp=0.12, f=1300, tau=0.012), start + 1.72)  # trust chips
    add(ui_click(amp=0.12, f=1220, tau=0.012), start + 1.86)

# ---- payoff + outro -----------------------------------------------------
EVENTS = [
    (17.58, pop(amp=0.24, f0=480, f1=980, d=0.13)),
    (17.78, pop(amp=0.24, f0=560, f1=1120, d=0.13)),
    (18.18, ui_click(amp=0.18, f=1180, tau=0.015)),
    (18.44, ui_click(amp=0.18, f=1080, tau=0.015)),
    (19.00, whoosh(amp=0.14, d=0.62)),
    (19.52, ui_click(amp=0.24, f=700, tau=0.026)),
    (20.02, pop(amp=0.26, f0=500, f1=1100)),
]
for at, sig in EVENTS:
    add(sig, at)

peak = max(abs(v) for v in buf) or 1.0
gain = 0.82 / peak
out_path = sys.argv[1] if len(sys.argv) > 1 else "marketing/assets/top3-sfx.wav"
with wave.open(out_path, "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(b"".join(
        struct.pack("<h", max(-32768, min(32767, int(v * gain * 32767)))) for v in buf
    ))
print(out_path, "peak=%.3f" % peak)
