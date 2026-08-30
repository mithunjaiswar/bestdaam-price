import Foundation
import AVFoundation
import CoreGraphics
import CoreText
import CoreVideo
import ImageIO

// PriceVichar — "this week's three biggest price gaps".
// Point of the reel: the cheaper store is NOT always the same one, so both
// are worth checking. Two of the three below are cheapest on Amazon, one on
// Flipkart — that contrast is the whole message.

let width = 1080, height = 1920
let fps: Int32 = 30
let totalMs = 21000.0
let outputPath = CommandLine.arguments.count > 1
    ? CommandLine.arguments[1]
    : "marketing/assets/pricevichar-top3-gaps.mp4"
let outputURL = URL(fileURLWithPath: outputPath)
try? FileManager.default.removeItem(at: outputURL)

func color(_ hex: UInt32, _ a: CGFloat = 1) -> CGColor {
    CGColor(red: CGFloat((hex >> 16) & 255)/255, green: CGFloat((hex >> 8) & 255)/255,
            blue: CGFloat(hex & 255)/255, alpha: a)
}
let C_white: UInt32 = 0xFFFFFF
let C_ink: UInt32   = 0x07183F
let C_blue: UInt32  = 0x1769E8
let C_mint: UInt32  = 0x14B86A
let C_soft: UInt32  = 0xF4F7FF
let C_line: UInt32  = 0xD9E2F7
let C_grey: UInt32  = 0x7F8AA6
let C_amber: UInt32 = 0xF59E0B
let C_skin: UInt32   = 0xF3C9A2
let C_hair: UInt32   = 0x171331
let C_blouse: UInt32 = 0x1769E8
let C_blush: UInt32  = 0xF39BA8

func easeOutCubic(_ t: Double) -> Double { 1 - pow(1 - t, 3) }
func easeInCubic(_ t: Double) -> Double { t * t * t }
func easeInOut(_ t: Double) -> Double { t < 0.5 ? 2*t*t : 1 - pow(-2*t + 2, 2)/2 }
func easeOutBack(_ t: Double) -> Double { let c1 = 1.70158, c3 = c1 + 1; return 1 + c3*pow(t-1,3) + c1*pow(t-1,2) }
func clamp01(_ v: Double) -> Double { max(0, min(1, v)) }
func seg(_ t: Double, _ s: Double, _ d: Double) -> Double { clamp01((t - s) / d) }
func lerp(_ a: Double, _ b: Double, _ t: Double) -> Double { a + (b - a) * t }

var ctx: CGContext?

// MARK: - primitives

func fillRect(_ r: CGRect, _ hex: UInt32, _ a: CGFloat = 1) {
    guard let c = ctx else { return }; c.setFillColor(color(hex, a)); c.fill(r)
}
func fillRounded(_ r: CGRect, _ rad: CGFloat, _ hex: UInt32, _ a: CGFloat = 1) {
    guard let c = ctx, a > 0.004 else { return }
    c.addPath(CGPath(roundedRect: r, cornerWidth: rad, cornerHeight: rad, transform: nil))
    c.setFillColor(color(hex, a)); c.fillPath()
}
func strokeRounded(_ r: CGRect, _ rad: CGFloat, _ hex: UInt32, _ w: CGFloat, _ a: CGFloat = 1) {
    guard let c = ctx, a > 0.004 else { return }
    c.addPath(CGPath(roundedRect: r, cornerWidth: rad, cornerHeight: rad, transform: nil))
    c.setStrokeColor(color(hex, a)); c.setLineWidth(w); c.strokePath()
}
func fillCircle(_ x: CGFloat, _ y: CGFloat, _ r: CGFloat, _ hex: UInt32, _ a: CGFloat = 1) {
    guard let c = ctx, a > 0.004 else { return }
    c.addEllipse(in: CGRect(x: x-r, y: y-r, width: 2*r, height: 2*r))
    c.setFillColor(color(hex, a)); c.fillPath()
}
func strokeCircle(_ x: CGFloat, _ y: CGFloat, _ r: CGFloat, _ hex: UInt32, _ w: CGFloat, _ a: CGFloat = 1) {
    guard let c = ctx, a > 0.004 else { return }
    c.addEllipse(in: CGRect(x: x-r, y: y-r, width: 2*r, height: 2*r))
    c.setStrokeColor(color(hex, a)); c.setLineWidth(w); c.strokePath()
}
func strokePoly(_ pts: [CGPoint], _ hex: UInt32, _ w: CGFloat, _ a: CGFloat = 1, close: Bool = false) {
    guard let c = ctx, a > 0.004, pts.count > 1 else { return }
    c.saveGState(); c.setLineCap(.round); c.setLineJoin(.round)
    let p = CGMutablePath(); p.move(to: pts[0])
    for q in pts.dropFirst() { p.addLine(to: q) }
    if close { p.closeSubpath() }
    c.addPath(p); c.setStrokeColor(color(hex, a)); c.setLineWidth(w); c.strokePath()
    c.restoreGState()
}
func tubeC(_ pts: [CGPoint], _ thickness: CGFloat, _ fill: UInt32) {
    strokePoly(pts, C_ink, thickness + 5, 1)
    strokePoly(pts, fill, thickness, 1)
}

