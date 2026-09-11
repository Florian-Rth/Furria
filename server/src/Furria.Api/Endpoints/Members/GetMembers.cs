using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Registry;
using Furria.Core.Club;
using Furria.Infrastructure.Registry;

namespace Furria.Api.Endpoints.Members;

public sealed class GetMembers : EndpointWithoutRequest<GetMembersResponse>
{
    private readonly PersonService _personService;

    public GetMembers(PersonService personService)
    {
        _personService = personService;
    }

    public override void Configure()
    {
        Get("members");
        Definition.RequireAffiliation();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var members = await _personService.GetMembersAsync(ct);

        await Send.OkAsync(ToResponse(members), cancellation: ct);
    }

    private static GetMembersResponse ToResponse(IReadOnlyList<MemberSummary> members) =>
        new() { Members = [.. members.Select(ToDto)] };

    private static MemberSummaryDto ToDto(MemberSummary member) =>
        new()
        {
            PersonId = member.PersonId,
            FirstName = member.FirstName,
            LastName = member.LastName,
            MembershipState = member.MembershipState,
            Groups = [.. member.Groups.Select(ToDto)],
            Roles = [.. member.Roles.Select(ToDto)],
        };

    private static GroupRefDto ToDto(GroupReference group) =>
        new() { GroupId = group.GroupId, Name = group.Name };

    private static RoleRefDto ToDto(RoleReference role) =>
        new() { RoleId = role.RoleId, Name = role.Name };
}

public sealed record GetMembersResponse
{
    public required IReadOnlyList<MemberSummaryDto> Members { get; init; }
}

public sealed record MemberSummaryDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required MembershipState MembershipState { get; init; }

    public required IReadOnlyList<GroupRefDto> Groups { get; init; }

    public required IReadOnlyList<RoleRefDto> Roles { get; init; }
}

public sealed record GroupRefDto
{
    public required int GroupId { get; init; }

    public required string Name { get; init; }
}

public sealed record RoleRefDto
{
    public required int RoleId { get; init; }

    public required string Name { get; init; }
}
