using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Core.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Calendar;

public sealed class DeleteCalendarSignUpLineById : Endpoint<DeleteCalendarSignUpLineByIdRequest>
{
    private readonly CalendarService _calendarService;

    public DeleteCalendarSignUpLineById(CalendarService calendarService)
    {
        _calendarService = calendarService;
    }

    public override void Configure()
    {
        Delete("calendar/sign-up-lines/{lineId}");
    }

    public override async Task HandleAsync(
        DeleteCalendarSignUpLineByIdRequest req,
        CancellationToken ct
    )
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _calendarService.RemoveSignUpLineAsync(
            accountId.Value,
            req.LineId,
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

public sealed record DeleteCalendarSignUpLineByIdRequest
{
    [RouteParam]
    public required int LineId { get; init; }
}

public sealed class DeleteCalendarSignUpLineByIdValidator
    : Validator<DeleteCalendarSignUpLineByIdRequest>
{
    public DeleteCalendarSignUpLineByIdValidator()
    {
        RuleFor(request => request.LineId).GreaterThan(0);
    }
}