func drawText(_ text: String, x: CGFloat, y: CGFloat, w: CGFloat, size: CGFloat,
              hex: UInt32, bold: Bool = true, align: CTTextAlignment = .left,
              a: CGFloat = 1, tracking: CGFloat = 0, lines: Int = 1) {
    guard let c = ctx, a > 0.004 else { return }
    let font = CTFontCreateWithName((bold ? "Helvetica-Bold" : "Helvetica") as CFString, size, nil)
    var alignment = align
    let style: CTParagraphStyle = withUnsafeBytes(of: &alignment) { bytes in
        let s = CTParagraphStyleSetting(spec: .alignment,
                                        valueSize: MemoryLayout<CTTextAlignment>.size,
                                        value: bytes.baseAddress!)
        let arr = [s]
        return arr.withUnsafeBufferPointer { CTParagraphStyleCreate($0.baseAddress, $0.count) }
    }
    var attr: [NSAttributedString.Key: Any] = [
        NSAttributedString.Key(kCTFontAttributeName as String): font,
        NSAttributedString.Key(kCTForegroundColorAttributeName as String): color(hex, a),
        NSAttributedString.Key(kCTParagraphStyleAttributeName as String): style
    ]
    if tracking != 0 { attr[NSAttributedString.Key(kCTKernAttributeName as String)] = tracking }
    let fs = CTFramesetterCreateWithAttributedString(NSAttributedString(string: text, attributes: attr))
    let rect = CGRect(x: x, y: y, width: w, height: size * (lines > 1 ? 1.32 * CGFloat(lines) : 1.6))
    let frame = CTFramesetterCreateFrame(fs, CFRange(location: 0, length: 0),
                                         CGPath(rect: rect, transform: nil), nil)
    // The context is y-flipped for top-left coordinates, which also mirrors
    // glyphs; reflect locally around this rect so text draws upright in place.
    c.saveGState()
    c.translateBy(x: 0, y: rect.midY * 2)
    c.scaleBy(x: 1, y: -1)
    CTFrameDraw(frame, c)
    c.restoreGState()
}

func loadImage(_ name: String) -> CGImage? {
    let url = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
        .appendingPathComponent("marketing/assets/\(name)")
    guard let src = CGImageSourceCreateWithURL(url as CFURL, nil) else { return nil }
    return CGImageSourceCreateImageAtIndex(src, 0, nil)
}

/// Image contained inside `rect`. The frame context is y-flipped, which mirrors
/// bitmaps, so the image is reflected locally around its own centre.
func drawImageFit(_ img: CGImage, in rect: CGRect, corner: CGFloat, a: CGFloat) {
    guard let c = ctx, a > 0.01 else { return }
    c.saveGState(); c.setAlpha(a)
    c.addPath(CGPath(roundedRect: rect, cornerWidth: corner, cornerHeight: corner, transform: nil))
    c.clip()
    c.setFillColor(color(C_white)); c.fill(rect)
    let iw = CGFloat(img.width), ih = CGFloat(img.height)
    let s = min(rect.width / iw, rect.height / ih) * 0.92
    let w = iw * s, h = ih * s
    let r = CGRect(x: rect.midX - w/2, y: rect.midY - h/2, width: w, height: h)
    c.translateBy(x: 0, y: r.midY * 2)
    c.scaleBy(x: 1, y: -1)
    c.draw(img, in: r)
    c.restoreGState()
}

