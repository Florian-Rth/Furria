namespace Furria.MediaWorker;

public sealed class MediaWorkerOptions
{
    public const string SectionName = "MediaWorker";

    public HardwareAcceleration HardwareAcceleration { get; set; } = HardwareAcceleration.None;

    public string HardwareDevice { get; set; } = "/dev/dri/renderD128";

    public string FfmpegPath { get; set; } = "ffmpeg";

    public string FfprobePath { get; set; } = "ffprobe";
}
