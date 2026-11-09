using Furria.Core.Groups;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class GroupToneConverter : ValueConverter<GroupTone, string>
{
    public const string HexColorCheck = "tone IS NULL OR tone ~ '^#[0-9A-F]{6}$'";

    public GroupToneConverter()
        : base(tone => tone.Hex, hex => GroupTone.Parse(hex)) { }
}
