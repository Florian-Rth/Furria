using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class DeleteActPartById : Endpoint<DeleteActPartByIdRequest>
{
    private readonly ActPartService _partService;

    public DeleteActPartById(ActPartService partService)
    {
        _partService = partService;
    }

    public override void Configure()
    {
        Delete("acts/{actId}/parts/{partId}");
    }

    public override async Task HandleAsync(DeleteActPartByIdRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _partService.RemoveAsync(
            accountId.Value,
            new RemoveActPartCommand { ActId = req.ActId, PartId = req.PartId },
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record DeleteActPartByIdRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    [RouteParam]
    public required int PartId { get; init; }
}

public sealed class DeleteActPartByIdValidator : Validator<DeleteActPartByIdRequest>
{
    public DeleteActPartByIdValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.PartId).GreaterThan(0);
    }
}
