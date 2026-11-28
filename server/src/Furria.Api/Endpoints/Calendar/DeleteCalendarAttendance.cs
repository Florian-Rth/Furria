using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Calendar;

public sealed class DeleteCalendarAttendance : Endpoint<DeleteCalendarAttendanceRequest>
{
    private readonly CalendarService _calendarService;

    public DeleteCalendarAttendance(CalendarService calendarService)
    {
        _calendarService = calendarService;
    }

    public override void Configure()
    {
        Delete("calendar/entries/{calendarEntryId}/attendance/{personId}");
    }

    public override async Task HandleAsync(
        DeleteCalendarAttendanceRequest req,
        CancellationToken ct
    )
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _calendarService.WithdrawMarkAsync(
            new WithdrawAttendanceMarkCommand
            {
                ActorAccountId = accountId.Value,
                CalendarEntryId = req.CalendarEntryId,
                PersonId = req.PersonId,
            },
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

public sealed record DeleteCalendarAttendanceRequest
{
    [RouteParam]
    public required int CalendarEntryId { get; init; }

    [RouteParam]
    public required int PersonId { get; init; }
}

public sealed class DeleteCalendarAttendanceValidator : Validator<DeleteCalendarAttendanceRequest>
{
    public DeleteCalendarAttendanceValidator()
    {
        RuleFor(request => request.CalendarEntryId).GreaterThan(0);
        RuleFor(request => request.PersonId).GreaterThan(0);
    }
}
