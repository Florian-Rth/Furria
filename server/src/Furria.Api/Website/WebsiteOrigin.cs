using System.Diagnostics.Contracts;

namespace Furria.Api.Website;

public static class WebsiteOrigin
{
    [Pure]
    public static string Of(string websiteBaseUrl) => websiteBaseUrl.TrimEnd('/');
}