func inr(_ v: Int) -> String {
    let s = String(v)
    guard s.count > 3 else { return s }
    let tail = String(s.suffix(3))
    var head = String(s.dropLast(3))
    var out = ""
    while head.count > 2 {
        out = "," + String(head.suffix(2)) + out
        head = String(head.dropLast(2))
    }
    return head + out + "," + tail
}

// MARK: - verified facts (pricevichar.com product pages, all checked 24 Aug 2026)

struct Deal {
    let name: String, sub: String
    let cheapStore: String, cheapPrice: Int
    let otherStore: String, otherPrice: Int
    let rating: String
    let image: CGImage?
}
let deals = [
    Deal(name: "HP 15 G10 (2025)", sub: "AMD Athlon Dual Core 7120U",
         cheapStore: "Amazon", cheapPrice: 39999,
         otherStore: "Flipkart", otherPrice: 54600,
         rating: "4.0 ★ (397)", image: loadImage("p-hp15.jpg")),
    Deal(name: "Bose QuietComfort", sub: "Wireless N.C Over-Ear",
         cheapStore: "Flipkart", cheapPrice: 19900,
         otherStore: "Amazon", otherPrice: 22900,
         rating: "4.6 ★ (143)", image: loadImage("p-bose.jpg")),
    Deal(name: "Samsung Galaxy Buds4 Pro", sub: "Wireless earbuds",
         cheapStore: "Amazon", cheapPrice: 20999,
         otherStore: "Flipkart", otherPrice: 22999,
         rating: "4.6 ★", image: loadImage("p-buds4pro.jpg")),
]

// MARK: - character

