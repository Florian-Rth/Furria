using Furria.Application.Identity;
using Furria.Application.Results;
using Furria.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Identity;

public sealed class AccountService
{
    private const string RejectedCredentialsMessage = "Email or password is not valid.";
    private const string RejectedSessionMessage = "The session could not be refreshed.";
    private const string DecoyPassword = "decoy-password-that-no-account-ever-uses";

    private static readonly Account DecoyAccount = new();

    private static string? _decoyPasswordHash;

    private readonly AppDbContext _dbContext;
    private readonly UserManager<Account> _userManager;
    private readonly SignInManager<Account> _signInManager;
    private readonly RefreshTokenService _refreshTokenService;
    private readonly AccessTokenService _accessTokenService;

    public AccountService(
        AppDbContext dbContext,
        UserManager<Account> userManager,
        SignInManager<Account> signInManager,
        RefreshTokenService refreshTokenService,
        AccessTokenService accessTokenService
    )
    {
        _dbContext = dbContext;
        _userManager = userManager;
        _signInManager = signInManager;
        _refreshTokenService = refreshTokenService;
        _accessTokenService = accessTokenService;
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
            return Result<SessionTokensDetails>.Unauthorized(RejectedCredentialsMessage);
        }

        var signIn = await _signInManager.CheckPasswordSignInAsync(
            account,
            command.Password,
            lockoutOnFailure: true
        );

        if (!signIn.Succeeded)
        {
            if (signIn.IsLockedOut || signIn.IsNotAllowed)
                BurnAPasswordCheck(command.Password);

            return Result<SessionTokensDetails>.Unauthorized(RejectedCredentialsMessage);
        }

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
            return Result<SessionTokensDetails>.Unauthorized(RejectedSessionMessage);
        }

        var access = _accessTokenService.Issue(account.Id, account.PersonId);
        return Result<SessionTokensDetails>.Success(Combine(access, rotated.Value));
    }

    public Task LogoutAsync(string presentedToken, int accountId, CancellationToken ct) =>
        _refreshTokenService.RevokeFamilyAsync(
            new RevokeRefreshTokenFamilyCommand
            {
                PresentedToken = presentedToken,
                AccountId = accountId,
                Reason = RefreshTokenRevocationReason.LoggedOut,
            },
            ct
        );

    public async Task<Result<AccountDetails>> GetDetailsAsync(int accountId, CancellationToken ct)
    {
        var details = await _dbContext
            .Users.AsNoTracking()
            .Where(account => account.Id == accountId)
            .Select(account => new AccountDetails
            {
                Id = account.Id,
                Email = account.Email ?? "",
                Person = new PersonDetails
                {
                    Id = account.Person!.Id,
                    FirstName = account.Person.FirstName,
                    LastName = account.Person.LastName,
                    Email = account.Person.Email,
                    Phone = account.Person.Phone,
                },
                Membership =
                    account.Person.Membership == null
                        ? null
                        : new MembershipDetails
                        {
                            Type = account.Person.Membership.Type,
                            Status = account.Person.Membership.Status,
                            StartedAt = account.Person.Membership.StartedAt,
                            EndedAt = account.Person.Membership.EndedAt,
                        },
            })
            .SingleOrDefaultAsync(ct);

        return details is null
            ? Result<AccountDetails>.NotFound("The account no longer exists.")
            : Result<AccountDetails>.Success(details);
    }

    private void BurnAPasswordCheck(string password)
    {
        var hasher = _userManager.PasswordHasher;
        _decoyPasswordHash ??= hasher.HashPassword(DecoyAccount, DecoyPassword);
        hasher.VerifyHashedPassword(DecoyAccount, _decoyPasswordHash, password);
    }

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
}
