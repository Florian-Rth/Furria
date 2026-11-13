using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Core.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Calendar;

public sealed class ReopenCalendarPoll : Endpoint<ReopenCalendarPollRequest>
{
    private readonly CalendarService _calendarService;

    public ReopenCalendarPoll(CalendarService calendarService)
    {
        _calendarService = calendarService;
    }

    public override void Configure()
    {
        Post("calendar/polls/{pollId}/reopen");
    }

    public override async Task HandleAsync(ReopenCalendarPollRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _calendarService.ReopenPollAsync(
            accountId.Value,
            req.PollId,
            AddOnHostKind.CalendarEntry,
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record ReopenCalendarPollRequest
{
    [RouteParam]
    public required int PollId { get; init; }
}

public sealed class ReopenCalendarPollValidator : Validator<ReopenCalendarPollRequest>
{
    public ReopenCalendarPollValidator()
    {
        RuleFor(request => request.PollId).GreaterThan(0);
    }
}
