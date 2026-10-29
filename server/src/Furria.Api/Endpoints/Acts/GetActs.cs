using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Api.Endpoints.RunningOrders;
using Furria.Api.Media;
using Furria.Application.RunningOrders;
using Furria.Core.RunningOrders;
using Furria.Infrastructure.RunningOrders;

namespace Furria.Api.Endpoints.Acts;

public sealed class GetActs : EndpointWithoutRequest<GetActsResponse>
{
    private readonly ActService _actService;
    private readonly ActAccess _actAccess;

    public GetActs(ActService actService, ActAccess actAccess)
    {
        _actService = actService;
        _actAccess = actAccess;
    }

    public override void Configure()
    {
        Get("acts");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var scope = await _actAccess.ScopeOfAsync(accountId.Value, ct);
        if (scope is null)
        {
            await Send.ForbiddenAsync(ct);
            return;
        }

        var acts = await _actService.GetActsAsync(scope, ct);

        await Send.OkAsync(
            new GetActsResponse { Acts = [.. acts.Select(ToDto)] },
            cancellation: ct
        );
    }

    private static ActSummaryDto ToDto(ActSummary act) =>
        new()
        {
            ActId = act.ActId,
            Name = act.Name,
            Kind = act.Kind,
            Group = ActGroupDto.From(act.Group),
            Archived = act.IsArchived,
            Cast = [.. act.Cast.Select(CastPersonDto.From)],
            Added = [.. act.Added.Select(ToPersonDto)],
            Removed = [.. act.Removed.Select(ToPersonDto)],
            Wishes = [.. act.Wishes.Select(ActWishDto.From)],
        };

    private static ActPersonDto ToPersonDto(CastMember member) =>
        new()
        {
            PersonId = member.PersonId,
            FirstName = member.FirstName,
            LastName = member.LastName,
            Portrait = PictureDto.From(member.Portrait),
        };
}

public sealed record GetActsResponse
{
    public required IReadOnlyList<ActSummaryDto> Acts { get; init; }
}

public sealed record ActSummaryDto
{
    public required int ActId { get; init; }

    public required string Name { get; init; }

    public required ActKind? Kind { get; init; }

    public required ActGroupDto? Group { get; init; }

    public required bool Archived { get; init; }

    public required IReadOnlyList<CastPersonDto> Cast { get; init; }

    public required IReadOnlyList<ActPersonDto> Added { get; init; }

    public required IReadOnlyList<ActPersonDto> Removed { get; init; }

    public required IReadOnlyList<ActWishDto> Wishes { get; init; }
}

public sealed record ActPersonDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required PictureDto? Portrait { get; init; }
}
