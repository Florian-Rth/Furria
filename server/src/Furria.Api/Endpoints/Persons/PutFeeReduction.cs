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

public sealed class PutFeeReduction : Endpoint<PutFeeReductionRequest>
{
    private readonly FeeReductionService _feeReductionService;

    public PutFeeReduction(FeeReductionService feeReductionService)
    {
        _feeReductionService = feeReductionService;
    }

    public override void Configure()
    {
        Put("manage/persons/{personId}/fee-reductions/{feeReductionId}");
        Definition.RequirePermission(FurriaPermissions.PersonsManage);
    }

    public override async Task HandleAsync(PutFeeReductionRequest req, CancellationToken ct)
    {
        var result = await _feeReductionService.UpdateAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static UpdateFeeReductionCommand ToCommand(PutFeeReductionRequest req) =>
        new()
        {
            PersonId = req.PersonId,
            FeeReductionId = req.FeeReductionId,
            Basis = req.Basis,
            FirstSessionYear = req.FirstSessionYear,
            LastSessionYear = req.LastSessionYear,
        };
}

public sealed record PutFeeReductionRequest
{
    [RouteParam]
    public required int PersonId { get; init; }

    [RouteParam]
    public required int FeeReductionId { get; init; }

    public required FeeReductionBasis Basis { get; init; }

    public required int FirstSessionYear { get; init; }

    public required int LastSessionYear { get; init; }
}

public sealed class PutFeeReductionValidator : Validator<PutFeeReductionRequest>
{
    public PutFeeReductionValidator()
    {
        RuleFor(request => request.PersonId).GreaterThan(0);
        RuleFor(request => request.FeeReductionId).GreaterThan(0);
        RuleFor(request => request.Basis).IsInEnum();
        RuleFor(request => request.FirstSessionYear).GreaterThanOrEqualTo(ClubSession.FoundingYear);
        RuleFor(request => request.LastSessionYear).GreaterThanOrEqualTo(ClubSession.FoundingYear);
    }
}
