using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Media;
using Furria.Api.Results;
using Furria.Application.Club;
using Furria.Application.Studio;
using Furria.Core.Media;
using Furria.Core.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class GetActStudio : Endpoint<GetActStudioRequest, GetActStudioResponse>
{
    private readonly ActStudioService _studioService;

    public GetActStudio(ActStudioService studioService)
    {
        _studioService = studioService;
    }

    public override void Configure()
    {
        Get("acts/{actId}/studio");
    }

    public override async Task HandleAsync(GetActStudioRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _studioService.GetStudioAsync(accountId.Value, req.ActId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(result.Value), cancellation: ct);
    }

    private static GetActStudioResponse ToResponse(ActStudioDetails details) =>
        new()
        {
            Act = ActSummaryDto.From(details.Act),
            Viewer = new StudioViewerDto
            {
                InCast = details.Viewer.InCast,
                CanEditSettings = details.Viewer.CanEditSettings,
                CanEditStudio = details.Viewer.CanEditStudio,
                CanGrantCoEditors = details.Viewer.CanGrantCoEditors,
            },
            CoEditors =
            [
                .. details.CoEditors.Select(editor => new CoEditorDto
                {
                    PersonId = editor.Person.PersonId,
                    FirstName = editor.Person.FirstName,
                    LastName = editor.Person.LastName,
                    Portrait = PictureDto.From(editor.Person.Portrait),
                    GrantedAt = editor.GrantedAt,
                }),
            ],
            Studio = details.Content is { } content ? ToDto(content) : null,
        };

    private static StudioDto ToDto(ActStudioContent content) =>
        new()
        {
            Music = new StudioMusicDto
            {
                LengthSeconds = content.Music.LengthSeconds,
                Source = content.Music.Source,
            },
            Songs = [.. content.Songs.Select(ToDto)],
            FinalTracks = [.. content.FinalTracks.Select(ToDto)],
            Steps = [.. content.Steps.Select(ToDto)],
            Parts = [.. content.Parts.Select(ToDto)],
            Spots = [.. content.Spots.Select(ToDto)],
            Videos = [.. content.Videos.Select(ToDto)],
            Choreography = content.Choreography is { } choreography ? ToDto(choreography) : null,
            Stage = content.Stage is { } stage ? ToDto(stage) : null,
            Evenings = [.. content.Evenings.Select(ToDto)],
        };

    private static StudioStageDto ToDto(ClubStageDetails stage) =>
        new()
        {
            WidthMetres = (double)stage.WidthMetres,
            DepthMetres = (double)stage.DepthMetres,
            ArtworkSvg = stage.ArtworkSvg,
        };

    private static StudioSongDto ToDto(StudioSongDetails song) =>
        new()
        {
            SongId = song.SongId,
            MediaItemId = song.MediaItemId,
            Position = song.Position,
            StartSeconds = song.StartSeconds,
            EndSeconds = song.EndSeconds,
            FirstBeatSeconds = song.FirstBeatSeconds,
            TempoBpm = song.TempoBpm,
            State = song.State,
            DurationSeconds = song.DurationSeconds,
            FileName = song.FileName,
            Urls = ToDto(song.Urls),
        };

    private static StudioFinalTrackDto ToDto(StudioFinalTrackDetails track) =>
        new()
        {
            FinalTrackId = track.FinalTrackId,
            MediaItemId = track.MediaItemId,
            Version = track.Version,
            Adopted = track.IsAdopted,
            State = track.State,
            DurationSeconds = track.DurationSeconds,
            Urls = ToDto(track.Urls),
        };

    private static StudioAudioUrlsDto ToDto(StudioAudioUrls urls) =>
        new()
        {
            Normalised = urls.Normalised,
            Preview = urls.Preview,
            Peaks = urls.Peaks,
        };

    private static StudioStepDto ToDto(StudioStepDetails step) =>
        new()
        {
            StepId = step.StepId,
            Name = step.Name,
            Description = step.Description,
            StartSeconds = step.StartSeconds,
            EndSeconds = step.EndSeconds,
            Placement = step.Placement,
        };

    private static StudioPartDto ToDto(StudioPartDetails part) =>
        new()
        {
            PartId = part.PartId,
            Name = part.Name,
            StepIds = part.StepIds,
            MainVideoId = part.MainVideoId,
            Adrift = part.IsAdrift,
        };

    private static StudioSpotDto ToDto(StudioSpotDetails spot) =>
        new()
        {
            SpotId = spot.SpotId,
            Number = spot.Number,
            Person = spot.Person is { } person ? ActPersonDto.From(person) : null,
        };

    private static StudioVideoDto ToDto(StudioVideoDetails video) =>
        new()
        {
            VideoId = video.VideoId,
            MediaItemId = video.MediaItemId,
            Name = video.Name,
            State = video.State,
            DurationSeconds = video.DurationSeconds,
            StartSeconds = video.StartSeconds,
            Placement = video.Placement,
            Outdated = video.IsOutdated,
            Urls = new StudioVideoUrlsDto
            {
                Video = video.Urls.Video,
                Compact = video.Urls.Compact,
                Poster = video.Urls.Poster,
            },
        };

    private static StudioChoreographyDto ToDto(StudioChoreographyDetails choreography) =>
        new() { Version = choreography.Version, Tracks = TracksOf(choreography.Document) };

    private static IReadOnlyList<SpotTrackDto> TracksOf(ChoreographyDocument document) =>
        [
            .. document.Tracks.Select(track => new SpotTrackDto
            {
                SpotId = track.SpotId,
                Keyframes = [.. track.Keyframes.Select(ToDto)],
            }),
        ];

    private static StudioEveningDto ToDto(StudioEveningDetails evening) =>
        new()
        {
            EventId = evening.EventId,
            Title = evening.Title,
            StartsAt = evening.StartsAt,
            Appearance = evening.Appearance is { } appearance ? ToDto(appearance) : null,
        };

    private static StudioAppearanceDto ToDto(StudioAppearanceDetails appearance) =>
        new()
        {
            AppearanceId = appearance.AppearanceId,
            Placed = appearance.IsPlaced,
            Added = [.. appearance.Added.Select(ActPersonDto.From)],
            RemovedPersonIds = appearance.RemovedPersonIds,
            SpotChanges =
            [
                .. appearance.SpotChanges.Select(change => new StudioSpotChangeDto
                {
                    SpotId = change.SpotId,
                    Person = change.Person is { } person ? ActPersonDto.From(person) : null,
                }),
            ],
            Choreography = appearance.Choreography is { } copy
                ? new StudioEveningChoreographyDto
                {
                    Version = copy.Version,
                    CopiedFromVersion = copy.CopiedFromVersion,
                    Tracks = TracksOf(copy.Document),
                }
                : null,
        };

    private static KeyframeDto ToDto(Keyframe keyframe) =>
        new()
        {
            SourceMediaItemId = keyframe.At.SourceMediaItemId,
            Seconds = keyframe.At.Seconds,
            Position = ToDto(keyframe.Position),
            Bend = keyframe.Bend is { } bend ? ToDto(bend) : null,
            Easing = keyframe.Easing,
            FacingDegrees = keyframe.FacingDegrees,
        };

    private static StagePointDto ToDto(StagePoint point) =>
        new() { RightMetres = point.RightMetres, BackMetres = point.BackMetres };
}

