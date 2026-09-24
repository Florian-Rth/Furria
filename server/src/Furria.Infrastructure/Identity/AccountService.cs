using System.Diagnostics.Contracts;
using Furria.Application.Identity;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.Identity;

public sealed class AccountService
{
    private const string RejectedCredentialsMessage = "Email or password is not valid.";
    private const string RejectedSessionMessage = "The session could not be refreshed.";
    private const string EndedSessionMessage = "The session is no longer valid.";
    private const string MissingAccountMessage = "The account no longer exists.";
    private const string DecoyPassword = "decoy-password-that-no-account-ever-uses";

    private static readonly Account DecoyAccount = new();

    private static string? _decoyPasswordHash;

    private readonly AppDbContext _dbContext;
    private readonly UserManager<Account> _userManager;
    private readonly SignInManager<Account> _signInManager;
    private readonly RefreshTokenService _refreshTokenService;
    private readonly AccessTokenService _accessTokenService;
    private readonly PermissionAuthorizer _permissionAuthorizer;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<AccountService> _logger;

    public AccountService(
        AppDbContext dbContext,
        UserManager<Account> userManager,
        SignInManager<Account> signInManager,
        RefreshTokenService refreshTokenService,
        AccessTokenService accessTokenService,
        PermissionAuthorizer permissionAuthorizer,
        TimeProvider timeProvider,
        ILogger<AccountService> logger
    )
    {
        _dbContext = dbContext;
        _userManager = userManager;
        _signInManager = signInManager;
        _refreshTokenService = refreshTokenService;
        _accessTokenService = accessTokenService;
        _permissionAuthorizer = permissionAuthorizer;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task<Result<SessionTokensDetails>> LoginAsync(
        LoginCommand command,
        CancellationToken ct
    )
    {
        var account = await _userManager.FindByEmailAsync(command.Email);
        if (account is null || account.IsDisabled)
        {
            BurnAPasswordCheck(command.Password);
            return RejectLogin(
                command.Email,
                account is null ? LoginFailureReason.UnknownAccount : LoginFailureReason.Disabled
            );
        }

        var wasLockedOut = await _userManager.IsLockedOutAsync(account);
        var signIn = await _signInManager.CheckPasswordSignInAsync(
            account,
            command.Password,
            lockoutOnFailure: true
        );

        if (!signIn.Succeeded)
        {
            if (signIn.IsLockedOut || signIn.IsNotAllowed)
                BurnAPasswordCheck(command.Password);

            if (signIn.IsLockedOut && !wasLockedOut)
                ReportLockout(account);

            return RejectLogin(command.Email, FailureReasonOf(signIn));
        }

        _logger.LogInformation("Login succeeded for account {AccountId}", account.Id);
        return Result<SessionTokensDetails>.Success(await StartSessionAsync(account, ct));
    }

    public async Task<Result<SessionTokensDetails>> RefreshSessionAsync(
        string presentedToken,
        CancellationToken ct
    )
    {
        var rotated = await _refreshTokenService.RotateAsync(presentedToken, ct);
        if (!rotated.IsSuccess)
            return Result<SessionTokensDetails>.Unauthorized(RejectedSessionMessage);

        var account = await FindAccountAsync(rotated.Value.AccountId, ct);
        if (account is null || account.IsDisabled)
        {
            await RevokeAsync(rotated.Value, RefreshTokenRevocationReason.AccountDisabled, ct);
            _logger.LogWarning(
                "Refresh refused for disabled account {AccountId}, session revoked",
                rotated.Value.AccountId
            );
            return Result<SessionTokensDetails>.Unauthorized(RejectedSessionMessage);
        }

        var access = _accessTokenService.Issue(account.Id, account.PersonId);
        return Result<SessionTokensDetails>.Success(Combine(access, rotated.Value));
    }

    public async Task<Result> MarkAnnouncementsSeenAsync(int accountId, CancellationToken ct)
    {
        var account = await _dbContext.Users.SingleOrDefaultAsync(row => row.Id == accountId, ct);

        if (account is null)
            return Result.NotFound(MissingAccountMessage);

        account.LastSeenAnnouncementAt = _timeProvider.GetUtcNow();
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    public async Task LogoutAsync(string presentedToken, int accountId, CancellationToken ct)
    {
        await _refreshTokenService.RevokeFamilyAsync(
            new RevokeRefreshTokenFamilyCommand
            {
                PresentedToken = presentedToken,
                AccountId = accountId,
                Reason = RefreshTokenRevocationReason.LoggedOut,
            },
            ct
        );
        _logger.LogInformation("Account {AccountId} logged out", accountId);
    }

    public async Task<Result<AccountDetails>> GetDetailsAsync(int accountId, CancellationToken ct)
    {
        var row = await _dbContext
            .Users.AsNoTracking()
            .Where(account => account.Id == accountId)
            .Select(account => new AccountRow(
                account.Id,
                account.Email ?? "",
                account.IsDisabled,
                account.LastSeenAnnouncementAt,
                new PersonDetails
                {
                    Id = account.Person!.Id,
                    FirstName = account.Person.FirstName,
                    LastName = account.Person.LastName,
                    Email = account.Person.Email,
                    Phone = account.Person.Phone,
                    Street = account.Person.Street,
                    Zip = account.Person.Zip,
                    City = account.Person.City,
                    BirthDate = account.Person.BirthDate,
                    ContactVisibleToMembers = account.Person.ContactVisibleToMembers,
                },
                account
                    .Person.Memberships.Select(membership => new MembershipRow(
                        membership.Id,
                        membership.StartedOn,
                        membership.EndedOn,
                        membership
                            .Pauses.Select(pause => new MembershipPauseDetails
                            {
                                PauseId = pause.Id,
                                FirstSessionYear = pause.FirstSessionYear,
                                LastSessionYear = pause.LastSessionYear,
                            })
                            .ToList()
                    ))
                    .ToList()
            ))
            .SingleOrDefaultAsync(ct);

        if (row is null)
            return Result<AccountDetails>.NotFound("The account no longer exists.");

        if (row.IsDisabled)
            return Result<AccountDetails>.Unauthorized(EndedSessionMessage);

        var isAffiliated = await _permissionAuthorizer.IsAffiliatedAsync(accountId, ct);
        var permissionKeys = await _permissionAuthorizer.GrantedKeysAsync(accountId, ct);

        return Result<AccountDetails>.Success(
            ToDetails(row, ClubClock.Today(_timeProvider), isAffiliated, Ordered(permissionKeys))
        );
    }

    private Result<SessionTokensDetails> RejectLogin(string email, LoginFailureReason reason)
    {
        _logger.LogInformation("Login failed for {Email}: {LoginFailureReason}", email, reason);
        return Result<SessionTokensDetails>.Unauthorized(RejectedCredentialsMessage);
    }

    private void ReportLockout(Account account) =>
        _logger.LogWarning(
            "Account {AccountId} locked out until {LockoutEnd}",
            account.Id,
            account.LockoutEnd
        );

    [Pure]
    private static LoginFailureReason FailureReasonOf(SignInResult signIn) =>
        signIn switch
        {
            { IsLockedOut: true } => LoginFailureReason.LockedOut,
            { IsNotAllowed: true } => LoginFailureReason.NotAllowed,
            _ => LoginFailureReason.WrongPassword,
        };

    private void BurnAPasswordCheck(string password)
    {
        var hasher = _userManager.PasswordHasher;
        _decoyPasswordHash ??= hasher.HashPassword(DecoyAccount, DecoyPassword);
        hasher.VerifyHashedPassword(DecoyAccount, _decoyPasswordHash, password);
    }

    private static AccountDetails ToDetails(
        AccountRow row,
        DateOnly today,
        bool isAffiliated,
        IReadOnlyList<string> permissionKeys
    ) =>
        new()
        {
            Id = row.Id,
            Email = row.Email,
            Person = row.Person,
            Membership = MembershipChainDetails.Of(ToPeriods(row.Memberships, today), today),
            IsAffiliated = isAffiliated,
            PermissionKeys = permissionKeys,
            LastSeenAnnouncementAt = row.LastSeenAnnouncementAt,
        };

    private static IReadOnlyList<string> Ordered(IReadOnlyCollection<string> permissionKeys) =>
        [.. permissionKeys.Order(StringComparer.Ordinal)];

    private static IReadOnlyList<MembershipDetails> ToPeriods(
        IReadOnlyList<MembershipRow> rows,
        DateOnly today
    ) =>
        rows.Select(row =>
                MembershipDetails.Of(row.Id, row.StartedOn, row.EndedOn, row.Pauses, today)
            )
            .ToList();

    private static SessionTokensDetails Combine(
        AccessTokenDetails access,
        IssuedRefreshTokenDetails refresh
    ) =>
        new()
        {
            AccessToken = access.Token,
            AccessTokenExpiresAt = access.ExpiresAt,
            RefreshToken = refresh.Token,
            RefreshTokenExpiresAt = refresh.ExpiresAt,
        };

    private Task<Account?> FindAccountAsync(int accountId, CancellationToken ct) =>
        _dbContext
            .Users.AsNoTracking()
            .SingleOrDefaultAsync(account => account.Id == accountId, ct);

    private Task RevokeAsync(
        IssuedRefreshTokenDetails issued,
        RefreshTokenRevocationReason reason,
        CancellationToken ct
    ) =>
        _refreshTokenService.RevokeFamilyAsync(
            new RevokeRefreshTokenFamilyCommand
            {
                PresentedToken = issued.Token,
                AccountId = issued.AccountId,
                Reason = reason,
            },
            ct
        );

    private async Task<SessionTokensDetails> StartSessionAsync(
        Account account,
        CancellationToken ct
    )
    {
        var refresh = await _refreshTokenService.IssueAsync(account.Id, ct);
        var access = _accessTokenService.Issue(account.Id, account.PersonId);
        return Combine(access, refresh);
    }

    private sealed record AccountRow(
        int Id,
        string Email,
        bool IsDisabled,
        DateTimeOffset? LastSeenAnnouncementAt,
        PersonDetails Person,
        IReadOnlyList<MembershipRow> Memberships
    );

    private sealed record MembershipRow(
        int Id,
        DateOnly StartedOn,
        DateOnly? EndedOn,
        IReadOnlyList<MembershipPauseDetails> Pauses
    );
}
