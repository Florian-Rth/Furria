using Furria.Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection;

namespace Furria.Tests.Common.Expectations;

public sealed class Expected
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly List<Func<AppDbContext, CancellationToken, Task>> _reads = [];

    public Expected(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    public PersonExpectations Person(int personId) => new(this, personId);

    public MembershipExpectations Membership(int membershipId) => new(this, membershipId);

    public MembershipSetExpectations MembershipsOfPerson(int personId) => new(this, personId);

    public MembershipPauseExpectations MembershipPause(int pauseId) => new(this, pauseId);

    public FeeReductionExpectations FeeReduction(int feeReductionId) => new(this, feeReductionId);

    public RoleExpectations Role(int roleId) => new(this, roleId);

    public RoleSetExpectations Roles() => new(this);

    public RoleHoldingExpectations RoleHolding(int roleHoldingId) => new(this, roleHoldingId);

    public RoleHoldingSetExpectations RoleHoldingsOfPerson(int personId) => new(this, personId);

    public AccountExpectations Account(int accountId) => new(this, accountId);

    public AccountSetExpectations Accounts() => new(this);

    public RefreshTokenExpectations RefreshTokensOf(int accountId) => new(this, accountId);

    public async Task AssertAsync(CancellationToken ct = default)
    {
        var pending = _reads.ToList();
        _reads.Clear();

        await using var scope = _scopeFactory.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        foreach (var read in pending)
        {
            await read(dbContext, ct);
        }
    }

    internal Expected Enqueue(Func<AppDbContext, CancellationToken, Task> read)
    {
        _reads.Add(read);
        return this;
    }
}
