using Furria.Application.Identity;
using Furria.Application.Results;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure.Identity;

public sealed class RefreshTokenService
{
    private const string RejectionMessage = "The refresh token is not valid.";

    private readonly AppDbContext _dbContext;
    private readonly TimeProvider _timeProvider;
    private readonly RefreshTokenOptions _options;
    private readonly ILogger<RefreshTokenService> _logger;

    public RefreshTokenService(
        AppDbContext dbContext,
        TimeProvider timeProvider,
        IOptions<RefreshTokenOptions> options,
        ILogger<RefreshTokenService> logger
    )
    {
        _dbContext = dbContext;
        _timeProvider = timeProvider;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<IssuedRefreshTokenDetails> IssueAsync(int accountId, CancellationToken ct)
    {
        var issued = Mint(accountId, Guid.CreateVersion7());
        _dbContext.RefreshTokens.Add(issued.Token);
        await _dbContext.SaveChangesAsync(ct);
        return issued.Details;
    }

    public async Task<Result<IssuedRefreshTokenDetails>> RotateAsync(
        string presentedToken,
        CancellationToken ct
    )
    {
        var presented = await FindAsync(presentedToken, ct);
        if (presented is null)
            return Result<IssuedRefreshTokenDetails>.Unauthorized(RejectionMessage);

        var now = _timeProvider.GetUtcNow();

        if (presented.RevokedAt is { } revokedAt)
        {
            if (IsReplay(presented.RevokedReason, revokedAt, now))
            {
                await RevokeLiveFamilyAsync(
                    presented.FamilyId,
                    RefreshTokenRevocationReason.ReuseDetected,
                    now,
                    ct
                );
                _logger.LogWarning(
                    "Refresh token replay for account {AccountId}, family {TokenFamilyId} revoked",
                    presented.AccountId,
                    presented.FamilyId
                );
            }

            return Result<IssuedRefreshTokenDetails>.Unauthorized(RejectionMessage);
        }

        if (presented.ExpiresAt <= now)
            return Result<IssuedRefreshTokenDetails>.Unauthorized(RejectionMessage);

        var successor = Mint(presented.AccountId, presented.FamilyId);

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);

        var consumed = await _dbContext
            .RefreshTokens.Where(token => token.Id == presented.Id && token.RevokedAt == null)
            .ExecuteUpdateAsync(
                setters =>
                    setters
                        .SetProperty(token => token.RevokedAt, now)
                        .SetProperty(
                            token => token.RevokedReason,
                            RefreshTokenRevocationReason.Rotated
                        )
                        .SetProperty(token => token.ReplacedById, successor.Token.Id),
                ct
            );

        if (consumed == 0)
        {
            await transaction.RollbackAsync(ct);
            return Result<IssuedRefreshTokenDetails>.Unauthorized(RejectionMessage);
        }

        _dbContext.RefreshTokens.Add(successor.Token);
        await _dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return Result<IssuedRefreshTokenDetails>.Success(successor.Details);
    }

    public async Task RevokeFamilyAsync(
        RevokeRefreshTokenFamilyCommand command,
        CancellationToken ct
    )
    {
        var presented = await FindAsync(command.PresentedToken, ct);
        if (presented is null || presented.AccountId != command.AccountId)
            return;

        await RevokeLiveFamilyAsync(
            presented.FamilyId,
            command.Reason,
            _timeProvider.GetUtcNow(),
            ct
        );
    }

    private bool IsReplay(
        RefreshTokenRevocationReason? reason,
        DateTimeOffset revokedAt,
        DateTimeOffset now
    ) =>
        reason == RefreshTokenRevocationReason.Rotated
        && now - revokedAt > _options.ReuseGraceWindow;

    private Task<RefreshToken?> FindAsync(string presentedToken, CancellationToken ct)
    {
        var hash = RefreshTokenSecret.HashOf(presentedToken);
        if (hash is null)
            return Task.FromResult<RefreshToken?>(null);

        return _dbContext
            .RefreshTokens.AsNoTracking()
            .SingleOrDefaultAsync(token => token.TokenHash == hash, ct);
    }

    private Task RevokeLiveFamilyAsync(
        Guid familyId,
        RefreshTokenRevocationReason reason,
        DateTimeOffset now,
        CancellationToken ct
    ) =>
        _dbContext
            .RefreshTokens.Where(token => token.FamilyId == familyId && token.RevokedAt == null)
            .ExecuteUpdateAsync(
                setters =>
                    setters
                        .SetProperty(token => token.RevokedAt, now)
                        .SetProperty(token => token.RevokedReason, reason),
                ct
            );

    private MintedRefreshToken Mint(int accountId, Guid familyId)
    {
        var secret = RefreshTokenSecret.Generate(out var hash);
        var now = _timeProvider.GetUtcNow();
        var expiresAt = now + _options.Lifetime;

        var token = new RefreshToken
        {
            Id = Guid.CreateVersion7(),
            AccountId = accountId,
            TokenHash = hash,
            FamilyId = familyId,
            CreatedAt = now,
            ExpiresAt = expiresAt,
        };

        var details = new IssuedRefreshTokenDetails
        {
            AccountId = accountId,
            Token = secret,
            ExpiresAt = expiresAt,
        };

        return new MintedRefreshToken(token, details);
    }

    private sealed record MintedRefreshToken(RefreshToken Token, IssuedRefreshTokenDetails Details);
}
