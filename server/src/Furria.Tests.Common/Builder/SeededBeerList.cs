namespace Furria.Tests.Common.Builder;

public sealed record SeededBeerList(
    IReadOnlyDictionary<string, int> PotIds,
    IReadOnlyDictionary<string, int> EnrollmentIds,
    IReadOnlyDictionary<string, int> CrateIds,
    IReadOnlyDictionary<string, int> PaymentIds
);
