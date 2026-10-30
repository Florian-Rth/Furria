using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Core.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class PutActPart : Endpoint<PutActPartRequest>
{
    private readonly ActPartService _partService;

    public PutActPart(ActPartService partService)
    {
        _partService = partService;
    }

    public override void Configure()
    {
        Put("acts/{actId}/parts/{partId}");
    }

    public override async Task HandleAsync(PutActPartRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _partService.SettleAsync(accountId.Value, ToSettings(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static ActPartSettingsCommand ToSettings(PutActPartRequest req) =>
        new()
        {
            ActId = req.ActId,
            PartId = req.PartId,
            Name = req.Name,
            FirstStepId = req.FirstStepId,
            MainVideoId = req.MainVideoId,
        };
}

public sealed record PutActPartRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    [RouteParam]
    public required int PartId { get; init; }

    public required string Name { get; init; }

    public required int FirstStepId { get; init; }

    public required int? MainVideoId { get; init; }
}

public sealed class PutActPartValidator : Validator<PutActPartRequest>
{
    public PutActPartValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.PartId).GreaterThan(0);
        RuleFor(request => request.Name).NotEmpty().MaximumLength(ActPart.NameLength);
        RuleFor(request => request.FirstStepId).GreaterThan(0);
        RuleFor(request => request.MainVideoId).GreaterThan(0);
    }
}
