using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.Gallery;

namespace Furria.Api.Endpoints.Gallery;

public sealed class RevokeUploadLink : Endpoint<RevokeUploadLinkRequest>
{
    private readonly UploadLinkService _uploadLinkService;

    public RevokeUploadLink(UploadLinkService uploadLinkService)
    {
        _uploadLinkService = uploadLinkService;
    }

    public override void Configure()
    {
        Post("gallery/upload-links/{uploadLinkId}/revoke");
        Definition.RequirePermission(FurriaPermissions.GalleryManage);
    }

    public override async Task HandleAsync(RevokeUploadLinkRequest req, CancellationToken ct)
    {
        var result = await _uploadLinkService.RevokeAsync(req.UploadLinkId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record RevokeUploadLinkRequest
{
    [RouteParam]
    public required int UploadLinkId { get; init; }
}

public sealed class RevokeUploadLinkValidator : Validator<RevokeUploadLinkRequest>
{
    public RevokeUploadLinkValidator()
    {
        RuleFor(request => request.UploadLinkId).GreaterThan(0);
    }
}
