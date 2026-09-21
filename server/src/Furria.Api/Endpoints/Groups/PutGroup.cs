using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Groups;
using Furria.Infrastructure.Groups;

namespace Furria.Api.Endpoints.Groups;

public sealed class PutGroup : Endpoint<PutGroupRequest>
{
    private readonly GroupService _groupService;

    public PutGroup(GroupService groupService)
    {
        _groupService = groupService;
    }

    public override void Configure()
    {
        Put("manage/groups/{groupId}");
        Definition.RequirePermission(FurriaPermissions.GroupsManage);
    }

    public override async Task HandleAsync(PutGroupRequest req, CancellationToken ct)
    {
        var result = await _groupService.UpdateAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static UpdateGroupCommand ToCommand(PutGroupRequest req) =>
        new()
        {
            GroupId = req.GroupId,
            Name = req.Name,
            Description = req.Description,
            IsRecruiting = req.IsRecruiting,
            GroupKindId = req.GroupKindId,
        };
}

public sealed record PutGroupRequest
{
    [RouteParam]
    public required int GroupId { get; init; }

    public required string Name { get; init; }

    public required string Description { get; init; }

    public required bool IsRecruiting { get; init; }

    public int? GroupKindId { get; init; }
}

public sealed class PutGroupValidator : Validator<PutGroupRequest>
{
    public PutGroupValidator()
    {
        RuleFor(request => request.GroupId).GreaterThan(0);
        RuleFor(request => request.Name).NotEmpty().MaximumLength(GroupLimits.NameLength);
        RuleFor(request => request.Description)
            .NotNull()
            .MaximumLength(GroupLimits.DescriptionLength);
        RuleFor(request => request.GroupKindId)
            .GreaterThan(0)
            .When(request => request.GroupKindId is not null);
    }
}
