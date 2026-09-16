using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Registry;
using Furria.Core.Club;
using Furria.Core.Identity;
using Furria.Infrastructure.Registry;

namespace Furria.Api.Endpoints.Persons;

public sealed class PostFeeReduction : Endpoint<PostFeeReductionRequest, PostFeeReductionResponse>
{
    private readonly FeeReductionService _feeReductionService;

    public PostFeeReduction(FeeReductionService feeReductionService)
    {
        _feeReductionService = feeReductionService;
    }

    public override void Configure()
    {
        Post("manage/persons/{personId}/fee-reductions");
        Definition.RequirePermission(FurriaPermissions.PersonsManage);
    }

    public override async Task HandleAsync(PostFeeReductionRequest req, CancellationToken ct)
    {
        var result = await _feeReductionService.AddAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(result.Value), cancellation: ct);
    }

    private static AddFeeReductionCommand ToCommand(PostFeeReductionRequest req) =>
        new()
        {
            PersonId = req.PersonId,
            Basis = req.Basis,
            FirstSessionYear = req.FirstSessionYear,
            LastSessionYear = req.LastSessionYear,
        };

    private static PostFeeReductionResponse ToResponse(int feeReductionId) =>
        new() { FeeReductionId = feeReductionId };
}

public sealed record PostFeeReductionRequest
{
    [RouteParam]
    public required int PersonId { get; init; }

    public required FeeReductionBasis Basis { get; init; }

    public required int FirstSessionYear { get; init; }

    public required int LastSessionYear { get; init; }
}

public sealed class PostFeeReductionValidator : Validator<PostFeeReductionRequest>
{
    public PostFeeReductionValidator()
    {
        RuleFor(request => request.PersonId).GreaterThan(0);
        RuleFor(request => request.Basis).IsInEnum();
        RuleFor(request => request.FirstSessionYear).GreaterThanOrEqualTo(ClubSession.FoundingYear);
        RuleFor(request => request.LastSessionYear).GreaterThanOrEqualTo(ClubSession.FoundingYear);
    }
}

public sealed record PostFeeReductionResponse
{
    public required int FeeReductionId { get; init; }
}
