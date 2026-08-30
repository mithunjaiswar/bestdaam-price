import Foundation
import AVFoundation
import CoreGraphics
import CoreText
import CoreVideo
import ImageIO

// PriceVichar — "deal journey" reel.
// Beats requested by Mithun: phone call -> Chrome -> search "pricevichar"
// -> scroll to deals -> tap the first offer -> go buy -> slogan.
// Style continues the flat line-art motion-graphics system.

let width = 1080, height = 1920
let fps: Int32 = 30
let totalMs = 18600.0
let outputPath = CommandLine.arguments.count > 1
    ? CommandLine.arguments[1]
    : "marketing/assets/pricevichar-deal-journey.mp4"
let outputURL = URL(fileURLWithPath: outputPath)
try? FileManager.default.removeItem(at: outputURL)

func color(_ hex: UInt32, _ a: CGFloat = 1) -> CGColor {
    CGColor(red: CGFloat((hex >> 16) & 255)/255, green: CGFloat((hex >> 8) & 255)/255,
            blue: CGFloat(hex & 255)/255, alpha: a)
}
// brand palette (BRAND_GUIDE.md)
let C_white: UInt32 = 0xFFFFFF
let C_ink: UInt32   = 0x07183F   // deep navy — every outline
let C_blue: UInt32  = 0x1769E8   // royal blue
let C_mint: UInt32  = 0x14B86A   // trust emerald
let C_soft: UInt32  = 0xF4F7FF   // soft blue-gray
let C_line: UInt32  = 0xD9E2F7
let C_grey: UInt32  = 0x7F8AA6
let C_amber: UInt32 = 0xF59E0B
// character palette — warmer than the flat navy silhouette
let C_skin: UInt32   = 0xF3C9A2
let C_skinSh: UInt32 = 0xE0AF85
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
func fillPoly(_ pts: [CGPoint], _ hex: UInt32, _ a: CGFloat = 1) {
    guard let c = ctx, a > 0.004 else { return }
    let p = CGMutablePath(); p.move(to: pts[0])
    for q in pts.dropFirst() { p.addLine(to: q) }
    p.closeSubpath(); c.addPath(p); c.setFillColor(color(hex, a)); c.fillPath()
}
/// Outlined limb — white body with a navy contour.
func tube(_ pts: [CGPoint], _ thickness: CGFloat, _ a: CGFloat = 1) {
    strokePoly(pts, C_ink, thickness + 6, a)
    strokePoly(pts, C_white, thickness, a)
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

// MARK: - verified content (pricevichar.com homepage, checked 24 Aug 2026)

// Only the Galaxy Watch9 offer has a product photo that actually matches its
// title in the live feed — the other cards' images are wrong/duplicated on the
// site right now, so those cards are rendered without a photo rather than
// showing a picture of the wrong product.
let dealTitle1 = "Samsung Galaxy Watch9"
let dealSub1   = "Lowest — ₹31,824 effectively"
let dealTag1   = "Limited-time"
let dealStore1 = "Flipkart"
let dealTitle2 = "BIGMUSCLES Pea Protein 1kg"
let dealTag2   = "₹799"
let dealTitle3 = "MUSCLEBLAZE Biozyme Whey 2kg"
let dealTag3   = "₹7,299"

func loadImage(_ name: String) -> CGImage? {
    let url = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
        .appendingPathComponent("marketing/assets/\(name)")
    guard let src = CGImageSourceCreateWithURL(url as CFURL, nil) else { return nil }
    return CGImageSourceCreateImageAtIndex(src, 0, nil)
}
let productImage = loadImage("deal-galaxy-watch9.jpg")

/// Draws an image contained inside `rect`, clipped to a rounded tile.
/// The frame context is y-flipped, which mirrors bitmaps, so the image is
/// reflected locally around its own centre to land upright and in place.
func drawImageFit(_ img: CGImage, in rect: CGRect, corner: CGFloat, a: CGFloat) {
    guard let c = ctx, a > 0.01 else { return }
    c.saveGState()
    c.setAlpha(a)
    c.addPath(CGPath(roundedRect: rect, cornerWidth: corner, cornerHeight: corner, transform: nil))
    c.clip()
    c.setFillColor(color(C_white)); c.fill(rect)
    let iw = CGFloat(img.width), ih = CGFloat(img.height)
    let s = min(rect.width / iw, rect.height / ih)
    let w = iw * s, h = ih * s
    let r = CGRect(x: rect.midX - w/2, y: rect.midY - h/2, width: w, height: h)
    c.translateBy(x: 0, y: r.midY * 2)
    c.scaleBy(x: 1, y: -1)
    c.draw(img, in: r)
    c.restoreGState()
}

// MARK: - illustration pieces

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

/// Colour-filled limb with a navy contour.
func tubeC(_ pts: [CGPoint], _ thickness: CGFloat, _ fill: UInt32) {
    strokePoly(pts, C_ink, thickness + 5, 1)
    strokePoly(pts, fill, thickness, 1)
}

/// Stylised woman — warmer proportions, long hair, a face.
/// Origin = feet centre, `h` = total height (head is ~1/7 of it).
/// pose 0 = idle, 1 = hands on hips, 2 = phone to ear, 3 = arm out.
func drawCharacter(cx: CGFloat, feetY: CGFloat, h: CGFloat, pose: Int, a: CGFloat, bob: CGFloat = 0) {
    guard let c = ctx, a > 0.01 else { return }
    let u = h / 200.0
    func P(_ dx: Double, _ up: Double) -> CGPoint {
        CGPoint(x: cx + CGFloat(dx)*u, y: feetY - CGFloat(up)*u + bob)
    }
    c.saveGState(); c.setAlpha(a)

    let headC = P(0, 178), headR = 15.5*u

    // hair, back layer — falls behind the shoulders
    let hb = CGMutablePath()
    hb.move(to: P(-16, 190))
    hb.addCurve(to: P(-22, 128), control1: P(-26, 168), control2: P(-25, 146))
    hb.addCurve(to: P(-13, 120), control1: P(-20, 122), control2: P(-17, 120))
    hb.addLine(to: P(13, 120))
    hb.addCurve(to: P(22, 128), control1: P(17, 120), control2: P(20, 122))
    hb.addCurve(to: P(16, 190), control1: P(25, 146), control2: P(26, 168))
    hb.closeSubpath()
    c.addPath(hb); c.setFillColor(color(C_hair)); c.fillPath()

    // legs + shoes (kept separate so they don't merge into one blob)
    tubeC([P(-7, 92), P(-9, 54), P(-9, 14)], 9.5*u, C_skin)
    tubeC([P( 7, 92), P( 9, 54), P( 9, 14)], 9.5*u, C_skin)
    fillRounded(CGRect(x: P(-18, 14).x, y: P(0, 14).y, width: 17*u, height: 10*u), 5*u, C_ink, 1)
    fillRounded(CGRect(x: P(  1, 14).x, y: P(0, 14).y, width: 17*u, height: 10*u), 5*u, C_ink, 1)

    // A-line skirt
    let skirt = CGMutablePath()
    skirt.move(to: P(-14, 112)); skirt.addLine(to: P(14, 112))
    skirt.addCurve(to: P(26, 78), control1: P(20, 100), control2: P(24, 88))
    skirt.addQuadCurve(to: P(-26, 78), control: P(0, 72))
    skirt.addCurve(to: P(-14, 112), control1: P(-24, 88), control2: P(-20, 100))
    skirt.closeSubpath()
    c.addPath(skirt); c.setFillColor(color(C_ink)); c.fillPath()
    c.addPath(skirt); c.setStrokeColor(color(C_ink)); c.setLineWidth(4); c.strokePath()

    // blouse
    let top = CGMutablePath()
    top.move(to: P(-19, 152))
    top.addQuadCurve(to: P(-15, 112), control: P(-22, 130))
    top.addLine(to: P(15, 112))
    top.addQuadCurve(to: P(19, 152), control: P(22, 130))
    top.addQuadCurve(to: P(0, 158), control: P(0, 156))
    top.closeSubpath()
    c.addPath(top); c.setFillColor(color(C_blouse)); c.fillPath()
    c.addPath(top); c.setStrokeColor(color(C_ink)); c.setLineWidth(4); c.strokePath()

    // arms
    switch pose {
    case 1:
        tubeC([P(-18, 150), P(-33, 126), P(-14, 111)], 7*u, C_skin)
        tubeC([P( 18, 150), P( 33, 126), P( 14, 111)], 7*u, C_skin)
    case 2:
        tubeC([P(-17, 149), P(-27, 124), P(-23, 104)], 7*u, C_skin)
        tubeC([P( 18, 150), P( 33, 160), P( 22, 174)], 7*u, C_skin)
    case 3:
        tubeC([P(-17, 149), P(-27, 124), P(-23, 104)], 7*u, C_skin)
        tubeC([P( 18, 151), P( 38, 154), P( 58, 150)], 7*u, C_skin)
    default:
        tubeC([P(-17, 149), P(-28, 126), P(-22, 106)], 7*u, C_skin)
        tubeC([P( 17, 149), P( 28, 126), P( 34, 108)], 7*u, C_skin)
    }

    // neck + face
    tubeC([P(0, 162), P(0, 154)], 7.5*u, C_skin)
    fillCircle(headC.x, headC.y, headR, C_skin)
    strokeCircle(headC.x, headC.y, headR, C_ink, 4)

    // Side-swept fringe across the TOP of the head only. Built from explicit
    // curves rather than addArc: the context is y-flipped, which inverts arc
    // sweep direction and would drop the fringe over her face.
    let fr = CGMutablePath()
    fr.move(to: P(-15.5, 178))
    fr.addQuadCurve(to: P(0, 194), control: P(-15.5, 190))
    fr.addQuadCurve(to: P(15.5, 178), control: P(15.5, 190))
    fr.addQuadCurve(to: P(3, 185), control: P(13, 183))
    fr.addQuadCurve(to: P(-15.5, 178), control: P(-9, 190))
    fr.closeSubpath()
    c.addPath(fr); c.setFillColor(color(C_hair)); c.fillPath()

    // eyes, smile, blush — all below the fringe line
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

/// Phone held to the ear, with ring arcs radiating from it.
func drawPhoneAtEar(cx: CGFloat, feetY: CGFloat, h: CGFloat, ring: Double, a: CGFloat, bob: CGFloat = 0) {
    guard let c = ctx, a > 0.01 else { return }
    let u = h / 200.0
    let px = cx + 24*u, py = feetY - 176*u + bob
    let ph = CGRect(x: px - 10*u, y: py - 19*u, width: 20*u, height: 38*u)
    fillRounded(ph, 5.5*u, C_ink, a)
    fillRounded(ph.insetBy(dx: 2.6*u, dy: 4*u), 3*u, C_soft, a)
    for k in 0..<3 {
        let phase = (ring + Double(k) * 0.33).truncatingRemainder(dividingBy: 1.0)
        let rr = CGFloat(lerp(14, 46, phase)) * u
        let aa = a * CGFloat(1 - phase) * 0.9
        c.saveGState(); c.setLineCap(.round)
        let p = CGMutablePath()
        p.addArc(center: CGPoint(x: px + 12*u, y: py), radius: rr,
                 startAngle: -0.7, endAngle: 0.7, clockwise: false)
        c.addPath(p); c.setStrokeColor(color(C_blue, aa)); c.setLineWidth(4); c.strokePath()
        c.restoreGState()
    }
}

/// Rounded speech bubble with a tail on the lower-left.
func speechBubble(_ r: CGRect, a: CGFloat) {
    fillRounded(r, 34, C_white, a)
    strokeRounded(r, 34, C_ink, 5, a)
    fillPoly([CGPoint(x: r.minX + 54, y: r.maxY - 4),
              CGPoint(x: r.minX + 116, y: r.maxY - 4),
              CGPoint(x: r.minX + 46, y: r.maxY + 46)], C_white, a)
    strokePoly([CGPoint(x: r.minX + 56, y: r.maxY - 2),
                CGPoint(x: r.minX + 46, y: r.maxY + 46),
                CGPoint(x: r.minX + 114, y: r.maxY - 2)], C_ink, 5, a)
}

/// A hand tapping the screen from below — index finger up, palm underneath.
/// Drawn as ONE outlined silhouette so no internal contours show through,
/// and kept small enough that it never blankets the cards behind it.
func drawTapHand(progress: Double, tipX: CGFloat, tipY: CGFloat, s: CGFloat, a: CGFloat) {
    guard let c = ctx, a > 0.01 else { return }
    let p = CGFloat(easeOutCubic(clamp01(progress)))
    let ty = tipY + (1 - p) * 620          // slides up from off-frame
    c.saveGState(); c.setAlpha(a)
    func Q(_ x: CGFloat, _ y: CGFloat) -> CGPoint { CGPoint(x: tipX + x*s, y: ty + y*s) }

    let hand = CGMutablePath()
    hand.move(to: Q(-22, 8))
    hand.addArc(center: Q(0, 8), radius: 22*s, startAngle: .pi, endAngle: 0, clockwise: true)
    hand.addLine(to: Q(22, 108))
    hand.addCurve(to: Q(62, 150), control1: Q(24, 130), control2: Q(45, 140))
    hand.addCurve(to: Q(72, 235), control1: Q(72, 175), control2: Q(74, 205))
    hand.addCurve(to: Q(10, 275), control1: Q(70, 262), control2: Q(45, 275))
    hand.addCurve(to: Q(-52, 250), control1: Q(-20, 275), control2: Q(-42, 272))
    hand.addCurve(to: Q(-86, 196), control1: Q(-62, 232), control2: Q(-84, 220))  // thumb
    hand.addCurve(to: Q(-58, 178), control1: Q(-88, 182), control2: Q(-72, 172))
    hand.addCurve(to: Q(-30, 150), control1: Q(-48, 182), control2: Q(-38, 166))
    hand.addCurve(to: Q(-22, 108), control1: Q(-25, 138), control2: Q(-22, 124))
    hand.closeSubpath()
    c.addPath(hand); c.setFillColor(color(C_white)); c.fillPath()
    c.addPath(hand); c.setStrokeColor(color(C_ink)); c.setLineWidth(5); c.setLineJoin(.round); c.strokePath()

    // curled fingers read as two creases on the knuckle side
    strokePoly([Q(30, 172), Q(58, 176)], C_ink, 4)
    strokePoly([Q(32, 208), Q(60, 212)], C_ink, 4)
    c.restoreGState()
}

/// Expanding ring at the point of contact.
func tapRipple(_ x: CGFloat, _ y: CGFloat, progress: Double, a: CGFloat) {
    guard progress > 0, progress < 1, a > 0.01 else { return }
    let p = easeOutCubic(progress)
    strokeCircle(x, y, CGFloat(lerp(10, 78, p)), C_mint, 5, a * CGFloat(1 - p))
}

func wireBar(_ x: CGFloat, _ y: CGFloat, _ w: CGFloat, _ h: CGFloat, _ hex: UInt32, _ a: CGFloat) {
    fillRounded(CGRect(x: x, y: y, width: w, height: h), h/2, hex, a)
}

/// The brand mark, traced from public/pricevichar-icon.svg (64×64 viewBox).
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

// MARK: - the simulated site page (drawn inside a clipped viewport)

/// One offer card from the "Fresh deals right now" strip.
func dealCard(_ r: CGRect, store: String, tag: String, tagIsPrice: Bool,
              title: String, sub: String, img: CGImage?, highlight: Bool, a: CGFloat) {
    guard a > 0.01 else { return }
    fillRounded(r, 26, C_white, a)
    strokeRounded(r, 26, highlight ? C_mint : C_line, highlight ? 6 : 3, a)
    let thumb = CGRect(x: r.minX + 22, y: r.minY + 22, width: r.width - 44, height: 136)
    if let img = img {
        drawImageFit(img, in: thumb, corner: 16, a: a)
        strokeRounded(thumb, 16, C_line, 2, a)
    } else {
        // no trustworthy photo for this offer — neutral brand tile instead
        fillRounded(thumb, 16, C_soft, a)
        drawMark(x: thumb.midX - 26, y: thumb.midY - 26, side: 52, a: a * 0.5)
    }
    drawText(store, x: r.minX + 24, y: r.minY + 172, w: 200, size: 24, hex: C_grey, a: a)
    let tw: CGFloat = tagIsPrice ? 118 : 158
    fillRounded(CGRect(x: r.maxX - tw - 24, y: r.minY + 166, width: tw, height: 40), 20,
                tagIsPrice ? C_mint : C_amber, a)
    drawText(tag, x: r.maxX - tw - 24, y: r.minY + 175, w: tw, size: 23,
             hex: C_white, align: .center, a: a)
    drawText(title, x: r.minX + 24, y: r.minY + 214, w: r.width - 48, size: 25, hex: C_ink, a: a, lines: 2)
    drawText(sub, x: r.minX + 24, y: r.minY + 288, w: r.width - 48, size: 22, hex: C_grey, bold: false, a: a)
    drawText("Check offer ↗", x: r.minX + 24, y: r.maxY - 48, w: 260, size: 25, hex: C_blue, a: a)
}

/// Draws the scrollable page. `scroll` shifts content up; `build` staggers reveals.
func sitePage(_ vp: CGRect, scroll: CGFloat, t: Double, a: CGFloat, highlightFirst: Bool) {
    guard let c = ctx, a > 0.01 else { return }
    c.saveGState()
    c.addPath(CGPath(roundedRect: vp, cornerWidth: 22, cornerHeight: 22, transform: nil)); c.clip()
    c.setAlpha(a)
    fillRect(vp, C_white)

    let ox = vp.minX, oy = vp.minY - scroll

    // sticky-ish header
    fillRect(CGRect(x: ox, y: oy, width: vp.width, height: 74), C_white)
    drawMark(x: ox + 26, y: oy + 16, side: 42)
    drawText("Price", x: ox + 78, y: oy + 24, w: 120, size: 30, hex: C_ink)
    drawText("Vichar", x: ox + 158, y: oy + 24, w: 140, size: 30, hex: C_blue)
    wireBar(ox + vp.width - 190, oy + 34, 70, 12, C_line, 1)
    wireBar(ox + vp.width - 106, oy + 34, 80, 12, C_line, 1)
    strokePoly([CGPoint(x: ox, y: oy + 74), CGPoint(x: ox + vp.width, y: oy + 74)], C_line, 3)

    // hero
    drawText("Search. Compare.", x: ox + 26, y: oy + 108, w: vp.width - 52, size: 40, hex: C_ink)
    drawText("Think. Buy better.", x: ox + 26, y: oy + 156, w: vp.width - 52, size: 40, hex: C_ink)
    let sb = CGRect(x: ox + 26, y: oy + 218, width: vp.width - 52, height: 64)
    fillRounded(sb, 32, C_soft, 1); strokeRounded(sb, 32, C_line, 3)
    strokeCircle(sb.minX + 40, sb.midY, 13, C_grey, 4)
    strokePoly([CGPoint(x: sb.minX + 50, y: sb.midY + 10), CGPoint(x: sb.minX + 62, y: sb.midY + 21)], C_grey, 4)
    drawText("Search any product…", x: sb.minX + 78, y: sb.midY - 17, w: 340, size: 27, hex: C_grey, bold: false)

    // "Fresh deals right now"
    drawText("AUTO-UPDATED OFFERS", x: ox + 26, y: oy + 330, w: 420, size: 21, hex: C_blue, tracking: 2)
    drawText("Fresh deals right now", x: ox + 26, y: oy + 364, w: vp.width - 52, size: 42, hex: C_ink)
    drawText("Converted partner links. Always verify the final price.",
             x: ox + 26, y: oy + 422, w: vp.width - 52, size: 24, hex: C_grey, bold: false)

    let cardY = oy + 470
    let cw: CGFloat = 300, gap: CGFloat = 20, chH: CGFloat = 380
    dealCard(CGRect(x: ox + 26, y: cardY, width: cw, height: chH),
             store: dealStore1, tag: dealTag1, tagIsPrice: false,
             title: dealTitle1, sub: dealSub1, img: productImage,
             highlight: highlightFirst, a: 1)
    dealCard(CGRect(x: ox + 26 + cw + gap, y: cardY, width: cw, height: chH),
             store: "Flipkart", tag: dealTag2, tagIsPrice: true,
             title: dealTitle2, sub: "Natural Unflavoured", img: nil,
             highlight: false, a: 1)
    dealCard(CGRect(x: ox + 26 + 2*(cw + gap), y: cardY, width: cw, height: chH),
             store: "Flipkart", tag: dealTag3, tagIsPrice: true,
             title: dealTitle3, sub: "Chocolate Hazelnut", img: nil,
             highlight: false, a: 1)

    // trust chips
    let chips = ["↻ Refreshed every 30 min", "✓ Affiliate links converted", "₹ Confirm price on retailer"]
    var chx = ox + 26
    for s in chips {
        let w: CGFloat = CGFloat(s.count) * 13.0 + 34
        fillRounded(CGRect(x: chx, y: oy + 884, width: w, height: 48), 24, C_soft, 1)
        drawText(s, x: chx + 17, y: oy + 897, w: w, size: 22, hex: C_ink, bold: false)
        chx += w + 14
    }

    // "Shop by category" — keeps the lower half of the page alive once scrolled
    drawText("Shop by category", x: ox + 26, y: oy + 976, w: vp.width - 52, size: 38, hex: C_ink)
    drawText("Select a category to explore", x: ox + 26, y: oy + 1030, w: vp.width - 52,
             size: 24, hex: C_grey, bold: false)
    let cats = ["All products", "Electronics", "Fashion", "Office & More"]
    var cax = ox + 26
    for s in cats {
        let w: CGFloat = CGFloat(s.count) * 12.0 + 48
        fillRounded(CGRect(x: cax, y: oy + 1078, width: w, height: 58), 29, C_white, 1)
        strokeRounded(CGRect(x: cax, y: oy + 1078, width: w, height: 58), 29, C_line, 3, 1)
        drawText(s, x: cax + 24, y: oy + 1094, w: w, size: 24, hex: C_ink, bold: false)
        cax += w + 14
    }
    drawText("EXPLORE OUR CATALOG", x: ox + 26, y: oy + 1176, w: 420, size: 20, hex: C_blue, tracking: 2)
    drawText("1,394 products found", x: ox + 26, y: oy + 1210, w: vp.width - 52, size: 30, hex: C_ink)
    c.restoreGState()
}

/// Chrome-style browser chrome around a viewport.
func browserShell(_ frame: CGRect, urlText: String, build: Double, a: CGFloat) {
    guard a > 0.01 else { return }
    let shell = CGFloat(easeOutCubic(clamp01(build / 0.35)))
    let r = CGRect(x: frame.minX, y: frame.minY, width: frame.width, height: frame.height * shell)
    fillRounded(r, 28, C_white, a)
    strokeRounded(r, 28, C_ink, 5, a)
    guard build > 0.20 else { return }
    let ba = CGFloat(easeOutCubic(clamp01((build - 0.20) / 0.22))) * a
    fillRounded(CGRect(x: frame.minX + 6, y: frame.minY + 6, width: frame.width - 12, height: 92), 24, C_soft, ba)
    fillRect(CGRect(x: frame.minX + 6, y: frame.minY + 70, width: frame.width - 12, height: 28), C_soft, ba)
    for k in 0..<3 {
        let cols: [UInt32] = [0xFF5F57, 0xFEBC2E, 0x28C840]
        fillCircle(frame.minX + 40 + CGFloat(k)*32, frame.minY + 34, 10, cols[k], ba)
    }
    // address bar
    let ab = CGRect(x: frame.minX + 140, y: frame.minY + 14, width: frame.width - 190, height: 42)
    fillRounded(ab, 21, C_white, ba); strokeRounded(ab, 21, C_line, 3, ba)
    strokeCircle(ab.minX + 28, ab.midY, 9, C_grey, 3, ba)
    drawText(urlText, x: ab.minX + 50, y: ab.midY - 15, w: ab.width - 70, size: 26, hex: C_ink, a: ba)
    strokePoly([CGPoint(x: frame.minX + 6, y: frame.minY + 98),
                CGPoint(x: frame.maxX - 6, y: frame.minY + 98)], C_line, 3, ba)
}

// MARK: - scenes

// The site view is the point of the reel, so the window takes most of the frame.
let SHELL   = CGRect(x: 52, y: 500, width: 976, height: 1090)
let PAGE_VP = CGRect(x: 58, y: 604, width: 964, height: 980)

func drawBackground(_ t: Double) {
    fillRect(CGRect(x: 0, y: 0, width: 1080, height: 1920), C_white)
    // soft brand wash behind the hook beat only
    let w = clamp01(easeInOut(seg(t, 0, 300)) - easeInOut(seg(t, 2500, 400)))
    if w > 0.001 {
        fillRect(CGRect(x: 0, y: 0, width: 1080, height: 1920), C_soft, CGFloat(w))
    }
}

// S0 — phone call: a friend asks where to buy cheap
func scene0(_ t: Double) {
    guard t < 3000 else { return }
    let a = CGFloat(clamp01(seg(t, 100, 320)) * (1 - easeInCubic(seg(t, 2600, 380))))
    guard a > 0.01 else { return }
    let bob = CGFloat(sin(t/420.0) * 4)
    drawCharacter(cx: 340, feetY: 1520, h: 480, pose: 2, a: a, bob: bob)
    drawPhoneAtEar(cx: 340, feetY: 1520, h: 480,
                   ring: (t / 900.0).truncatingRemainder(dividingBy: 1.0), a: a, bob: bob)

    let bp = CGFloat(easeOutBack(seg(t, 620, 480)))
    if bp > 0.01 {
        // sits just above her head so the tail reads as coming from the call
        let br = CGRect(x: 455, y: 790, width: 520, height: 215)
        // asks about the same product the reel ends on, so the story matches
        speechBubble(br, a: a * min(1, bp))
        drawText("\"Smartwatch sasta", x: br.minX + 40, y: br.minY + 44, w: 450, size: 40, hex: C_ink, a: a * CGFloat(seg(t, 760, 260)))
        drawText("kahan se milega?\"", x: br.minX + 40, y: br.minY + 96, w: 450, size: 40, hex: C_ink, a: a * CGFloat(seg(t, 840, 260)))
    }
    let tp = CGFloat(easeOutCubic(seg(t, 1750, 420)))
    drawText("Ek jagah pe saare live offers.", x: 90, y: 380, w: 900, size: 46,
             hex: C_ink, align: .center, a: a * tp)
    sparkles(t, in: CGRect(x: 80, y: 340, width: 920, height: 1180), phase: 0.4, hex: C_blue, a: a * 0.5)
}

// S1 — Chrome opens, "pricevichar" is typed into the address bar
func scene1(_ t: Double) {
    guard t >= 2750 && t < 6650 else { return }
    let a = CGFloat(clamp01(seg(t, 2750, 300)) * (1 - easeInCubic(seg(t, 6250, 380))))
    guard a > 0.01 else { return }

    let typed = "pricevichar"
    let n = Int(clamp01((t - 3700) / 900) * Double(typed.count))
    var url = String(typed.prefix(max(0, n)))
    if t > 4700 { url = "pricevichar.com" }
    if n < typed.count && t < 4700 && Int(t / 180) % 2 == 0 { url += "|" }

    browserShell(SHELL, urlText: url, build: clamp01((t - 2850) / 900), a: a)

    // search suggestion drops under the address bar while typing
    if t > 3900 && t < 4750 {
        let sa = a * CGFloat(easeOutCubic(seg(t, 3900, 260))) * CGFloat(1 - easeInCubic(seg(t, 4600, 200)))
        let sr = CGRect(x: SHELL.minX + 140, y: SHELL.minY + 62, width: SHELL.width - 190, height: 62)
        fillRounded(sr, 16, C_white, sa); strokeRounded(sr, 16, C_line, 3, sa)
        drawMark(x: sr.minX + 16, y: sr.minY + 13, side: 36, a: sa)
        drawText("pricevichar.com", x: sr.minX + 66, y: sr.minY + 17, w: 420, size: 27, hex: C_ink, a: sa)
    }

    // blank new-tab state, so the window isn't an empty box while she types
    if t > 3350 && t < 5400 {
        let na = a * CGFloat(easeOutCubic(seg(t, 3350, 320))) * CGFloat(1 - easeInCubic(seg(t, 5050, 320)))
        let mid = PAGE_VP.midX
        let pill = CGRect(x: mid - 230, y: PAGE_VP.minY + 150, width: 460, height: 66)
        fillRounded(pill, 33, C_soft, na); strokeRounded(pill, 33, C_line, 3, na)
        strokeCircle(pill.minX + 40, pill.midY, 12, C_line, 4, na)
        for k in 0..<4 {
            let sq = CGRect(x: mid - 218 + CGFloat(k) * 122, y: PAGE_VP.minY + 268, width: 92, height: 92)
            fillRounded(sq, 22, C_soft, na)
            wireBar(sq.minX + 14, sq.maxY + 18, 64, 12, C_line, na)
        }
    }

    // loading sliver, then the page paints in
    if t > 4780 && t < 5500 {
        let p = CGFloat(seg(t, 4780, 600))
        fillRect(CGRect(x: SHELL.minX + 6, y: SHELL.minY + 96, width: (SHELL.width - 12) * p, height: 6), C_blue, a)
    }
    if t > 5250 {
        sitePage(PAGE_VP, scroll: 0, t: t, a: a * CGFloat(easeOutCubic(seg(t, 5250, 420))), highlightFirst: false)
    }

    let hp = CGFloat(easeOutCubic(seg(t, 2950, 450)))
    drawText("Chrome pe bas naam likho", x: 90, y: 322, w: 900, size: 46,
             hex: C_ink, align: .center, a: a * hp)
    drawText("pricevichar", x: 90, y: 384, w: 900, size: 46,
             hex: C_blue, align: .center, a: a * CGFloat(easeOutCubic(seg(t, 3700, 400))))
}

// S2 — scroll down to the live deals strip
func scene2(_ t: Double) {
    guard t >= 6450 && t < 10200 else { return }
    let a = CGFloat(clamp01(seg(t, 6450, 300)) * (1 - easeInCubic(seg(t, 9800, 380))))
    guard a > 0.01 else { return }
    let scroll = CGFloat(lerp(0, 330, easeInOut(seg(t, 6950, 1500))))
    browserShell(SHELL, urlText: "pricevichar.com", build: 1, a: a)
    sitePage(PAGE_VP, scroll: scroll, t: t, a: a, highlightFirst: false)

    // scrollbar hint
    let track = CGRect(x: PAGE_VP.maxX - 14, y: PAGE_VP.minY + 12, width: 8, height: PAGE_VP.height - 24)
    fillRounded(track, 4, C_line, a * 0.7)
    let thumbH: CGFloat = 190
    let ty = track.minY + (track.height - thumbH) * (scroll / 330)
    fillRounded(CGRect(x: track.minX, y: ty, width: 8, height: thumbH), 4, C_grey, a * 0.9)

    // held back until scene 1's headline has fully cleared
    drawText("Neeche scroll — live deals", x: 90, y: 322, w: 900, size: 46,
             hex: C_ink, align: .center, a: a * CGFloat(easeOutCubic(seg(t, 6700, 420))))
    drawText("Har 30 minute mein refresh", x: 90, y: 388, w: 900, size: 34,
             hex: C_grey, bold: false, align: .center, a: a * CGFloat(easeOutCubic(seg(t, 8300, 400))))
}

// S3 — the first offer is highlighted and tapped
func scene3(_ t: Double) {
    guard t >= 9850 && t < 14200 else { return }
    let a = CGFloat(clamp01(seg(t, 9850, 300)) * (1 - easeInCubic(seg(t, 13800, 380))))
    guard a > 0.01 else { return }
    browserShell(SHELL, urlText: "pricevichar.com", build: 1, a: a)
    sitePage(PAGE_VP, scroll: 330, t: t, a: a, highlightFirst: t > 10600)

    // taps the FIRST card from below, then withdraws so it stops covering the strip
    let handIn = seg(t, 9950, 700)
    let handOut = seg(t, 11350, 520)
    let tipX: CGFloat = PAGE_VP.minX + 176, tipY: CGFloat = 900
    tapRipple(tipX, tipY, progress: seg(t, 10680, 620), a: a)
    drawTapHand(progress: clamp01(handIn - handOut), tipX: tipX, tipY: tipY, s: 1.15,
                a: a * CGFloat(seg(t, 9950, 280)) * CGFloat(1 - handOut))

    // the tapped card lifts out of the page as a focus card
    if t > 11050 {
        let p = easeOutBack(seg(t, 11050, 560))
        let s = CGFloat(clamp01(p))
        guard let c = ctx else { return }
        c.saveGState()
        c.translateBy(x: 540, y: 1130); c.scaleBy(x: s, y: s); c.translateBy(x: -540, y: -1130)
        let fr = CGRect(x: 130, y: 940, width: 820, height: 360)
        fillRounded(fr, 34, C_white, a)
        strokeRounded(fr, 34, C_mint, 7, a)
        // product shot on the left so viewers see what the item actually is
        let ib = CGRect(x: fr.minX + 30, y: fr.minY + 34, width: 240, height: 240)
        if let img = productImage {
            drawImageFit(img, in: ib, corner: 22, a: a)
            strokeRounded(ib, 22, C_line, 3, a)
        }
        let tx = fr.minX + 288
        drawText(dealStore1, x: tx, y: fr.minY + 34, w: 300, size: 28, hex: C_grey, a: a, tracking: 1.5)
        fillRounded(CGRect(x: fr.maxX - 208, y: fr.minY + 28, width: 176, height: 52), 26, C_amber, a)
        drawText(dealTag1, x: fr.maxX - 208, y: fr.minY + 40, w: 176, size: 26, hex: C_white, align: .center, a: a)
        drawText(dealTitle1, x: tx, y: fr.minY + 92, w: fr.maxX - tx - 30, size: 38, hex: C_ink, a: a)
        drawText(dealSub1, x: tx, y: fr.minY + 152, w: fr.maxX - tx - 34, size: 28, hex: C_grey, bold: false, a: a)
        fillRounded(CGRect(x: tx, y: fr.maxY - 110, width: 300, height: 62), 31, C_blue, a)
        drawText("Check offer ↗", x: tx, y: fr.maxY - 93, w: 300, size: 28, hex: C_white, align: .center, a: a)
        c.restoreGState()
    }

    drawText("Pehla offer — tap", x: 90, y: 322, w: 900, size: 46,
             hex: C_ink, align: .center, a: a * CGFloat(easeOutCubic(seg(t, 10100, 400))))
    sparkles(t, in: CGRect(x: 80, y: 900, width: 920, height: 560), phase: 2.2, hex: C_mint, a: a * 0.45)
}

// S4 — hand-off to the retailer, with the honest caveats
func scene4(_ t: Double) {
    guard t >= 13900 && t < 17000 else { return }
    let a = CGFloat(clamp01(seg(t, 13900, 300)))
    guard a > 0.01 else { return }

    drawText("Seedha store par", x: 90, y: 470, w: 900, size: 46, hex: C_ink,
             align: .center, a: a * CGFloat(seg(t, 13950, 350)))

    let cp = easeOutBack(seg(t, 14100, 560))
    let s = CGFloat(clamp01(cp))
    if let c = ctx {
        c.saveGState()
        c.translateBy(x: 540, y: 760); c.scaleBy(x: s, y: s); c.translateBy(x: -540, y: -760)
        let r = CGRect(x: 150, y: 600, width: 780, height: 320)
        fillRounded(r, 40, C_white, a); strokeRounded(r, 40, C_mint, 7, a)
        fillCircle(540, 690, 52, C_mint, a)
        strokePoly([CGPoint(x: 516, y: 692), CGPoint(x: 532, y: 708), CGPoint(x: 566, y: 670)], C_white, 9, a)
        drawText("Offer limited time ke liye hai", x: r.minX, y: r.minY + 168, w: r.width, size: 38,
                 hex: C_ink, align: .center, a: a)
        drawText("Flipkart par jaake check karo aur buy karo", x: r.minX, y: r.minY + 224, w: r.width, size: 27,
                 hex: C_grey, bold: false, align: .center, a: a)
        c.restoreGState()
    }

    // trust chips, staggered
    let chips = ["Partner links converted", "Refreshed every 30 min", "Price change ho sakta hai"]
    for (i, s) in chips.enumerated() {
        let p = CGFloat(easeOutCubic(seg(t, 14650 + Double(i) * 260, 380)))
        guard p > 0.01 else { continue }
        let w: CGFloat = 720
        let y: CGFloat = 1010 + CGFloat(i) * 88
        fillRounded(CGRect(x: 540 - w/2, y: y, width: w, height: 70), 35, C_soft, a * p)
        fillCircle(540 - w/2 + 44, y + 35, 12, C_mint, a * p)
        drawText(s, x: 540 - w/2 + 74, y: y + 20, w: w - 100, size: 29, hex: C_ink, a: a * p)
    }

    drawCharacter(cx: 540, feetY: 1560, h: 300, pose: 1,
                  a: a * CGFloat(easeOutCubic(seg(t, 15300, 450))), bob: CGFloat(sin(t/300.0) * 3))
}

// S5 — iris close, logo, slogan
func scene5(_ t: Double) {
    guard let c = ctx else { return }
    if t >= 16600 && t < 17400 {
        let p = easeInOut(seg(t, 16600, 700))
        let r = CGFloat(lerp(1250, 0, p))
        let path = CGMutablePath()
        path.addRect(CGRect(x: 0, y: 0, width: 1080, height: 1920))
        path.addEllipse(in: CGRect(x: 540 - r, y: 960 - r, width: 2*r, height: 2*r))
        c.addPath(path); c.setFillColor(color(C_white)); c.fillPath(using: .evenOdd)
        if r > 4 { strokeCircle(540, 960, r, C_ink, 4, 0.45) }
    } else if t >= 17400 {
        fillRect(CGRect(x: 0, y: 0, width: 1080, height: 1920), C_white)
    }
    guard t >= 17050 else { return }
    let a = CGFloat(easeOutCubic(seg(t, 17050, 420)))

    let s = CGFloat(easeOutBack(seg(t, 17100, 520)))
    let side: CGFloat = 200 * max(0, s)
    if side > 2 { drawMark(x: 540 - side/2, y: 760 - side/2, side: side, a: a) }

    drawText("PriceVichar", x: 90, y: 920, w: 900, size: 92, hex: C_ink, align: .center, a: a)
    drawText("Search. Compare. Think. Buy better.", x: 90, y: 1044, w: 900, size: 40,
             hex: C_blue, align: .center, a: a * CGFloat(seg(t, 17300, 400)))

    let pp = CGFloat(easeOutBack(seg(t, 17600, 480)))
    if pp > 0.01 {
        let pw: CGFloat = 560
        fillRounded(CGRect(x: 540 - pw/2, y: 1180, width: pw, height: 110), 55, C_mint, a * min(1, pp))
        drawText("pricevichar.com", x: 540 - pw/2, y: 1210, w: pw, size: 44,
                 hex: C_white, align: .center, a: a * min(1, pp))
    }
}

/// Compliance line, on for the whole reel except the very first and last beats.
func disclosure(_ t: Double) {
    let a = CGFloat(seg(t, 2900, 500)) * CGFloat(1 - easeInCubic(seg(t, 16500, 350)))
    guard a > 0.01 else { return }
    drawText("Offers checked 24 Aug 2026 · affiliate links · offers rotate every 30 min",
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
    scene0(msTime); scene1(msTime); scene2(msTime); scene3(msTime); scene4(msTime)
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
