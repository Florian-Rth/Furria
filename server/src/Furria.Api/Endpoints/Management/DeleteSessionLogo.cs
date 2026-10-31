using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Core.Media;
using Furria.Infrastructure.Media;

namespace Furria.Api.Endpoints.Management;

public sealed class DeleteSessionLogo : Endpoint<DeleteSessionLogoRequest>
{
    private readonly PictureService _pictureService;

    public DeleteSessionLogo(PictureService pictureService)
    {
        _pictureService = pictureService;
    }

    public override void Configure()
    {
        Delete("manage/sessions/{sessionId}/logo");
        Definition.RequirePermission(FurriaPermissions.ClubManage);
    }

    public override async Task HandleAsync(DeleteSessionLogoRequest req, CancellationToken ct)
    {
        var result = await _pictureService.RemoveAsync(MediaOwner.Session(req.SessionId), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record DeleteSessionLogoRequest
{
    [RouteParam]
    public required int SessionId { get; init; }
}

public sealed class DeleteSessionLogoValidator : Validator<DeleteSessionLogoRequest>
{
    public DeleteSessionLogoValidator()
    {
        RuleFor(request => request.SessionId).GreaterThan(0);
    }
}
