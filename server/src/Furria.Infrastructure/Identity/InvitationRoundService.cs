using System.Diagnostics.Contracts;
using Furria.Application.ClubApp;
using Furria.Application.Identity;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Core.Identity;
using Furria.Infrastructure.Club;
using Furria.Infrastructure.Mail;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure.Identity;

public sealed class InvitationRoundService
{
    public static readonly TimeSpan ReminderDelay = TimeSpan.FromDays(3);

    private static readonly InvitationChannel[] RemindableChannels =
    [
        InvitationChannel.Mail,
        InvitationChannel.Request,
    ];

    private readonly AppDbContext _dbContext;
    private readonly ClubRecordService _clubRecordService;
    private readonly MailOutbox _mailOutbox;
    private readonly ClubAppOptions _clubAppOptions;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<InvitationRoundService> _logger;

    public InvitationRoundService(
        AppDbContext dbContext,
        ClubRecordService clubRecordService,
        MailOutbox mailOutbox,
        IOptions<ClubAppOptions> clubAppOptions,
        TimeProvider timeProvider,
        ILogger<InvitationRoundService> logger
    )
    {
        _dbContext = dbContext;
        _clubRecordService = clubRecordService;
        _mailOutbox = mailOutbox;
        _clubAppOptions = clubAppOptions.Value;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task<InvitationRoundPreviewDetails> PreviewAsync(CancellationToken ct)
    {
        var round = await RoundAsync(ct);

        return new InvitationRoundPreviewDetails
        {
            InviteCount = await InviteesOf(round).CountAsync(ct),
            RemindCount = await ReminderTargetsOf(round).CountAsync(ct),
            EligibleWithoutEmailCount = await _dbContext
                .EligibleWithoutEmail(round.Today, round.AgeOfConsent)
                .CountAsync(ct),
        };
    }

    public async Task<Result<InvitationRoundDetails>> InviteAllAsync(
        int issuerPersonId,
        CancellationToken ct
    )
    {
        var round = await RoundAsync(ct);
        var recipients = await InviteesOf(round)
            .OrderBy(person => person.Id)
            .Select(person => new Recipient(person.Id, person.FirstName, person.Email!))
            .ToListAsync(ct);

        var issues = recipients
            .Select(recipient => Issue(recipient, InvitationChannel.Mail, false, round))
            .ToList();

        var sent = await IssueAsync(
            issues,
            new RoundAct(issuerPersonId, AccountEventKind.Invited, round),
            token => VoidLiveInvitationsOfAsync(recipients, round.Now, token),
            ct
        );
        if (sent.IsSuccess)
            _logger.LogInformation(
                "Bulk invitation sent to {InvitationCount} persons by person {IssuerPersonId}",
                sent.Value.SentCount,
                issuerPersonId
            );

        return sent;
    }

    public async Task<Result<InvitationRoundDetails>> RemindAllAsync(
        int issuerPersonId,
        CancellationToken ct
    )
    {
        var round = await RoundAsync(ct);
        var targets = await ReminderTargetsOf(round)
            .OrderBy(invitation => invitation.PersonId)
            .Select(invitation => new ReminderTarget(
                invitation.Id,
                invitation.Channel,
                new Recipient(
                    invitation.PersonId,
                    invitation.Person!.FirstName,
                    invitation.Person.Email!
                )
            ))
            .ToListAsync(ct);

        var issues = targets
            .Select(target => Issue(target.Recipient, target.Channel, true, round))
            .ToList();

        var sent = await IssueAsync(
            issues,
            new RoundAct(issuerPersonId, AccountEventKind.Reminded, round),
            token => VoidRemindedInvitationsAsync(targets, round.Now, token),
            ct
        );
        if (sent.IsSuccess)
            _logger.LogInformation(
                "Invitation reminders sent to {InvitationCount} persons by person {IssuerPersonId}",
                sent.Value.SentCount,
                issuerPersonId
            );

        return sent;
    }

    private async Task<Result<InvitationRoundDetails>> IssueAsync(
        IReadOnlyList<IssuedRoundInvitation> issues,
        RoundAct act,
        Func<CancellationToken, Task<bool>> voidPreviousAsync,
        CancellationToken ct
    )
    {
        if (issues.Count == 0)
            return Result<InvitationRoundDetails>.Success(
                new InvitationRoundDetails { SentCount = 0 }
            );

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        if (!await voidPreviousAsync(ct))
            return Result<InvitationRoundDetails>.Conflict(
                WriteConflictMessages.InvitationIssuedMeanwhile
            );

        _dbContext.Invitations.AddRange(issues.Select(issue => ToInvitation(issue, act)));
        _dbContext.AccountEvents.AddRange(issues.Select(issue => ToEvent(issue, act)));
        foreach (var issue in issues)
            _mailOutbox.Stage(ToMail(issue, act.Round));

        var saved = await _dbContext.SaveOrConflictAsync(ct);
        if (!saved.IsSuccess)
            return Result<InvitationRoundDetails>.Carrying(saved);

        await transaction.CommitAsync(ct);

        return Result<InvitationRoundDetails>.Success(
            new InvitationRoundDetails { SentCount = issues.Count }
        );
    }

    private async Task<Round> RoundAsync(CancellationToken ct)
    {
        var record = await _clubRecordService.GetAsync(ct);
        var now = _timeProvider.GetUtcNow();

        return new Round(now, ClubClock.DayOf(now), record.AgeOfConsent, record.Name);
    }

    private IQueryable<Person> InviteesOf(Round round) =>
        _dbContext
            .EligibleForMailWithoutAccount(round.Today, round.AgeOfConsent)
            .NeverInvited(_dbContext);

    private IQueryable<Invitation> ReminderTargetsOf(Round round)
    {
        var issuedBefore = round.Now - ReminderDelay;
        var eligible = _dbContext.EligibleForMailWithoutAccount(round.Today, round.AgeOfConsent);

        return _dbContext
            .OpenInvitations()
            .Where(invitation =>
                RemindableChannels.Contains(invitation.Channel)
                && invitation.IssuedAt < issuedBefore
                && eligible.Any(person => person.Id == invitation.PersonId)
            );
    }

    private async Task<bool> VoidLiveInvitationsOfAsync(
        IReadOnlyList<Recipient> recipients,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        var personIds = recipients.Select(recipient => recipient.PersonId).ToList();

        await _dbContext
            .Invitations.Where(invitation =>
                personIds.Contains(invitation.PersonId)
                && invitation.RedeemedAt == null
                && invitation.VoidedAt == null
            )
            .ExecuteUpdateAsync(setters => setters.SetProperty(row => row.VoidedAt, now), ct);

        return true;
    }

    private async Task<bool> VoidRemindedInvitationsAsync(
        IReadOnlyList<ReminderTarget> targets,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        var invitationIds = targets.Select(target => target.InvitationId).ToList();

        var voided = await _dbContext
            .Invitations.Where(invitation =>
                invitationIds.Contains(invitation.Id)
                && invitation.RedeemedAt == null
                && invitation.VoidedAt == null
            )
            .ExecuteUpdateAsync(setters => setters.SetProperty(row => row.VoidedAt, now), ct);

        return voided == invitationIds.Count;
    }

    private OutgoingMail ToMail(IssuedRoundInvitation issue, Round round)
    {
        var content = new InvitationMailContent
        {
            PersonId = issue.Recipient.PersonId,
            To = issue.Recipient.Email,
            FirstName = issue.Recipient.FirstName,
            ClubName = round.ClubName,
            Link = InvitationMail.LinkOf(_clubAppOptions.BaseUrl, issue.Token),
            ExpiresAt = issue.ExpiresAt,
        };

        return issue.IsReminder
            ? InvitationMail.ComposeReminder(content)
            : InvitationMail.Compose(content);
    }

    private static IssuedRoundInvitation Issue(
        Recipient recipient,
        InvitationChannel channel,
        bool isReminder,
        Round round
    )
    {
        var token = OpaqueTokenSecret.Generate(out var tokenHash);

        return new IssuedRoundInvitation(
            recipient,
            channel,
            isReminder,
            token,
            tokenHash,
            round.Now + Invitation.MailLifetime
        );
    }

    [Pure]
    private static Invitation ToInvitation(IssuedRoundInvitation issue, RoundAct act) =>
        new()
        {
            PersonId = issue.Recipient.PersonId,
            Purpose = InvitationPurpose.Onboarding,
            Channel = issue.Channel,
            TokenHash = issue.TokenHash,
            IssuedByPersonId = act.IssuerPersonId,
            IssuedAt = act.Round.Now,
            ExpiresAt = issue.ExpiresAt,
            IsReminder = issue.IsReminder,
        };

    [Pure]
    private static AccountEvent ToEvent(IssuedRoundInvitation issue, RoundAct act) =>
        new()
        {
            PersonId = issue.Recipient.PersonId,
            Kind = act.EventKind,
            ActorPersonId = act.IssuerPersonId,
            At = act.Round.Now,
        };

    private sealed record Round(
        DateTimeOffset Now,
        DateOnly Today,
        int AgeOfConsent,
        string? ClubName
    );

    private sealed record Recipient(int PersonId, string FirstName, string Email);

    private sealed record RoundAct(int IssuerPersonId, AccountEventKind EventKind, Round Round);

    private sealed record ReminderTarget(
        int InvitationId,
        InvitationChannel Channel,
        Recipient Recipient
    );

    private sealed record IssuedRoundInvitation(
        Recipient Recipient,
        InvitationChannel Channel,
        bool IsReminder,
        string Token,
        string TokenHash,
        DateTimeOffset ExpiresAt
    );
}
