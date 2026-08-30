import AVFoundation
import Foundation

// Combine a silent render with its sound bed.
// shouldOptimizeForNetworkUse moves the moov atom to the front ("fast start"),
// without which simple players stall until the whole file is buffered.

let videoPath = CommandLine.arguments[1]
let audioPath = CommandLine.arguments[2]
let outPath = CommandLine.arguments[3]
let outURL = URL(fileURLWithPath: outPath)
try? FileManager.default.removeItem(at: outURL)

let videoAsset = AVURLAsset(url: URL(fileURLWithPath: videoPath))
let audioAsset = AVURLAsset(url: URL(fileURLWithPath: audioPath))
let composition = AVMutableComposition()

guard let vTrack = composition.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid),
      let srcV = videoAsset.tracks(withMediaType: .video).first else { fatalError("no video track") }
let dur = videoAsset.duration
try vTrack.insertTimeRange(CMTimeRange(start: .zero, duration: dur), of: srcV, at: .zero)
vTrack.preferredTransform = srcV.preferredTransform

guard let aTrack = composition.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid),
      let srcA = audioAsset.tracks(withMediaType: .audio).first else { fatalError("no audio track") }
let useDur = CMTimeMinimum(audioAsset.duration, dur)
try aTrack.insertTimeRange(CMTimeRange(start: .zero, duration: useDur), of: srcA, at: .zero)

guard let export = AVAssetExportSession(asset: composition, presetName: AVAssetExportPresetHighestQuality) else {
    fatalError("no export session")
}
export.outputURL = outURL
export.outputFileType = .mp4
export.shouldOptimizeForNetworkUse = true

let sem = DispatchSemaphore(value: 0)
export.exportAsynchronously { sem.signal() }
sem.wait()
if export.status != .completed { fatalError(export.error?.localizedDescription ?? "export failed") }
print(outURL.path)
