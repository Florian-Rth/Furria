using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Endpoints.Halls;
using Furria.Api.Results;
using Furria.Application.Halls;
using Furria.Infrastructure.Halls;

namespace Furria.Api.Endpoints.Seating;

public sealed class PutSeatingStandard : Endpoint<PutSeatingStandardRequest>
{
    private readonly SeatingService _seatingService;

    public PutSeatingStandard(SeatingService seatingService)
    {
        _seatingService = seatingService;
    }

    public override void Configure()
    {
        Put("seating/standard");
        Definition.RequireAnyPermission(HallKeys.Planners);
    }

    public override async Task HandleAsync(PutSeatingStandardRequest req, CancellationToken ct)
    {
        var result = await _seatingService.SetStandardAsync(
            new SeatingStandardCommand
            {
                ComfortableChairSpacingCm = req.ComfortableChairSpacingCm,
                MaximumChairSpacingCm = req.MaximumChairSpacingCm,
                ChairDepthCm = req.ChairDepthCm,
                AisleWidthCm = req.AisleWidthCm,
                ExitClearanceCm = req.ExitClearanceCm,
            },
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record PutSeatingStandardRequest
{
    public required int ComfortableChairSpacingCm { get; init; }

    public required int MaximumChairSpacingCm { get; init; }

    public required int ChairDepthCm { get; init; }

    public required int AisleWidthCm { get; init; }

    public required int ExitClearanceCm { get; init; }
}

public sealed class PutSeatingStandardValidator : Validator<PutSeatingStandardRequest>
{
    public PutSeatingStandardValidator()
    {
        RuleFor(request => request.ComfortableChairSpacingCm).Must(IsStandardSize);
        RuleFor(request => request.MaximumChairSpacingCm)
            .Must(IsStandardSize)
            .LessThanOrEqualTo(request => request.ComfortableChairSpacingCm)
            .WithMessage("Bei voller Bestuhlung stehen die Stühle nicht weiter als bei bequemer.");
        RuleFor(request => request.ChairDepthCm).Must(IsStandardSize);
        RuleFor(request => request.AisleWidthCm).Must(IsStandardSize);
        RuleFor(request => request.ExitClearanceCm).Must(IsStandardSize);
    }

    private static bool IsStandardSize(int centimetres) =>
        centimetres is >= HallLimits.SmallestStandardCm and <= HallLimits.LargestStandardCm;
}
