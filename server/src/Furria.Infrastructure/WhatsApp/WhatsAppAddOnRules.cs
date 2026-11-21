namespace Furria.Infrastructure.WhatsApp;

internal static class WhatsAppAddOnRules
{
    internal const string AddOnIdCheck =
        $"(add_on_id IS NULL AND (add_on_kind IS NULL OR add_on_kind = '{nameof(WhatsAppAddOnKind.Attendance)}'))"
        + $" OR (add_on_id IS NOT NULL AND add_on_kind IN ('{nameof(WhatsAppAddOnKind.Poll)}', '{nameof(WhatsAppAddOnKind.SignUpList)}'))";

    internal const string PollOptionIdsCheck =
        "cardinality(poll_option_ids) = 0"
        + " OR cardinality(poll_option_ids) = cardinality(poll_options)";

    internal const string PollOptionsCheck =
        "cardinality(poll_options) = 0 OR add_on_kind IS NOT NULL";

    internal const string EmptyArray = "'{}'";
}
