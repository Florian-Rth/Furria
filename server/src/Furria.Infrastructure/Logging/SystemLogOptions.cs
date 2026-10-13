using Microsoft.Extensions.Configuration;

namespace Furria.Infrastructure.Logging;

public sealed class SystemLogOptions
{
    public const string SectionName = "SystemLog";

    public bool Enabled { get; set; } = true;

    public int RowCap { get; set; } = 100_000;

    public static SystemLogOptions Of(IConfiguration configuration) =>
        configuration.GetSection(SectionName).Get<SystemLogOptions>() ?? new SystemLogOptions();
}
