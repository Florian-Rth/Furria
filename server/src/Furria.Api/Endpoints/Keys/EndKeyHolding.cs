using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Keys;

public sealed class EndKeyHolding : Endpoint<EndKeyHoldingRequest>
{
    private readonly KeyHoldingService _keyHoldingService;

    public EndKeyHolding(KeyHoldingService keyHoldingService)
    {
        _keyHoldingService = keyHoldingService;
    }

    public override void Configure()
    {
        Post("manage/keys/{keyHoldingId}/end");
        Definition.RequirePermission(FurriaPermissions.KeyHoldingsManage);
    }

    public override async Task HandleAsync(EndKeyHoldingRequest req, CancellationToken ct)
    {
        var result = await _keyHoldingService.EndAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static KeyHoldingEndCommand ToCommand(EndKeyHoldingRequest req) =>
        new() { KeyHoldingId = req.KeyHoldingId, UntilOn = req.UntilOn };
}

public sealed record EndKeyHoldingRequest
{
    [RouteParam]
    public required int KeyHoldingId { get; init; }

    public required DateOnly UntilOn { get; init; }
}

public sealed class EndKeyHoldingValidator : Validator<EndKeyHoldingRequest>
{
    public EndKeyHoldingValidator()
    {
        RuleFor(request => request.KeyHoldingId).GreaterThan(0);
        RuleFor(request => request.UntilOn).NotEmpty();
    }
}
