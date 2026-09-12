using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.Groups;

namespace Furria.Api.Endpoints.Groups;

public sealed class ArchiveGroup : Endpoint<ArchiveGroupRequest>
{
    private readonly GroupService _groupService;

    public ArchiveGroup(GroupService groupService)
    {
        _groupService = groupService;
    }

    public override void Configure()
    {
        Post("manage/groups/{groupId}/archive");
        Definition.RequirePermission(FurriaPermissions.GroupsManage);
    }

    public override async Task HandleAsync(ArchiveGroupRequest req, CancellationToken ct)
    {
        var result = await _groupService.ArchiveAsync(req.GroupId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record ArchiveGroupRequest
{
    [RouteParam]
    public required int GroupId { get; init; }
}

public sealed class ArchiveGroupValidator : Validator<ArchiveGroupRequest>
{
    public ArchiveGroupValidator()
    {
        RuleFor(request => request.GroupId).GreaterThan(0);
    }
}