func drawCharacter(cx: CGFloat, feetY: CGFloat, h: CGFloat, pose: Int, a: CGFloat, bob: CGFloat = 0) {
    guard let c = ctx, a > 0.01 else { return }
    let u = h / 200.0
    func P(_ dx: Double, _ up: Double) -> CGPoint {
        CGPoint(x: cx + CGFloat(dx)*u, y: feetY - CGFloat(up)*u + bob)
    }
    c.saveGState(); c.setAlpha(a)
    let headC = P(0, 178), headR = 15.5*u

    let hb = CGMutablePath()
    hb.move(to: P(-16, 190))
    hb.addCurve(to: P(-22, 128), control1: P(-26, 168), control2: P(-25, 146))
    hb.addCurve(to: P(-13, 120), control1: P(-20, 122), control2: P(-17, 120))
    hb.addLine(to: P(13, 120))
    hb.addCurve(to: P(22, 128), control1: P(17, 120), control2: P(20, 122))
    hb.addCurve(to: P(16, 190), control1: P(25, 146), control2: P(26, 168))
    hb.closeSubpath()
    c.addPath(hb); c.setFillColor(color(C_hair)); c.fillPath()

    tubeC([P(-7, 92), P(-9, 52), P(-9, 14)], 9.5*u, C_skin)
    tubeC([P( 7, 92), P( 9, 52), P( 9, 14)], 9.5*u, C_skin)
    fillRounded(CGRect(x: P(-18, 14).x, y: P(0, 14).y, width: 17*u, height: 10*u), 5*u, C_ink, 1)
    fillRounded(CGRect(x: P(  1, 14).x, y: P(0, 14).y, width: 17*u, height: 10*u), 5*u, C_ink, 1)

    let skirt = CGMutablePath()
    skirt.move(to: P(-14, 112)); skirt.addLine(to: P(14, 112))
    skirt.addCurve(to: P(26, 78), control1: P(20, 100), control2: P(24, 88))
    skirt.addQuadCurve(to: P(-26, 78), control: P(0, 72))
    skirt.addCurve(to: P(-14, 112), control1: P(-24, 88), control2: P(-20, 100))
    skirt.closeSubpath()
    c.addPath(skirt); c.setFillColor(color(C_ink)); c.fillPath()

    let top = CGMutablePath()
    top.move(to: P(-19, 152))
    top.addQuadCurve(to: P(-15, 112), control: P(-22, 130))
    top.addLine(to: P(15, 112))
    top.addQuadCurve(to: P(19, 152), control: P(22, 130))
    top.addQuadCurve(to: P(0, 158), control: P(0, 156))
    top.closeSubpath()
    c.addPath(top); c.setFillColor(color(C_blouse)); c.fillPath()
    c.addPath(top); c.setStrokeColor(color(C_ink)); c.setLineWidth(4); c.strokePath()

    switch pose {
    case 1:
        tubeC([P(-18, 150), P(-33, 126), P(-14, 111)], 7*u, C_skin)
        tubeC([P( 18, 150), P( 33, 126), P( 14, 111)], 7*u, C_skin)
    case 2: // one arm up, presenting
        tubeC([P(-17, 149), P(-27, 124), P(-23, 104)], 7*u, C_skin)
        tubeC([P( 18, 150), P( 36, 162), P( 44, 182)], 7*u, C_skin)
    default:
        tubeC([P(-17, 149), P(-28, 126), P(-22, 106)], 7*u, C_skin)
        tubeC([P( 17, 149), P( 28, 126), P( 34, 108)], 7*u, C_skin)
    }

    tubeC([P(0, 162), P(0, 154)], 7.5*u, C_skin)
    fillCircle(headC.x, headC.y, headR, C_skin)
    strokeCircle(headC.x, headC.y, headR, C_ink, 4)

    let fr = CGMutablePath()
    fr.move(to: P(-15.5, 178))
    fr.addQuadCurve(to: P(0, 194), control: P(-15.5, 190))
    fr.addQuadCurve(to: P(15.5, 178), control: P(15.5, 190))
    fr.addQuadCurve(to: P(3, 185), control: P(13, 183))
    fr.addQuadCurve(to: P(-15.5, 178), control: P(-9, 190))
    fr.closeSubpath()
    c.addPath(fr); c.setFillColor(color(C_hair)); c.fillPath()

    fillCircle(P(-5.6, 177).x, P(-5.6, 177).y, 1.9*u, C_ink)
    fillCircle(P( 5.6, 177).x, P( 5.6, 177).y, 1.9*u, C_ink)
    let sm = CGMutablePath()
    sm.move(to: P(-4.4, 172))
    sm.addQuadCurve(to: P(4.4, 172), control: P(0, 167.5))
    c.addPath(sm); c.setStrokeColor(color(C_ink)); c.setLineWidth(2.8)
    c.setLineCap(.round); c.strokePath()
    fillCircle(P(-10, 173).x, P(-10, 173).y, 2.3*u, C_blush, 0.5)
    fillCircle(P( 10, 173).x, P( 10, 173).y, 2.3*u, C_blush, 0.5)
    c.restoreGState()
}

func sparkles(_ t: Double, in rect: CGRect, phase: Double, hex: UInt32, a: CGFloat) {
    guard let c = ctx, a > 0.01 else { return }
    let spots: [(CGFloat, CGFloat, Int)] = [
        (0.07, 0.10, 0), (0.93, 0.18, 1), (0.18, 0.88, 2), (0.80, 0.92, 0),
        (0.52, 0.04, 1), (0.04, 0.58, 2), (0.96, 0.66, 0), (0.33, 0.97, 1)
    ]
    c.saveGState()
    for (i, s) in spots.enumerated() {
        let tw = 0.55 + 0.45 * sin(t/380.0 + phase + Double(i) * 0.8)
        let px = rect.minX + rect.width * s.0, py = rect.minY + rect.height * s.1
        let aa = a * CGFloat(tw), r: CGFloat = 9
        switch s.2 {
        case 0:
            strokePoly([CGPoint(x: px-r, y: py), CGPoint(x: px+r, y: py)], hex, 3, aa)
            strokePoly([CGPoint(x: px, y: py-r), CGPoint(x: px, y: py+r)], hex, 3, aa)
        case 1:
            strokePoly([CGPoint(x: px, y: py-r), CGPoint(x: px+r, y: py),
                        CGPoint(x: px, y: py+r), CGPoint(x: px-r, y: py)], hex, 3, aa, close: true)
        default: fillCircle(px, py, 4, hex, aa)
        }
    }
    c.restoreGState()
}

