using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Registry;
using Furria.Infrastructure.Registry;

namespace Furria.Api.Endpoints.Persons;

public sealed class PostMembership : Endpoint<PostMembershipRequest, PostMembershipResponse>
{
    private readonly MembershipService _membershipService;

    public PostMembership(MembershipService membershipService)
    {
        _membershipService = membershipService;
    }

    public override void Configure()
    {
        Post("manage/persons/{personId}/memberships");
        Definition.RequirePermission(FurriaPermissions.PersonsManage);
    }

    public override async Task HandleAsync(PostMembershipRequest req, CancellationToken ct)
    {
        var result = await _membershipService.AddAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(result.Value), cancellation: ct);
    }

    private static AddMembershipCommand ToCommand(PostMembershipRequest req) =>
        new()
        {
            PersonId = req.PersonId,
            StartedOn = req.StartedOn,
            EndedOn = req.EndedOn,
        };

    private static PostMembershipResponse ToResponse(int membershipId) =>
        new() { MembershipId = membershipId };
}

public sealed record PostMembershipRequest
{
    [RouteParam]
    public required int PersonId { get; init; }

    public required DateOnly StartedOn { get; init; }

    public required DateOnly? EndedOn { get; init; }
}

public sealed class PostMembershipValidator : Validator<PostMembershipRequest>
{
    public PostMembershipValidator()
    {
        RuleFor(request => request.PersonId).GreaterThan(0);
        RuleFor(request => request.StartedOn).NotEmpty();
    }
}

public sealed record PostMembershipResponse
{
    public required int MembershipId { get; init; }
}
