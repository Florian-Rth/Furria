using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.GroupMatcher;
using Furria.Core.GroupMatcher;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.GroupMatcher;

namespace Furria.Api.Endpoints.GroupMatcher;

public sealed class GetGroupMatcherPage
    : Endpoint<GetGroupMatcherPageRequest, GetGroupMatcherPageResponse>
{
    private readonly GroupMatcherService _groupMatcherService;
    private readonly PermissionAuthorizer _authorizer;

    public GetGroupMatcherPage(
        GroupMatcherService groupMatcherService,
        PermissionAuthorizer authorizer
    )
    {
        _groupMatcherService = groupMatcherService;
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Get("groups/{groupId}/group-matcher");
    }

    public override async Task HandleAsync(GetGroupMatcherPageRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        if (!await _authorizer.CanAdministerGroupAsync(accountId.Value, req.GroupId, ct))
        {
            await Send.ForbiddenAsync(ct);
            return;
        }

        var page = await _groupMatcherService.GetPageAsync(req.GroupId, ct);
        if (!page.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(page.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(page.Value), cancellation: ct);
    }

    private static GetGroupMatcherPageResponse ToResponse(GroupMatcherPageDetails page) =>
        new()
        {
            IsTakingPart = page.IsTakingPart,
            Statements = [.. page.Statements.Select(ToDto)],
            AdmissionAges = page.AdmissionAges,
        };

    private static GroupStatementSummaryDto ToDto(GroupStatementSummary statement) =>
        new()
        {
            StatementId = statement.StatementId,
            Text = statement.Text,
            Position = statement.Position,
            Importance = statement.Importance,
            State = statement.State,
        };
}

public sealed record GetGroupMatcherPageRequest
{
    [RouteParam]
    public required int GroupId { get; init; }
}

public sealed class GetGroupMatcherPageValidator : Validator<GetGroupMatcherPageRequest>
{
    public GetGroupMatcherPageValidator()
    {
        RuleFor(request => request.GroupId).GreaterThan(0);
    }
}

public sealed record GetGroupMatcherPageResponse
{
    public required bool IsTakingPart { get; init; }

    public required IReadOnlyList<GroupStatementSummaryDto> Statements { get; init; }

    public required IReadOnlyList<AdmissionAgeBand> AdmissionAges { get; init; }
}

public sealed record GroupStatementSummaryDto
{
    public required int StatementId { get; init; }

    public required string Text { get; init; }

    public required StancePosition? Position { get; init; }

    public required int? Importance { get; init; }

    public required GroupStatementState State { get; init; }
}
