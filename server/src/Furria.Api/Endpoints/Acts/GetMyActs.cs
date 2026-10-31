using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Api.Endpoints.RunningOrders;
using Furria.Application.Studio;
using Furria.Core.Club;
using Furria.Core.RunningOrders;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class GetMyActs : EndpointWithoutRequest<GetMyActsResponse>
{
    private readonly ActStudioService _studioService;

    public GetMyActs(ActStudioService studioService)
    {
        _studioService = studioService;
    }

    public override void Configure()
    {
        Get("acts/mine");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var acts = await _studioService.GetMyActsAsync(accountId.Value, ct);

        await Send.OkAsync(
            new GetMyActsResponse { Acts = [.. acts.Select(ToDto)] },
            cancellation: ct
        );
    }

    private static MyActDto ToDto(MyActSummary act) =>
        new()
        {
            ActId = act.ActId,
            Name = act.Name,
            Kind = act.Kind,
            SessionYear = act.SessionYear,
            Group = ActGroupDto.From(act.Group),
            ViewerInCast = act.ViewerInCast,
            ViewerLeads = act.ViewerLeads,
            Playable = act.IsPlayable,
            Cast = [.. act.Cast.Select(ActPersonDto.From)],
            Editors = [.. act.Editors.Select(ActPersonDto.From)],
            NextEvening = act.NextEvening is { } evening ? ToDto(evening) : null,
            NextTraining = act.NextTraining is { } training ? ToDto(training) : null,
        };

    private static MyActEveningDto ToDto(MyActEveningSummary evening) =>
        new()
        {
            EventId = evening.EventId,
            Title = evening.Title,
            StartsAt = evening.StartsAt,
            Position = evening.Position,
        };

    private static MyActTrainingDto ToDto(MyActTrainingSummary training) =>
        new()
        {
            CalendarEntryId = training.CalendarEntryId,
            Title = training.Title,
            StartsAt = training.StartsAt,
            ViewerAnswer = training.ViewerAnswer,
            Present = training.Present,
            Absent = training.Absent,
        };
}

public sealed record GetMyActsResponse
{
    public required IReadOnlyList<MyActDto> Acts { get; init; }
}

public sealed record MyActDto
{
    public required int ActId { get; init; }

    public required string Name { get; init; }

    public required ActKind? Kind { get; init; }

    public required int SessionYear { get; init; }

    public required ActGroupDto? Group { get; init; }

    public required bool ViewerInCast { get; init; }

    public required bool ViewerLeads { get; init; }

    public required bool Playable { get; init; }

    public required IReadOnlyList<ActPersonDto> Cast { get; init; }

    public required IReadOnlyList<ActPersonDto> Editors { get; init; }

    public required MyActEveningDto? NextEvening { get; init; }

    public required MyActTrainingDto? NextTraining { get; init; }
}

public sealed record MyActEveningDto
{
    public required int EventId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required int? Position { get; init; }
}

public sealed record MyActTrainingDto
{
    public required int CalendarEntryId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required AttendanceAnswer? ViewerAnswer { get; init; }

    public required int Present { get; init; }

    public required int Absent { get; init; }
}