public sealed record GetActStudioRequest
{
    [RouteParam]
    public required int ActId { get; init; }
}

public sealed class GetActStudioValidator : Validator<GetActStudioRequest>
{
    public GetActStudioValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
    }
}

public sealed record GetActStudioResponse
{
    public required ActSummaryDto Act { get; init; }

    public required StudioViewerDto Viewer { get; init; }

    public required IReadOnlyList<CoEditorDto> CoEditors { get; init; }

    public required StudioDto? Studio { get; init; }
}

public sealed record StudioViewerDto
{
    public required bool InCast { get; init; }

    public required bool CanEditSettings { get; init; }

    public required bool CanEditStudio { get; init; }

    public required bool CanGrantCoEditors { get; init; }
}

public sealed record CoEditorDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required PictureDto? Portrait { get; init; }

    public required DateTimeOffset GrantedAt { get; init; }
}

public sealed record StudioDto
{
    public required StudioMusicDto Music { get; init; }

    public required IReadOnlyList<StudioSongDto> Songs { get; init; }

    public required IReadOnlyList<StudioFinalTrackDto> FinalTracks { get; init; }

    public required IReadOnlyList<StudioStepDto> Steps { get; init; }

    public required IReadOnlyList<StudioPartDto> Parts { get; init; }

    public required IReadOnlyList<StudioSpotDto> Spots { get; init; }

    public required IReadOnlyList<StudioVideoDto> Videos { get; init; }

    public required StudioChoreographyDto? Choreography { get; init; }

    public required StudioStageDto? Stage { get; init; }

