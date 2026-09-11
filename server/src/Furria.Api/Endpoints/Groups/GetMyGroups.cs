using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Groups;
using Furria.Infrastructure.Groups;

namespace Furria.Api.Endpoints.Groups;

public sealed class GetMyGroups : EndpointWithoutRequest<GetMyGroupsResponse>
{
    private readonly GroupService _groupService;

    public GetMyGroups(GroupService groupService)
    {
        _groupService = groupService;
    }

    public override void Configure()
    {
        Get("my-groups");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var personId = User.PersonId();
        if (personId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var groups = await _groupService.GetMyGroupsAsync(personId.Value, ct);

        await Send.OkAsync(ToResponse(groups), cancellation: ct);
    }

    private static GetMyGroupsResponse ToResponse(IReadOnlyList<MyGroupSummary> groups) =>
        new() { Groups = [.. groups.Select(ToDto)] };

    private static MyGroupSummaryDto ToDto(MyGroupSummary group) =>
        new()
        {
            GroupId = group.GroupId,
            Name = group.Name,
            IsMember = group.IsMember,
            IsAdmin = group.IsAdmin,
        };
}

public sealed record GetMyGroupsResponse
{
    public required IReadOnlyList<MyGroupSummaryDto> Groups { get; init; }
}

public sealed record MyGroupSummaryDto
{
    public required int GroupId { get; init; }

    public required string Name { get; init; }

    public required bool IsMember { get; init; }

    public required bool IsAdmin { get; init; }
}
