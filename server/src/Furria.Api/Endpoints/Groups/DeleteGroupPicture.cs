using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Core.Media;
using Furria.Infrastructure.Media;

namespace Furria.Api.Endpoints.Groups;

public sealed class DeleteGroupPicture : Endpoint<DeleteGroupPictureRequest>
{
    private readonly MediaOwnerAccess _ownerAccess;
    private readonly PictureService _pictureService;

    public DeleteGroupPicture(MediaOwnerAccess ownerAccess, PictureService pictureService)
    {
        _ownerAccess = ownerAccess;
        _pictureService = pictureService;
    }

    public override void Configure()
    {
        Delete("groups/{groupId}/picture");
    }

    public override async Task HandleAsync(DeleteGroupPictureRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var owner = MediaOwner.Group(req.GroupId);
        var access = await _ownerAccess.MayUploadAsync(accountId.Value, owner, ct);
        var result = access.IsSuccess ? await _pictureService.RemoveAsync(owner, ct) : access;
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record DeleteGroupPictureRequest
{
    [RouteParam]
    public required int GroupId { get; init; }
}

public sealed class DeleteGroupPictureValidator : Validator<DeleteGroupPictureRequest>
{
    public DeleteGroupPictureValidator()
    {
        RuleFor(request => request.GroupId).GreaterThan(0);
    }
}
