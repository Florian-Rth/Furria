using System.Diagnostics.Contracts;
using Furria.Application.Registry;

namespace Furria.Api.Endpoints.Persons;

public static class PersonAccessFilters
{
    public const string None = "none";
    public const string Invited = "invited";
    public const string Active = "active";
    public const string Disabled = "disabled";
    public const string NotInvitable = "not-invitable";
    public const string WithAccess = "with-access";
    public const string OpenInvitation = "open-invitation";
    public const string WithoutEmail = "without-email";

    private static readonly IReadOnlyDictionary<string, PersonAccessFilter> ByWireName =
        new Dictionary<string, PersonAccessFilter>(StringComparer.Ordinal)
        {
            [None] = PersonAccessFilter.None,
            [Invited] = PersonAccessFilter.Invited,
            [Active] = PersonAccessFilter.Active,
            [Disabled] = PersonAccessFilter.Disabled,
            [NotInvitable] = PersonAccessFilter.NotInvitable,
            [WithAccess] = PersonAccessFilter.WithAccess,
            [OpenInvitation] = PersonAccessFilter.OpenInvitation,
            [WithoutEmail] = PersonAccessFilter.WithoutEmail,
        };

    [Pure]
    public static bool IsKnown(string? wireName) =>
        wireName is not null && ByWireName.ContainsKey(wireName);

    [Pure]
    public static PersonAccessFilter? Parse(string? wireName) =>
        wireName is not null && ByWireName.TryGetValue(wireName, out var filter) ? filter : null;
}
