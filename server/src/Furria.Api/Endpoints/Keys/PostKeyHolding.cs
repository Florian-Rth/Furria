using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Keys;

public sealed class PostKeyHolding : Endpoint<PostKeyHoldingRequest, PostKeyHoldingResponse>
{
    private readonly KeyHoldingService _keyHoldingService;

    public PostKeyHolding(KeyHoldingService keyHoldingService)
    {
        _keyHoldingService = keyHoldingService;
    }

    public override void Configure()
    {
        Post("manage/keys");
        Definition.RequirePermission(FurriaPermissions.KeyHoldingsManage);
    }

    public override async Task HandleAsync(PostKeyHoldingRequest req, CancellationToken ct)
    {
        var result = await _keyHoldingService.OpenAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(result.Value), cancellation: ct);
    }

    private static KeyHoldingOpenCommand ToCommand(PostKeyHoldingRequest req) =>
        new()
        {
            VenueId = req.VenueId,
            PersonId = req.PersonId,
            SinceOn = req.SinceOn,
        };

    private static PostKeyHoldingResponse ToResponse(int keyHoldingId) =>
        new() { KeyHoldingId = keyHoldingId };
}

public sealed record PostKeyHoldingRequest
{
    public required int VenueId { get; init; }

    public required int PersonId { get; init; }

    public required DateOnly SinceOn { get; init; }
}

public sealed class PostKeyHoldingValidator : Validator<PostKeyHoldingRequest>
{
    public PostKeyHoldingValidator()
    {
        RuleFor(request => request.VenueId).GreaterThan(0);
        RuleFor(request => request.PersonId).GreaterThan(0);
        RuleFor(request => request.SinceOn).NotEmpty();
    }
}

public sealed record PostKeyHoldingResponse
{
    public required int KeyHoldingId { get; init; }
}
