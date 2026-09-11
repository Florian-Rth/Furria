using System.Diagnostics.Contracts;
using Furria.Application.Registry;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Core.Identity;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Registry;

public sealed class MembershipService
{
    private const int NoMembershipId = 0;
    private const int NoPauseId = 0;

    private const string UnknownPersonMessage = "Diese Person steht nicht im Register.";
    private const string UnknownMembershipMessage =
        "Diese Mitgliedschaft gibt es bei dieser Person nicht.";
    private const string UnknownPauseMessage =
        "Diese Ruhezeit gibt es in dieser Mitgliedschaft nicht.";
    private const string OpenMembershipMessage = "Es läuft bereits eine Mitgliedschaft.";
    private const string EndedMembershipMessage = "Diese Mitgliedschaft ist bereits beendet.";
    private const string EndBeforeStartMessage =
        "Eine Mitgliedschaft kann nicht vor ihrem Beginn enden.";
    private const string OpenSpanLabel = "offen";
    private const string PauseEndBeforeStartMessage =
        "Eine Ruhezeit kann nicht vor ihrer ersten Session enden.";
    private const string OverlappingPauseMessage =
        "Dieser Zeitraum überschneidet sich mit einer bestehenden Ruhezeit.";
    private const string OpenPauseOnEndedMembershipMessage =
        "Zu einer beendeten Mitgliedschaft gehört keine offene Ruhezeit. "
        + "Gib die letzte Session an.";
    private const string OverlappingMembershipMessage =
        "Dieser Zeitraum überschneidet sich mit einer bestehenden Mitgliedschaft. "
        + "Ein Wiedereintritt beginnt frühestens am Tag nach dem Ende der vorigen Mitgliedschaft.";

    private readonly AppDbContext _dbContext;

    public MembershipService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Result<int>> AddAsync(AddMembershipCommand command, CancellationToken ct)
    {
        if (!await PersonExistsAsync(command.PersonId, ct))
            return Result<int>.NotFound(UnknownPersonMessage);

        var period = new DatePeriod { Start = command.StartedOn, End = command.EndedOn };

        if (!period.IsWellFormed)
            return Result<int>.Validation(EndBeforeStartMessage);

        var chain = await PeriodsOfAsync(command.PersonId, NoMembershipId, ct);

        if (period.IsOpen && chain.Any(row => row.EndedOn is null))
            return Result<int>.Conflict(OpenMembershipMessage);

        if (Overlaps(chain, period))
            return Result<int>.Conflict(OverlappingMembershipMessage);

        var membership = new Membership
        {
            PersonId = command.PersonId,
            StartedOn = command.StartedOn,
            EndedOn = command.EndedOn,
        };

        _dbContext.Memberships.Add(membership);
        await _dbContext.SaveChangesAsync(ct);

        return Result<int>.Success(membership.Id);
    }

