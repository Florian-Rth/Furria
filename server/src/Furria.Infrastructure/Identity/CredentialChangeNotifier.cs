using System.Diagnostics.Contracts;
using Furria.Core.Club;
using Furria.Infrastructure.Mail;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.Identity;

public sealed class CredentialChangeNotifier
{
    private readonly AppDbContext _dbContext;
    private readonly MailQueue _mailQueue;
    private readonly ILogger<CredentialChangeNotifier> _logger;

    public CredentialChangeNotifier(
        AppDbContext dbContext,
        MailQueue mailQueue,
        ILogger<CredentialChangeNotifier> logger
    )
    {
        _dbContext = dbContext;
        _mailQueue = mailQueue;
        _logger = logger;
    }

    public async Task NotifyAsync(
        int accountId,
        CredentialChange change,
        string? toAddress,
        CancellationToken ct
    )
    {
        var holder = await HolderAsync(accountId, ct);
        if (holder is null)
            return;

        var to = toAddress ?? holder.LoginEmail;
        if (string.IsNullOrEmpty(to))
            return;

        var content = ToMailContent(holder, to, await ClubNameAsync(ct), change);
        _mailQueue.Enqueue(CredentialChangeNoticeMail.Compose(content));
        _logger.LogInformation(
            "Mail {MailTemplate} queued for person {PersonId}",
            MailTemplate.CredentialChangeNotice,
            holder.PersonId
        );
    }

    private Task<AccountHolder?> HolderAsync(int accountId, CancellationToken ct) =>
        _dbContext
            .Users.AsNoTracking()
            .Where(account => account.Id == accountId)
            .Select(account => new AccountHolder(
                account.PersonId,
                account.Person!.FirstName,
                account.Email
            ))
            .SingleOrDefaultAsync(ct);

    private Task<string?> ClubNameAsync(CancellationToken ct) =>
        _dbContext
            .ClubRecords.AsNoTracking()
            .Where(row => row.Id == ClubRecord.TheOnlyId)
            .Select(row => row.Name)
            .SingleOrDefaultAsync(ct);

    [Pure]
    private static CredentialChangeNoticeMailContent ToMailContent(
        AccountHolder holder,
        string to,
        string? clubName,
        CredentialChange change
    ) =>
        new()
        {
            PersonId = holder.PersonId,
            To = to,
            FirstName = holder.FirstName,
            ClubName = clubName,
            Change = change,
        };

    private sealed record AccountHolder(int PersonId, string FirstName, string? LoginEmail);
}
