using System.Reflection;

namespace Furria.Infrastructure.Operations;

public static class FurriaVersion
{
    public static readonly string Current =
        typeof(FurriaVersion)
            .Assembly.GetCustomAttribute<AssemblyInformationalVersionAttribute>()
            ?.InformationalVersion
        ?? "unknown";
}
