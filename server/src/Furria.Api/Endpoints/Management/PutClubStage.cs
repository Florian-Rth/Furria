using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Core.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Management;

public sealed class PutClubStage : Endpoint<PutClubStageRequest>
{
    private readonly ClubRecordService _clubRecordService;

    public PutClubStage(ClubRecordService clubRecordService)
    {
        _clubRecordService = clubRecordService;
    }

    public override void Configure()
    {
        Put("manage/club-record/stage");
        Definition.RequirePermission(FurriaPermissions.ClubManage);
    }

    public override async Task HandleAsync(PutClubStageRequest req, CancellationToken ct)
    {
        var result = await _clubRecordService.UpdateStageAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static UpdateClubStageCommand ToCommand(PutClubStageRequest req) =>
        new()
        {
            WidthMetres = req.WidthMetres,
            DepthMetres = req.DepthMetres,
            ArtworkSvg = req.ArtworkSvg,
        };
}

public sealed record PutClubStageRequest
{
    public required decimal WidthMetres { get; init; }

    public required decimal DepthMetres { get; init; }

    public required string? ArtworkSvg { get; init; }
}

public sealed class PutClubStageValidator : Validator<PutClubStageRequest>
{
    private const string SideTooPreciseMessage = "Bühnenmaße werden auf den Zentimeter angegeben.";

    private static readonly string SideOutOfRangeMessage =
        $"Eine Bühnenseite misst zwischen {ClubRecord.SmallestStageSideMetres} und {ClubRecord.LargestStageSideMetres} Metern.";

    public PutClubStageValidator()
    {
        StageSide(RuleFor(request => request.WidthMetres));
        StageSide(RuleFor(request => request.DepthMetres));
        RuleFor(request => request.ArtworkSvg).MaximumLength(ClubRecord.StageArtworkLength);
    }

    private static void StageSide(IRuleBuilder<PutClubStageRequest, decimal> side) =>
        side.InclusiveBetween(ClubRecord.SmallestStageSideMetres, ClubRecord.LargestStageSideMetres)
            .WithMessage(SideOutOfRangeMessage)
            .PrecisionScale(ClubRecord.StageSidePrecision, ClubRecord.StageSideScale, true)
            .WithMessage(SideTooPreciseMessage);
}
