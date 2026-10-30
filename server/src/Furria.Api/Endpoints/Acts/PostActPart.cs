using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Core.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class PostActPart : Endpoint<PostActPartRequest, PostActPartResponse>
{
    private readonly ActPartService _partService;

    public PostActPart(ActPartService partService)
    {
        _partService = partService;
    }

    public override void Configure()
    {
        Post("acts/{actId}/parts");
    }

    public override async Task HandleAsync(PostActPartRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _partService.AddAsync(
            accountId.Value,
            new AddActPartCommand
            {
                ActId = req.ActId,
                FirstStepId = req.FirstStepId,
                Name = req.Name,
            },
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(new PostActPartResponse { PartId = result.Value }, cancellation: ct);
    }
}

public sealed record PostActPartRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    public required int FirstStepId { get; init; }

    public required string Name { get; init; }
}

public sealed class PostActPartValidator : Validator<PostActPartRequest>
{
    public PostActPartValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.FirstStepId).GreaterThan(0);
        RuleFor(request => request.Name).NotEmpty().MaximumLength(ActPart.NameLength);
    }
}

public sealed record PostActPartResponse
{
    public required int PartId { get; init; }
}
