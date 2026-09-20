using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Announcements;

public sealed class PostAnnouncement : Endpoint<PostAnnouncementRequest, PostAnnouncementResponse>
{
    private readonly AnnouncementService _announcementService;

    public PostAnnouncement(AnnouncementService announcementService)
    {
        _announcementService = announcementService;
    }

    public override void Configure()
    {
        Post("announcements");
        Definition.RequirePermission(FurriaPermissions.AnnouncementsPost);
    }

    public override async Task HandleAsync(PostAnnouncementRequest req, CancellationToken ct)
    {
        var personId = User.PersonId();
        if (personId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _announcementService.CreateAsync(ToCommand(req, personId.Value), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(result.Value), cancellation: ct);
    }

    private static CreateAnnouncementCommand ToCommand(
        PostAnnouncementRequest req,
        int authorPersonId
    ) =>
        new()
        {
            AuthorPersonId = authorPersonId,
            Title = req.Title,
            Body = req.Body,
            ValidUntil = req.ValidUntil,
        };

    private static PostAnnouncementResponse ToResponse(int announcementId) =>
        new() { AnnouncementId = announcementId };
}

public sealed record PostAnnouncementRequest
{
    public required string Title { get; init; }

    public required string Body { get; init; }

    public required DateOnly? ValidUntil { get; init; }
}

public sealed class PostAnnouncementValidator : Validator<PostAnnouncementRequest>
{
    public PostAnnouncementValidator()
    {
        RuleFor(request => request.Title).NotEmpty().MaximumLength(AnnouncementLimits.TitleLength);
        RuleFor(request => request.Body).NotEmpty().MaximumLength(AnnouncementLimits.BodyLength);
    }
}

public sealed record PostAnnouncementResponse
{
    public required int AnnouncementId { get; init; }
}
