using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Groups;

public sealed class EndGroupAdminTests : IClassFixture<ApiTestFixture>
{
    private const string ValidationField = "request";

    private static readonly DateOnly AppointedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly EndedIn2026 = new(2026, 3, 1);

    private readonly ApiTestFixture _fixture;

    public EndGroupAdminTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CloseTheTenure_When_TheCallerIsTheGroupAdmin()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                            .AddGroupAdmin(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                "Trainerin",
                                AppointedIn2017
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var response = await client.POSTAsync<EndGroupAdmin, EndGroupAdminRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                GroupAdminId = ctx.Groups.GroupAdmins.IdOf("paula-tanzgarde"),
                EndedOn = EndedIn2026,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.GroupAdmin(ctx.Groups.GroupAdmins.IdOf("paula-tanzgarde"))
            .ToHavePeriod(AppointedIn2017, EndedIn2026)
            .GroupAdminsOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveOpenCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheTenureBelongsToAnotherGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroup("elferrat", "Elferrat")
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                            .AddGroupAdmin(
                                "paula-elferrat",
                                "elferrat",
                                "paula",
                                sinceOn: AppointedIn2017
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var response = await client.POSTAsync<EndGroupAdmin, EndGroupAdminRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                GroupAdminId = ctx.Groups.GroupAdmins.IdOf("paula-elferrat"),
                EndedOn = EndedIn2026,
            }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await ctx
            .Expected.GroupAdmin(ctx.Groups.GroupAdmins.IdOf("paula-elferrat"))
            .ToHavePeriod(AppointedIn2017, null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnprocessable_When_TheEndLiesBeforeTheTenure()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                            .AddGroupAdmin(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                sinceOn: AppointedIn2017
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var response = await client.POSTAsync<EndGroupAdmin, EndGroupAdminRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                GroupAdminId = ctx.Groups.GroupAdmins.IdOf("paula-tanzgarde"),
                EndedOn = AppointedIn2017.AddDays(-1),
            }
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Eine Ernennung kann nicht vor ihrem Beginn enden."],
            failures[ValidationField]
        );
        await ctx
            .Expected.GroupAdmin(ctx.Groups.GroupAdmins.IdOf("paula-tanzgarde"))
            .ToHavePeriod(AppointedIn2017, null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerOnlyBelongsToTheGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("mara", "Mara", "Lenz")
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddAccount("mara")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership("mara-tanzgarde", "tanzgarde", "mara")
                            .AddGroupAdmin(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                sinceOn: AppointedIn2017
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("mara", ct);
        var response = await client.POSTAsync<EndGroupAdmin, EndGroupAdminRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                GroupAdminId = ctx.Groups.GroupAdmins.IdOf("paula-tanzgarde"),
                EndedOn = EndedIn2026,
            }
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.GroupAdmin(ctx.Groups.GroupAdmins.IdOf("paula-tanzgarde"))
            .ToHavePeriod(AppointedIn2017, null)
            .AssertAsync(ct);
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
