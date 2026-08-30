import Foundation
import AVFoundation
import CoreGraphics
import CoreText
import CoreVideo
import ImageIO

// PriceVichar — site introduction reel.
// Nobody knows the site yet, so this is a guided tour of what it actually does:
// search, compare, recorded price history, live deals, trending + guides, and
// the fact that it is free with no markup. Every label and number below is
// taken from the live site (checked 24 Aug 2026).

let width = 1080, height = 1920
let fps: Int32 = 30
let totalMs = 27600.0
let outputPath = CommandLine.arguments.count > 1
    ? CommandLine.arguments[1]
    : "marketing/assets/pricevichar-site-intro.mp4"
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
    // context is y-flipped for top-left coords, which also mirrors glyphs;
    // reflect locally around this rect so text draws upright in place
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
    c.translateBy(x: 0, y: r.midY * 2); c.scaleBy(x: 1, y: -1)
    c.draw(img, in: r)
    c.restoreGState()
}
func inr(_ v: Int) -> String {
    let s = String(v)
    guard s.count > 3 else { return s }
    let tail = String(s.suffix(3))
    var head = String(s.dropLast(3))
    var out = ""
    while head.count > 2 { out = "," + String(head.suffix(2)) + out; head = String(head.dropLast(2)) }
    return head + out + "," + tail
}

let imgBuds = loadImage("p-buds4pro.jpg")
let imgBoat = loadImage("p-boat.jpg")

// Live "Fresh deals right now" entries, read off the homepage 24 Aug 2026.
// Titles are shortened, never reworded. The first offer has no product photo
// on the site — it renders as a generated gradient tile, so that is what the
// reel shows too rather than inventing a picture for it.
struct FeedItem {
    let store: String, tag: String, tagIsPrice: Bool
    let title: String, sub: String
    let image: CGImage?
}
let feed = [
    FeedItem(store: "Flipkart", tag: "₹2,100", tagIsPrice: true,
             title: "HORLICKS Protein Powder", sub: "Launch Bonanza", image: nil),
    FeedItem(store: "Flipkart", tag: "Limited-time", tagIsPrice: false,
             title: "Samsung Galaxy Watch9", sub: "Lowest — ₹31,824 effectively",
             image: loadImage("feed-409.jpg")),
    FeedItem(store: "Flipkart", tag: "₹799", tagIsPrice: true,
             title: "BIGMUSCLES Pea Protein 1kg", sub: "Natural Unflavoured",
             image: loadImage("feed-408.jpg")),
]

/// The site's own placeholder tile for offers with no product photo.
func gradientTile(_ r: CGRect, a: CGFloat) {
    guard let c = ctx, a > 0.01 else { return }
    c.saveGState(); c.setAlpha(a)
    c.addPath(CGPath(roundedRect: r, cornerWidth: 22, cornerHeight: 22, transform: nil))
    c.clip()
    let cs = CGColorSpaceCreateDeviceRGB()
    if let g = CGGradient(colorsSpace: cs,
                          colors: [color(0x071B33), color(0x087F5B)] as CFArray,
                          locations: [0, 1]) {
        c.drawLinearGradient(g, start: CGPoint(x: r.minX, y: r.minY),
                             end: CGPoint(x: r.maxX, y: r.maxY), options: [])
    }
    fillCircle(r.maxX - 14, r.minY + 12, r.width * 0.42, 0x35D39A, 0.16)
    c.restoreGState()
}

// MARK: - shared pieces

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
    case 2:
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
    sm.move(to: P(-4.4, 172)); sm.addQuadCurve(to: P(4.4, 172), control: P(0, 167.5))
    c.addPath(sm); c.setStrokeColor(color(C_ink)); c.setLineWidth(2.8); c.setLineCap(.round); c.strokePath()
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

/// Step header: numbered chip + title, consistent across every feature beat.
func stepHeader(_ n: Int, _ title: String, _ sub: String, p: Double, a: CGFloat) {
    let e = CGFloat(easeOutCubic(clamp01(p)))
    guard e > 0.01 else { return }
    let s = CGFloat(clamp01(easeOutBack(clamp01(p))))
    fillCircle(150, 372, 42 * s, C_blue, a * e)
    drawText("\(n)", x: 108, y: 342, w: 84, size: 46, hex: C_white, align: .center, a: a * e)
    drawText(title, x: 214, y: 336, w: 780, size: 54, hex: C_ink, a: a * e)
    drawText(sub, x: 216, y: 400, w: 780, size: 30, hex: C_grey, bold: false, a: a * e)
}

