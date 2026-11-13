using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Core.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Announcements;

public sealed class PostAnnouncementAnswer : Endpoint<PostAnnouncementAnswerRequest>
{
    private readonly AnnouncementService _announcementService;

    public PostAnnouncementAnswer(AnnouncementService announcementService)
    {
        _announcementService = announcementService;
    }

    public override void Configure()
    {
        Post("announcements/{announcementId}/response");
        Definition.RequirePermission(FurriaPermissions.ClubRead);
    }

    public override async Task HandleAsync(PostAnnouncementAnswerRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _announcementService.SetResponseAsync(
            ToCommand(req, accountId.Value),
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static SetAnnouncementResponseCommand ToCommand(
        PostAnnouncementAnswerRequest req,
        int actorAccountId
    ) =>
        new()
        {
            AnnouncementId = req.AnnouncementId,
            ActorAccountId = actorAccountId,
            Answer = req.Answer,
        };
}

public sealed record PostAnnouncementAnswerRequest
{
    [RouteParam]
    public required int AnnouncementId { get; init; }

    public required AttendanceAnswer Answer { get; init; }
}

public sealed class PostAnnouncementAnswerValidator : Validator<PostAnnouncementAnswerRequest>
{
    private const string UnknownAnswerMessage = "Diese Antwort gibt es nicht.";

    public PostAnnouncementAnswerValidator()
    {
        RuleFor(request => request.AnnouncementId).GreaterThan(0);
        RuleFor(request => request.Answer).IsInEnum().WithMessage(UnknownAnswerMessage);
    }
}
