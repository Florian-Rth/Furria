using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Groups;
using Furria.Infrastructure.Groups;

namespace Furria.Api.Endpoints.Groups;

public sealed class PostGroup : Endpoint<PostGroupRequest, PostGroupResponse>
{
    private readonly GroupService _groupService;

    public PostGroup(GroupService groupService)
    {
        _groupService = groupService;
    }

    public override void Configure()
    {
        Post("manage/groups");
        Definition.RequirePermission(FurriaPermissions.GroupsManage);
    }

    public override async Task HandleAsync(PostGroupRequest req, CancellationToken ct)
    {
        var result = await _groupService.CreateAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(result.Value), cancellation: ct);
    }

    private static CreateGroupCommand ToCommand(PostGroupRequest req) =>
        new()
        {
            Name = req.Name,
            Description = req.Description,
            IsRecruiting = req.IsRecruiting,
            GroupKindId = req.GroupKindId,
        };

    private static PostGroupResponse ToResponse(int groupId) => new() { GroupId = groupId };
}

public sealed record PostGroupRequest
{
    public required string Name { get; init; }

    public required string Description { get; init; }

    public required bool IsRecruiting { get; init; }

    public int? GroupKindId { get; init; }
}

public sealed class PostGroupValidator : Validator<PostGroupRequest>
{
    public PostGroupValidator()
    {
        RuleFor(request => request.Name).NotEmpty().MaximumLength(GroupLimits.NameLength);
        RuleFor(request => request.Description)
            .NotNull()
            .MaximumLength(GroupLimits.DescriptionLength);
        RuleFor(request => request.GroupKindId)
            .GreaterThan(0)
            .When(request => request.GroupKindId is not null);
    }
}

public sealed record PostGroupResponse
{
    public required int GroupId { get; init; }
}
