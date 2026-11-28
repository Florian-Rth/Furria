using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Club;
using Furria.Core.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Calendar;

public sealed class PutCalendarAttendance : Endpoint<PutCalendarAttendanceRequest>
{
    private readonly CalendarService _calendarService;

    public PutCalendarAttendance(CalendarService calendarService)
    {
        _calendarService = calendarService;
    }

    public override void Configure()
    {
        Put("calendar/entries/{calendarEntryId}/attendance/{personId}");
    }

    public override async Task HandleAsync(PutCalendarAttendanceRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _calendarService.MarkAsync(
            new MarkAttendanceCommand
            {
                ActorAccountId = accountId.Value,
                CalendarEntryId = req.CalendarEntryId,
                PersonId = req.PersonId,
                Answer = req.Answer,
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

public sealed record PutCalendarAttendanceRequest
{
    [RouteParam]
    public required int CalendarEntryId { get; init; }

    [RouteParam]
    public required int PersonId { get; init; }

    public required AttendanceAnswer Answer { get; init; }
}

public sealed class PutCalendarAttendanceValidator : Validator<PutCalendarAttendanceRequest>
{
    private const string PresentOrAbsentMessage = "Eintragen lässt sich nur da oder nicht da.";

    public PutCalendarAttendanceValidator()
    {
        RuleFor(request => request.CalendarEntryId).GreaterThan(0);
        RuleFor(request => request.PersonId).GreaterThan(0);
        RuleFor(request => request.Answer)
            .Must(answer => answer is AttendanceAnswer.Yes or AttendanceAnswer.No)
            .WithMessage(PresentOrAbsentMessage);
    }
}
