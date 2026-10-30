using System.Text.Json;
using System.Text.Json.Serialization;
using Furria.Core.Studio;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

internal static class ChoreographyDocumentColumn
{
    public const string ShapeCheck =
        "jsonb_typeof(document) = 'object' AND jsonb_typeof(document -> 'tracks') = 'array'";

    private static readonly JsonSerializerOptions DocumentJson = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
        RespectNullableAnnotations = true,
        RespectRequiredConstructorParameters = true,
    };

    private static readonly ValueComparer<ChoreographyDocument> DocumentComparer = new(
        (left, right) => Serialized(left) == Serialized(right),
        document => Serialized(document).GetHashCode(StringComparison.Ordinal),
        document => Deserialized(Serialized(document))
    );

    public static void Configure(PropertyBuilder<ChoreographyDocument> document) =>
        document
            .HasColumnType("jsonb")
            .HasConversion(value => Serialized(value), json => Deserialized(json))
            .Metadata.SetValueComparer(DocumentComparer);

    private static string Serialized(ChoreographyDocument? document) =>
        JsonSerializer.Serialize(document ?? ChoreographyDocument.Empty, DocumentJson);

    private static ChoreographyDocument Deserialized(string json) =>
        JsonSerializer.Deserialize<ChoreographyDocument>(json, DocumentJson)
        ?? ChoreographyDocument.Empty;
}
