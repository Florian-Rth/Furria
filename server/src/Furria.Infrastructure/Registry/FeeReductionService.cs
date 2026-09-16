using System.Diagnostics.Contracts;
using Furria.Application.Registry;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Core.Identity;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Registry;

public sealed class FeeReductionService
{
    private const int NoFeeReductionId = 0;

    private const string UnknownPersonMessage = "Diese Person steht nicht im Register.";
    private const string UnknownFeeReductionMessage =
        "Diese Beitragsermäßigung gibt es bei dieser Person nicht.";
    private const string EndBeforeStartMessage =
        "Eine Beitragsermäßigung kann nicht vor ihrer ersten Session enden.";
    private const string OverlappingFeeReductionMessage =
        "Dieser Zeitraum überschneidet sich mit einer bestehenden Beitragsermäßigung.";

    private readonly AppDbContext _dbContext;

    public FeeReductionService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Result<int>> AddAsync(AddFeeReductionCommand command, CancellationToken ct)
    {
        if (!await PersonExistsAsync(command.PersonId, ct))
            return Result<int>.NotFound(UnknownPersonMessage);

        var span = SpanOf(command.FirstSessionYear, command.LastSessionYear);

        if (!span.IsWellFormed)
            return Result<int>.Validation(EndBeforeStartMessage);

        if (await OverlapsAnotherAsync(command.PersonId, NoFeeReductionId, span, ct))
            return Result<int>.Conflict(OverlappingFeeReductionMessage);

        var reduction = new FeeReduction
        {
            PersonId = command.PersonId,
            Basis = command.Basis,
            FirstSessionYear = command.FirstSessionYear,
            LastSessionYear = command.LastSessionYear,
        };

        _dbContext.FeeReductions.Add(reduction);
        await _dbContext.SaveChangesAsync(ct);

        return Result<int>.Success(reduction.Id);
    }

    public async Task<Result> UpdateAsync(UpdateFeeReductionCommand command, CancellationToken ct)
    {
        var reduction = await TrackedFeeReductionAsync(
            command.PersonId,
            command.FeeReductionId,
            ct
        );

        if (reduction is null)
            return Result.NotFound(UnknownFeeReductionMessage);

        var span = SpanOf(command.FirstSessionYear, command.LastSessionYear);

        if (!span.IsWellFormed)
            return Result.Validation(EndBeforeStartMessage);

        if (await OverlapsAnotherAsync(command.PersonId, command.FeeReductionId, span, ct))
            return Result.Conflict(OverlappingFeeReductionMessage);

        reduction.Basis = command.Basis;
        reduction.FirstSessionYear = command.FirstSessionYear;
        reduction.LastSessionYear = command.LastSessionYear;
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    [Pure]
    private static SessionSpan SpanOf(int firstSessionYear, int lastSessionYear) =>
        new() { FirstYear = firstSessionYear, LastYear = lastSessionYear };

    private Task<FeeReduction?> TrackedFeeReductionAsync(
        int personId,
        int feeReductionId,
        CancellationToken ct
    ) =>
        _dbContext.FeeReductions.SingleOrDefaultAsync(
            row => row.Id == feeReductionId && row.PersonId == personId,
            ct
        );

    private Task<bool> PersonExistsAsync(int personId, CancellationToken ct) =>
        _dbContext.People.AsNoTracking().AnyAsync(row => row.Id == personId, ct);

    private async Task<bool> OverlapsAnotherAsync(
        int personId,
        int exceptFeeReductionId,
        SessionSpan span,
        CancellationToken ct
    )
    {
        var spans = await _dbContext
            .FeeReductions.AsNoTracking()
            .Where(row => row.PersonId == personId && row.Id != exceptFeeReductionId)
            .Select(row => new SpanRow(row.FirstSessionYear, row.LastSessionYear))
            .ToListAsync(ct);

        return spans.Any(row => span.Overlaps(row.AsSpan));
    }

    private sealed record SpanRow(int FirstSessionYear, int LastSessionYear)
    {
        [Pure]
        public SessionSpan AsSpan =>
            new() { FirstYear = FirstSessionYear, LastYear = LastSessionYear };
    }
}