    public async Task<Result> UpdateAsync(UpdateMembershipCommand command, CancellationToken ct)
    {
        var membership = await TrackedMembershipAsync(command.PersonId, command.MembershipId, ct);

        if (membership is null)
            return Result.NotFound(UnknownMembershipMessage);

        var period = new DatePeriod { Start = command.StartedOn, End = command.EndedOn };

        if (!period.IsWellFormed)
            return Result.Validation(EndBeforeStartMessage);

        var others = await PeriodsOfAsync(command.PersonId, command.MembershipId, ct);

        if (period.IsOpen && others.Any(row => row.EndedOn is null))
            return Result.Conflict(OpenMembershipMessage);

        if (Overlaps(others, period))
            return Result.Conflict(OverlappingMembershipMessage);

        if (MisplacedPause(membership, SpanOf(period.Start, period.End)) is { } stray)
            return Result.Validation(StrandedPauseMessage(stray));

        membership.StartedOn = command.StartedOn;
        membership.EndedOn = command.EndedOn;

        if (command.EndedOn is { } endedOn)
            ClampOpenPauses(membership, endedOn);

        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    public async Task<Result> EndAsync(EndMembershipCommand command, CancellationToken ct)
    {
        var membership = await TrackedMembershipAsync(command.PersonId, command.MembershipId, ct);

        if (membership is null)
            return Result.NotFound(UnknownMembershipMessage);

        if (membership.EndedOn is not null)
            return Result.Conflict(EndedMembershipMessage);

        if (command.EndedOn < membership.StartedOn)
            return Result.Validation(EndBeforeStartMessage);

        if (MisplacedPause(membership, SpanOf(membership.StartedOn, command.EndedOn)) is { } stray)
            return Result.Validation(StrandedPauseMessage(stray));

        membership.EndedOn = command.EndedOn;
        ClampOpenPauses(membership, command.EndedOn);
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    public async Task<Result<int>> AddPauseAsync(
        AddMembershipPauseCommand command,
        CancellationToken ct
    )
    {
        var membership = await TrackedMembershipAsync(command.PersonId, command.MembershipId, ct);

        if (membership is null)
            return Result<int>.NotFound(UnknownMembershipMessage);

        var span = SpanOf(command.FirstSessionYear, command.LastSessionYear);

        if (!span.IsWellFormed)
            return Result<int>.Validation(PauseEndBeforeStartMessage);

        if (span.LastYear is null && membership.EndedOn is not null)
            return Result<int>.Validation(OpenPauseOnEndedMembershipMessage);

        var membershipSpan = SpanOf(membership.StartedOn, membership.EndedOn);

        if (!FitsIn(span, membershipSpan))
            return Result<int>.Validation(OutsideMembershipMessage(span));

        if (OverlapsAnotherPause(membership, span, NoPauseId))
            return Result<int>.Conflict(OverlappingPauseMessage);

        var pause = new MembershipPause
        {
            MembershipId = command.MembershipId,
            FirstSessionYear = command.FirstSessionYear,
            LastSessionYear = command.LastSessionYear,
        };

        _dbContext.MembershipPauses.Add(pause);
        await _dbContext.SaveChangesAsync(ct);

        return Result<int>.Success(pause.Id);
    }

    public async Task<Result> UpdatePauseAsync(
        UpdateMembershipPauseCommand command,
        CancellationToken ct
    )
    {
        var membership = await TrackedMembershipAsync(command.PersonId, command.MembershipId, ct);

        if (membership is null)
            return Result.NotFound(UnknownMembershipMessage);

        var pause = membership.Pauses.SingleOrDefault(row => row.Id == command.PauseId);

        if (pause is null)
            return Result.NotFound(UnknownPauseMessage);

        var span = SpanOf(command.FirstSessionYear, command.LastSessionYear);

        if (!span.IsWellFormed)
            return Result.Validation(PauseEndBeforeStartMessage);

        if (span.LastYear is null && membership.EndedOn is not null)
            return Result.Validation(OpenPauseOnEndedMembershipMessage);

        if (!FitsIn(span, SpanOf(membership.StartedOn, membership.EndedOn)))
            return Result.Validation(OutsideMembershipMessage(span));

        if (OverlapsAnotherPause(membership, span, command.PauseId))
            return Result.Conflict(OverlappingPauseMessage);

        pause.FirstSessionYear = command.FirstSessionYear;
        pause.LastSessionYear = command.LastSessionYear;
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    [Pure]
    private static SessionSpan SpanOf(DateOnly startedOn, DateOnly? endedOn) =>
        SpanOf(
            ClubSession.YearOf(startedOn),
            endedOn is null ? null : ClubSession.YearOf(endedOn.Value)
        );

    [Pure]
    private static SessionSpan SpanOf(MembershipPause pause) =>
        SpanOf(pause.FirstSessionYear, pause.LastSessionYear);

    [Pure]
    private static SessionSpan SpanOf(int firstSessionYear, int? lastSessionYear) =>
        new() { FirstYear = firstSessionYear, LastYear = lastSessionYear };

    [Pure]
    private static bool OverlapsAnotherPause(
        Membership membership,
        SessionSpan span,
        int exceptPauseId
    ) =>
        membership
            .Pauses.Where(pause => pause.Id != exceptPauseId)
            .Any(pause => span.Overlaps(SpanOf(pause)));

    [Pure]
    private static MembershipPause? MisplacedPause(Membership membership, SessionSpan span) =>
        membership.Pauses.FirstOrDefault(pause => !FitsIn(SpanOf(pause), span));

    [Pure]
    private static bool FitsIn(SessionSpan pause, SessionSpan membershipSpan) =>
        membershipSpan.Contains(pause.FirstYear)
        && (pause.LastYear is null || membershipSpan.Contains(pause.LastYear.Value));

    [Pure]
    private static string StrandedPauseMessage(MembershipPause pause) =>
        $"Die Ruhezeit {SpanLabel(SpanOf(pause))} liegt dann außerhalb der Mitgliedschaft.";

    [Pure]
    private static string OutsideMembershipMessage(SessionSpan span) =>
        $"Die Ruhezeit {SpanLabel(span)} liegt außerhalb der Mitgliedschaft.";

    [Pure]
    private static string SpanLabel(SessionSpan span)
    {
        var first = ClubSession.LabelOf(span.FirstYear);

        if (span.LastYear is not { } lastYear)
            return $"{first} – {OpenSpanLabel}";

        return lastYear == span.FirstYear ? first : $"{first} – {ClubSession.LabelOf(lastYear)}";
    }

    private static void ClampOpenPauses(Membership membership, DateOnly endedOn)
    {
        var lastSessionYear = ClubSession.YearOf(endedOn);

        foreach (var pause in membership.Pauses.Where(pause => pause.LastSessionYear is null))
        {
            pause.LastSessionYear = lastSessionYear;
        }
    }

    private Task<Membership?> TrackedMembershipAsync(
        int personId,
        int membershipId,
        CancellationToken ct
    ) =>
        _dbContext
            .Memberships.Include(row => row.Pauses)
            .SingleOrDefaultAsync(row => row.Id == membershipId && row.PersonId == personId, ct);

    private Task<bool> PersonExistsAsync(int personId, CancellationToken ct) =>
        _dbContext.People.AsNoTracking().AnyAsync(row => row.Id == personId, ct);

    [Pure]
    private static bool Overlaps(IReadOnlyList<PeriodRow> chain, DatePeriod period) =>
        chain.Any(row => period.Overlaps(row.AsPeriod));

    private Task<List<PeriodRow>> PeriodsOfAsync(
        int personId,
        int exceptMembershipId,
        CancellationToken ct
    ) =>
        _dbContext
            .Memberships.AsNoTracking()
            .Where(row => row.PersonId == personId && row.Id != exceptMembershipId)
            .Select(row => new PeriodRow(row.StartedOn, row.EndedOn))
            .ToListAsync(ct);

    private sealed record PeriodRow(DateOnly StartedOn, DateOnly? EndedOn)
    {
        [Pure]
        public DatePeriod AsPeriod => new() { Start = StartedOn, End = EndedOn };
    }
}