func drawMark(x: CGFloat, y: CGFloat, side: CGFloat, a: CGFloat = 1) {
    guard let c = ctx, a > 0.01 else { return }
    let k = side / 64
    func P(_ p: CGFloat, _ q: CGFloat) -> CGPoint { CGPoint(x: x + p*k, y: y + q*k) }
    c.saveGState(); c.setAlpha(a)
    fillRounded(CGRect(x: x, y: y, width: side, height: side), 16*k, C_ink)
    let p = CGMutablePath()
    p.move(to: P(17, 14)); p.addLine(to: P(37, 14))
    p.addCurve(to: P(52, 27), control1: P(46, 14), control2: P(52, 19))
    p.addCurve(to: P(39, 40), control1: P(52, 34), control2: P(47, 39))
    p.addLine(to: P(28, 40)); p.addLine(to: P(28, 51)); p.addLine(to: P(17, 51)); p.closeSubpath()
    p.move(to: P(28, 23)); p.addLine(to: P(28, 32)); p.addLine(to: P(36, 32))
    p.addCurve(to: P(41, 27), control1: P(39, 32), control2: P(41, 30))
    p.addCurve(to: P(36, 23), control1: P(41, 24), control2: P(39, 23))
    p.closeSubpath()
    c.addPath(p); c.setFillColor(color(C_white)); c.fillPath(using: .evenOdd)
    strokePoly([P(33, 47), P(39, 53), P(51, 39)], C_mint, 6*k)
    c.restoreGState()
}

// MARK: - deal panel

/// One deal: product shot, both store prices, and the gap.
/// `p` drives entry, `count` the price roll-up, `reveal` the gap badge.
func dealPanel(_ d: Deal, index: Int, p: Double, count: Double, reveal: Double, a: CGFloat) {
    guard let c = ctx, a > 0.01 else { return }
    let slide = CGFloat((1 - easeOutCubic(p)) * 90)
    c.saveGState(); c.setAlpha(a)
    c.translateBy(x: 0, y: slide)

    // rank chip
    fillCircle(150, 470, 40, C_blue, 1)
    drawText("\(index + 1)", x: 110, y: 442, w: 80, size: 44, hex: C_white, align: .center)
    drawText("of 3", x: 200, y: 452, w: 140, size: 26, hex: C_grey, tracking: 2)

    // product
    let ib = CGRect(x: 96, y: 560, width: 300, height: 300)
    fillRounded(ib, 28, C_soft, 1)
    if let img = d.image { drawImageFit(img, in: ib, corner: 28, a: 1) }
    strokeRounded(ib, 28, C_line, 3, 1)

    drawText(d.name, x: 430, y: 570, w: 560, size: 44, hex: C_ink, lines: 2)
    drawText(d.sub, x: 430, y: 672, w: 560, size: 28, hex: C_grey, bold: false, lines: 2)
    drawText(d.rating, x: 430, y: 742, w: 560, size: 28, hex: C_amber)

    // the two store rows
    let rows: [(String, Int, Bool)] = [
        (d.cheapStore, d.cheapPrice, true),
        (d.otherStore, d.otherPrice, false),
    ]
    for (i, row) in rows.enumerated() {
        let y: CGFloat = 920 + CGFloat(i) * 160
        let r = CGRect(x: 96, y: y, width: 888, height: 138)
        fillRounded(r, 30, C_white, 1)
        strokeRounded(r, 30, row.2 ? C_mint : C_line, row.2 ? 6 : 3, 1)
        drawText(row.0.uppercased(), x: r.minX + 40, y: r.minY + 26, w: 320,
                 size: 28, hex: C_grey, tracking: 2)
        let shown = Int(Double(row.1) * easeOutCubic(clamp01(count)))
        drawText("₹" + inr(shown), x: r.minX + 40, y: r.minY + 62, w: 420,
                 size: 58, hex: row.2 ? C_mint : C_ink)
        if row.2 {
            fillRounded(CGRect(x: r.maxX - 250, y: r.minY + 44, width: 206, height: 52), 26, C_mint, 1)
            drawText("BEST PRICE", x: r.maxX - 250, y: r.minY + 56, w: 206, size: 26,
                     hex: C_white, align: .center, tracking: 1)
        }
    }

    // the gap
    if reveal > 0.01 {
        let s = CGFloat(clamp01(easeOutBack(reveal)))
        c.saveGState()
        c.translateBy(x: 540, y: 1330); c.scaleBy(x: s, y: s); c.translateBy(x: -540, y: -1330)
        fillRounded(CGRect(x: 150, y: 1250, width: 780, height: 160), 44, C_ink, 1)
        c.restoreGState()
        let gap = d.otherPrice - d.cheapPrice
        drawText("₹" + inr(gap) + " ka farak", x: 150, y: 1298, w: 780, size: 62,
                 hex: C_white, align: .center, a: CGFloat(clamp01(reveal)))

        // trust strip, so the lower third is not dead space
        let ca = CGFloat(clamp01((reveal - 0.35) / 0.5))
        if ca > 0.01 {
            let chips = ["✓ Dono store verified", "↻ Checked 24 Aug"]
            var cx: CGFloat = 208
            for s in chips {
                let w: CGFloat = CGFloat(s.count) * 15.0 + 52
                fillRounded(CGRect(x: cx, y: 1452, width: w, height: 62), 31, C_soft, ca)
                drawText(s, x: cx + 26, y: 1470, w: w, size: 27, hex: C_ink, bold: false, a: ca)
                cx += w + 18
            }
            drawText("Poora comparison — pricevichar.com", x: 150, y: 1556, w: 780, size: 30,
                     hex: C_blue, align: .center, a: ca)
        }
    }
    c.restoreGState()
}

