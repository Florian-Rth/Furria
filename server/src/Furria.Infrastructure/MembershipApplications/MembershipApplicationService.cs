using System.Diagnostics.Contracts;
using Furria.Application.MembershipApplications;
using Furria.Application.Results;
using Furria.Application.Website;
using Furria.Core.Club;
using Furria.Core.MembershipApplications;
using Furria.Infrastructure.Identity;
using Furria.Infrastructure.Mail;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Registry;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure.MembershipApplications;

public sealed partial class MembershipApplicationService
{
    private const string ImplausibleBirthDateMessage =
        "Bitte prüf das Geburtsdatum – so kann es nicht stimmen.";

    private readonly AppDbContext _dbContext;
    private readonly MailOutbox _mailOutbox;
    private readonly MembershipApplicationArrivalNotifier _arrivalNotifier;
    private readonly PersonService _personService;
    private readonly MembershipService _membershipService;
    private readonly AccountAccessService _accountAccessService;
    private readonly WebsiteOptions _websiteOptions;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<MembershipApplicationService> _logger;

    public MembershipApplicationService(
        AppDbContext dbContext,
        MailOutbox mailOutbox,
        MembershipApplicationArrivalNotifier arrivalNotifier,
        PersonService personService,
        MembershipService membershipService,
        AccountAccessService accountAccessService,
        IOptions<WebsiteOptions> websiteOptions,
        TimeProvider timeProvider,
        ILogger<MembershipApplicationService> logger
    )
    {
        _dbContext = dbContext;
        _mailOutbox = mailOutbox;
        _arrivalNotifier = arrivalNotifier;
        _personService = personService;
        _membershipService = membershipService;
        _accountAccessService = accountAccessService;
        _websiteOptions = websiteOptions.Value;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task<Result> SubmitAsync(
        SubmitMembershipApplicationCommand command,
        CancellationToken ct
    )
    {
        var now = _timeProvider.GetUtcNow();
        var club = await ClubTermsAsync(ct);
        var refusal = ApplicantBirthDate.RefusalOf(
            command.BirthDate,
            ClubClock.DayOf(now),
            club.AgeOfConsent
        );
        if (refusal is not null)
            return Result.Validation(RefusalMessage(refusal.Value, club.AgeOfConsent));

        var token = OpaqueTokenSecret.Generate(out var tokenHash);
        var application = ToApplication(command, tokenHash, now);

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        _dbContext.MembershipApplications.Add(application);
        await _dbContext.SaveChangesAsync(ct);
        _mailOutbox.Stage(
            MembershipApplicationConfirmationMail.Compose(
                ToMailContent(application, club.Name, LinkOf(token))
            )
        );
        await _dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        _logger.LogInformation(
            "Membership application {MembershipApplicationId} submitted",
            application.Id
        );

        return Result.Success();
    }

    public async Task<MembershipApplicationConfirmation> ConfirmAsync(
        string token,
        CancellationToken ct
    )
    {
        var now = _timeProvider.GetUtcNow();
        var application = await PendingConfirmationAsync(token, ct);
        if (application is null)
            return MembershipApplicationConfirmation.Expired;

        return VerdictBeforeConfirming(application, now)
            ?? await RecordConfirmationAsync(application.Id, now, ct);
    }

    public async Task DeleteUnconfirmedExpiredAsync(CancellationToken ct)
    {
        var confirmableSince = MembershipApplication.ConfirmableSince(_timeProvider.GetUtcNow());
        var deleted = await _dbContext
            .MembershipApplications.Where(row =>
                row.ConfirmedAt == null && row.SubmittedAt <= confirmableSince
            )
            .ExecuteDeleteAsync(ct);

        if (deleted > 0)
            _logger.LogInformation(
                "{MembershipApplicationCount} unconfirmed membership applications deleted",
                deleted
            );
    }

    private async Task<MembershipApplicationConfirmation> RecordConfirmationAsync(
        int applicationId,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var confirmed = await _dbContext
            .MembershipApplications.Where(row => row.Id == applicationId && row.ConfirmedAt == null)
            .ExecuteUpdateAsync(setters => setters.SetProperty(row => row.ConfirmedAt, now), ct);
        if (confirmed == 0)
            return MembershipApplicationConfirmation.AlreadyConfirmed;

        await _arrivalNotifier.NotifyAsync(applicationId, ct);
        await transaction.CommitAsync(ct);

        _logger.LogInformation(
            "Membership application {MembershipApplicationId} confirmed",
            applicationId
        );

        return MembershipApplicationConfirmation.Confirmed;
    }

    private async Task<PendingConfirmation?> PendingConfirmationAsync(
        string token,
        CancellationToken ct
    )
    {
        if (OpaqueTokenSecret.HashOf(token) is not { } tokenHash)
            return null;

        return await _dbContext
            .MembershipApplications.AsNoTracking()
            .Where(row => row.ConfirmationTokenHash == tokenHash)
            .Select(row => new PendingConfirmation(row.Id, row.SubmittedAt, row.ConfirmedAt))
            .SingleOrDefaultAsync(ct);
    }

    private async Task<ClubTerms> ClubTermsAsync(CancellationToken ct) =>
        await _dbContext
            .ClubRecords.AsNoTracking()
            .Where(record => record.Id == ClubRecord.TheOnlyId)
            .Select(record => new ClubTerms(record.AgeOfConsent, record.Name))
            .SingleOrDefaultAsync(ct)
        ?? new ClubTerms(ClubRecord.DefaultAgeOfConsent, null);

    private string LinkOf(string token) =>
        MembershipApplicationConfirmationMail.LinkOf(_websiteOptions.BaseUrl, token);

    [Pure]
    private static MembershipApplicationConfirmation? VerdictBeforeConfirming(
        PendingConfirmation application,
        DateTimeOffset now
    ) =>
        application switch
        {
            { ConfirmedAt: not null } => MembershipApplicationConfirmation.AlreadyConfirmed,
            _ when application.SubmittedAt <= MembershipApplication.ConfirmableSince(now) =>
                MembershipApplicationConfirmation.Expired,
            _ => null,
        };

    [Pure]
    private static string RefusalMessage(ApplicantBirthDateRefusal refusal, int ageOfConsent) =>
        refusal switch
        {
            ApplicantBirthDateRefusal.BelowAgeOfConsent =>
                $"Online kann sich bewerben, wer mindestens {ageOfConsent} Jahre alt ist. Bist du jünger, schreib uns – dann nehmen wir dich direkt auf.",
            _ => ImplausibleBirthDateMessage,
        };

    [Pure]
    private static MembershipApplication ToApplication(
        SubmitMembershipApplicationCommand command,
        string tokenHash,
        DateTimeOffset submittedAt
    ) =>
        new()
        {
            FirstName = command.FirstName.Trim(),
            LastName = command.LastName.Trim(),
            BirthDate = command.BirthDate,
            Street = command.Street.Trim(),
            Zip = command.Zip.Trim(),
            City = command.City.Trim(),
            Email = command.Email.Trim(),
            Phone = NullIfBlank(command.Phone),
            ConfirmationTokenHash = tokenHash,
            SubmittedAt = submittedAt,
        };

    [Pure]
    private static MembershipApplicationConfirmationMailContent ToMailContent(
        MembershipApplication application,
        string? clubName,
        string link
    ) =>
        new()
        {
            MembershipApplicationId = application.Id,
            To = application.Email,
            FirstName = application.FirstName,
            ClubName = clubName,
            Link = link,
        };

    [Pure]
    private static string? NullIfBlank(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private sealed record ClubTerms(int AgeOfConsent, string? Name);

    private sealed record PendingConfirmation(
        int Id,
        DateTimeOffset SubmittedAt,
        DateTimeOffset? ConfirmedAt
    );
}
