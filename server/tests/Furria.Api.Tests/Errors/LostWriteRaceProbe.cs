using FastEndpoints;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Furria.Api.Tests.Errors;

public sealed class LostWriteRaceProbe : Endpoint<LostWriteRaceProbeRequest>
{
    public const string ConcurrentChange = "concurrent-change";
    public const string VanishedReference = "vanished-reference";
    public const string TakenUniqueValue = "taken-unique-value";
    public const string BulkTakenUniqueValue = "bulk-taken-unique-value";

    public override void Configure()
    {
        Get("tests/lost-write-race-probe/{race}");
        AllowAnonymous();
    }

    public override Task HandleAsync(LostWriteRaceProbeRequest req, CancellationToken ct) =>
        throw req.Race switch
        {
            ConcurrentChange => new DbUpdateConcurrencyException("Row was changed meanwhile."),
            VanishedReference => Violation(PostgresErrorCodes.ForeignKeyViolation),
            TakenUniqueValue => Violation(PostgresErrorCodes.UniqueViolation),
            BulkTakenUniqueValue => BulkViolation(PostgresErrorCodes.UniqueViolation),
            _ => new InvalidOperationException("Unknown race."),
        };

    private static DbUpdateException Violation(string sqlState) =>
        new("Saving failed.", BulkViolation(sqlState));

    private static PostgresException BulkViolation(string sqlState) =>
        new("Constraint violated.", "ERROR", "ERROR", sqlState);
}

public sealed record LostWriteRaceProbeRequest
{
    public required string Race { get; init; }
}
