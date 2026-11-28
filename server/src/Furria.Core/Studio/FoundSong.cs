namespace Furria.Core.Studio;

public readonly record struct FoundSong(MusicCut Cut, SongPlacement Placement)
{
    public double NewStartSeconds => Placement.NewSecondsOf(Cut.StartSeconds);

    public double NewEndSeconds => Placement.NewSecondsOf(Cut.EndSeconds);
}
