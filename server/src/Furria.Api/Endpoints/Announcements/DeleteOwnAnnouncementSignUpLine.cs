using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Announcements;

public sealed class DeleteOwnAnnouncementSignUpLine
    : Endpoint<DeleteOwnAnnouncementSignUpLineRequest>
{
    private readonly CalendarService _calendarService;

    public DeleteOwnAnnouncementSignUpLine(CalendarService calendarService)
    {
        _calendarService = calendarService;
    }

    public override void Configure()
    {
        Delete("announcements/sign-up-lists/{signUpListId}/my-line");
        Definition.RequirePermission(FurriaPermissions.ClubRead);
    }

    public override async Task HandleAsync(
        DeleteOwnAnnouncementSignUpLineRequest req,
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
            AddOnHostKind.Announcement,
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

public sealed record DeleteOwnAnnouncementSignUpLineRequest
{
    [RouteParam]
    public required int SignUpListId { get; init; }
}

public sealed class DeleteOwnAnnouncementSignUpLineValidator
    : Validator<DeleteOwnAnnouncementSignUpLineRequest>
{
    public DeleteOwnAnnouncementSignUpLineValidator()
    {
        RuleFor(request => request.SignUpListId).GreaterThan(0);
    }
}
