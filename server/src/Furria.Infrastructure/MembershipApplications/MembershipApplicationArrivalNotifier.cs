using System.Diagnostics.Contracts;
using Furria.Application.Authorization;
using Furria.Application.ClubApp;
using Furria.Core.Club;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Mail;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure.MembershipApplications;

public sealed class MembershipApplicationArrivalNotifier
{
    private const string OutsideTransactionMessage =
        "An arrival notice is stored in the transaction of the confirmation it reports; "
        + "begin that transaction before confirming.";

    private readonly AppDbContext _dbContext;
    private readonly MailOutbox _mailOutbox;
    private readonly ClubAppOptions _clubAppOptions;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<MembershipApplicationArrivalNotifier> _logger;

    public MembershipApplicationArrivalNotifier(
        AppDbContext dbContext,
        MailOutbox mailOutbox,
        IOptions<ClubAppOptions> clubAppOptions,
        TimeProvider timeProvider,
        ILogger<MembershipApplicationArrivalNotifier> logger
    )
    {
        _dbContext = dbContext;
        _mailOutbox = mailOutbox;
        _clubAppOptions = clubAppOptions.Value;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task NotifyAsync(int membershipApplicationId, CancellationToken ct)
    {
        if (_dbContext.Database.CurrentTransaction is null)
            throw new InvalidOperationException(OutsideTransactionMessage);

        var applicant = await ApplicantAsync(membershipApplicationId, ct);
        var deciders = await DecidersAsync(ct);
        var clubName = await ClubNameAsync(ct);
        var link = MembershipApplicationArrivalMail.LinkOf(
            _clubAppOptions.BaseUrl,
            membershipApplicationId
        );

        foreach (var decider in deciders)
            _mailOutbox.Stage(
                MembershipApplicationArrivalMail.Compose(
                    ToMailContent(decider, applicant, clubName, link)
                )
            );
        await _dbContext.SaveChangesAsync(ct);

        LogNotices(membershipApplicationId, deciders.Count);
    }

    private void LogNotices(int membershipApplicationId, int noticeCount)
    {
        if (noticeCount == 0)
            _logger.LogWarning(
                "Membership application {MembershipApplicationId} arrived, but nobody who decides applications has an email",
                membershipApplicationId
            );
        else
            _logger.LogInformation(
                "Mail {MailTemplate} for membership application {MembershipApplicationId} queued for {NoticeCount} persons",
                MailTemplate.MembershipApplicationArrival,
                membershipApplicationId,
                noticeCount
            );
    }

    private Task<Applicant> ApplicantAsync(int membershipApplicationId, CancellationToken ct) =>
        _dbContext
            .MembershipApplications.AsNoTracking()
            .Where(row => row.Id == membershipApplicationId)
            .Select(row => new Applicant(row.FirstName, row.LastName))
            .SingleAsync(ct);

    private async Task<IReadOnlyList<Decider>> DecidersAsync(CancellationToken ct)
    {
        var holderIds = PermissionHolderQuery.PersonIdsHolding(
            _dbContext,
            FurriaPermissions.MembershipApplicationsDecide,
            ClubClock.Today(_timeProvider)
        );

        return await _dbContext
            .People.AsNoTracking()
            .Where(person =>
                holderIds.Contains(person.Id) && person.Email != null && person.Email != ""
            )
            .OrderBy(person => person.Id)
            .Select(person => new Decider(person.Id, person.FirstName, person.Email!))
            .ToListAsync(ct);
    }

    private Task<string?> ClubNameAsync(CancellationToken ct) =>
        _dbContext
            .ClubRecords.AsNoTracking()
            .Where(row => row.Id == ClubRecord.TheOnlyId)
            .Select(row => row.Name)
            .SingleOrDefaultAsync(ct);

    [Pure]
    private static MembershipApplicationArrivalMailContent ToMailContent(
        Decider decider,
        Applicant applicant,
        string? clubName,
        string link
    ) =>
        new()
        {
            PersonId = decider.PersonId,
            To = decider.Email,
            FirstName = decider.FirstName,
            ApplicantFirstName = applicant.FirstName,
            ApplicantLastName = applicant.LastName,
            ClubName = clubName,
            Link = link,
        };

    private sealed record Applicant(string FirstName, string LastName);

    private sealed record Decider(int PersonId, string FirstName, string Email);
}
