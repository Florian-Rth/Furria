using System.Diagnostics.Contracts;
using Furria.Application.ClubApp;
using Furria.Application.Identity;
using Furria.Application.Results;
using Furria.Core.Identity;
using Furria.Infrastructure.Mail;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure.Identity;

public sealed class AccountAdministrationService
{
    private const string UnknownPersonMessage = "Diese Person steht nicht im Register.";
    private const string OwnAccountMessage =
        "Deinen eigenen Zugang kannst du nicht sperren. Das muss jemand anderes tun.";

    private readonly AppDbContext _dbContext;
    private readonly AccountAccessService _accountAccessService;
    private readonly RefreshTokenService _refreshTokenService;
    private readonly ClubAppOptions _clubAppOptions;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<AccountAdministrationService> _logger;

    public AccountAdministrationService(
        AppDbContext dbContext,
        AccountAccessService accountAccessService,
        RefreshTokenService refreshTokenService,
        IOptions<ClubAppOptions> clubAppOptions,
        TimeProvider timeProvider,
        ILogger<AccountAdministrationService> logger
    )
    {
        _dbContext = dbContext;
        _accountAccessService = accountAccessService;
        _refreshTokenService = refreshTokenService;
        _clubAppOptions = clubAppOptions.Value;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task<Result<IssuedInPersonInvitationDetails>> IssueRecoveryAsync(
        int personId,
        int? issuerPersonId,
        CancellationToken ct
    )
    {
        var holder = await HolderAsync(personId, ct);
        if (holder is null)
            return Result<IssuedInPersonInvitationDetails>.NotFound(UnknownPersonMessage);

        if (RecoveryRefusalOf(holder) is { } refusal)
            return Result<IssuedInPersonInvitationDetails>.Conflict(refusal);

        var now = _timeProvider.GetUtcNow();
        var token = OpaqueTokenSecret.Generate(out var tokenHash);
        var (code, codeHash) = await _accountAccessService.FreshInvitationCodeAsync(now, ct);
        var expiresAt = now + Invitation.InPersonLifetime;

        var saved = await _accountAccessService.RecordIssuedAsync(
            new Invitation
            {
                PersonId = personId,
                Purpose = InvitationPurpose.Recovery,
                Channel = InvitationChannel.InPerson,
                TokenHash = tokenHash,
                CodeHash = codeHash,
                IssuedByPersonId = issuerPersonId,
                IssuedAt = now,
                ExpiresAt = expiresAt,
            },
            ct
        );
        if (!saved.IsSuccess)
            return Result<IssuedInPersonInvitationDetails>.Carrying(saved);

        _logger.LogInformation("Access recovery issued for person {PersonId}", personId);

        return Result<IssuedInPersonInvitationDetails>.Success(
            new IssuedInPersonInvitationDetails
            {
                Link = InvitationMail.LinkOf(_clubAppOptions.BaseUrl, token),
                Code = code,
                ExpiresAt = expiresAt,
            }
        );
    }

    public async Task<Result> SetDisabledAsync(AccountLockCommand command, CancellationToken ct)
    {
        var holder = await HolderAsync(command.PersonId, ct);
        if (holder is null)
            return Result.NotFound(UnknownPersonMessage);

        if (LockRefusalOf(holder, command) is { } refusal)
            return Result.Conflict(refusal);

        if (holder.AccountIsDisabled == command.IsDisabled)
            return Result.Success();

        await ApplyLockAsync(command, ct);
        if (command.IsDisabled)
            _logger.LogInformation("Account of person {PersonId} disabled", command.PersonId);
        else
            _logger.LogInformation("Account of person {PersonId} enabled", command.PersonId);

        return Result.Success();
    }

    private async Task ApplyLockAsync(AccountLockCommand command, CancellationToken ct)
    {
        var now = _timeProvider.GetUtcNow();
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var account = await _dbContext.Users.SingleAsync(
            row => row.PersonId == command.PersonId,
            ct
        );
        account.IsDisabled = command.IsDisabled;
        _dbContext.AccountEvents.Add(
            new AccountEvent
            {
                PersonId = command.PersonId,
                Kind = command.IsDisabled ? AccountEventKind.Disabled : AccountEventKind.Enabled,
                ActorPersonId = command.ActorPersonId,
                At = now,
            }
        );
        await _dbContext.SaveChangesAsync(ct);

        if (command.IsDisabled)
        {
            await _refreshTokenService.RevokeAllAsync(account.Id, ct);
            await VoidLiveRecoveryAsync(command.PersonId, now, ct);
        }

        await transaction.CommitAsync(ct);
    }

    private Task VoidLiveRecoveryAsync(int personId, DateTimeOffset now, CancellationToken ct) =>
        _dbContext
            .Invitations.Where(invitation =>
                invitation.PersonId == personId
                && invitation.Purpose == InvitationPurpose.Recovery
                && invitation.RedeemedAt == null
                && invitation.VoidedAt == null
            )
            .ExecuteUpdateAsync(setters => setters.SetProperty(row => row.VoidedAt, now), ct);

    private Task<AccountHolder?> HolderAsync(int personId, CancellationToken ct) =>
        _dbContext
            .People.AsNoTracking()
            .Where(person => person.Id == personId)
            .Select(person => new AccountHolder(
                person.Id,
                person.FirstName,
                _dbContext
                    .Users.Where(account => account.PersonId == person.Id)
                    .Select(account => (bool?)account.IsDisabled)
                    .FirstOrDefault()
            ))
            .SingleOrDefaultAsync(ct);

    [Pure]
    private static string? RecoveryRefusalOf(AccountHolder holder) =>
        holder.AccountIsDisabled switch
        {
            null => $"{holder.FirstName} hat noch keinen Zugang.",
            true => $"Der Zugang von {holder.FirstName} ist gesperrt. Entsperre ihn zuerst.",
            false => null,
        };

    [Pure]
    private static string? LockRefusalOf(AccountHolder holder, AccountLockCommand command)
    {
        if (holder.AccountIsDisabled is null)
            return $"{holder.FirstName} hat keinen Zugang.";

        return command.IsDisabled && holder.PersonId == command.ActorPersonId
            ? OwnAccountMessage
            : null;
    }

    private sealed record AccountHolder(int PersonId, string FirstName, bool? AccountIsDisabled);
}
