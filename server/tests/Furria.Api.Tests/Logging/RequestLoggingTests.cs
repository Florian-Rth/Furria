using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Tests.Common.Fixtures;
using Serilog.Events;
using Xunit;

namespace Furria.Api.Tests.Logging;

public sealed class RequestLoggingTests : IClassFixture<ApiTestFixture>
{
    private const string RequestCompleted =
        "HTTP {RequestMethod} {RoutePattern} responded {StatusCode} in {Elapsed:0} ms";

    private readonly ApiTestFixture _fixture;

    public RequestLoggingTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CarryTheCallersAccountId_When_TheCallerIsSignedIn()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde")),
            ct
        );
        var groupId = ctx.Groups.Groups.IdOf("tanzgarde");
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        await ReadGroupAsync(client, groupId);

        var written = RequestEventFor(groupId);
        Assert.Equal(ctx.Identity.ManagingLogin.AccountId, written.ScalarOf("AccountId"));
    }

    private static Task<TestResult<GetGroupByIdResponse>> ReadGroupAsync(
        HttpClient client,
        int groupId
    ) =>
        client.GETAsync<GetGroupById, GetGroupByIdRequest, GetGroupByIdResponse>(
            new GetGroupByIdRequest { GroupId = groupId }
        );

    private LogEvent RequestEventFor(int groupId) =>
        Assert.Single(
            _fixture.Logs.Written(RequestCompleted),
            logged => Equals(logged.ScalarOf("RequestPath"), $"/api/groups/{groupId}")
        );
}
