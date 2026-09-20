using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Registry;
using Furria.Core.Club;
using Furria.Infrastructure.Registry;

namespace Furria.Api.Endpoints.Persons;

public sealed class PutMembershipPause : Endpoint<PutMembershipPauseRequest>
{
    private readonly MembershipService _membershipService;

    public PutMembershipPause(MembershipService membershipService)
    {
        _membershipService = membershipService;
    }

    public override void Configure()
    {
        Put("manage/persons/{personId}/memberships/{membershipId}/pauses/{pauseId}");
        Definition.RequirePermission(FurriaPermissions.PersonsManage);
    }

    public override async Task HandleAsync(PutMembershipPauseRequest req, CancellationToken ct)
    {
        var result = await _membershipService.UpdatePauseAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static UpdateMembershipPauseCommand ToCommand(PutMembershipPauseRequest req) =>
        new()
        {
            PersonId = req.PersonId,
            MembershipId = req.MembershipId,
            PauseId = req.PauseId,
            FirstSessionYear = req.FirstSessionYear,
            LastSessionYear = req.LastSessionYear,
        };
}

public sealed record PutMembershipPauseRequest
{
    [RouteParam]
    public required int PersonId { get; init; }

    [RouteParam]
    public required int MembershipId { get; init; }

    [RouteParam]
    public required int PauseId { get; init; }

    public required int FirstSessionYear { get; init; }

    public required int? LastSessionYear { get; init; }
}

public sealed class PutMembershipPauseValidator : Validator<PutMembershipPauseRequest>
{
    public PutMembershipPauseValidator()
    {
        RuleFor(request => request.PersonId).GreaterThan(0);
        RuleFor(request => request.MembershipId).GreaterThan(0);
        RuleFor(request => request.PauseId).GreaterThan(0);
        RuleFor(request => request.FirstSessionYear)
            .GreaterThanOrEqualTo(ClubSession.EarliestSessionYear);
        RuleFor(request => request.LastSessionYear)
            .GreaterThanOrEqualTo(ClubSession.EarliestSessionYear)
            .When(request => request.LastSessionYear.HasValue);
    }
}
