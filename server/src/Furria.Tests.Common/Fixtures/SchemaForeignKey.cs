namespace Furria.Tests.Common.Fixtures;

public sealed record SchemaForeignKey(
    string Name,
    string Table,
    string ReferencedTable,
    string OnDelete
);
