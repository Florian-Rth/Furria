using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Announcements;

public sealed class DeleteAnnouncementSignUpLineById
    : Endpoint<DeleteAnnouncementSignUpLineByIdRequest>
{
    private readonly CalendarService _calendarService;

    public DeleteAnnouncementSignUpLineById(CalendarService calendarService)
    {
        _calendarService = calendarService;
    }

    public override void Configure()
    {
        Delete("announcements/sign-up-lines/{lineId}");
        Definition.RequirePermission(FurriaPermissions.ClubRead);
    }

    public override async Task HandleAsync(
        DeleteAnnouncementSignUpLineByIdRequest req,
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

public sealed record DeleteAnnouncementSignUpLineByIdRequest
{
    [RouteParam]
    public required int LineId { get; init; }
}

public sealed class DeleteAnnouncementSignUpLineByIdValidator
    : Validator<DeleteAnnouncementSignUpLineByIdRequest>
{
    public DeleteAnnouncementSignUpLineByIdValidator()
    {
        RuleFor(request => request.LineId).GreaterThan(0);
    }
}
