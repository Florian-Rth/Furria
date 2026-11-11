using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Calendar;

public sealed class CloseCalendarPoll : Endpoint<CloseCalendarPollRequest>
{
    private readonly CalendarService _calendarService;

    public CloseCalendarPoll(CalendarService calendarService)
    {
        _calendarService = calendarService;
    }

    public override void Configure()
    {
        Post("calendar/polls/{pollId}/close");
    }

    public override async Task HandleAsync(CloseCalendarPollRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _calendarService.ClosePollAsync(accountId.Value, req.PollId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record CloseCalendarPollRequest
{
    [RouteParam]
    public required int PollId { get; init; }
}

public sealed class CloseCalendarPollValidator : Validator<CloseCalendarPollRequest>
{
    public CloseCalendarPollValidator()
    {
        RuleFor(request => request.PollId).GreaterThan(0);
    }
}
