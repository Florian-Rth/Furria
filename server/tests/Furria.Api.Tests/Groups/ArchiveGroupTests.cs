using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Groups;

[Collection("Api")]
public sealed class ArchiveGroupTests
{
    private const string ConflictField = "conflict";
    private const int UnknownGroupId = 999_999;

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public ArchiveGroupTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_StampToday_When_TheKeyHolderArchivesTheGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Groups(groups => groups.AddGroup("kindergarde", "Kindergarde")),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.POSTAsync<ArchiveGroup, ArchiveGroupRequest>(
            new() { GroupId = ctx.Groups.Groups.IdOf("kindergarde") }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Group(ctx.Groups.Groups.IdOf("kindergarde"))
            .ToBeArchivedOn(_fixture.Today)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_LeaveEveryPeriodUntouched_When_TheGroupIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddPerson("anna", "Anna", "Kaiser")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("kindergarde", "Kindergarde")
                            .AddGroupMembership(
                                "paula-kindergarde",
                                "kindergarde",
                                "paula",
                                JoinedIn2017
                            )
                            .AddGroupAdmin(
                                "anna-kindergarde",
                                "kindergarde",
                                "anna",
                                "Trainerin",
                                JoinedIn2017
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.POSTAsync<ArchiveGroup, ArchiveGroupRequest>(
            new() { GroupId = ctx.Groups.Groups.IdOf("kindergarde") }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.GroupMembership(ctx.Groups.GroupMemberships.IdOf("paula-kindergarde"))
            .ToHavePeriod(JoinedIn2017, null)
            .GroupAdmin(ctx.Groups.GroupAdmins.IdOf("anna-kindergarde"))
            .ToHavePeriod(JoinedIn2017, null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheGroupIsAlreadyArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups.AddGroup(
                        "kindergarde",
                        "Kindergarde",
                        "Aufgeloest.",
                        isRecruiting: false,
                        ArchivedIn2021
                    )
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.POSTAsync<ArchiveGroup, ArchiveGroupRequest>(
            new() { GroupId = ctx.Groups.Groups.IdOf("kindergarde") }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(["Diese Gruppe ist bereits archiviert."], failures[ConflictField]);
        await ctx
            .Expected.Group(ctx.Groups.Groups.IdOf("kindergarde"))
            .ToBeArchivedOn(ArchivedIn2021)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheGroupIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.POSTAsync<ArchiveGroup, ArchiveGroupRequest>(
            new() { GroupId = UnknownGroupId }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerDoesNotHoldGroupsManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity.AddPerson("anna", "Anna", "Kaiser").AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("kindergarde", "Kindergarde")
                            .AddGroupAdmin("anna-kindergarde", "kindergarde", "anna")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var response = await client.POSTAsync<ArchiveGroup, ArchiveGroupRequest>(
            new() { GroupId = ctx.Groups.Groups.IdOf("kindergarde") }
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.Group(ctx.Groups.Groups.IdOf("kindergarde"))
            .ToBeArchivedOn(null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerSendsNoToken()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Groups(groups => groups.AddGroup("kindergarde", "Kindergarde")),
            ct
        );

        var response = await _fixture
            .CreateClient()
            .POSTAsync<ArchiveGroup, ArchiveGroupRequest>(
                new() { GroupId = ctx.Groups.Groups.IdOf("kindergarde") }
            );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    private static async Task<IDictionary<string, List<string>>> ReadFailuresAsync(
        HttpResponseMessage response,
        CancellationToken ct
    )
    {
        var payload = await response.Content.ReadFromJsonAsync<ErrorResponse>(ct);
        return payload?.Errors
            ?? throw new InvalidOperationException("The failure response carried no errors.");
    }
}