// MARK: - scenes

func drawBackground(_ t: Double) {
    fillRect(CGRect(x: 0, y: 0, width: 1080, height: 1920), C_white)
    let w = clamp01(easeInOut(seg(t, 0, 300)) - easeInOut(seg(t, 2500, 400)))
    if w > 0.001 { fillRect(CGRect(x: 0, y: 0, width: 1080, height: 1920), C_soft, CGFloat(w)) }
}

// S0 — hook
func scene0(_ t: Double) {
    guard t < 3100 else { return }
    let a = CGFloat(clamp01(seg(t, 100, 300)) * (1 - easeInCubic(seg(t, 2700, 380))))
    guard a > 0.01 else { return }
    let hp = CGFloat(easeOutCubic(seg(t, 250, 480)))
    drawText("Ek hi product.", x: 90, y: CGFloat(lerp(420, 396, Double(hp))), w: 900, size: 76,
             hex: C_ink, align: .center, a: a * hp)
    let h2 = CGFloat(easeOutCubic(seg(t, 620, 480)))
    drawText("Do store. Alag daam.", x: 90, y: CGFloat(lerp(520, 496, Double(h2))), w: 900, size: 76,
             hex: C_blue, align: .center, a: a * h2)
    let h3 = CGFloat(easeOutCubic(seg(t, 1150, 460)))
    drawText("Is hafte ke 3 sabse bade farak", x: 90, y: 640, w: 900, size: 40,
             hex: C_grey, bold: false, align: .center, a: a * h3)

    drawCharacter(cx: 540, feetY: 1560, h: 520, pose: 2, a: a * CGFloat(easeOutCubic(seg(t, 900, 500))),
                  bob: CGFloat(sin(t/420.0) * 4))
    sparkles(t, in: CGRect(x: 80, y: 380, width: 920, height: 1180), phase: 0.4, hex: C_blue, a: a * 0.55)
}

// S1..S3 — the three deals
let dealStart = [3000.0, 8200.0, 13000.0]
let dealLen = 5000.0

