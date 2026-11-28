namespace Furria.Core.Studio;

public sealed record FollowedSong(MusicCut Cut, SongWarp Warp)
{
    public double NewStartSeconds => Warp.NewSecondsOf(Cut.StartSeconds);

    public double NewEndSeconds => Warp.NewSecondsOf(Cut.EndSeconds);
}
