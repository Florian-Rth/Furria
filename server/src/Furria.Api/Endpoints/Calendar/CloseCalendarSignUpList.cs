using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Core.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Calendar;

public sealed class CloseCalendarSignUpList : Endpoint<CloseCalendarSignUpListRequest>
{
    private readonly CalendarService _calendarService;

    public CloseCalendarSignUpList(CalendarService calendarService)
    {
        _calendarService = calendarService;
    }

    public override void Configure()
    {
        Post("calendar/sign-up-lists/{signUpListId}/close");
    }

    public override async Task HandleAsync(CloseCalendarSignUpListRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _calendarService.CloseSignUpListAsync(
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

public sealed record CloseCalendarSignUpListRequest
{
    [RouteParam]
    public required int SignUpListId { get; init; }
}

public sealed class CloseCalendarSignUpListValidator : Validator<CloseCalendarSignUpListRequest>
{
    public CloseCalendarSignUpListValidator()
    {
        RuleFor(request => request.SignUpListId).GreaterThan(0);
    }
}
