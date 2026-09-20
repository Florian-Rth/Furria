using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Management;

public sealed class GetSessionRecords : EndpointWithoutRequest<GetSessionRecordsResponse>
{
    private readonly SessionRecordService _sessionRecordService;

    public GetSessionRecords(SessionRecordService sessionRecordService)
    {
        _sessionRecordService = sessionRecordService;
    }

    public override void Configure()
    {
        Get("manage/sessions");
        Definition.RequirePermission(FurriaPermissions.ClubManage);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var records = await _sessionRecordService.GetRecordsAsync(ct);

        await Send.OkAsync(ToResponse(records), cancellation: ct);
    }

    private static GetSessionRecordsResponse ToResponse(
        IReadOnlyList<SessionRecordSummary> records
    ) => new() { Sessions = [.. records.Select(ToDto)] };

    private static SessionRecordSummaryDto ToDto(SessionRecordSummary record) =>
        new()
        {
            SessionId = record.SessionId,
            StartYear = record.StartYear,
            Number = record.Number,
            Motto = record.Motto,
            LogoSvg = record.LogoSvg,
        };
}

public sealed record GetSessionRecordsResponse
{
    public required IReadOnlyList<SessionRecordSummaryDto> Sessions { get; init; }
}

public sealed record SessionRecordSummaryDto
{
    public required int SessionId { get; init; }

    public required int StartYear { get; init; }

    public required int? Number { get; init; }

    public required string? Motto { get; init; }

    public required string? LogoSvg { get; init; }
}
