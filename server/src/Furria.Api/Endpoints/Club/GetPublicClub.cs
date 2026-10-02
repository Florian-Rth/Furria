using FastEndpoints;
using Furria.Application.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Club;

public sealed class GetPublicClub : EndpointWithoutRequest<GetPublicClubResponse>
{
    private readonly ClubService _clubService;

    public GetPublicClub(ClubService clubService)
    {
        _clubService = clubService;
    }

    public override void Configure()
    {
        Get("public/club");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var club = await _clubService.GetPublicAsync(ct);

        await Send.OkAsync(ToResponse(club), cancellation: ct);
    }

    private static GetPublicClubResponse ToResponse(PublicClubDetails club) =>
        new()
        {
            Name = club.Name,
            FoundedYear = club.FoundedYear,
            MemberCount = club.MemberCount,
            GroupCount = club.GroupCount,
            Session = ToDto(club.Session),
        };

    private static PublicClubSessionDto ToDto(PublicClubSession session) =>
        new()
        {
            StartYear = session.StartYear,
            Label = session.Label,
            Motto = session.Motto,
        };
}

public sealed record GetPublicClubResponse
{
    public required string? Name { get; init; }

    public required int? FoundedYear { get; init; }

    public required int MemberCount { get; init; }

    public required int GroupCount { get; init; }

    public required PublicClubSessionDto Session { get; init; }
}

public sealed record PublicClubSessionDto
{
    public required int StartYear { get; init; }

    public required string Label { get; init; }

    public required string? Motto { get; init; }
}
