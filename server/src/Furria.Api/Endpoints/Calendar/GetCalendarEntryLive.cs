using System.Diagnostics.Contracts;
using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Endpoints.RunningOrders;
using Furria.Api.Media;
using Furria.Api.Results;
using Furria.Application.RunningOrders;
using Furria.Core.RunningOrders;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Club;
using Furria.Infrastructure.RunningOrders;

namespace Furria.Api.Endpoints.Calendar;

public sealed class GetCalendarEntryLive
    : Endpoint<GetCalendarEntryLiveRequest, GetCalendarEntryLiveResponse>
{
    private readonly CalendarService _calendarService;
    private readonly RunningOrderService _runningOrderService;
    private readonly LiveDirectionService _liveDirectionService;
    private readonly PermissionAuthorizer _authorizer;

    public GetCalendarEntryLive(
        CalendarService calendarService,
        RunningOrderService runningOrderService,
        LiveDirectionService liveDirectionService,
        PermissionAuthorizer authorizer
    )
    {
        _calendarService = calendarService;
        _runningOrderService = runningOrderService;
        _liveDirectionService = liveDirectionService;
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Get("calendar/entries/{calendarEntryId}/live");
    }

    public override async Task HandleAsync(GetCalendarEntryLiveRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var entry = await _calendarService.GetEntryAsync(accountId.Value, req.CalendarEntryId, ct);
        if (!entry.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(entry.Error, ct);
            return;
        }

        var live = await _liveDirectionService.GetAsync(req.CalendarEntryId, ct);
        var evening = await _runningOrderService.GetEveningLiveAsync(
            req.CalendarEntryId,
            User.PersonId(),
            ct
        );
        var canDirect = await _authorizer.IsGrantedAnyAsync(
            accountId.Value,
            RunningOrderKeys.Planners,
            ct
        );

        await Send.OkAsync(ToResponse(evening, live, canDirect), cancellation: ct);
    }

    [Pure]
    private static GetCalendarEntryLiveResponse ToResponse(
        EveningLiveDetails evening,
        LiveDirectionDetails? live,
        bool canDirect
    ) =>
        new()
        {
            CalendarEntryId = evening.EventId,
            Title = evening.Title,
            StartsAt = evening.StartsAt,
            CanDirect = canDirect,
            Live = live is null ? null : LiveDirectionDto.From(live),
            Lines = [.. evening.Lines.Select(line => ToDto(line, canDirect))],
        };

    [Pure]
    private static LiveLineDto ToDto(EveningLiveLineDetails line, bool canDirect) =>
        new()
        {
            AppearanceId = line.AppearanceId,
            ActId = line.ActId,
            Name = line.Name,
            Kind = line.Kind,
            Group = ActGroupDto.From(line.Group),
            Position = line.Position,
            Own = line.IsOwn,
            Cast =
            [
                .. line.Cast.Select(member =>
                    LivePersonDto.From(member, line.StandInIds, canDirect)
                ),
            ],
            Missing =
            [
                .. line.Missing.Select(member =>
                    LivePersonDto.From(member, line.StandInIds, canDirect)
                ),
            ],
        };
}

public sealed record GetCalendarEntryLiveRequest
{
    [RouteParam]
    public required int CalendarEntryId { get; init; }
}

public sealed class GetCalendarEntryLiveValidator : Validator<GetCalendarEntryLiveRequest>
{
    public GetCalendarEntryLiveValidator()
    {
        RuleFor(request => request.CalendarEntryId).GreaterThan(0);
    }
}

public sealed record GetCalendarEntryLiveResponse
{
    public required int CalendarEntryId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required bool CanDirect { get; init; }

    public required LiveDirectionDto? Live { get; init; }

    public required IReadOnlyList<LiveLineDto> Lines { get; init; }
}

public sealed record LiveLineDto
{
    public required int AppearanceId { get; init; }

    public required int ActId { get; init; }

    public required string Name { get; init; }

    public required ActKind? Kind { get; init; }

    public required ActGroupDto? Group { get; init; }

    public required int Position { get; init; }

    public required bool Own { get; init; }

    public required IReadOnlyList<LivePersonDto> Cast { get; init; }

    public required IReadOnlyList<LivePersonDto> Missing { get; init; }
}

public sealed record LivePersonDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required PictureDto? Portrait { get; init; }

    public required bool Absent { get; init; }

    public required bool StandsIn { get; init; }

    [Pure]
    public static LivePersonDto From(
        CastMember member,
        IReadOnlySet<int> standInIds,
        bool showsAbsence
    ) =>
        new()
        {
            PersonId = member.PersonId,
            FirstName = member.FirstName,
            LastName = member.LastName,
            Portrait = PictureDto.From(member.Portrait),
            Absent = showsAbsence && member.IsAbsent,
            StandsIn = standInIds.Contains(member.PersonId),
        };
}

public sealed record LiveDirectionDto
{
    public required int? AppearanceId { get; init; }

    public required DateTimeOffset StartedAt { get; init; }

    public required DateTimeOffset MovedAt { get; init; }

    [Pure]
    public static LiveDirectionDto From(LiveDirectionDetails live) =>
        new()
        {
            AppearanceId = live.AppearanceId,
            StartedAt = live.StartedAt,
            MovedAt = live.MovedAt,
        };
}
