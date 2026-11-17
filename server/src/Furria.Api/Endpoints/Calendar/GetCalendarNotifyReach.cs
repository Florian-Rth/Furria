using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Club;
using Furria.Core.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Calendar;

public sealed class GetCalendarNotifyReach
    : Endpoint<GetCalendarNotifyReachRequest, GetCalendarNotifyReachResponse>
{
    private readonly CalendarService _calendarService;

    public GetCalendarNotifyReach(CalendarService calendarService)
    {
        _calendarService = calendarService;
    }

    public override void Configure()
    {
        Get("calendar/notify-reach");
    }

    public override async Task HandleAsync(GetCalendarNotifyReachRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var reach = await _calendarService.NotifyReachAsync(
            ToQuery(req, accountId.Value, User.PersonId()),
            ct
        );
        if (!reach.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(reach.Error, ct);
            return;
        }

        await Send.OkAsync(new() { People = reach.Value }, cancellation: ct);
    }

    private static CalendarNotifyReachQuery ToQuery(
        GetCalendarNotifyReachRequest req,
        int actorAccountId,
        int? actorPersonId
    ) =>
        new()
        {
            ActorAccountId = actorAccountId,
            ActorPersonId = actorPersonId,
            Kind = req.Kind,
            Audience = req.Audience,
            AudienceGroupIds = req.AudienceGroupIds,
            AudiencePersonIds = req.AudiencePersonIds,
        };
}

public sealed record GetCalendarNotifyReachRequest
{
    [QueryParam]
    public CalendarEntryKind Kind { get; init; }

    [QueryParam]
    public CalendarEntryAudience Audience { get; init; }

    [QueryParam]
    public IReadOnlyList<int> AudienceGroupIds { get; init; } = [];

    [QueryParam]
    public IReadOnlyList<int> AudiencePersonIds { get; init; } = [];
}

public sealed class GetCalendarNotifyReachValidator : Validator<GetCalendarNotifyReachRequest>
{
    private const string UnknownKindMessage = "Diese Art von Eintrag gibt es nicht.";
    private const string UnknownAudienceMessage = "Diese Auswahl für „Für wen“ gibt es nicht.";
    private const string TrainingForTheClubMessage = "Ein Training ist nie für den ganzen Verein.";
    private const string UnknownGroupMessage = "Diese Gruppe gibt es nicht.";
    private const string UnknownPersonMessage = "Diese Person gibt es nicht.";

    public GetCalendarNotifyReachValidator()
    {
        RuleFor(request => request.Kind).IsInEnum().WithMessage(UnknownKindMessage);
        RuleFor(request => request.Audience).IsInEnum().WithMessage(UnknownAudienceMessage);
        RuleFor(request => request.Audience)
            .Must((request, audience) => CalendarKindAudience.Admits(request.Kind, audience))
            .WithMessage(TrainingForTheClubMessage);
        RuleForEach(request => request.AudienceGroupIds)
            .GreaterThan(0)
            .WithMessage(UnknownGroupMessage);
        RuleForEach(request => request.AudiencePersonIds)
            .GreaterThan(0)
            .WithMessage(UnknownPersonMessage);
    }
}

public sealed record GetCalendarNotifyReachResponse
{
    public required int People { get; init; }
}
