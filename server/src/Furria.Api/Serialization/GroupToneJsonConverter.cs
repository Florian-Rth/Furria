using System.Text.Json;
using System.Text.Json.Serialization;
using Furria.Core.Groups;

namespace Furria.Api.Serialization;

public sealed class GroupToneJsonConverter : JsonConverter<GroupTone>
{
    private const string NotAToneMessage = "A tone is a #RRGGBB color.";

    public override GroupTone Read(
        ref Utf8JsonReader reader,
        Type typeToConvert,
        JsonSerializerOptions options
    ) =>
        reader.TokenType == JsonTokenType.String
        && GroupTone.TryParse(reader.GetString(), out var tone)
            ? tone
            : throw new JsonException(NotAToneMessage);

    public override void Write(
        Utf8JsonWriter writer,
        GroupTone value,
        JsonSerializerOptions options
    ) => writer.WriteStringValue(value.Hex);
}
