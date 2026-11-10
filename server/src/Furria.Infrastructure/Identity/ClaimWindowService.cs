using System.Diagnostics.Contracts;
using Furria.Application.Identity;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Core.Identity;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Registry;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.Identity;

public sealed class ClaimWindowService
{
    public const string EndOutOfRangeMessage =
        "Das Anmeldefenster schließt in der Zukunft und höchstens in sieben Tagen.";

    private readonly AppDbContext _dbContext;
    private readonly AccountAccessService _accountAccessService;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<ClaimWindowService> _logger;

    public ClaimWindowService(
        AppDbContext dbContext,
        AccountAccessService accountAccessService,
        TimeProvider timeProvider,
        ILogger<ClaimWindowService> logger
    )
    {
        _dbContext = dbContext;
        _accountAccessService = accountAccessService;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public Task<ClaimWindowDetails?> GetOpenWindowAsync(CancellationToken ct) =>
        OpenWindowAsync(_timeProvider.GetUtcNow(), ct);

    public async Task<ClaimWindowOverviewDetails> GetOverviewAsync(CancellationToken ct) =>
        new() { Window = await GetOpenWindowAsync(ct), Claims = await ClaimsAsync(ct) };

    public async Task<Result> OpenUntilAsync(
        DateTimeOffset closesAt,
        int? openedByPersonId,
        CancellationToken ct
    )
    {
        var now = _timeProvider.GetUtcNow();
        if (!ClaimWindow.CanCloseAt(closesAt, now))
            return Result.Validation(EndOutOfRangeMessage);

        var latest = await LatestWindowAsync(ct);
        if (latest is not null && IsOpen(latest.ClosedAt, latest.ClosesAt, now))
            latest.ClosesAt = closesAt;
        else
            _dbContext.ClaimWindows.Add(
                new ClaimWindow
                {
                    OpenedAt = now,
                    ClosesAt = closesAt,
                    OpenedByPersonId = openedByPersonId,
                }
            );

        await _dbContext.SaveChangesAsync(ct);
        _logger.LogInformation("Claim window open until {ClosesAt}", closesAt);

        return Result.Success();
    }

    public async Task CloseAsync(CancellationToken ct)
    {
        var now = _timeProvider.GetUtcNow();
        var closed = await _dbContext
            .ClaimWindows.Where(window => window.ClosedAt == null && window.ClosesAt > now)
            .ExecuteUpdateAsync(setters => setters.SetProperty(row => row.ClosedAt, now), ct);

        if (closed > 0)
            _logger.LogInformation("Claim window closed by hand");
    }

    public async Task<Result<ClaimDetails>> ClaimAsync(ClaimCommand command, CancellationToken ct)
    {
        var now = _timeProvider.GetUtcNow();
        if (await OpenWindowAsync(now, ct) is null)
            return Result<ClaimDetails>.Success(ClaimDetails.Refused(ClaimOutcome.Closed));

        var matches = await MatchesAsync(command, ct);
        if (matches.Count != 1)
            return Result<ClaimDetails>.Success(ClaimDetails.Refused(ClaimOutcome.NotFound));

        var today = ClubClock.DayOf(now);
        var subject = await SubjectAsync(matches[0], command.BirthDate, today, ct);
        var ageOfConsent = await _dbContext.AgeOfConsentAsync(ct);
        if (RefusalOf(subject, today, ageOfConsent) is { } refusal)
            return Result<ClaimDetails>.Success(ClaimDetails.Refused(refusal));

        return await IssueAsync(subject.PersonId, now, ct);
    }

    private async Task<Result<ClaimDetails>> IssueAsync(
        int personId,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        var token = OpaqueTokenSecret.Generate(out var tokenHash);
        var saved = await _accountAccessService.RecordIssuedAsync(
            new Invitation
            {
                PersonId = personId,
                Purpose = InvitationPurpose.Onboarding,
                Channel = InvitationChannel.ClaimWindow,
                TokenHash = tokenHash,
                IssuedByPersonId = null,
                IssuedAt = now,
                ExpiresAt = now + Invitation.InPersonLifetime,
            },
            ct
        );
        if (!saved.IsSuccess)
            return Result<ClaimDetails>.Carrying(saved);

        _logger.LogInformation("Claim window invitation issued for person {PersonId}", personId);

        return Result<ClaimDetails>.Success(ClaimDetails.Invited(token));
    }

    private async Task<ClaimWindowDetails?> OpenWindowAsync(
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        var latest = await LatestWindowAsync(ct);

        return latest is not null && IsOpen(latest.ClosedAt, latest.ClosesAt, now)
            ? new ClaimWindowDetails { OpenedAt = latest.OpenedAt, ClosesAt = latest.ClosesAt }
            : null;
    }

    private Task<ClaimWindow?> LatestWindowAsync(CancellationToken ct) =>
        _dbContext
            .ClaimWindows.OrderByDescending(window => window.OpenedAt)
            .ThenByDescending(window => window.Id)
            .FirstOrDefaultAsync(ct);

    private async Task<IReadOnlyList<ClaimSummary>> ClaimsAsync(CancellationToken ct) =>
        await _dbContext
            .People.AsNoTracking()
            .Select(person => new
            {
                person.Id,
                person.FirstName,
                person.LastName,
                ClaimedAt = _dbContext
                    .AccountEvents.Where(accountEvent =>
                        accountEvent.PersonId == person.Id
                        && accountEvent.Kind == AccountEventKind.Claimed
                    )
                    .Max(accountEvent => (DateTimeOffset?)accountEvent.At),
                HasAccount = _dbContext.Users.Any(account => account.PersonId == person.Id),
            })
            .Where(row => row.ClaimedAt != null)
            .OrderByDescending(row => row.ClaimedAt)
            .ThenByDescending(row => row.Id)
            .Select(row => new ClaimSummary
            {
                PersonId = row.Id,
                FirstName = row.FirstName,
                LastName = row.LastName,
                ClaimedAt = row.ClaimedAt!.Value,
                HasAccount = row.HasAccount,
            })
            .ToListAsync(ct);

    private async Task<IReadOnlyList<int>> MatchesAsync(ClaimCommand command, CancellationToken ct)
    {
        var firstName = ClaimName.Normalize(command.FirstName);
        var lastName = ClaimName.Normalize(command.LastName);
        var bornThatDay = await _dbContext
            .People.AsNoTracking()
            .Where(person => person.BirthDate == command.BirthDate && person.ArchivedOn == null)
            .Select(person => new
            {
                person.Id,
                person.FirstName,
                person.LastName,
            })
            .ToListAsync(ct);

        return
        [
            .. bornThatDay
                .Where(person =>
                    ClaimName.Normalize(person.FirstName) == firstName
                    && ClaimName.Normalize(person.LastName) == lastName
                )
                .Select(person => person.Id),
        ];
    }

    private async Task<ClaimSubject> SubjectAsync(
        int personId,
        DateOnly birthDate,
        DateOnly today,
        CancellationToken ct
    )
    {
        var person = _dbContext.People.AsNoTracking().Where(row => row.Id == personId);

        return new ClaimSubject
        {
            PersonId = personId,
            HasAccount = await _dbContext
                .Users.AsNoTracking()
                .AnyAsync(account => account.PersonId == personId, ct),
            BirthDate = birthDate,
            Candidate = new AccountCandidate
            {
                IsAffiliated = await person.AnyAsync(AffiliationQuery.IsAffiliatedOn(today), ct),
                BirthDate = birthDate,
                Email = await person.Select(row => row.Email).SingleAsync(ct),
            },
        };
    }

    [Pure]
    private static bool IsOpen(
        DateTimeOffset? closedAt,
        DateTimeOffset closesAt,
        DateTimeOffset now
    ) => closedAt is null && closesAt > now;

    [Pure]
    private static ClaimOutcome? RefusalOf(ClaimSubject subject, DateOnly today, int ageOfConsent)
    {
        if (subject.HasAccount)
            return ClaimOutcome.HasAccount;
        if (AccountEligibility.CanBeMailed(subject.Candidate))
            return ClaimOutcome.HasEmail;
        if (AccountEligibility.IsBelowAgeOfConsent(subject.BirthDate, ageOfConsent, today))
            return ClaimOutcome.UnderAge;

        return AccountEligibility.ReasonAgainst(subject.Candidate, today, ageOfConsent) is null
            ? null
            : ClaimOutcome.NotFound;
    }

    private sealed record ClaimSubject
    {
        public required int PersonId { get; init; }

        public required bool HasAccount { get; init; }

        public required DateOnly BirthDate { get; init; }

        public required AccountCandidate Candidate { get; init; }
    }
}
