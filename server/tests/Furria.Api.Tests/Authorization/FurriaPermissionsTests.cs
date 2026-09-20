using System.Reflection;
using Furria.Application.Authorization;
using Xunit;

namespace Furria.Api.Tests.Authorization;

public sealed class FurriaPermissionsTests
{
    private static readonly IReadOnlyList<string> Declared = DeclaredKeys();

    [Fact]
    public void Should_StayApart_When_TheGrantableKeysMeetTheImpliedOnes()
    {
        Assert.Empty(FurriaPermissions.All.Intersect(FurriaPermissions.ImpliedByRelationship));
    }

    [Fact]
    public void Should_CoverEveryDeclaredKey_When_BothListsAreTakenTogether()
    {
        var listed = FurriaPermissions
            .All.Concat(FurriaPermissions.ImpliedByRelationship)
            .ToHashSet(StringComparer.Ordinal);

        Assert.Equal(
            Declared.OrderBy(key => key, StringComparer.Ordinal),
            listed.Order(StringComparer.Ordinal)
        );
    }

    private static IReadOnlyList<string> DeclaredKeys() =>
        [
            .. typeof(FurriaPermissions)
                .GetFields(BindingFlags.Public | BindingFlags.Static)
                .Where(field => field.IsLiteral && field.FieldType == typeof(string))
                .Select(field => (string)field.GetRawConstantValue()!),
        ];
}
