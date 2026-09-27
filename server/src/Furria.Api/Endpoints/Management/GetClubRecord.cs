using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Management;

public sealed class GetClubRecord : EndpointWithoutRequest<GetClubRecordResponse>
{
    private readonly ClubRecordService _clubRecordService;

    public GetClubRecord(ClubRecordService clubRecordService)
    {
        _clubRecordService = clubRecordService;
    }

    public override void Configure()
    {
        Get("manage/club-record");
        Definition.RequirePermission(FurriaPermissions.ClubManage);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var record = await _clubRecordService.GetAsync(ct);

        await Send.OkAsync(ToResponse(record), cancellation: ct);
    }

    private static GetClubRecordResponse ToResponse(ClubRecordDetails record) =>
        new()
        {
            Name = record.Name,
            ShortName = record.ShortName,
            FoundedYear = record.FoundedYear,
            Street = record.Street,
            Zip = record.Zip,
            City = record.City,
            Email = record.Email,
            Phone = record.Phone,
            WebsiteUrl = record.WebsiteUrl,
            InstagramUrl = record.InstagramUrl,
            FacebookUrl = record.FacebookUrl,
            AgeOfConsent = record.AgeOfConsent,
        };
}

public sealed record GetClubRecordResponse
{
    public required string? Name { get; init; }

    public required string? ShortName { get; init; }

    public required int? FoundedYear { get; init; }

    public required string? Street { get; init; }

    public required string? Zip { get; init; }

    public required string? City { get; init; }

    public required string? Email { get; init; }

    public required string? Phone { get; init; }

    public required string? WebsiteUrl { get; init; }

    public required string? InstagramUrl { get; init; }

    public required string? FacebookUrl { get; init; }

    public required int AgeOfConsent { get; init; }
}
