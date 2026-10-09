using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Core.Media;
using Furria.Infrastructure.Media;

namespace Furria.Api.Endpoints.Persons;

public sealed class DeletePortrait : Endpoint<DeletePortraitRequest>
{
    private readonly MediaOwnerAccess _ownerAccess;
    private readonly PictureService _pictureService;

    public DeletePortrait(MediaOwnerAccess ownerAccess, PictureService pictureService)
    {
        _ownerAccess = ownerAccess;
        _pictureService = pictureService;
    }

    public override void Configure()
    {
        Delete("persons/{personId}/portrait");
    }

    public override async Task HandleAsync(DeletePortraitRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var owner = MediaOwner.Person(req.PersonId);
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

public sealed record DeletePortraitRequest
{
    [RouteParam]
    public required int PersonId { get; init; }
}

public sealed class DeletePortraitValidator : Validator<DeletePortraitRequest>
{
    public DeletePortraitValidator()
    {
        RuleFor(request => request.PersonId).GreaterThan(0);
    }
}
