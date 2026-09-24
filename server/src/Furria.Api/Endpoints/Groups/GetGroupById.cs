using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Groups;
using Furria.Core.Groups;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Groups;

namespace Furria.Api.Endpoints.Groups;

public sealed class GetGroupById : Endpoint<GetGroupByIdRequest, GetGroupByIdResponse>
{
    private readonly GroupService _groupService;
    private readonly PermissionAuthorizer _authorizer;

    public GetGroupById(GroupService groupService, PermissionAuthorizer authorizer)
    {
        _groupService = groupService;
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Get("groups/{groupId}");
    }

    public override async Task HandleAsync(GetGroupByIdRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        if (!await MayReadAsync(accountId.Value, req.GroupId, ct))
        {
            await Send.ForbiddenAsync(ct);
            return;
        }

        var group = await _groupService.GetGroupAsync(req.GroupId, User.PersonId(), ct);
        if (!group.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(group.Error, ct);
            return;
        }

        var viewerMayManage =
            group.Value.ViewerIsAdmin
            || await _authorizer.IsGrantedAsync(
                accountId.Value,
                FurriaPermissions.GroupsManage,
                ct
            );

        await Send.OkAsync(ToResponse(group.Value, viewerMayManage), cancellation: ct);
    }

    private async Task<bool> MayReadAsync(int accountId, int groupId, CancellationToken ct) =>
        await _authorizer.IsAffiliatedAsync(accountId, ct)
        || await _authorizer.CanAdministerGroupAsync(accountId, groupId, ct);

    private static GetGroupByIdResponse ToResponse(GroupDetails group, bool viewerMayManage) =>
        new()
        {
            GroupId = group.GroupId,
            Name = group.Name,
            Description = group.Description,
            IsRecruiting = group.IsRecruiting,
            GroupKindId = group.GroupKindId,
            GroupKindName = group.GroupKindName,
            FoundedYear = group.FoundedYear,
            Tone = group.Tone,
            TrainingSlots = [.. group.TrainingSlots.Select(ToDto)],
            Admins = [.. group.Admins.Select(ToDto)],
            Members = [.. group.Members.Select(ToDto)],
            ViewerIsMember = group.ViewerIsMember,
            ViewerIsAdmin = group.ViewerIsAdmin,
            ViewerMayManage = viewerMayManage,
            ViewerSince = group.ViewerSince,
            PastMembers = viewerMayManage ? [.. group.PastMembers.Select(ToDto)] : [],
            PastAdmins = viewerMayManage ? [.. group.PastAdmins.Select(ToDto)] : [],
        };

    private static GroupTrainingSlotDto ToDto(GroupTrainingSlotDetails slot) =>
        new()
        {
            GroupTrainingSlotId = slot.GroupTrainingSlotId,
            Weekday = slot.Weekday,
            StartsAt = slot.StartsAt,
            DurationMinutes = slot.DurationMinutes,
            VenueId = slot.VenueId,
            VenueName = slot.VenueName,
        };

    private static HubMemberDto ToDto(HubMember member) =>
        new()
        {
            GroupMembershipId = member.GroupMembershipId,
            PersonId = member.PersonId,
            FirstName = member.FirstName,
            LastName = member.LastName,
            JoinedOn = member.JoinedOn,
            LeftOn = member.LeftOn,
            Since = member.Since,
            IsAffiliated = member.IsAffiliated,
        };

    private static HubAdminDto ToDto(HubAdministrator admin) =>
        new()
        {
            GroupAdminId = admin.GroupAdminId,
            PersonId = admin.PersonId,
            FirstName = admin.FirstName,
            LastName = admin.LastName,
            Function = admin.Function,
            SinceOn = admin.SinceOn,
            UntilOn = admin.UntilOn,
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

    public required int? GroupKindId { get; init; }

    public required string? GroupKindName { get; init; }

    public required int? FoundedYear { get; init; }

    public required GroupTone? Tone { get; init; }

    public required IReadOnlyList<GroupTrainingSlotDto> TrainingSlots { get; init; }

    public required IReadOnlyList<HubAdminDto> Admins { get; init; }

    public required IReadOnlyList<HubMemberDto> Members { get; init; }

    public required bool ViewerIsMember { get; init; }

    public required bool ViewerIsAdmin { get; init; }

    public required bool ViewerMayManage { get; init; }

    public required DateOnly? ViewerSince { get; init; }

    public required IReadOnlyList<HubMemberDto> PastMembers { get; init; }

    public required IReadOnlyList<HubAdminDto> PastAdmins { get; init; }
}

public sealed record GroupTrainingSlotDto
{
    public required int GroupTrainingSlotId { get; init; }

    public required DayOfWeek Weekday { get; init; }

    public required TimeOnly StartsAt { get; init; }

    public required int DurationMinutes { get; init; }

    public required int? VenueId { get; init; }

    public required string? VenueName { get; init; }
}

public sealed record HubMemberDto
{
    public required int GroupMembershipId { get; init; }

    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required DateOnly JoinedOn { get; init; }

    public required DateOnly? LeftOn { get; init; }

    public required DateOnly Since { get; init; }

    public required bool IsAffiliated { get; init; }
}

public sealed record HubAdminDto
{
    public required int GroupAdminId { get; init; }

    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required string? Function { get; init; }

    public required DateOnly SinceOn { get; init; }

    public required DateOnly? UntilOn { get; init; }

    public required DateOnly Since { get; init; }

    public required bool IsAffiliated { get; init; }
}
