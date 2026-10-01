namespace Furria.Api.Proxies;

public sealed class TrustedProxyOptions
{
    public const string SectionName = "ForwardedHeaders";

    public string[] TrustedProxies { get; set; } = [];
}