    public required IReadOnlyList<StudioEveningDto> Evenings { get; init; }
}

public sealed record StudioEveningDto
{
    public required int EventId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required StudioAppearanceDto? Appearance { get; init; }
}

public sealed record StudioAppearanceDto
{
    public required int AppearanceId { get; init; }

    public required bool Placed { get; init; }

    public required IReadOnlyList<ActPersonDto> Added { get; init; }

    public required IReadOnlyList<int> RemovedPersonIds { get; init; }

    public required IReadOnlyList<StudioSpotChangeDto> SpotChanges { get; init; }

    public required StudioEveningChoreographyDto? Choreography { get; init; }
}

public sealed record StudioSpotChangeDto
{
    public required int SpotId { get; init; }

    public required ActPersonDto? Person { get; init; }
}

public sealed record StudioEveningChoreographyDto
{
    public required int Version { get; init; }

    public required int? CopiedFromVersion { get; init; }

    public required IReadOnlyList<SpotTrackDto> Tracks { get; init; }
}

public sealed record StudioStageDto
{
    public required double WidthMetres { get; init; }

    public required double DepthMetres { get; init; }

    public required string? ArtworkSvg { get; init; }
}

public sealed record StudioMusicDto
{
    public required double LengthSeconds { get; init; }

    public required StudioMusicSource Source { get; init; }
}

public sealed record StudioAudioUrlsDto
{
    public required string Normalised { get; init; }

    public required string Preview { get; init; }

    public required string Peaks { get; init; }
}

public sealed record StudioSongDto
{
    public required int SongId { get; init; }

    public required int MediaItemId { get; init; }

    public required int Position { get; init; }

    public required double StartSeconds { get; init; }

    public required double EndSeconds { get; init; }

    public required double? FirstBeatSeconds { get; init; }

    public required double? TempoBpm { get; init; }

    public required MediaItemState State { get; init; }

    public required double? DurationSeconds { get; init; }

    public required string FileName { get; init; }

    public required StudioAudioUrlsDto Urls { get; init; }
}

public sealed record StudioFinalTrackDto
{
    public required int FinalTrackId { get; init; }

    public required int MediaItemId { get; init; }

    public required int Version { get; init; }

    public required bool Adopted { get; init; }

    public required MediaItemState State { get; init; }

    public required double? DurationSeconds { get; init; }

    public required StudioAudioUrlsDto Urls { get; init; }
}

public sealed record StudioStepDto
{
    public required int StepId { get; init; }

    public required string Name { get; init; }

    public required string? Description { get; init; }

    public required double? StartSeconds { get; init; }

    public required double? EndSeconds { get; init; }

    public required AnchorPlacement Placement { get; init; }
}

public sealed record StudioPartDto
{
    public required int PartId { get; init; }

    public required string Name { get; init; }

    public required IReadOnlyList<int> StepIds { get; init; }

    public required int? MainVideoId { get; init; }

    public required bool Adrift { get; init; }
}

public sealed record StudioSpotDto
{
    public required int SpotId { get; init; }

    public required int Number { get; init; }

    public required ActPersonDto? Person { get; init; }
}

public sealed record StudioVideoUrlsDto
{
    public required string Video { get; init; }

    public required string Compact { get; init; }

    public required string Poster { get; init; }
}

public sealed record StudioVideoDto
{
    public required int VideoId { get; init; }

    public required int MediaItemId { get; init; }

    public required string? Name { get; init; }

    public required MediaItemState State { get; init; }

    public required double? DurationSeconds { get; init; }

    public required double? StartSeconds { get; init; }

    public required VideoPlacement Placement { get; init; }

    public required bool Outdated { get; init; }

    public required StudioVideoUrlsDto Urls { get; init; }
}

public sealed record StudioChoreographyDto
{
    public required int Version { get; init; }

    public required IReadOnlyList<SpotTrackDto> Tracks { get; init; }
}

public sealed record SpotTrackDto
{
    public required int SpotId { get; init; }

    public required IReadOnlyList<KeyframeDto> Keyframes { get; init; }
}

public sealed record KeyframeDto
{
    public required int SourceMediaItemId { get; init; }

    public required double Seconds { get; init; }

    public required StagePointDto Position { get; init; }

    public required StagePointDto? Bend { get; init; }

    public required KeyframeEasing Easing { get; init; }

    public required double? FacingDegrees { get; init; }
}

public sealed record StagePointDto
{
    public required double RightMetres { get; init; }

    public required double BackMetres { get; init; }
}