func chip(_ x: CGFloat, _ y: CGFloat, _ label: String, size: CGFloat = 28,
          fill: UInt32 = 0xF4F7FF, ink: UInt32 = 0x07183F, a: CGFloat = 1) -> CGFloat {
    let w = CGFloat(label.count) * size * 0.55 + 52
    fillRounded(CGRect(x: x, y: y, width: w, height: size + 32), (size + 32)/2, fill, a)
    drawText(label, x: x + 26, y: y + 15, w: w, size: size, hex: ink, bold: false, a: a)
    return w + 16
}

// MARK: - scenes

func drawBackground(_ t: Double) {
    fillRect(CGRect(x: 0, y: 0, width: 1080, height: 1920), C_white)
    let w = clamp01(easeInOut(seg(t, 0, 300)) - easeInOut(seg(t, 2700, 400)))
    if w > 0.001 { fillRect(CGRect(x: 0, y: 0, width: 1080, height: 1920), C_soft, CGFloat(w)) }
}

// S0 — who we are
func scene0(_ t: Double) {
    guard t < 3400 else { return }
    let a = CGFloat(clamp01(seg(t, 80, 300)) * (1 - easeInCubic(seg(t, 3000, 380))))
    guard a > 0.01 else { return }
    let ms = CGFloat(easeOutBack(seg(t, 150, 520)))
    let side: CGFloat = 170 * max(0, ms)
    if side > 2 { drawMark(x: 540 - side/2, y: 420 - side/2, side: side, a: a) }
    drawText("PriceVichar", x: 90, y: 540, w: 900, size: 84, hex: C_ink, align: .center,
             a: a * CGFloat(easeOutCubic(seg(t, 500, 420))))
    drawText("India ka price comparison", x: 90, y: 648, w: 900, size: 42, hex: C_blue,
             align: .center, a: a * CGFloat(easeOutCubic(seg(t, 800, 420))))
    let cp = CGFloat(easeOutCubic(seg(t, 1150, 460)))
    if cp > 0.01 {
        var x: CGFloat = 168
        x += chip(x, 740, "1,394 products", a: a * cp)
        x += chip(x, 740, "Amazon + Flipkart", a: a * cp)
    }
    drawText("Roz price check hota hai. Site bilkul free hai.", x: 90, y: 856, w: 900, size: 34,
             hex: C_grey, bold: false, align: .center, a: a * CGFloat(easeOutCubic(seg(t, 1450, 440))))
    drawCharacter(cx: 540, feetY: 1620, h: 500, pose: 2,
                  a: a * CGFloat(easeOutCubic(seg(t, 1000, 500))), bob: CGFloat(sin(t/420.0) * 4))
    sparkles(t, in: CGRect(x: 80, y: 360, width: 920, height: 1200), phase: 0.3, hex: C_blue, a: a * 0.5)
}

// S1 — search
func scene1(_ t: Double) {
    guard t >= 3300 && t < 7500 else { return }
    let a = CGFloat(clamp01(seg(t, 3300, 300)) * (1 - easeInCubic(seg(t, 7050, 400))))
    guard a > 0.01 else { return }
    stepHeader(1, "Search karo", "Koi bhi product — ek search mein", p: seg(t, 3350, 420), a: a)

    let sp = CGFloat(easeOutCubic(seg(t, 3600, 460)))
    let sb = CGRect(x: 96, y: 540, width: 888, height: 110)
    fillRounded(sb, 55, C_white, a * sp); strokeRounded(sb, 55, C_line, 4, a * sp)
    strokeCircle(sb.minX + 62, sb.midY, 19, C_grey, 5, a * sp)
    strokePoly([CGPoint(x: sb.minX + 76, y: sb.midY + 15), CGPoint(x: sb.minX + 94, y: sb.midY + 33)], C_grey, 5, a * sp)
    let q = "Smartwatch"
    let n = Int(clamp01((t - 4000) / 700) * Double(q.count))
    drawText(String(q.prefix(max(0, n))), x: sb.minX + 116, y: sb.midY - 26, w: 600, size: 42,
             hex: C_ink, a: a * sp)

    let qp = CGFloat(easeOutCubic(seg(t, 4750, 420)))
    if qp > 0.01 {
        drawText("QUICK SEARCHES", x: 100, y: 690, w: 600, size: 24, hex: C_blue, a: a * qp, tracking: 2)
        var x: CGFloat = 96
        for lab in ["Earbuds", "Smartwatch", "Speakers", "Wired Earphones"] {
            x += chip(x, 730, lab, a: a * qp)
        }
    }
    let fp = CGFloat(easeOutCubic(seg(t, 5200, 440)))
    if fp > 0.01 {
        drawText("FILTER + SORT", x: 100, y: 850, w: 600, size: 24, hex: C_blue, a: a * fp, tracking: 2)
        var x: CGFloat = 96
        for lab in ["Under ₹1,000", "Under ₹5,000", "Above ₹20,000"] { x += chip(x, 890, lab, a: a * fp) }
        x = 96
        for lab in ["Amazon", "Flipkart", "Price: Low to High"] { x += chip(x, 990, lab, a: a * fp) }
    }
    let rp = CGFloat(easeOutBack(seg(t, 5750, 500)))
    if rp > 0.01 {
        let r = CGRect(x: 250, y: 1130, width: 580, height: 120)
        fillRounded(r, 34, C_mint, a * min(1, rp))
        drawText("1,394 products", x: r.minX, y: r.minY + 32, w: r.width, size: 52,
                 hex: C_white, align: .center, a: a * min(1, rp))
    }
    drawCharacter(cx: 540, feetY: 1640, h: 300, pose: 1,
                  a: a * CGFloat(easeOutCubic(seg(t, 6100, 420))), bob: CGFloat(sin(t/300.0) * 3))
}

