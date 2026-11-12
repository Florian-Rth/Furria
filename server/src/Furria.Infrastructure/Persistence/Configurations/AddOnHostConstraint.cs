namespace Furria.Infrastructure.Persistence.Configurations;

internal static class AddOnHostConstraint
{
    internal const string OneHost = "num_nonnulls(calendar_entry_id, announcement_id) = 1";
}
