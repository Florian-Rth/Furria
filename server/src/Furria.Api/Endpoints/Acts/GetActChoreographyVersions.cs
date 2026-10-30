using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class GetActChoreographyVersions
    : Endpoint<GetActChoreographyVersionsRequest, GetActChoreographyVersionsResponse>
{
    private readonly ActChoreographyService _choreographyService;

    public GetActChoreographyVersions(ActChoreographyService choreographyService)
    {
        _choreographyService = choreographyService;
    }

    public override void Configure()
    {
        Get("acts/{actId}/choreography/versions");
    }

    public override async Task HandleAsync(
        GetActChoreographyVersionsRequest req,
        CancellationToken ct
    )
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _choreographyService.VersionsAsync(accountId.Value, req.ActId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(
            new GetActChoreographyVersionsResponse
            {
                Versions = [.. result.Value.Select(ChoreographyVersionSummaryDto.From)],
            },
            cancellation: ct
        );
    }
}

public sealed record GetActChoreographyVersionsRequest
{
    [RouteParam]
    public required int ActId { get; init; }
}

public sealed class GetActChoreographyVersionsValidator
    : Validator<GetActChoreographyVersionsRequest>
{
    public GetActChoreographyVersionsValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
    }
}

public sealed record GetActChoreographyVersionsResponse
{
    public required IReadOnlyList<ChoreographyVersionSummaryDto> Versions { get; init; }
}
