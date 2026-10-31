using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class GetActEveningChoreographyVersions
    : Endpoint<GetActEveningChoreographyVersionsRequest, GetActEveningChoreographyVersionsResponse>
{
    private readonly ActEveningService _eveningService;

    public GetActEveningChoreographyVersions(ActEveningService eveningService)
    {
        _eveningService = eveningService;
    }

    public override void Configure()
    {
        Get("acts/{actId}/evenings/{eventId}/choreography/versions");
    }

    public override async Task HandleAsync(
        GetActEveningChoreographyVersionsRequest req,
        CancellationToken ct
    )
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _eveningService.ChoreographyVersionsAsync(
            accountId.Value,
            new ActEveningChoreographyVersionsQuery
            {
                ActId = req.ActId,
                EventId = req.EventId,
                Before = req.Before,
            },
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(
            new GetActEveningChoreographyVersionsResponse
            {
                Versions = [.. result.Value.Versions.Select(ChoreographyVersionSummaryDto.From)],
                Total = result.Value.Total,
                HasOlder = result.Value.HasOlder,
            },
            cancellation: ct
        );
    }
}

public sealed record GetActEveningChoreographyVersionsRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    [RouteParam]
    public required int EventId { get; init; }

    [QueryParam]
    public int? Before { get; init; }
}

public sealed class GetActEveningChoreographyVersionsValidator
    : Validator<GetActEveningChoreographyVersionsRequest>
{
    public GetActEveningChoreographyVersionsValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.EventId).GreaterThan(0);
        RuleFor(request => request.Before)
            .GreaterThan(0)
            .When(request => request.Before is not null);
    }
}

public sealed record GetActEveningChoreographyVersionsResponse
{
    public required IReadOnlyList<ChoreographyVersionSummaryDto> Versions { get; init; }

    public required int Total { get; init; }

    public required bool HasOlder { get; init; }
}
