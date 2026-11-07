using System.Text.Json;
using Furria.Core.Studio;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

internal static class SongPiecesColumn
{
    public const string ShapeCheck = "jsonb_typeof(pieces) = 'array'";

    private static readonly JsonSerializerOptions PiecesJson = new(JsonSerializerDefaults.Web)
    {
        RespectNullableAnnotations = true,
        RespectRequiredConstructorParameters = true,
    };

    private static readonly ValueComparer<IReadOnlyList<SongPiece>> PiecesComparer = new(
        (left, right) =>
            (left ?? Array.Empty<SongPiece>()).SequenceEqual(right ?? Array.Empty<SongPiece>()),
        pieces => pieces.Aggregate(0, (hash, piece) => HashCode.Combine(hash, piece)),
        pieces => pieces.ToArray()
    );

    public static void Configure(PropertyBuilder<IReadOnlyList<SongPiece>> pieces) =>
        pieces
            .HasColumnType("jsonb")
            .HasDefaultValueSql("'[]'::jsonb")
            .HasConversion(value => Serialized(value), json => Deserialized(json))
            .Metadata.SetValueComparer(PiecesComparer);

    private static string Serialized(IReadOnlyList<SongPiece>? pieces) =>
        JsonSerializer.Serialize(pieces ?? [], PiecesJson);

    private static IReadOnlyList<SongPiece> Deserialized(string json) =>
        JsonSerializer.Deserialize<SongPiece[]>(json, PiecesJson) ?? [];
}
