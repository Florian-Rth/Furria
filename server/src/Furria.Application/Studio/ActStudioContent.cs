using Furria.Application.Club;

namespace Furria.Application.Studio;

public sealed record ActStudioContent
{
    public required StudioMusicDetails Music { get; init; }

    public required IReadOnlyList<StudioSongDetails> Songs { get; init; }

    public required IReadOnlyList<StudioFinalTrackDetails> FinalTracks { get; init; }

    public required IReadOnlyList<StudioStepDetails> Steps { get; init; }

    public required IReadOnlyList<StudioPartDetails> Parts { get; init; }

    public required IReadOnlyList<StudioSpotDetails> Spots { get; init; }

    public required IReadOnlyList<StudioVideoDetails> Videos { get; init; }

    public required StudioChoreographyDetails? Choreography { get; init; }

    public required ClubStageDetails? Stage { get; init; }

    public required IReadOnlyList<StudioEveningDetails> Evenings { get; init; }
}
