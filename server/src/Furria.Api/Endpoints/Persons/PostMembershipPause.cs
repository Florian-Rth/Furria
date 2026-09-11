using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Registry;
using Furria.Core.Club;
using Furria.Infrastructure.Registry;

namespace Furria.Api.Endpoints.Persons;

public sealed class PostMembershipPause
    : Endpoint<PostMembershipPauseRequest, PostMembershipPauseResponse>
{
    private readonly MembershipService _membershipService;

    public PostMembershipPause(MembershipService membershipService)
    {
        _membershipService = membershipService;
    }

    public override void Configure()
    {
        Post("manage/persons/{personId}/memberships/{membershipId}/pauses");
        Definition.RequirePermission(FurriaPermissions.PersonsManage);
    }

    public override async Task HandleAsync(PostMembershipPauseRequest req, CancellationToken ct)
    {
        var result = await _membershipService.AddPauseAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(result.Value), cancellation: ct);
    }

    private static AddMembershipPauseCommand ToCommand(PostMembershipPauseRequest req) =>
        new()
        {
            PersonId = req.PersonId,
            MembershipId = req.MembershipId,
            FirstSessionYear = req.FirstSessionYear,
            LastSessionYear = req.LastSessionYear,
        };

    private static PostMembershipPauseResponse ToResponse(int pauseId) =>
        new() { PauseId = pauseId };
}

public sealed record PostMembershipPauseRequest
{
    [RouteParam]
    public required int PersonId { get; init; }

    [RouteParam]
    public required int MembershipId { get; init; }

    public required int FirstSessionYear { get; init; }

    public required int? LastSessionYear { get; init; }
}

public sealed class PostMembershipPauseValidator : Validator<PostMembershipPauseRequest>
{
    public PostMembershipPauseValidator()
    {
        RuleFor(request => request.PersonId).GreaterThan(0);
        RuleFor(request => request.MembershipId).GreaterThan(0);
        RuleFor(request => request.FirstSessionYear).GreaterThanOrEqualTo(ClubSession.FoundingYear);
        RuleFor(request => request.LastSessionYear)
            .GreaterThanOrEqualTo(ClubSession.FoundingYear)
            .When(request => request.LastSessionYear.HasValue);
    }
}

public sealed record PostMembershipPauseResponse
{
    public required int PauseId { get; init; }
}
