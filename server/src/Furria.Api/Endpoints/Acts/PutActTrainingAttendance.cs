using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Core.Club;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class PutActTrainingAttendance : Endpoint<PutActTrainingAttendanceRequest>
{
    private readonly ActAttendanceService _attendanceService;

    public PutActTrainingAttendance(ActAttendanceService attendanceService)
    {
        _attendanceService = attendanceService;
    }

    public override void Configure()
    {
        Put("acts/{actId}/trainings/{calendarEntryId}/attendance/{personId}");
    }

    public override async Task HandleAsync(
        PutActTrainingAttendanceRequest req,
        CancellationToken ct
    )
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _attendanceService.MarkAsync(accountId.Value, ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static MarkAttendanceCommand ToCommand(PutActTrainingAttendanceRequest req) =>
        new()
        {
            Target = new ActTrainingPersonCommand
            {
                ActId = req.ActId,
                CalendarEntryId = req.CalendarEntryId,
                PersonId = req.PersonId,
            },
            Answer = req.Answer,
        };
}

public sealed record PutActTrainingAttendanceRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    [RouteParam]
    public required int CalendarEntryId { get; init; }

    [RouteParam]
    public required int PersonId { get; init; }

    public required AttendanceAnswer Answer { get; init; }
}

public sealed class PutActTrainingAttendanceValidator : Validator<PutActTrainingAttendanceRequest>
{
    private const string PresentOrAbsentMessage = "Eintragen lässt sich nur da oder nicht da.";

    public PutActTrainingAttendanceValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.CalendarEntryId).GreaterThan(0);
        RuleFor(request => request.PersonId).GreaterThan(0);
        RuleFor(request => request.Answer)
            .Must(answer => answer is AttendanceAnswer.Yes or AttendanceAnswer.No)
            .WithMessage(PresentOrAbsentMessage);
    }
}
