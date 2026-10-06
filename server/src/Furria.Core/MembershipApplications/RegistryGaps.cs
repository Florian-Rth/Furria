using System.Diagnostics.Contracts;
using Furria.Core.Identity;

namespace Furria.Core.MembershipApplications;

public static class RegistryGaps
{
    private static readonly IReadOnlyList<RegistryGap> BirthDateGap = [RegistryGap.BirthDate];
    private static readonly IReadOnlyList<RegistryGap> NoGap = [];

    [Pure]
    public static IReadOnlyList<RegistryGap> Of(
        DateOnly? recordedBirthDate,
        ContactDetails recorded,
        ContactDetails applied
    ) => [.. recordedBirthDate is null ? BirthDateGap : NoGap, .. ContactGapsOf(recorded, applied)];

    [Pure]
    public static ContactDetails Filled(ContactDetails recorded, ContactDetails applied)
    {
        var gaps = ContactGapsOf(recorded, applied).ToHashSet();
        var fillsAddress = gaps.Contains(RegistryGap.Address);

        return new ContactDetails
        {
            Email = gaps.Contains(RegistryGap.Email) ? applied.Email : recorded.Email,
            Phone = gaps.Contains(RegistryGap.Phone) ? applied.Phone : recorded.Phone,
            Street = fillsAddress ? applied.Street : recorded.Street,
            Zip = fillsAddress ? applied.Zip : recorded.Zip,
            City = fillsAddress ? applied.City : recorded.City,
        };
    }

    [Pure]
    private static IEnumerable<RegistryGap> ContactGapsOf(
        ContactDetails recorded,
        ContactDetails applied
    )
    {
        if (IsBlank(recorded.Email) && !IsBlank(applied.Email))
            yield return RegistryGap.Email;
        if (IsBlank(recorded.Phone) && !IsBlank(applied.Phone))
            yield return RegistryGap.Phone;
        if (HasNoAddress(recorded) && !HasNoAddress(applied))
            yield return RegistryGap.Address;
    }

    [Pure]
    private static bool HasNoAddress(ContactDetails contact) =>
        IsBlank(contact.Street) && IsBlank(contact.Zip) && IsBlank(contact.City);

    [Pure]
    private static bool IsBlank(string? value) => string.IsNullOrWhiteSpace(value);
}
