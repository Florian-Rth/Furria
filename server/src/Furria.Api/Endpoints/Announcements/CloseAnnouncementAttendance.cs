using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Announcements;

public sealed class CloseAnnouncementAttendance : Endpoint<CloseAnnouncementAttendanceRequest>
{
    private readonly AnnouncementService _announcementService;

    public CloseAnnouncementAttendance(AnnouncementService announcementService)
    {
        _announcementService = announcementService;
    }

    public override void Configure()
    {
        Post("announcements/{announcementId}/attendance/close");
        Definition.RequirePermission(FurriaPermissions.ClubRead);
    }

    public override async Task HandleAsync(
        CloseAnnouncementAttendanceRequest req,
        CancellationToken ct
    )
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _announcementService.CloseAttendanceAsync(
            accountId.Value,
            req.AnnouncementId,
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

public sealed record CloseAnnouncementAttendanceRequest
{
    [RouteParam]
    public required int AnnouncementId { get; init; }
}

public sealed class CloseAnnouncementAttendanceValidator
    : Validator<CloseAnnouncementAttendanceRequest>
{
    public CloseAnnouncementAttendanceValidator()
    {
        RuleFor(request => request.AnnouncementId).GreaterThan(0);
    }
}
