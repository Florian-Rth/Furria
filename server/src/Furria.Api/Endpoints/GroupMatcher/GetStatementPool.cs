using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Authorization;
using Furria.Application.GroupMatcher;
using Furria.Core.Groups;
using Furria.Infrastructure.GroupMatcher;

namespace Furria.Api.Endpoints.GroupMatcher;

public sealed class GetStatementPool : EndpointWithoutRequest<GetStatementPoolResponse>
{
    private readonly StatementPoolService _statementPoolService;

    public GetStatementPool(StatementPoolService statementPoolService)
    {
        _statementPoolService = statementPoolService;
    }

    public override void Configure()
    {
        Get("manage/group-matcher");
        Definition.RequirePermission(FurriaPermissions.GroupMatcherManage);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var pool = await _statementPoolService.GetAsync(ct);

        await Send.OkAsync(ToResponse(pool), cancellation: ct);
    }

    private static GetStatementPoolResponse ToResponse(StatementPoolDetails pool) =>
        new()
        {
            Statements = [.. pool.Statements.Select(ToDto)],
            Proposals = [.. pool.Proposals.Select(ToDto)],
            Coverage = [.. pool.Coverage.Select(ToDto)],
        };

    private static ApprovedStatementSummaryDto ToDto(ApprovedStatementSummary statement) =>
        new()
        {
            StatementId = statement.StatementId,
            Text = statement.Text,
            ApprovedAt = statement.ApprovedAt,
            RewordedAt = statement.RewordedAt,
        };

    private static WaitingProposalSummaryDto ToDto(WaitingProposalSummary proposal) =>
        new()
        {
            StatementId = proposal.StatementId,
            Text = proposal.Text,
            ProposedAt = proposal.ProposedAt,
            ProposedBy = proposal.ProposedBy is { } group ? ToDto(group) : null,
        };

    private static GroupCoverageSummaryDto ToDto(GroupCoverageSummary coverage) =>
        new()
        {
            Group = ToDto(coverage.Group),
            IsTakingPart = coverage.IsTakingPart,
            Cells =
            [
                .. coverage.Cells.Select(cell => new CoverageCellDto
                {
                    StatementId = cell.StatementId,
                    State = cell.State,
                }),
            ],
        };

    private static PoolGroupRefDto ToDto(MatcherGroupRef group) =>
        new()
        {
            GroupId = group.GroupId,
            Name = group.Name,
            Tone = group.Tone,
        };
}

public sealed record GetStatementPoolResponse
{
    public required IReadOnlyList<ApprovedStatementSummaryDto> Statements { get; init; }

    public required IReadOnlyList<WaitingProposalSummaryDto> Proposals { get; init; }

    public required IReadOnlyList<GroupCoverageSummaryDto> Coverage { get; init; }
}

public sealed record ApprovedStatementSummaryDto
{
    public required int StatementId { get; init; }

    public required string Text { get; init; }

    public required DateTimeOffset ApprovedAt { get; init; }

    public required DateTimeOffset? RewordedAt { get; init; }
}

public sealed record WaitingProposalSummaryDto
{
    public required int StatementId { get; init; }

    public required string Text { get; init; }

    public required DateTimeOffset ProposedAt { get; init; }

    public required PoolGroupRefDto? ProposedBy { get; init; }
}

public sealed record GroupCoverageSummaryDto
{
    public required PoolGroupRefDto Group { get; init; }

    public required bool IsTakingPart { get; init; }

    public required IReadOnlyList<CoverageCellDto> Cells { get; init; }
}

public sealed record CoverageCellDto
{
    public required int StatementId { get; init; }

    public required GroupStatementState State { get; init; }
}

public sealed record PoolGroupRefDto
{
    public required int GroupId { get; init; }

    public required string Name { get; init; }

    public required GroupTone? Tone { get; init; }
}
