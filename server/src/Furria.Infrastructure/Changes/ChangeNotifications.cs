using Microsoft.EntityFrameworkCore.Migrations;

namespace Furria.Infrastructure.Changes;

public static class ChangeNotifications
{
    private const string FunctionName = "furria_notify_change";

    public const string Channel = "furria_changes";
    public const string TriggerName = "furria_notify_change";

    public static void CreateChangeNotifier(this MigrationBuilder migrationBuilder) =>
        migrationBuilder.Sql(
            $"""
            CREATE FUNCTION {FunctionName}() RETURNS trigger LANGUAGE plpgsql AS $$
            BEGIN
                PERFORM pg_notify('{Channel}', TG_TABLE_NAME);
                RETURN NULL;
            END;
            $$;
            """
        );

    public static void DropChangeNotifier(this MigrationBuilder migrationBuilder) =>
        migrationBuilder.Sql($"DROP FUNCTION {FunctionName}();");

    public static void NotifyChangesOf(this MigrationBuilder migrationBuilder, string table) =>
        migrationBuilder.Sql(
            $"""
            CREATE TRIGGER {TriggerName}
            AFTER INSERT OR UPDATE OR DELETE OR TRUNCATE ON "{table}"
            FOR EACH STATEMENT EXECUTE FUNCTION {FunctionName}();
            """
        );

    public static void StopNotifyingChangesOf(
        this MigrationBuilder migrationBuilder,
        string table
    ) => migrationBuilder.Sql($"""DROP TRIGGER {TriggerName} ON "{table}";""");
}
