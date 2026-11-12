using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Core.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Calendar;

public sealed class DeleteOwnCalendarSignUpLine : Endpoint<DeleteOwnCalendarSignUpLineRequest>
{
    private readonly CalendarService _calendarService;

    public DeleteOwnCalendarSignUpLine(CalendarService calendarService)
    {
        _calendarService = calendarService;
    }

    public override void Configure()
    {
        Delete("calendar/sign-up-lists/{signUpListId}/my-line");
    }

    public override async Task HandleAsync(
        DeleteOwnCalendarSignUpLineRequest req,
        CancellationToken ct
    )
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _calendarService.DeleteOwnSignUpLineAsync(
            accountId.Value,
            req.SignUpListId,
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

public sealed record DeleteOwnCalendarSignUpLineRequest
{
    [RouteParam]
    public required int SignUpListId { get; init; }
}

public sealed class DeleteOwnCalendarSignUpLineValidator
    : Validator<DeleteOwnCalendarSignUpLineRequest>
{
    public DeleteOwnCalendarSignUpLineValidator()
    {
        RuleFor(request => request.SignUpListId).GreaterThan(0);
    }
}
