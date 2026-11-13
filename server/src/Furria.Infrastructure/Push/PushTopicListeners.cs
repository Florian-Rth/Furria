using Furria.Core.Push;
using Furria.Infrastructure.Identity;
using Furria.Infrastructure.Persistence;

namespace Furria.Infrastructure.Push;

internal static class PushTopicListeners
{
    internal static IQueryable<Account> ListeningTo(
        this IQueryable<Account> accounts,
        AppDbContext dbContext,
        PushTopic topic
    ) =>
        accounts.Where(account =>
            !dbContext.MutedPushTopics.Any(muted =>
                muted.AccountId == account.Id && muted.Topic == topic
            )
        );
}