// S2 — compare
func scene2(_ t: Double) {
    guard t >= 7350 && t < 12100 else { return }
    let a = CGFloat(clamp01(seg(t, 7350, 300)) * (1 - easeInCubic(seg(t, 11650, 400))))
    guard a > 0.01 else { return }
    stepHeader(2, "Compare karo", "Dono store ka daam, side by side", p: seg(t, 7400, 420), a: a)

    let ip = CGFloat(easeOutCubic(seg(t, 7650, 450)))
    let ib = CGRect(x: 96, y: 520, width: 260, height: 260)
    fillRounded(ib, 28, C_soft, a * ip)
    if let img = imgBuds { drawImageFit(img, in: ib, corner: 28, a: a * ip) }
    strokeRounded(ib, 28, C_line, 3, a * ip)
    drawText("Samsung Galaxy", x: 392, y: 540, w: 600, size: 44, hex: C_ink, a: a * ip)
    drawText("Buds4 Pro", x: 392, y: 596, w: 600, size: 44, hex: C_ink, a: a * ip)
    drawText("4.6 ★", x: 392, y: 668, w: 600, size: 30, hex: C_amber, a: a * ip)

    let rows: [(String, Int, Bool, Double)] = [
        ("Amazon", 20999, true, 8050), ("Flipkart", 22999, false, 8300),
    ]
    for (i, row) in rows.enumerated() {
        let p = CGFloat(easeOutCubic(seg(t, row.3, 480)))
        guard p > 0.01 else { continue }
        let y: CGFloat = 840 + CGFloat(i) * 158
        let r = CGRect(x: 96, y: y, width: 888, height: 136)
        fillRounded(r, 30, C_white, a * p)
        strokeRounded(r, 30, row.2 ? C_mint : C_line, row.2 ? 6 : 3, a * p)
        drawText(row.0.uppercased(), x: r.minX + 40, y: r.minY + 26, w: 320, size: 27,
                 hex: C_grey, a: a * p, tracking: 2)
        let shown = Int(Double(row.1) * easeOutCubic(seg(t, row.3 + 120, 700)))
        drawText("₹" + inr(shown), x: r.minX + 40, y: r.minY + 62, w: 420, size: 56,
                 hex: row.2 ? C_mint : C_ink, a: a * p)
        if row.2 {
            fillRounded(CGRect(x: r.maxX - 246, y: r.minY + 42, width: 202, height: 52), 26, C_mint, a * p)
            drawText("BEST PRICE", x: r.maxX - 246, y: r.minY + 54, w: 202, size: 26,
                     hex: C_white, align: .center, a: a * p, tracking: 1)
        }
    }
    let sp = CGFloat(easeOutBack(seg(t, 9400, 560)))
    if sp > 0.01 {
        let r = CGRect(x: 180, y: 1200, width: 720, height: 150)
        fillRounded(r, 42, C_ink, a * min(1, sp))
        drawText("₹2,000 bachao", x: r.minX, y: r.minY + 40, w: r.width, size: 60,
                 hex: C_white, align: .center, a: a * min(1, sp))
    }
    drawText("Site khud batati hai kaunsa store sasta hai", x: 90, y: 1420, w: 900, size: 32,
             hex: C_grey, bold: false, align: .center,
             a: a * CGFloat(easeOutCubic(seg(t, 10100, 420))))
}

