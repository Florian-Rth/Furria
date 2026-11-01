using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Application.Authorization;
using Furria.Application.Gallery;
using Furria.Core.Gallery;
using Furria.Infrastructure.Gallery;

namespace Furria.Api.Endpoints.Gallery;

public sealed class PostUploadLink : Endpoint<PostUploadLinkRequest, PostUploadLinkResponse>
{
    private readonly UploadLinkService _uploadLinkService;

    public PostUploadLink(UploadLinkService uploadLinkService)
    {
        _uploadLinkService = uploadLinkService;
    }

    public override void Configure()
    {
        Post("gallery/upload-links");
        Definition.RequirePermission(FurriaPermissions.GalleryManage);
    }

    public override async Task HandleAsync(PostUploadLinkRequest req, CancellationToken ct)
    {
        var link = await _uploadLinkService.CreateAsync(
            new CreateUploadLinkCommand
            {
                ActorAccountId = User.AccountId()!.Value,
                Title = req.Title,
            },
            ct
        );

        await Send.OkAsync(
            new PostUploadLinkResponse
            {
                UploadLinkId = link.UploadLinkId,
                Token = link.Token,
                ExpiresAt = link.ExpiresAt,
            },
            cancellation: ct
        );
    }
}

public sealed record PostUploadLinkRequest
{
    public required string Title { get; init; }
}

public sealed class PostUploadLinkValidator : Validator<PostUploadLinkRequest>
{
    public PostUploadLinkValidator()
    {
        RuleFor(request => request.Title)
            .Must(title => !string.IsNullOrWhiteSpace(title))
            .MaximumLength(UploadLink.TitleLength);
    }
}

public sealed record PostUploadLinkResponse
{
    public required int UploadLinkId { get; init; }

    public required string Token { get; init; }

    public required DateTimeOffset ExpiresAt { get; init; }
}
