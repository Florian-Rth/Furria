using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Core.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Announcements;

public sealed class PostAnnouncementReminder : Endpoint<PostAnnouncementReminderRequest>
{
    private readonly AnnouncementService _announcementService;

    public PostAnnouncementReminder(AnnouncementService announcementService)
    {
        _announcementService = announcementService;
    }

    public override void Configure()
    {
        Post("announcements/{announcementId}/reminders");
        Definition.RequirePermission(FurriaPermissions.ClubRead);
    }

    public override async Task HandleAsync(
        PostAnnouncementReminderRequest req,
        CancellationToken ct
    )
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _announcementService.RemindAsync(ToCommand(req, accountId.Value), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static RemindAnnouncementCommand ToCommand(
        PostAnnouncementReminderRequest req,
        int actorAccountId
    ) =>
        new()
        {
            ActorAccountId = actorAccountId,
            AnnouncementId = req.AnnouncementId,
            Kind = req.Kind,
            AddOnId = req.AddOnId,
        };
}

public sealed record PostAnnouncementReminderRequest
{
    [RouteParam]
    public required int AnnouncementId { get; init; }

    public required AnnouncementAddOnKind Kind { get; init; }

    public int? AddOnId { get; init; }
}

public sealed class PostAnnouncementReminderValidator : Validator<PostAnnouncementReminderRequest>
{
    private const string UnremindableMessage = "An diese Funktion lässt sich nicht erinnern.";
    private const string MissingAddOnMessage = "Welche Funktion soll erinnern?";
    private const string StrayAddOnMessage = "Die Zu-/Absage braucht keine weitere Angabe.";

    public PostAnnouncementReminderValidator()
    {
        RuleFor(request => request.AnnouncementId).GreaterThan(0);
        RuleFor(request => request.Kind).IsInEnum().WithMessage(UnremindableMessage);
        RuleFor(request => request.AddOnId)
            .NotNull()
            .When(request => request.Kind != AnnouncementAddOnKind.Attendance)
            .WithMessage(MissingAddOnMessage);
        RuleFor(request => request.AddOnId)
            .GreaterThan(0)
            .When(request => request.AddOnId is not null);
        RuleFor(request => request.AddOnId)
            .Null()
            .When(request => request.Kind == AnnouncementAddOnKind.Attendance)
            .WithMessage(StrayAddOnMessage);
    }
}
