using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Registry;
using Furria.Infrastructure.Registry;

namespace Furria.Api.Endpoints.Persons;

public sealed class EndMembership : Endpoint<EndMembershipRequest>
{
    private readonly MembershipService _membershipService;

    public EndMembership(MembershipService membershipService)
    {
        _membershipService = membershipService;
    }

    public override void Configure()
    {
        Post("manage/persons/{personId}/memberships/{membershipId}/end");
        Definition.RequirePermission(FurriaPermissions.PersonsManage);
    }

    public override async Task HandleAsync(EndMembershipRequest req, CancellationToken ct)
    {
        var result = await _membershipService.EndAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static EndMembershipCommand ToCommand(EndMembershipRequest req) =>
        new()
        {
            PersonId = req.PersonId,
            MembershipId = req.MembershipId,
            EndedOn = req.EndedOn,
        };
}

public sealed record EndMembershipRequest
{
    [RouteParam]
    public required int PersonId { get; init; }

    [RouteParam]
    public required int MembershipId { get; init; }

    public required DateOnly EndedOn { get; init; }
}

public sealed class EndMembershipValidator : Validator<EndMembershipRequest>
{
    public EndMembershipValidator()
    {
        RuleFor(request => request.PersonId).GreaterThan(0);
        RuleFor(request => request.MembershipId).GreaterThan(0);
        RuleFor(request => request.EndedOn).NotEmpty();
    }
}
