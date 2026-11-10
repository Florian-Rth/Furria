using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Promo;
using Furria.Application.Website;
using Furria.Infrastructure.Promo;
using Microsoft.Extensions.Options;

namespace Furria.Api.Endpoints.Promo;

public sealed class GetPromoMembers : EndpointWithoutRequest<GetPromoMembersResponse>
{
    private readonly PromoService _promoService;
    private readonly IOptions<WebsiteOptions> _websiteOptions;

    public GetPromoMembers(PromoService promoService, IOptions<WebsiteOptions> websiteOptions)
    {
        _promoService = promoService;
        _websiteOptions = websiteOptions;
    }

    public override void Configure()
    {
        Get("promo/members");
        Definition.RequireAffiliation();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var members = await _promoService.GetMembersAsync(ct);

        await Send.OkAsync(ToResponse(members, _websiteOptions.Value.BaseUrl), cancellation: ct);
    }

    private static GetPromoMembersResponse ToResponse(
        IReadOnlyList<PromoMemberSummary> members,
        string websiteUrl
    ) => new() { WebsiteUrl = websiteUrl, Members = [.. members.Select(ToDto)] };

    private static PromoMemberSummaryDto ToDto(PromoMemberSummary member) =>
        new()
        {
            AccountId = member.AccountId,
            FirstName = member.FirstName,
            LastInitial = member.LastInitial,
            ArrivedAt = member.ArrivedAt,
        };
}

public sealed record GetPromoMembersResponse
{
    public required string WebsiteUrl { get; init; }

    public required IReadOnlyList<PromoMemberSummaryDto> Members { get; init; }
}

public sealed record PromoMemberSummaryDto
{
    public required int AccountId { get; init; }

    public required string FirstName { get; init; }

    public required string LastInitial { get; init; }

    public required DateTimeOffset? ArrivedAt { get; init; }
}
