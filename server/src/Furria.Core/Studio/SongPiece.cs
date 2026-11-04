namespace Furria.Core.Studio;

public readonly record struct SongPiece(double StartSeconds, double EndSeconds)
{
    public const int MostPerSong = 50;
}