func dealScene(_ t: Double, _ i: Int) {
    let s = dealStart[i]
    let last = (i == deals.count - 1)
    let hold = last ? 4400.0 : dealLen
    guard t >= s - 200 && t < s + hold else { return }
    let a = CGFloat(clamp01(seg(t, s - 150, 300)) * (1 - easeInCubic(seg(t, s + hold - 450, 400))))
    guard a > 0.01 else { return }
    dealPanel(deals[i], index: i,
              p: seg(t, s, 500), count: seg(t, s + 260, 760), reveal: seg(t, s + 1250, 620), a: a)
    sparkles(t, in: CGRect(x: 60, y: 500, width: 960, height: 900),
             phase: 1.4 + Double(i), hex: C_blue, a: a * 0.35)
}

// S4 — the point
func scene4(_ t: Double) {
    guard t >= 17500 && t < 19600 else { return }
    let a = CGFloat(clamp01(seg(t, 17500, 320)) * (1 - easeInCubic(seg(t, 19200, 380))))
    guard a > 0.01 else { return }
    drawText("Har baar ek hi store", x: 90, y: 560, w: 900, size: 66, hex: C_ink,
             align: .center, a: a * CGFloat(easeOutCubic(seg(t, 17550, 400))))
    drawText("sasta nahi hota.", x: 90, y: 648, w: 900, size: 66, hex: C_blue,
             align: .center, a: a * CGFloat(easeOutCubic(seg(t, 17750, 400))))

    // two of three cheapest on Amazon, one on Flipkart — shown as a tally
    let tallies = [("Amazon sasta", 2), ("Flipkart sasta", 1)]
    for (i, item) in tallies.enumerated() {
        let p = CGFloat(easeOutBack(seg(t, 18150 + Double(i) * 260, 460)))
        guard p > 0.01 else { continue }
        let y: CGFloat = 830 + CGFloat(i) * 150
        let r = CGRect(x: 220, y: y, width: 640, height: 118)
        fillRounded(r, 34, C_soft, a * min(1, p))
        drawText(item.0, x: r.minX + 46, y: r.minY + 38, w: 380, size: 40,
                 hex: C_ink, a: a * min(1, p))
        drawText("\(item.1) / 3", x: r.maxX - 220, y: r.minY + 32, w: 170, size: 46,
                 hex: C_mint, align: .center, a: a * min(1, p))
    }
    drawText("Dono check karo — 30 second lagte hain.", x: 90, y: 1140, w: 900, size: 34,
             hex: C_grey, bold: false, align: .center,
             a: a * CGFloat(easeOutCubic(seg(t, 18700, 400))))
    drawCharacter(cx: 540, feetY: 1580, h: 340, pose: 1,
                  a: a * CGFloat(easeOutCubic(seg(t, 18300, 450))), bob: CGFloat(sin(t/300.0) * 3))
}

// S5 — iris, logo, slogan
func scene5(_ t: Double) {
    guard let c = ctx else { return }
    if t >= 19000 && t < 19750 {
        let p = easeInOut(seg(t, 19000, 680))
        let r = CGFloat(lerp(1250, 0, p))
        let path = CGMutablePath()
        path.addRect(CGRect(x: 0, y: 0, width: 1080, height: 1920))
        path.addEllipse(in: CGRect(x: 540 - r, y: 960 - r, width: 2*r, height: 2*r))
        c.addPath(path); c.setFillColor(color(C_white)); c.fillPath(using: .evenOdd)
        if r > 4 { strokeCircle(540, 960, r, C_ink, 4, 0.45) }
    } else if t >= 19750 {
        fillRect(CGRect(x: 0, y: 0, width: 1080, height: 1920), C_white)
    }
    guard t >= 19450 else { return }
    let a = CGFloat(easeOutCubic(seg(t, 19450, 420)))
    let s = CGFloat(easeOutBack(seg(t, 19500, 520)))
    let side: CGFloat = 200 * max(0, s)
    if side > 2 { drawMark(x: 540 - side/2, y: 760 - side/2, side: side, a: a) }
    drawText("PriceVichar", x: 90, y: 920, w: 900, size: 92, hex: C_ink, align: .center, a: a)
    drawText("Search. Compare. Think. Buy better.", x: 90, y: 1044, w: 900, size: 40,
             hex: C_blue, align: .center, a: a * CGFloat(seg(t, 19700, 400)))
    let pp = CGFloat(easeOutBack(seg(t, 20000, 480)))
    if pp > 0.01 {
        let pw: CGFloat = 560
        fillRounded(CGRect(x: 540 - pw/2, y: 1180, width: pw, height: 110), 55, C_mint, a * min(1, pp))
        drawText("pricevichar.com", x: 540 - pw/2, y: 1210, w: pw, size: 44,
                 hex: C_white, align: .center, a: a * min(1, pp))
    }
}

