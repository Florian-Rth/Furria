using System.Diagnostics.Contracts;
using Furria.Application.Identity;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Core.Identity;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Registry;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.Identity;

public sealed class AccountClaimService
{
    private const string DeadInvitationMessage = "Diese Einladung gilt nicht mehr.";

    private static readonly Result<RedemptionDetails> Taken = Result<RedemptionDetails>.Success(
        RedemptionDetails.Refused(RedemptionOutcome.LoginEmailTaken)
    );

    private static readonly Result<RedemptionDetails> WrongPassword =
        Result<RedemptionDetails>.Success(
            RedemptionDetails.Refused(RedemptionOutcome.ClaimPasswordWrong)
        );

    private readonly AppDbContext _dbContext;
    private readonly UserManager<Account> _userManager;
    private readonly SignInManager<Account> _signInManager;
    private readonly AccountService _accountService;
    private readonly RefreshTokenService _refreshTokenService;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<AccountClaimService> _logger;

    public AccountClaimService(
        AppDbContext dbContext,
        UserManager<Account> userManager,
        SignInManager<Account> signInManager,
        AccountService accountService,
        RefreshTokenService refreshTokenService,
        TimeProvider timeProvider,
        ILogger<AccountClaimService> logger
    )
    {
        _dbContext = dbContext;
        _userManager = userManager;
        _signInManager = signInManager;
        _accountService = accountService;
        _refreshTokenService = refreshTokenService;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task<bool> IsClaimableAsync(string normalizedLoginEmail, CancellationToken ct) =>
        await ClaimableAccountAsync(normalizedLoginEmail, ct) is not null;

    public async Task<Result<RedemptionDetails>> ClaimOrRefuseAsync(
        AccountClaim claim,
        CancellationToken ct
    )
    {
        var account = await ClaimableAccountAsync(claim.NormalizedLoginEmail, ct);
        if (account is null)
            return Taken;

        if (claim.ClaimPassword is not { } claimPassword)
            return Result<RedemptionDetails>.Success(RedemptionDetails.ClaimRequired());

        if (!await ProvesOwnershipAsync(account, claimPassword))
            return WrongPassword;

        return await MoveOntoKeeperAsync(account, claim, ct);
    }

    private async Task<Result<RedemptionDetails>> MoveOntoKeeperAsync(
        Account account,
        AccountClaim claim,
        CancellationToken ct
    )
    {
        var now = _timeProvider.GetUtcNow();
        var strayPersonId = account.PersonId;

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        if (!await RedeemInvitationAsync(claim.InvitationId, now, ct))
            return Result<RedemptionDetails>.Conflict(DeadInvitationMessage);

        await StrayPersonAbsorption.AbsorbAsync(
            _dbContext,
            new StrayPersonAbsorption.Absorption(
                account.Id,
                strayPersonId,
                claim.KeeperPersonId,
                now
            ),
            ct
        );
        _dbContext.AccountEvents.Add(
            new AccountEvent
            {
                PersonId = claim.KeeperPersonId,
                Kind = AccountEventKind.Redeemed,
                ActorPersonId = claim.KeeperPersonId,
                At = now,
            }
        );
        await _dbContext.SaveChangesAsync(ct);
        await _refreshTokenService.RevokeAllAsync(account.Id, ct);
        await transaction.CommitAsync(ct);
        await _dbContext.Entry(account).ReloadAsync(ct);

        _logger.LogInformation(
            "Account {AccountId} claimed onto person {PersonId}, stray person {StrayPersonId} absorbed",
            account.Id,
            claim.KeeperPersonId,
            strayPersonId
        );

        return Result<RedemptionDetails>.Success(
            RedemptionDetails.Redeemed(await _accountService.StartSessionAsync(account, ct))
        );
    }

    private async Task<bool> ProvesOwnershipAsync(Account account, string claimPassword)
    {
        var wasLockedOut = await _userManager.IsLockedOutAsync(account);
        var signIn = await _signInManager.CheckPasswordSignInAsync(
            account,
            claimPassword,
            lockoutOnFailure: true
        );
        if (signIn.Succeeded)
            return true;

        if (signIn.IsLockedOut && !wasLockedOut)
            _logger.LogWarning(
                "Account {AccountId} locked out until {LockoutEnd}",
                account.Id,
                account.LockoutEnd
            );

        _logger.LogInformation(
            "Claim refused for account {AccountId}: {LoginFailureReason}",
            account.Id,
            FailureReasonOf(signIn)
        );
        return false;
    }

    private async Task<Account?> ClaimableAccountAsync(
        string normalizedLoginEmail,
        CancellationToken ct
    )
    {
        var affiliated = _dbContext.People.Where(
            AffiliationQuery.IsAffiliatedOn(ClubClock.Today(_timeProvider))
        );
        var account = await _dbContext
            .Users.Where(account =>
                account.NormalizedEmail == normalizedLoginEmail
                && !account.IsDisabled
                && !affiliated.Any(person => person.Id == account.PersonId)
            )
            .SingleOrDefaultAsync(ct);

        if (account is null)
            return null;

        return await StrayPersonAbsorption.HoldsClubDataAsync(_dbContext, account.PersonId, ct)
            ? null
            : account;
    }

    private async Task<bool> RedeemInvitationAsync(
        int invitationId,
        DateTimeOffset now,
        CancellationToken ct
    ) =>
        await _dbContext
            .Invitations.Where(row =>
                row.Id == invitationId
                && row.RedeemedAt == null
                && row.VoidedAt == null
                && row.ExpiresAt > now
            )
            .ExecuteUpdateAsync(setters => setters.SetProperty(row => row.RedeemedAt, now), ct)
        == 1;

    [Pure]
    private static LoginFailureReason FailureReasonOf(SignInResult signIn) =>
        signIn switch
        {
            { IsLockedOut: true } => LoginFailureReason.LockedOut,
            { IsNotAllowed: true } => LoginFailureReason.NotAllowed,
            _ => LoginFailureReason.WrongPassword,
        };
}
