using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class DeleteActTrainingAttendance : Endpoint<DeleteActTrainingAttendanceRequest>
{
    private readonly ActAttendanceService _attendanceService;

    public DeleteActTrainingAttendance(ActAttendanceService attendanceService)
    {
        _attendanceService = attendanceService;
    }

    public override void Configure()
    {
        Delete("acts/{actId}/trainings/{calendarEntryId}/attendance/{personId}");
    }

    public override async Task HandleAsync(
        DeleteActTrainingAttendanceRequest req,
        CancellationToken ct
    )
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _attendanceService.WithdrawAsync(
            accountId.Value,
            new ActTrainingPersonCommand
            {
                ActId = req.ActId,
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

public sealed record DeleteActTrainingAttendanceRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    [RouteParam]
    public required int CalendarEntryId { get; init; }

    [RouteParam]
    public required int PersonId { get; init; }
}

public sealed class DeleteActTrainingAttendanceValidator
    : Validator<DeleteActTrainingAttendanceRequest>
{
    public DeleteActTrainingAttendanceValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.CalendarEntryId).GreaterThan(0);
        RuleFor(request => request.PersonId).GreaterThan(0);
    }
}