func disclosure(_ t: Double) {
    let a = CGFloat(seg(t, 3100, 500)) * CGFloat(1 - easeInCubic(seg(t, 18900, 350)))
    guard a > 0.01 else { return }
    drawText("Prices checked 24 Aug 2026 on pricevichar.com · both stores verified",
             x: 70, y: 1760, w: 940, size: 24, hex: C_grey, bold: false, align: .center, a: a * 0.95)
    drawText("Prices & availability change — final price retailer par confirm karein",
             x: 70, y: 1800, w: 940, size: 24, hex: C_grey, bold: false, align: .center, a: a * 0.95)
}

func renderFrame(msTime: Double) -> CVPixelBuffer? {
    var buffer: CVPixelBuffer?
    let attrs: [CFString: Any] = [kCVPixelBufferCGImageCompatibilityKey: true,
                                  kCVPixelBufferCGBitmapContextCompatibilityKey: true]
    CVPixelBufferCreate(kCFAllocatorDefault, width, height, kCVPixelFormatType_32BGRA,
                        attrs as CFDictionary, &buffer)
    guard let pixel = buffer else { return nil }
    CVPixelBufferLockBaseAddress(pixel, [])
    defer { CVPixelBufferUnlockBaseAddress(pixel, []) }
    guard let base = CVPixelBufferGetBaseAddress(pixel) else { return nil }
    let cs = CGColorSpaceCreateDeviceRGB()
    guard let cg = CGContext(data: base, width: width, height: height, bitsPerComponent: 8,
                             bytesPerRow: CVPixelBufferGetBytesPerRow(pixel), space: cs,
                             bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue)
    else { return nil }
    cg.translateBy(x: 0, y: CGFloat(height)); cg.scaleBy(x: 1, y: -1)
    cg.setShouldAntialias(true)
    ctx = cg

    drawBackground(msTime)
    scene0(msTime)
    for i in 0..<deals.count { dealScene(msTime, i) }
    scene4(msTime)
    disclosure(msTime)
    scene5(msTime)
    return pixel
}

let writer = try AVAssetWriter(outputURL: outputURL, fileType: .mp4)
let settings: [String: Any] = [
    AVVideoCodecKey: AVVideoCodecType.h264,
    AVVideoWidthKey: width, AVVideoHeightKey: height,
    AVVideoCompressionPropertiesKey: [
        AVVideoAverageBitRateKey: 5_400_000,
        AVVideoProfileLevelKey: AVVideoProfileLevelH264MainAutoLevel
    ]
]
let input = AVAssetWriterInput(mediaType: .video, outputSettings: settings)
input.expectsMediaDataInRealTime = false
let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: nil)
guard writer.canAdd(input) else { fatalError("cannot add video input") }
writer.add(input)
writer.startWriting(); writer.startSession(atSourceTime: .zero)

let totalFrames = Int(totalMs / 1000.0 * Double(fps))
for frame in 0..<totalFrames {
    while !input.isReadyForMoreMediaData { Thread.sleep(forTimeInterval: 0.002) }
    if let pixel = renderFrame(msTime: Double(frame) / Double(fps) * 1000.0) {
        adaptor.append(pixel, withPresentationTime: CMTime(value: CMTimeValue(frame), timescale: fps))
    }
}
input.markAsFinished()
let sem = DispatchSemaphore(value: 0)
writer.finishWriting { sem.signal() }
sem.wait()
if writer.status != .completed { fatalError(writer.error?.localizedDescription ?? "render failed") }
print(outputURL.path)
