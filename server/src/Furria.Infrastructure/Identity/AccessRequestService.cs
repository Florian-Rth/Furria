using Furria.Application.ClubApp;
using Furria.Core.Club;
using Furria.Core.Identity;
using Furria.Infrastructure.Club;
using Furria.Infrastructure.Mail;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure.Identity;

public sealed class AccessRequestService
{
    public static readonly TimeSpan MailInterval = TimeSpan.FromMinutes(5);

    private readonly AppDbContext _dbContext;
    private readonly AccountAccessService _accountAccessService;
    private readonly ClubRecordService _clubRecordService;
    private readonly ClubAppOptions _clubAppOptions;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<AccessRequestService> _logger;

    public AccessRequestService(
        AppDbContext dbContext,
        AccountAccessService accountAccessService,
        ClubRecordService clubRecordService,
        IOptions<ClubAppOptions> clubAppOptions,
        TimeProvider timeProvider,
        ILogger<AccessRequestService> logger
    )
    {
        _dbContext = dbContext;
        _accountAccessService = accountAccessService;
        _clubRecordService = clubRecordService;
        _clubAppOptions = clubAppOptions.Value;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task AnswerAsync(string email, CancellationToken ct)
    {
        var normalizedEmail = NormalizedEmail.Of(email);
        var now = _timeProvider.GetUtcNow();
        if (await WasMailedRecentlyAsync(normalizedEmail, now, ct))
            return;

        var record = await _clubRecordService.GetAsync(ct);
        var requesters = await RequestersAsync(
            normalizedEmail,
            ClubClock.DayOf(now),
            record.AgeOfConsent,
            ct
        );
        if (requesters.Count == 0)
            return;

        var expiresAt = now + Invitation.MailLifetime;
        var issues = requesters.Select(requester => IssueTo(requester, now, expiresAt)).ToList();
        var addressee = requesters[0];
        var mail = AccessRequestMail.Compose(
            new AccessRequestMailContent
            {
                PersonId = addressee.PersonId,
                To = addressee.Email,
                ClubName = record.Name,
                Links = issues.Select(issue => issue.Link).ToList(),
                ExpiresAt = expiresAt,
            }
        );

        var saved = await _accountAccessService.RecordIssuedAsync(
            issues.Select(issue => issue.Invitation).ToList(),
            [mail],
            ct
        );
        if (!saved.IsSuccess)
            return;

        foreach (var issue in issues)
            _logger.LogInformation(
                "Self-requested invitation issued for person {PersonId}",
                issue.Invitation.PersonId
            );
        _logger.LogInformation(
            "Access request answered with {InvitationCount} invitations, addressed to person {PersonId}",
            issues.Count,
            addressee.PersonId
        );
    }

    private RequesterIssue IssueTo(
        Requester requester,
        DateTimeOffset now,
        DateTimeOffset expiresAt
    )
    {
        var token = OpaqueTokenSecret.Generate(out var tokenHash);

        return new RequesterIssue(
            new Invitation
            {
                PersonId = requester.PersonId,
                Purpose = InvitationPurpose.Onboarding,
                Channel = InvitationChannel.Request,
                TokenHash = tokenHash,
                IssuedByPersonId = null,
                IssuedAt = now,
                ExpiresAt = expiresAt,
            },
            new AccessRequestMailLink(
                requester.FirstName,
                InvitationMail.LinkOf(_clubAppOptions.BaseUrl, token)
            )
        );
    }

    private Task<bool> WasMailedRecentlyAsync(
        string normalizedEmail,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        var since = now - MailInterval;

        return _dbContext
            .Invitations.AsNoTracking()
            .AnyAsync(
                invitation =>
                    invitation.Channel == InvitationChannel.Request
                    && !invitation.IsReminder
                    && invitation.IssuedAt > since
                    && invitation.Person!.Email!.ToUpper() == normalizedEmail,
                ct
            );
    }

    private async Task<IReadOnlyList<Requester>> RequestersAsync(
        string normalizedEmail,
        DateOnly today,
        int ageOfConsent,
        CancellationToken ct
    ) =>
        await _dbContext
            .EligibleForMailWithoutAccount(today, ageOfConsent)
            .AsNoTracking()
            .Where(person => person.Email!.ToUpper() == normalizedEmail)
            .OrderBy(person => person.FirstName)
            .ThenBy(person => person.Id)
            .Select(person => new Requester(person.Id, person.FirstName, person.Email!))
            .ToListAsync(ct);

    private sealed record Requester(int PersonId, string FirstName, string Email);

    private sealed record RequesterIssue(Invitation Invitation, AccessRequestMailLink Link);
}
