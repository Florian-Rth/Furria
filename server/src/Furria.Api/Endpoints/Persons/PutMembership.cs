using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Registry;
using Furria.Infrastructure.Registry;

namespace Furria.Api.Endpoints.Persons;

public sealed class PutMembership : Endpoint<PutMembershipRequest>
{
    private readonly MembershipService _membershipService;

    public PutMembership(MembershipService membershipService)
    {
        _membershipService = membershipService;
    }

    public override void Configure()
    {
        Put("manage/persons/{personId}/memberships/{membershipId}");
        Definition.RequirePermission(FurriaPermissions.PersonsManage);
    }

    public override async Task HandleAsync(PutMembershipRequest req, CancellationToken ct)
    {
        var result = await _membershipService.UpdateAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static UpdateMembershipCommand ToCommand(PutMembershipRequest req) =>
        new()
        {
            PersonId = req.PersonId,
            MembershipId = req.MembershipId,
            StartedOn = req.StartedOn,
            EndedOn = req.EndedOn,
        };
}

public sealed record PutMembershipRequest
{
    [RouteParam]
    public required int PersonId { get; init; }

    [RouteParam]
    public required int MembershipId { get; init; }

    public required DateOnly StartedOn { get; init; }

    public required DateOnly? EndedOn { get; init; }
}

public sealed class PutMembershipValidator : Validator<PutMembershipRequest>
{
    public PutMembershipValidator()
    {
        RuleFor(request => request.PersonId).GreaterThan(0);
        RuleFor(request => request.MembershipId).GreaterThan(0);
        RuleFor(request => request.StartedOn).NotEmpty();
    }
}
