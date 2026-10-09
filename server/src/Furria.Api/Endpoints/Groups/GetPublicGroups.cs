using FastEndpoints;
using Furria.Api.Media;
using Furria.Application.Groups;
using Furria.Core.Groups;
using Furria.Infrastructure.Groups;

namespace Furria.Api.Endpoints.Groups;

public sealed class GetPublicGroups : EndpointWithoutRequest<GetPublicGroupsResponse>
{
    private readonly GroupService _groupService;

    public GetPublicGroups(GroupService groupService)
    {
        _groupService = groupService;
    }

    public override void Configure()
    {
        Get("public/groups");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var groups = await _groupService.GetPublicGroupsAsync(ct);

        await Send.OkAsync(ToResponse(groups), cancellation: ct);
    }

    private static GetPublicGroupsResponse ToResponse(IReadOnlyList<PublicGroupSummary> groups) =>
        new() { Groups = [.. groups.Select(ToDto)] };

    private static PublicGroupDto ToDto(PublicGroupSummary group) =>
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
}

public sealed record GetPublicGroupsResponse
{
    public required IReadOnlyList<PublicGroupDto> Groups { get; init; }
}

public sealed record PublicGroupDto
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
