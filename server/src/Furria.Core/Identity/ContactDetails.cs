using System.Diagnostics.Contracts;

namespace Furria.Core.Identity;

public sealed record ContactDetails
{
    public required string? Email { get; init; }

    public required string? Phone { get; init; }

    public required string? Street { get; init; }

    public required string? Zip { get; init; }

    public required string? City { get; init; }

    [Pure]
    private static bool SameValue(string? submitted, string? recorded) =>
        string.Equals(AbsentIfEmpty(submitted), AbsentIfEmpty(recorded), StringComparison.Ordinal);

    [Pure]
    private static string? AbsentIfEmpty(string? value) => value is "" ? null : value;

    [Pure]
    public static ContactDetails Of(Person person) =>
        new()
        {
            Email = person.Email,
            Phone = person.Phone,
            Street = person.Street,
            Zip = person.Zip,
            City = person.City,
        };

    [Pure]
    public bool DiffersFrom(ContactDetails recorded) =>
        !SameValue(Email, recorded.Email)
        || !SameValue(Phone, recorded.Phone)
        || !SameValue(Street, recorded.Street)
        || !SameValue(Zip, recorded.Zip)
        || !SameValue(City, recorded.City);
}
