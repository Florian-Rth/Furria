using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Calendar;

public sealed class DeleteCalendarEntryById : Endpoint<DeleteCalendarEntryByIdRequest>
{
    private readonly CalendarService _calendarService;
    private readonly PermissionAuthorizer _authorizer;

    public DeleteCalendarEntryById(CalendarService calendarService, PermissionAuthorizer authorizer)
    {
        _calendarService = calendarService;
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Delete("calendar/entries/{calendarEntryId}");
    }

    public override async Task HandleAsync(DeleteCalendarEntryByIdRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var ownership = await _calendarService.OwnershipOfAsync(req.CalendarEntryId, ct);
        if (ownership is null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        if (
            !await _authorizer.MayOwnCalendarEntryAsync(accountId.Value, ownership.OwnerGroupId, ct)
        )
        {
            await Send.ForbiddenAsync(ct);
            return;
        }

        var result = await _calendarService.DeleteAsync(req.CalendarEntryId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record DeleteCalendarEntryByIdRequest
{
    [RouteParam]
    public required int CalendarEntryId { get; init; }
}

public sealed class DeleteCalendarEntryByIdValidator : Validator<DeleteCalendarEntryByIdRequest>
{
    public DeleteCalendarEntryByIdValidator()
    {
        RuleFor(request => request.CalendarEntryId).GreaterThan(0);
    }
}
