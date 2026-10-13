using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Core.Media;
using Furria.Infrastructure.Media;

namespace Furria.Api.Endpoints.Events;

public sealed class DeleteEventPicture : Endpoint<DeleteEventPictureRequest>
{
    private readonly PictureService _pictureService;

    public DeleteEventPicture(PictureService pictureService)
    {
        _pictureService = pictureService;
    }

    public override void Configure()
    {
        Delete("events/{eventId}/picture");
        Definition.RequirePermission(FurriaPermissions.EventsManage);
    }

    public override async Task HandleAsync(DeleteEventPictureRequest req, CancellationToken ct)
    {
        var result = await _pictureService.RemoveAsync(MediaOwner.Event(req.EventId), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record DeleteEventPictureRequest
{
    [RouteParam]
    public required int EventId { get; init; }
}

public sealed class DeleteEventPictureValidator : Validator<DeleteEventPictureRequest>
{
    public DeleteEventPictureValidator()
    {
        RuleFor(request => request.EventId).GreaterThan(0);
    }
}
