using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

internal static class PlanDocumentColumn
{
    private static readonly JsonSerializerOptions DocumentJson = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        RespectNullableAnnotations = true,
    };

    public static void Configure<TDocument>(PropertyBuilder<TDocument> document, TDocument empty)
        where TDocument : class =>
        document
            .HasColumnType("jsonb")
            .HasConversion(value => Serialized(value, empty), json => Deserialized(json, empty))
            .Metadata.SetValueComparer(
                new ValueComparer<TDocument>(
                    (left, right) => Serialized(left, empty) == Serialized(right, empty),
                    value => Serialized(value, empty).GetHashCode(StringComparison.Ordinal),
                    value => Deserialized(Serialized(value, empty), empty)
                )
            );

    private static string Serialized<TDocument>(TDocument? document, TDocument empty) =>
        JsonSerializer.Serialize(document ?? empty, DocumentJson);

    private static TDocument Deserialized<TDocument>(string json, TDocument empty) =>
        JsonSerializer.Deserialize<TDocument>(json, DocumentJson) ?? empty;
}
