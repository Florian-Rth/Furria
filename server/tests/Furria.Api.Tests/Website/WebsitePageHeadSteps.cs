using System.Net;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Website;

internal static class WebsitePageHeadSteps
{
    internal const string Origin = ApiTestFixture.WebsiteBaseUrl;

    internal static async Task<(HttpStatusCode Status, string Html)> PageHeadAsync(
        ApiTestFixture fixture,
        string kind,
        string slug
    )
    {
        var ct = TestContext.Current.CancellationToken;
        var response = await fixture
            .CreateClient()
            .GetAsync($"/api/public/page-heads/{kind}/{slug}", ct);

        return (response.StatusCode, await response.Content.ReadAsStringAsync(ct));
    }

    internal static string Meta(string property, string content) =>
        $"<meta data-page-head property=\"{property}\" content=\"{content}\">";
}
