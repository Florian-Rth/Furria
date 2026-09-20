using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Groups;
using Furria.Core.Groups;
using Furria.Infrastructure.Groups;

namespace Furria.Api.Endpoints.Groups;

public sealed class GetGroups : EndpointWithoutRequest<GetGroupsResponse>
{
    private readonly GroupService _groupService;

    public GetGroups(GroupService groupService)
    {
        _groupService = groupService;
    }

    public override void Configure()
    {
        Get("groups");
        Definition.RequireAffiliation();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var personId = User.PersonId();
        if (personId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var groups = await _groupService.GetGroupsAsync(personId.Value, ct);

        await Send.OkAsync(ToResponse(groups), cancellation: ct);
    }

    private static GetGroupsResponse ToResponse(IReadOnlyList<GroupSummary> groups) =>
        new() { Groups = [.. groups.Select(ToDto)] };

    private static GroupSummaryDto ToDto(GroupSummary group) =>
        new()
        {
            GroupId = group.GroupId,
            Name = group.Name,
            Description = group.Description,
            IsRecruiting = group.IsRecruiting,
            GroupKindName = group.GroupKindName,
            FoundedYear = group.FoundedYear,
            Tone = group.Tone,
            MemberCount = group.MemberCount,
            MemberPreview = [.. group.MemberPreview.Select(ToDto)],
            Admins = [.. group.Admins.Select(ToDto)],
            ViewerIsMember = group.ViewerIsMember,
            ViewerIsAdmin = group.ViewerIsAdmin,
        };

    private static PersonRefDto ToDto(PersonReference person) =>
        new()
        {
            PersonId = person.PersonId,
            FirstName = person.FirstName,
            LastName = person.LastName,
        };
}

public sealed record GetGroupsResponse
{
    public required IReadOnlyList<GroupSummaryDto> Groups { get; init; }
}

public sealed record GroupSummaryDto
{
    public required int GroupId { get; init; }

    public required string Name { get; init; }

    public required string Description { get; init; }

    public required bool IsRecruiting { get; init; }

    public required string? GroupKindName { get; init; }

    public required int? FoundedYear { get; init; }

    public required GroupTone? Tone { get; init; }

    public required int MemberCount { get; init; }

    public required IReadOnlyList<PersonRefDto> MemberPreview { get; init; }

    public required IReadOnlyList<PersonRefDto> Admins { get; init; }

    public required bool ViewerIsMember { get; init; }

    public required bool ViewerIsAdmin { get; init; }
}

public sealed record PersonRefDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }
}
