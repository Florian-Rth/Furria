using System.Buffers.Text;
using System.Diagnostics.Contracts;
using System.Globalization;
using Furria.Application.Identity;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.Identity;

public sealed class PasskeyService
{
    private const string MissingAccountMessage = "Dieser Zugang besteht nicht mehr.";
    private const string DisabledAccountMessage = "Dieser Zugang ist gesperrt.";
    private const string ManagedByEnvironmentMessage =
        "Dieser Zugang wird über die Serverkonfiguration verwaltet.";
    private const string DeadChallengeMessage =
        "Die Einrichtung ist abgelaufen. Versuch es noch einmal.";
    private const string RejectedPasskeyMessage =
        "Der Passkey konnte nicht eingerichtet werden. Versuch es noch einmal.";
    private const string MissingPasskeyMessage = "Diesen Passkey gibt es nicht.";

    private readonly AppDbContext _dbContext;
    private readonly UserManager<Account> _userManager;
    private readonly IPasskeyHandler<Account> _passkeyHandler;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly CredentialChangeNotifier _credentialChangeNotifier;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<PasskeyService> _logger;

    public PasskeyService(
        AppDbContext dbContext,
        UserManager<Account> userManager,
        IPasskeyHandler<Account> passkeyHandler,
        IHttpContextAccessor httpContextAccessor,
        CredentialChangeNotifier credentialChangeNotifier,
        TimeProvider timeProvider,
        ILogger<PasskeyService> logger
    )
    {
        _dbContext = dbContext;
        _userManager = userManager;
        _passkeyHandler = passkeyHandler;
        _httpContextAccessor = httpContextAccessor;
        _credentialChangeNotifier = credentialChangeNotifier;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    private HttpContext CurrentHttpContext =>
        _httpContextAccessor.HttpContext
        ?? throw new InvalidOperationException("A passkey ceremony runs inside a request.");

    public async Task<Result<PasskeyOptionsDetails>> MakeCreationOptionsAsync(
        int accountId,
        CancellationToken ct
    )
    {
        var account = await FindAccountAsync(accountId);
        if (account is not { IsDisabled: false, IsManagingLogin: false })
            return Result<PasskeyOptionsDetails>.Carrying(RefusalOf(account));

        var created = await _passkeyHandler.MakeCreationOptionsAsync(
            await UserEntityOfAsync(account, ct),
            CurrentHttpContext
        );
        var challengeId = await IssueChallengeAsync(
            PasskeyChallengePurpose.Creation,
            account.Id,
            created.AttestationState,
            ct
        );
        _logger.LogInformation("Passkey creation started for account {AccountId}", account.Id);

        return Result<PasskeyOptionsDetails>.Success(
            new PasskeyOptionsDetails
            {
                ChallengeId = challengeId,
                OptionsJson = created.CreationOptionsJson,
            }
        );
    }

    public async Task<Result<PasskeyDetails>> AddAsync(
        AddPasskeyCommand command,
        CancellationToken ct
    )
    {
        var challenge = await ConsumeChallengeAsync(
            command.ChallengeId,
            PasskeyChallengePurpose.Creation,
            ct
        );
        var account = await FindAccountAsync(command.AccountId);
        if (account is not { IsDisabled: false, IsManagingLogin: false })
            return Result<PasskeyDetails>.Carrying(RefusalOf(account));

        if (challenge is null || challenge.AccountId != account.Id)
        {
            _logger.LogInformation(
                "Passkey refused for account {AccountId}: the creation challenge is dead",
                account.Id
            );
            return Result<PasskeyDetails>.Validation(DeadChallengeMessage);
        }

        var attested = await _passkeyHandler.PerformAttestationAsync(
            new PasskeyAttestationContext
            {
                HttpContext = CurrentHttpContext,
                CredentialJson = command.CredentialJson,
                AttestationState = challenge.State,
            }
        );
        if (!attested.Succeeded || attested.UserEntity.Id != UserIdOf(account))
        {
            _logger.LogInformation(
                "Passkey refused for account {AccountId}: the attestation failed",
                account.Id
            );
            return Result<PasskeyDetails>.Validation(RejectedPasskeyMessage);
        }

        var now = _timeProvider.GetUtcNow();
        var passkey = Stamped(
            attested.Passkey,
            PasskeyName.Chosen(command.Name, ClubClock.DayOf(now)),
            now
        );
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        ThrowUnlessSucceeded(await _userManager.AddOrUpdatePasskeyAsync(account, passkey));
        await _credentialChangeNotifier.NotifyAsync(
            account.Id,
            CredentialChange.PasskeyAdded,
            toAddress: null,
            ct
        );
        await transaction.CommitAsync(ct);
        _logger.LogInformation("Passkey added to account {AccountId}", account.Id);

        return Result<PasskeyDetails>.Success(ToDetails(passkey));
    }

    public async Task<Result> RemoveAsync(int accountId, string passkeyId, CancellationToken ct)
    {
        var account = await FindAccountAsync(accountId);
        if (account is not { IsDisabled: false })
            return RefusalOf(account);

        var credentialId = CredentialIdOf(passkeyId);
        if (
            credentialId is null
            || await _userManager.GetPasskeyAsync(account, credentialId) is null
        )
            return Result.NotFound(MissingPasskeyMessage);

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        ThrowUnlessSucceeded(await _userManager.RemovePasskeyAsync(account, credentialId));
        await _credentialChangeNotifier.NotifyAsync(
            account.Id,
            CredentialChange.PasskeyRemoved,
            toAddress: null,
            ct
        );
        await transaction.CommitAsync(ct);
        _logger.LogInformation("Passkey removed from account {AccountId}", account.Id);

        return Result.Success();
    }

    public async Task<PasskeyOptionsDetails> MakeRequestOptionsAsync(CancellationToken ct)
    {
        var requested = await _passkeyHandler.MakeRequestOptionsAsync(null, CurrentHttpContext);
        var challengeId = await IssueChallengeAsync(
            PasskeyChallengePurpose.Request,
            accountId: null,
            requested.AssertionState,
            ct
        );

        return new PasskeyOptionsDetails
        {
            ChallengeId = challengeId,
            OptionsJson = requested.RequestOptionsJson,
        };
    }

    public async Task<Account?> VerifyAssertionAsync(
        PasskeyAssertion assertion,
        CancellationToken ct
    )
    {
        var challenge = await ConsumeChallengeAsync(
            assertion.ChallengeId,
            PasskeyChallengePurpose.Request,
            ct
        );
        if (challenge is null)
        {
            _logger.LogInformation("Passkey assertion refused: the request challenge is dead");
            return null;
        }

        var asserted = await _passkeyHandler.PerformAssertionAsync(
            new PasskeyAssertionContext
            {
                HttpContext = CurrentHttpContext,
                CredentialJson = assertion.CredentialJson,
                AssertionState = challenge.State,
            }
        );
        if (!asserted.Succeeded)
        {
            _logger.LogInformation("Passkey assertion refused: the assertion failed");
            return null;
        }

        ThrowUnlessSucceeded(
            await _userManager.AddOrUpdatePasskeyAsync(asserted.User, asserted.Passkey)
        );

        return asserted.User;
    }

    public async Task<IReadOnlyList<PasskeyDetails>> ListAsync(int accountId, CancellationToken ct)
    {
        var rows = await _dbContext
            .UserPasskeys.AsNoTracking()
            .Where(row => row.UserId == accountId)
            .ToListAsync(ct);

        return
        [
            .. rows.Select(row => ToDetails(row.CredentialId, row.Data.Name, row.Data.CreatedAt))
                .OrderBy(passkey => passkey.AddedAt)
                .ThenBy(passkey => passkey.Id, StringComparer.Ordinal),
        ];
    }

    private async Task<string> IssueChallengeAsync(
        PasskeyChallengePurpose purpose,
        int? accountId,
        string? state,
        CancellationToken ct
    )
    {
        var now = _timeProvider.GetUtcNow();
        await _dbContext
            .PasskeyChallenges.Where(challenge => challenge.ExpiresAt <= now)
            .ExecuteDeleteAsync(ct);

        var challengeId = OpaqueTokenSecret.Generate(out var idHash);
        _dbContext.PasskeyChallenges.Add(
            new PasskeyChallenge
            {
                Purpose = purpose,
                IdHash = idHash,
                AccountId = accountId,
                State =
                    state
                    ?? throw new InvalidOperationException(
                        "The passkey handler returned no ceremony state."
                    ),
                IssuedAt = now,
                ExpiresAt = now.Add(PasskeyChallenge.Lifetime),
            }
        );
        await _dbContext.SaveChangesAsync(ct);

        return challengeId;
    }

    private async Task<PasskeyChallenge?> ConsumeChallengeAsync(
        string challengeId,
        PasskeyChallengePurpose purpose,
        CancellationToken ct
    )
    {
        var idHash = OpaqueTokenSecret.HashOf(challengeId);
        if (idHash is null)
            return null;

        var challenge = await _dbContext
            .PasskeyChallenges.AsNoTracking()
            .SingleOrDefaultAsync(row => row.IdHash == idHash, ct);
        if (challenge is null)
            return null;

        var consumed = await _dbContext
            .PasskeyChallenges.Where(row => row.Id == challenge.Id)
            .ExecuteDeleteAsync(ct);

        return consumed == 1 && IsLive(challenge, purpose, _timeProvider.GetUtcNow())
            ? challenge
            : null;
    }

    private async Task<PasskeyUserEntity> UserEntityOfAsync(Account account, CancellationToken ct)
    {
        var displayName = await _dbContext
            .People.AsNoTracking()
            .Where(person => person.Id == account.PersonId)
            .Select(person => person.FirstName + " " + person.LastName)
            .SingleAsync(ct);

        return new PasskeyUserEntity
        {
            Id = UserIdOf(account),
            Name = account.Email ?? displayName,
            DisplayName = displayName,
        };
    }

    private Task<Account?> FindAccountAsync(int accountId) =>
        _userManager.FindByIdAsync(accountId.ToString(CultureInfo.InvariantCulture));

    [Pure]
    private static string UserIdOf(Account account) =>
        account.Id.ToString(CultureInfo.InvariantCulture);

    [Pure]
    private static bool IsLive(
        PasskeyChallenge challenge,
        PasskeyChallengePurpose purpose,
        DateTimeOffset now
    ) => challenge.Purpose == purpose && challenge.ExpiresAt > now;

    [Pure]
    private static byte[]? CredentialIdOf(string passkeyId)
    {
        if (!Base64Url.IsValid(passkeyId, out var decodedLength) || decodedLength == 0)
            return null;

        var decoded = new byte[decodedLength];
        return Base64Url.TryDecodeFromChars(passkeyId, decoded, out var written)
            ? decoded[..written]
            : null;
    }

    [Pure]
    private static UserPasskeyInfo Stamped(
        UserPasskeyInfo attested,
        string name,
        DateTimeOffset addedAt
    ) =>
        new(
            attested.CredentialId,
            attested.PublicKey,
            addedAt,
            attested.SignCount,
            attested.Transports,
            attested.IsUserVerified,
            attested.IsBackupEligible,
            attested.IsBackedUp,
            attested.AttestationObject,
            attested.ClientDataJson
        )
        {
            Name = name,
        };

    [Pure]
    private static PasskeyDetails ToDetails(UserPasskeyInfo passkey) =>
        ToDetails(passkey.CredentialId, passkey.Name, passkey.CreatedAt);

    [Pure]
    private static PasskeyDetails ToDetails(
        byte[] credentialId,
        string? name,
        DateTimeOffset addedAt
    ) =>
        new()
        {
            Id = Base64Url.EncodeToString(credentialId),
            Name = PasskeyName.Chosen(name, ClubClock.DayOf(addedAt)),
            AddedAt = addedAt,
        };

    [Pure]
    private static Result RefusalOf(Account? account) =>
        account switch
        {
            null => Result.NotFound(MissingAccountMessage),
            { IsManagingLogin: true } => Result.Forbidden(ManagedByEnvironmentMessage),
            _ => Result.Forbidden(DisabledAccountMessage),
        };

    private static void ThrowUnlessSucceeded(IdentityResult result)
    {
        if (!result.Succeeded)
            throw new InvalidOperationException(
                "The passkey could not be stored: "
                    + string.Join(", ", result.Errors.Select(error => error.Code))
            );
    }
}