// S3 — recorded price history
func scene3(_ t: Double) {
    guard t >= 11950 && t < 16300 else { return }
    let a = CGFloat(clamp01(seg(t, 11950, 300)) * (1 - easeInCubic(seg(t, 15850, 400))))
    guard a > 0.01 else { return }
    stepHeader(3, "Price history dekho", "Daam pehle kya tha, abhi kya hai", p: seg(t, 12000, 420), a: a)

    let ip = CGFloat(easeOutCubic(seg(t, 12250, 450)))
    let ib = CGRect(x: 96, y: 520, width: 230, height: 230)
    fillRounded(ib, 28, C_soft, a * ip)
    if let img = imgBoat { drawImageFit(img, in: ib, corner: 28, a: a * ip) }
    strokeRounded(ib, 28, C_line, 3, a * ip)
    drawText("Boat Nirvana Ion", x: 360, y: 540, w: 620, size: 42, hex: C_ink, a: a * ip)
    drawText("32dB ANC · 120 hrs", x: 360, y: 596, w: 620, size: 28, hex: C_grey, bold: false, a: a * ip)
    drawText("4.2 ★ (1,48,499)", x: 360, y: 646, w: 620, size: 28, hex: C_amber, a: a * ip)

    // flat line chart — the real story for this product
    let cp = CGFloat(easeOutCubic(seg(t, 12700, 700)))
    if cp > 0.01 {
        let box = CGRect(x: 96, y: 800, width: 888, height: 300)
        fillRounded(box, 34, C_soft, a * cp)
        drawText("32 CHECKS · 24 JUL → 24 AUG", x: 136, y: 836, w: 700, size: 26,
                 hex: C_blue, a: a * cp, tracking: 2)
        let y0: CGFloat = 990
        let x0: CGFloat = 150, x1: CGFloat = 930
        let xr = x0 + (x1 - x0) * cp
        strokePoly([CGPoint(x: x0, y: y0), CGPoint(x: xr, y: y0)], C_mint, 8, a)
        for k in 0...4 {
            let px = x0 + (x1 - x0) * CGFloat(k) / 4
            if px <= xr { fillCircle(px, y0, 10, C_mint, a) }
        }
        drawText("₹2,099", x: 136, y: 1024, w: 300, size: 34, hex: C_ink, a: a * cp)
        drawText("₹2,099", x: 700, y: 1024, w: 240, size: 34, hex: C_ink, align: .right, a: a * cp)
    }
    let mp = CGFloat(easeOutBack(seg(t, 13700, 560)))
    if mp > 0.01 {
        let r = CGRect(x: 150, y: 1170, width: 780, height: 150)
        fillRounded(r, 42, C_mint, a * min(1, mp))
        drawText("Ek mahine se daam wahi", x: r.minX, y: r.minY + 42, w: r.width, size: 50,
                 hex: C_white, align: .center, a: a * min(1, mp))
    }
    drawText("Toh rukne ka fayda nahi — abhi le sakte ho", x: 90, y: 1390, w: 900, size: 32,
             hex: C_grey, bold: false, align: .center,
             a: a * CGFloat(easeOutCubic(seg(t, 14400, 420))))
}

