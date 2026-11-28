using Furria.Core.RunningOrders;

namespace Furria.Core.Studio;

public sealed class ActMusicReplacement
{
    public int Id { get; set; }

    public int ActId { get; set; }

    public int SongId { get; set; }

    public MusicBeforeReplacement Before { get; set; } = MusicBeforeReplacement.Empty;

    public string Fingerprint { get; set; } = "";

    public Act? Act { get; set; }

    public ActSong? Song { get; set; }
}
