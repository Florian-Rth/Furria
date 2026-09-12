using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Groups;
using Furria.Infrastructure.Groups;

namespace Furria.Api.Endpoints.Groups;

public sealed class GetGroupById : Endpoint<GetGroupByIdRequest, GetGroupByIdResponse>
{
    private readonly GroupService _groupService;

    public GetGroupById(GroupService groupService)
    {
        _groupService = groupService;
    }

    public override void Configure()
    {
        Get("groups/{groupId}");
        Definition.RequireAffiliation();
    }

    public override async Task HandleAsync(GetGroupByIdRequest req, CancellationToken ct)
    {
        var group = await _groupService.GetGroupAsync(req.GroupId, ct);
        if (!group.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(group.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(group.Value), cancellation: ct);
    }

    private static GetGroupByIdResponse ToResponse(GroupDetails group) =>
        new()
        {
            GroupId = group.GroupId,
            Name = group.Name,
            Description = group.Description,
            IsRecruiting = group.IsRecruiting,
            Members = [.. group.Members.Select(ToDto)],
            Admins = [.. group.Admins.Select(ToDto)],
        };

    private static SincePersonDto ToDto(GroupMember member) =>
        new()
        {
            PersonId = member.PersonId,
            FirstName = member.FirstName,
            LastName = member.LastName,
            Since = member.Since,
            IsAffiliated = member.IsAffiliated,
        };

    private static GroupAdminDto ToDto(GroupAdministrator admin) =>
        new()
        {
            PersonId = admin.PersonId,
            FirstName = admin.FirstName,
            LastName = admin.LastName,
            Function = admin.Function,
            Since = admin.Since,
            IsAffiliated = admin.IsAffiliated,
        };
}

public sealed record GetGroupByIdRequest
{
    [RouteParam]
    public required int GroupId { get; init; }
}

public sealed class GetGroupByIdValidator : Validator<GetGroupByIdRequest>
{
    public GetGroupByIdValidator()
    {
        RuleFor(request => request.GroupId).GreaterThan(0);
    }
}

public sealed record GetGroupByIdResponse
{
    public required int GroupId { get; init; }

    public required string Name { get; init; }

    public required string Description { get; init; }

    public required bool IsRecruiting { get; init; }

    public required IReadOnlyList<SincePersonDto> Members { get; init; }

    public required IReadOnlyList<GroupAdminDto> Admins { get; init; }
}

public sealed record SincePersonDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required DateOnly Since { get; init; }

    public required bool IsAffiliated { get; init; }
}

public sealed record GroupAdminDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required string? Function { get; init; }

    public required DateOnly Since { get; init; }

    public required bool IsAffiliated { get; init; }
}
