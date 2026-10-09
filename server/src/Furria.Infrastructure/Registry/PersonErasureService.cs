using System.Diagnostics.Contracts;
using System.Globalization;
using Furria.Application.Registry;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Infrastructure.Identity;
using Furria.Infrastructure.Mail;
using Furria.Infrastructure.Media;
using Furria.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.Registry;

public sealed class PersonErasureService
{
    private const string UnknownPersonMessage = "Diese Person steht nicht im Register.";
    private const string ClosedActorMessage = "Dieser Zugang ist gesperrt.";

    private readonly AppDbContext _dbContext;
    private readonly UserManager<Account> _userManager;
    private readonly ReauthenticationService _reauthenticationService;
    private readonly MailOutbox _mailOutbox;
    private readonly MediaRoot _mediaRoot;
    private readonly ILogger<PersonErasureService> _logger;

    public PersonErasureService(
        AppDbContext dbContext,
        UserManager<Account> userManager,
        ReauthenticationService reauthenticationService,
        MailOutbox mailOutbox,
        MediaRoot mediaRoot,
        ILogger<PersonErasureService> logger
    )
    {
        _dbContext = dbContext;
        _userManager = userManager;
        _reauthenticationService = reauthenticationService;
        _mailOutbox = mailOutbox;
        _mediaRoot = mediaRoot;
        _logger = logger;
    }

    public async Task<Result> EraseAsync(PersonErasureCommand command, CancellationToken ct)
    {
        var actor = await _userManager.FindByIdAsync(
            command.ActorAccountId.ToString(CultureInfo.InvariantCulture)
        );
        if (actor is not { IsDisabled: false })
            return Result.Forbidden(ClosedActorMessage);

        var proven = await _reauthenticationService.ProveAsync(actor, command.Proof, ct);
        if (!proven.IsSuccess)
            return proven;

        if (!await EraseWithEveryChainAsync(command.PersonId, ct))
            return Result.NotFound(UnknownPersonMessage);

        _logger.LogInformation(
            "Person {PersonId} erased by person {ActorPersonId}",
            command.PersonId,
            actor.PersonId
        );

        return Result.Success();
    }

    private async Task<bool> EraseWithEveryChainAsync(int personId, CancellationToken ct)
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        await DropMailQueuedForAsync(personId, ct);
        await StageNoticeAsync(personId, ct);
        var ownMedia = await OwnMediaOfAsync(personId, ct);
        var erased = await _dbContext
            .People.Where(person => person.Id == personId)
            .ExecuteDeleteAsync(ct);
        if (erased == 0)
        {
            await transaction.RollbackAsync(ct);
            return false;
        }

        await transaction.CommitAsync(ct);
        foreach (var storageKey in ownMedia)
            _mediaRoot.DeleteFilesOf(storageKey);

        return true;
    }

    private Task<List<Guid>> OwnMediaOfAsync(int personId, CancellationToken ct) =>
        _dbContext
            .MediaItems.Where(item => item.OwnerPersonId == personId)
            .Select(item => item.StorageKey)
            .ToListAsync(ct);

    private Task DropMailQueuedForAsync(int personId, CancellationToken ct) =>
        _dbContext
            .OutboxMails.Where(mail =>
                mail.RecipientKind == MailRecipientKind.Person && mail.RecipientId == personId
            )
            .ExecuteDeleteAsync(ct);

    private async Task StageNoticeAsync(int personId, CancellationToken ct)
    {
        var holder = await _dbContext
            .Users.AsNoTracking()
            .Where(account => account.PersonId == personId)
            .Select(account => new AccountHolder(account.Email, account.Person!.FirstName))
            .SingleOrDefaultAsync(ct);
        if (holder is not { LoginEmail: { } loginEmail })
            return;

        var club = await _dbContext
            .ClubRecords.AsNoTracking()
            .SingleOrDefaultAsync(row => row.Id == ClubRecord.TheOnlyId, ct);
        _mailOutbox.Stage(
            PersonErasureNoticeMail.Compose(NoticeOf(personId, loginEmail, holder.FirstName, club))
        );
        await _dbContext.SaveChangesAsync(ct);
    }

    [Pure]
    private static PersonErasureNoticeMailContent NoticeOf(
        int personId,
        string loginEmail,
        string firstName,
        ClubRecord? club
    ) =>
        new()
        {
            PersonId = personId,
            To = loginEmail,
            FirstName = firstName,
            ClubName = club?.Name,
            ClubEmail = club?.Email,
            ClubPhone = club?.Phone,
            ClubStreet = club?.Street,
            ClubZip = club?.Zip,
            ClubCity = club?.City,
        };

    private sealed record AccountHolder(string? LoginEmail, string FirstName);
}
