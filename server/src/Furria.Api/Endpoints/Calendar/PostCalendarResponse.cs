using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Club;
using Furria.Core.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Calendar;

public sealed class PostCalendarResponse : Endpoint<PostCalendarResponseRequest>
{
    private readonly CalendarService _calendarService;

    public PostCalendarResponse(CalendarService calendarService)
    {
        _calendarService = calendarService;
    }

    public override void Configure()
    {
        Post("calendar/{calendarEntryId}/response");
    }

    public override async Task HandleAsync(PostCalendarResponseRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _calendarService.SetResponseAsync(ToCommand(req, accountId.Value), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static SetAttendanceResponseCommand ToCommand(
        PostCalendarResponseRequest req,
        int actorAccountId
    ) =>
        new()
        {
            CalendarEntryId = req.CalendarEntryId,
            ActorAccountId = actorAccountId,
            Answer = req.Answer,
        };
}

public sealed record PostCalendarResponseRequest
{
    [RouteParam]
    public required int CalendarEntryId { get; init; }

    public required AttendanceAnswer Answer { get; init; }
}

public sealed class PostCalendarResponseValidator : Validator<PostCalendarResponseRequest>
{
    private const string UnknownAnswerMessage = "Diese Antwort gibt es nicht.";

    public PostCalendarResponseValidator()
    {
        RuleFor(request => request.CalendarEntryId).GreaterThan(0);
        RuleFor(request => request.Answer).IsInEnum().WithMessage(UnknownAnswerMessage);
    }
}
