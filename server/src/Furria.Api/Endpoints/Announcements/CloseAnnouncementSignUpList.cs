using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Announcements;

public sealed class CloseAnnouncementSignUpList : Endpoint<CloseAnnouncementSignUpListRequest>
{
    private readonly CalendarService _calendarService;

    public CloseAnnouncementSignUpList(CalendarService calendarService)
    {
        _calendarService = calendarService;
    }

    public override void Configure()
    {
        Post("announcements/sign-up-lists/{signUpListId}/close");
        Definition.RequirePermission(FurriaPermissions.ClubRead);
    }

    public override async Task HandleAsync(
        CloseAnnouncementSignUpListRequest req,
        CancellationToken ct
    )
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

public sealed record CloseAnnouncementSignUpListRequest
{
    [RouteParam]
    public required int SignUpListId { get; init; }
}

public sealed class CloseAnnouncementSignUpListValidator
    : Validator<CloseAnnouncementSignUpListRequest>
{
    public CloseAnnouncementSignUpListValidator()
    {
        RuleFor(request => request.SignUpListId).GreaterThan(0);
    }
}