// S4 — live deals
func scene4(_ t: Double) {
    guard t >= 16150 && t < 19700 else { return }
    let a = CGFloat(clamp01(seg(t, 16150, 300)) * (1 - easeInCubic(seg(t, 19250, 400))))
    guard a > 0.01 else { return }
    stepHeader(4, "Live deals", "Deal channel se seedha, apne aap", p: seg(t, 16200, 420), a: a)

    // the actual offers sitting on the homepage feed right now
    for (i, item) in feed.enumerated() {
        let p = CGFloat(easeOutCubic(seg(t, 16500 + Double(i) * 220, 460)))
        guard p > 0.01 else { continue }
        let r = CGRect(x: 96, y: 540 + CGFloat(i) * 178, width: 888, height: 158)
        fillRounded(r, 30, C_white, a * p); strokeRounded(r, 30, C_line, 3, a * p)
        let thumb = CGRect(x: r.minX + 22, y: r.minY + 22, width: 114, height: 114)
        if let img = item.image {
            drawImageFit(img, in: thumb, corner: 22, a: a * p)
            strokeRounded(thumb, 22, C_line, 2, a * p)
        } else {
            gradientTile(thumb, a: a * p)
        }
        drawText(item.store, x: r.minX + 162, y: r.minY + 24, w: 300, size: 25,
                 hex: C_grey, a: a * p)
        drawText(item.title, x: r.minX + 162, y: r.minY + 60, w: 500, size: 33,
                 hex: C_ink, a: a * p)
        drawText(item.sub, x: r.minX + 162, y: r.minY + 104, w: 500, size: 25,
                 hex: C_grey, bold: false, a: a * p)
        let tw: CGFloat = item.tagIsPrice ? 128 : 176
        fillRounded(CGRect(x: r.maxX - tw - 30, y: r.minY + 54, width: tw, height: 50), 25,
                    item.tagIsPrice ? C_mint : C_amber, a * p)
        drawText(item.tag, x: r.maxX - tw - 30, y: r.minY + 66, w: tw, size: 25,
                 hex: C_white, align: .center, a: a * p)
    }
    let cp = CGFloat(easeOutBack(seg(t, 17400, 520)))
    if cp > 0.01 {
        var x: CGFloat = 130
        x += chip(x, 1128, "Har 30 min refresh", size: 30, fill: 0xE8F7EF, ink: 0x0B6B43, a: a * min(1, cp))
        x += chip(x, 1128, "Partner links", size: 30, fill: 0xE8F7EF, ink: 0x0B6B43, a: a * min(1, cp))
    }
    drawText("Final price hamesha store par confirm karein", x: 90, y: 1268, w: 900, size: 30,
             hex: C_grey, bold: false, align: .center,
             a: a * CGFloat(easeOutCubic(seg(t, 17900, 420))))
    drawCharacter(cx: 540, feetY: 1690, h: 270, pose: 1,
                  a: a * CGFloat(easeOutCubic(seg(t, 18100, 420))), bob: CGFloat(sin(t/300.0) * 3))
}

// S5 — trending + guides
func scene5(_ t: Double) {
    guard t >= 19550 && t < 23100 else { return }
    let a = CGFloat(clamp01(seg(t, 19550, 300)) * (1 - easeInCubic(seg(t, 22650, 400))))
    guard a > 0.01 else { return }
    stepHeader(5, "Trending + guides", "Kya chal raha hai, kya lena chahiye", p: seg(t, 19600, 420), a: a)

    for i in 0..<3 {
        let p = CGFloat(easeOutCubic(seg(t, 19900 + Double(i) * 200, 440)))
        guard p > 0.01 else { continue }
        let r = CGRect(x: 96, y: 530 + CGFloat(i) * 128, width: 888, height: 108)
        fillRounded(r, 26, C_soft, a * p)
        fillCircle(r.minX + 62, r.midY, 30, C_blue, a * p)
        drawText("#\(i + 1)", x: r.minX + 26, y: r.midY - 20, w: 72, size: 30,
                 hex: C_white, align: .center, a: a * p)
        drawText(["Samsung Buds", "Smartwatch", "Wired Earphones"][i],
                 x: r.minX + 118, y: r.midY - 22, w: 500, size: 34, hex: C_ink, a: a * p)
        drawText("Trend score", x: r.maxX - 260, y: r.midY - 18, w: 220, size: 26,
                 hex: C_grey, align: .right, a: a * p)
    }
    drawText("Ranking: 70% Flipkart signals + 30% site activity",
             x: 96, y: 930, w: 888, size: 26, hex: C_grey, bold: false,
             a: a * CGFloat(easeOutCubic(seg(t, 20700, 420))))

    let gp = CGFloat(easeOutCubic(seg(t, 21050, 460)))
    if gp > 0.01 {
        drawText("BUYING GUIDES", x: 100, y: 1010, w: 600, size: 26, hex: C_blue, a: a * gp, tracking: 2)
        var x: CGFloat = 96
        for lab in ["Earbuds under ₹2,000", "Smartwatch under ₹5,000"] { x += chip(x, 1060, lab, a: a * gp) }
        x = 96
        for lab in ["Phones under ₹20,000", "Laptops under ₹50,000"] { x += chip(x, 1160, lab, a: a * gp) }
    }
    let sp = CGFloat(easeOutCubic(seg(t, 21700, 440)))
    if sp > 0.01 {
        var x: CGFloat = 168
        x += chip(x, 1290, "♡ Save & track", size: 30, a: a * sp)
        x += chip(x, 1290, "Share on WhatsApp", size: 30, a: a * sp)
    }
}

