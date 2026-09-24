using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Tests.Common.Fixtures;
using Serilog.Events;
using Xunit;

namespace Furria.Api.Tests.Logging;

[Collection("Api")]
public sealed class RequestLoggingTests
{
    private const string RequestCompleted =
        "HTTP {RequestMethod} {RoutePattern} responded {StatusCode} in {Elapsed:0} ms";

    private readonly ApiTestFixture _fixture;

    public RequestLoggingTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_WriteOneEventNamingTheRoutePattern_When_ARequestCompletes()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde")),
            ct
        );
        var groupId = ctx.Groups.Groups.IdOf("tanzgarde");
        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);

        var (response, _) = await ReadGroupAsync(client, groupId);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var written = RequestEventFor(groupId);
        Assert.Equal(LogEventLevel.Information, written.Level);
        Assert.Equal("GET", written.ScalarOf("RequestMethod"));
        Assert.Equal("/api/groups/{groupId}", written.ScalarOf("RoutePattern"));
        Assert.Equal(200, written.ScalarOf("StatusCode"));
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
        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);

        await ReadGroupAsync(client, groupId);

        var written = RequestEventFor(groupId);
        Assert.Equal(ctx.Identity.BootstrapAdmin.AccountId, written.ScalarOf("AccountId"));
    }

    [Fact]
    public async Task Should_CarryNoAccountId_When_TheCallerIsAnonymous()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde")),
            ct
        );
        var groupId = ctx.Groups.Groups.IdOf("tanzgarde");

        var (response, _) = await ReadGroupAsync(_fixture.CreateClient(), groupId);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        var written = RequestEventFor(groupId);
        Assert.Equal(LogEventLevel.Information, written.Level);
        Assert.False(written.Properties.ContainsKey("AccountId"));
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
