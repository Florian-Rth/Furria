using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Endpoints.RunningOrders;
using Furria.Api.Media;
using Furria.Application.RunningOrders;
using Furria.Core.Club;
using Furria.Core.RunningOrders;
using Furria.Infrastructure.RunningOrders;

namespace Furria.Api.Endpoints.Acts;

public sealed class GetActs : Endpoint<GetActsRequest, GetActsResponse>
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

    public override async Task HandleAsync(GetActsRequest req, CancellationToken ct)
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

        var shown = await _actService.GetActsAsync(scope, req.Session, ct);

        await Send.OkAsync(
            new GetActsResponse
            {
                SessionYear = shown.SessionYear,
                SessionYears = shown.SessionYears,
                Acts = [.. shown.Acts.Select(ToDto)],
            },
            cancellation: ct
        );
    }

    private static ActSummaryDto ToDto(ActSummary act) =>
        new()
        {
            ActId = act.ActId,
            Name = act.Name,
            Kind = act.Kind,
            SessionYear = act.SessionYear,
            Closed = act.IsClosed,
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

public sealed record GetActsRequest
{
    [QueryParam]
    public int? Session { get; init; }
}

public sealed class GetActsValidator : Validator<GetActsRequest>
{
    public GetActsValidator()
    {
        RuleFor(request => request.Session).GreaterThanOrEqualTo(ClubSession.EarliestSessionYear);
    }
}

public sealed record GetActsResponse
{
    public required int SessionYear { get; init; }

    public required IReadOnlyList<int> SessionYears { get; init; }

    public required IReadOnlyList<ActSummaryDto> Acts { get; init; }
}

public sealed record ActSummaryDto
{
    public required int ActId { get; init; }

    public required string Name { get; init; }

    public required ActKind? Kind { get; init; }

    public required int? SessionYear { get; init; }

    public required bool Closed { get; init; }

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
