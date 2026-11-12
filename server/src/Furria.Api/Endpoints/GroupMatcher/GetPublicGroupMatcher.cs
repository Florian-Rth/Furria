using FastEndpoints;
using Furria.Api.Media;
using Furria.Application.GroupMatcher;
using Furria.Application.Groups;
using Furria.Core.GroupMatcher;
using Furria.Core.Groups;
using Furria.Infrastructure.GroupMatcher;

namespace Furria.Api.Endpoints.GroupMatcher;

public sealed class GetPublicGroupMatcher : EndpointWithoutRequest<GetPublicGroupMatcherResponse>
{
    private readonly GroupMatcherService _groupMatcherService;

    public GetPublicGroupMatcher(GroupMatcherService groupMatcherService)
    {
        _groupMatcherService = groupMatcherService;
    }

    public override void Configure()
    {
        Get("public/group-matcher");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var groupMatcher = await _groupMatcherService.GetPublicAsync(ct);
        if (groupMatcher is null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        await Send.OkAsync(ToResponse(groupMatcher), cancellation: ct);
    }

    private static GetPublicGroupMatcherResponse ToResponse(PublicGroupMatcherDetails details) =>
        new()
        {
            Groups = [.. details.Groups.Select(ToDto)],
            Statements = [.. details.Statements.Select(ToDto)],
            AdmissionAges = [.. details.AdmissionAges.Select(ToDto)],
        };

    private static GroupMatcherGroupDto ToDto(PublicGroupSummary group) =>
        new()
        {
            GroupId = group.GroupId,
            Name = group.Name,
            Picture = PictureDto.From(group.Picture),
            Description = group.Description,
            IsRecruiting = group.IsRecruiting,
            GroupKindName = group.GroupKindName,
            FoundedYear = group.FoundedYear,
            Tone = group.Tone,
        };

    private static GroupMatcherStatementDto ToDto(PublicStatementSummary statement) =>
        new()
        {
            StatementId = statement.StatementId,
            Text = statement.Text,
            Stances = [.. statement.Stances.Select(ToDto)],
        };

    private static GroupMatcherStanceDto ToDto(PublicStanceSummary stance) =>
        new()
        {
            GroupId = stance.GroupId,
            Position = stance.Position,
            Importance = stance.Importance,
        };

    private static GroupMatcherAdmissionAgesDto ToDto(PublicAdmissionAgesSummary admissionAges) =>
        new() { GroupId = admissionAges.GroupId, Bands = admissionAges.Bands };
}

public sealed record GetPublicGroupMatcherResponse
{
    public required IReadOnlyList<GroupMatcherGroupDto> Groups { get; init; }

    public required IReadOnlyList<GroupMatcherStatementDto> Statements { get; init; }

    public required IReadOnlyList<GroupMatcherAdmissionAgesDto> AdmissionAges { get; init; }
}

public sealed record GroupMatcherGroupDto
{
    public required int GroupId { get; init; }

    public required string Name { get; init; }

    public required PictureDto? Picture { get; init; }

    public required string Description { get; init; }

    public required bool IsRecruiting { get; init; }

    public required string? GroupKindName { get; init; }

    public required int? FoundedYear { get; init; }

    public required GroupTone? Tone { get; init; }
}

public sealed record GroupMatcherStatementDto
{
    public required int StatementId { get; init; }

    public required string Text { get; init; }

    public required IReadOnlyList<GroupMatcherStanceDto> Stances { get; init; }
}

public sealed record GroupMatcherStanceDto
{
    public required int GroupId { get; init; }

    public required StancePosition Position { get; init; }

    public required int Importance { get; init; }
}

public sealed record GroupMatcherAdmissionAgesDto
{
    public required int GroupId { get; init; }

    public required IReadOnlyList<AdmissionAgeBand> Bands { get; init; }
}