// S6 — free, no markup
func scene6(_ t: Double) {
    guard t >= 22950 && t < 25600 else { return }
    let a = CGFloat(clamp01(seg(t, 22950, 300)) * (1 - easeInCubic(seg(t, 25200, 380))))
    guard a > 0.01 else { return }
    drawText("Bilkul free.", x: 90, y: 560, w: 900, size: 78, hex: C_ink, align: .center,
             a: a * CGFloat(easeOutCubic(seg(t, 23000, 420))))
    drawText("Koi markup nahi.", x: 90, y: 664, w: 900, size: 78, hex: C_mint, align: .center,
             a: a * CGFloat(easeOutCubic(seg(t, 23250, 420))))
    drawText("Aap store ka hi price dete ho. Site partner commission se chalti hai.",
             x: 120, y: 820, w: 840, size: 34, hex: C_grey, bold: false, align: .center,
             a: a * CGFloat(easeOutCubic(seg(t, 23650, 440))), lines: 2)
    drawCharacter(cx: 540, feetY: 1560, h: 420, pose: 1,
                  a: a * CGFloat(easeOutCubic(seg(t, 23900, 450))), bob: CGFloat(sin(t/300.0) * 4))
    sparkles(t, in: CGRect(x: 80, y: 520, width: 920, height: 1000), phase: 3.1, hex: C_mint, a: a * 0.5)
}

// S7 — outro
func scene7(_ t: Double) {
    guard let c = ctx else { return }
    if t >= 25000 && t < 25750 {
        let p = easeInOut(seg(t, 25000, 680))
        let r = CGFloat(lerp(1250, 0, p))
        let path = CGMutablePath()
        path.addRect(CGRect(x: 0, y: 0, width: 1080, height: 1920))
        path.addEllipse(in: CGRect(x: 540 - r, y: 960 - r, width: 2*r, height: 2*r))
        c.addPath(path); c.setFillColor(color(C_white)); c.fillPath(using: .evenOdd)
        if r > 4 { strokeCircle(540, 960, r, C_ink, 4, 0.45) }
    } else if t >= 25750 {
        fillRect(CGRect(x: 0, y: 0, width: 1080, height: 1920), C_white)
    }
    guard t >= 25450 else { return }
    let a = CGFloat(easeOutCubic(seg(t, 25450, 420)))
    let s = CGFloat(easeOutBack(seg(t, 25500, 520)))
    let side: CGFloat = 200 * max(0, s)
    if side > 2 { drawMark(x: 540 - side/2, y: 720 - side/2, side: side, a: a) }
    drawText("PriceVichar", x: 90, y: 880, w: 900, size: 92, hex: C_ink, align: .center, a: a)
    drawText("Search. Compare. Think. Buy better.", x: 90, y: 1004, w: 900, size: 40,
             hex: C_blue, align: .center, a: a * CGFloat(seg(t, 25700, 400)))
    let pp = CGFloat(easeOutBack(seg(t, 26000, 480)))
    if pp > 0.01 {
        let pw: CGFloat = 560
        fillRounded(CGRect(x: 540 - pw/2, y: 1140, width: pw, height: 110), 55, C_mint, a * min(1, pp))
        drawText("pricevichar.com", x: 540 - pw/2, y: 1170, w: pw, size: 44,
                 hex: C_white, align: .center, a: a * min(1, pp))
    }
    drawText("Abhi jaake dekho — free hai", x: 90, y: 1300, w: 900, size: 34,
             hex: C_grey, bold: false, align: .center, a: a * CGFloat(seg(t, 26300, 400)))
}

func disclosure(_ t: Double) {
    let a = CGFloat(seg(t, 3400, 500)) * CGFloat(1 - easeInCubic(seg(t, 24900, 350)))
    guard a > 0.01 else { return }
    drawText("Prices & features checked 24 Aug 2026 · partner links used",
             x: 70, y: 1770, w: 940, size: 24, hex: C_grey, bold: false, align: .center, a: a * 0.95)
    drawText("Prices & availability change — final price retailer par confirm karein",
             x: 70, y: 1810, w: 940, size: 24, hex: C_grey, bold: false, align: .center, a: a * 0.95)
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
    scene0(msTime); scene1(msTime); scene2(msTime); scene3(msTime)
    scene4(msTime); scene5(msTime); scene6(msTime)
    disclosure(msTime)
    scene7(msTime)
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
