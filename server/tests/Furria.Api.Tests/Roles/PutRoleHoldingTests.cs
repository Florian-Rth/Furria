using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Roles;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Roles;

public sealed class PutRoleHoldingTests : IClassFixture<ApiTestFixture>
{
    private const string ConflictField = "conflict";
    private const string ValidationField = "request";
    private const string OverlappingHoldingMessage =
        "Dieser Zeitraum überschneidet sich mit einer bestehenden Inhaberschaft. "
        + "Eine erneute Inhaberschaft beginnt frühestens am Tag nach dem Ende der vorigen.";
    private const string EndBeforeStartMessage =
        "Eine Inhaberschaft kann nicht vor ihrem Beginn enden.";
    private const string ArchivedRoleMessage =
        "Eine archivierte Rolle kann nicht bearbeitet werden.";

    private static readonly DateOnly HeldSince2017 = new(2017, 9, 1);
    private static readonly DateOnly HandedOver2020 = new(2020, 3, 1);
    private static readonly DateOnly ReallyHeldSince2017 = new(2017, 10, 15);
    private static readonly DateOnly ReallyHandedOver2020 = new(2020, 6, 30);
    private static readonly DateOnly ReappointedIn2021 = new(2021, 1, 1);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 2, 1);

    private readonly ApiTestFixture _fixture;

    public PutRoleHoldingTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<HttpResponseMessage> CorrectHoldingAsync(
        HttpClient client,
        int roleId,
        int roleHoldingId,
        DateOnly sinceOn,
        DateOnly? untilOn
    ) =>
        client.PUTAsync<PutRoleHolding, PutRoleHoldingRequest>(
            new PutRoleHoldingRequest
            {
                RoleId = roleId,
                RoleHoldingId = roleHoldingId,
                SinceOn = sinceOn,
                UntilOn = untilOn,
            }
        );

    [Fact]
    public async Task Should_StoreTheCorrectedPeriod_When_AManagerEditsAnEndedRoleHolding()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithEndedRoleHoldingAsync(ct);

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await CorrectHoldingAsync(
            client,
            ctx.Roles.Roles.IdOf("chronik"),
            ctx.Roles.RoleHoldings.IdOf("ilka-chronik"),
            ReallyHeldSince2017,
            ReallyHandedOver2020
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.RoleHolding(ctx.Roles.RoleHoldings.IdOf("ilka-chronik"))
            .ToHavePeriod(ReallyHeldSince2017, ReallyHandedOver2020)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepItRunning_When_TheStartOfARunningRoleHoldingIsCorrected()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("ilka", "Ilka", "Reineke"))
                    .Roles(roles =>
                        roles
                            .AddRole("chronik", "Chronik")
                            .AddRoleHolding("ilka-chronik", "chronik", "ilka", HeldSince2017)
                    ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await CorrectHoldingAsync(
            client,
            ctx.Roles.Roles.IdOf("chronik"),
            ctx.Roles.RoleHoldings.IdOf("ilka-chronik"),
            ReallyHeldSince2017,
            null
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.RoleHolding(ctx.Roles.RoleHoldings.IdOf("ilka-chronik"))
            .ToHavePeriod(ReallyHeldSince2017, null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RunAgain_When_TheEndOfTheLastRoleHoldingIsCleared()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithEndedRoleHoldingAsync(ct);

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await CorrectHoldingAsync(
            client,
            ctx.Roles.Roles.IdOf("chronik"),
            ctx.Roles.RoleHoldings.IdOf("ilka-chronik"),
            HeldSince2017,
            null
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.RoleHolding(ctx.Roles.RoleHoldings.IdOf("ilka-chronik"))
            .ToBeOpen()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheMovedEndReachesTheNextRoleHolding()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithReappointmentAsync(ct);

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await CorrectHoldingAsync(
            client,
            ctx.Roles.Roles.IdOf("chronik"),
            ctx.Roles.RoleHoldings.IdOf("ilka-chronik"),
            HeldSince2017,
            ReappointedIn2021
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([OverlappingHoldingMessage], failures[ConflictField]);
        await ctx
            .Expected.RoleHolding(ctx.Roles.RoleHoldings.IdOf("ilka-chronik"))
            .ToHavePeriod(HeldSince2017, HandedOver2020)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_ClearingTheEndWouldRunIntoTheNextRoleHolding()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithReappointmentAsync(ct);

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await CorrectHoldingAsync(
            client,
            ctx.Roles.Roles.IdOf("chronik"),
            ctx.Roles.RoleHoldings.IdOf("ilka-chronik"),
            HeldSince2017,
            null
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([OverlappingHoldingMessage], failures[ConflictField]);
        await ctx
            .Expected.RoleHolding(ctx.Roles.RoleHoldings.IdOf("ilka-chronik"))
            .ToHavePeriod(HeldSince2017, HandedOver2020)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_StoreThePeriod_When_TheNextRoleHoldingStartsTheDayAfterTheMovedEnd()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithReappointmentAsync(ct);

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await CorrectHoldingAsync(
            client,
            ctx.Roles.Roles.IdOf("chronik"),
            ctx.Roles.RoleHoldings.IdOf("ilka-chronik"),
            HeldSince2017,
            ReappointedIn2021.AddDays(-1)
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.RoleHolding(ctx.Roles.RoleHoldings.IdOf("ilka-chronik"))
            .ToHavePeriod(HeldSince2017, ReappointedIn2021.AddDays(-1))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnprocessableEntity_When_TheEndPrecedesTheStart()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithEndedRoleHoldingAsync(ct);

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await CorrectHoldingAsync(
            client,
            ctx.Roles.Roles.IdOf("chronik"),
            ctx.Roles.RoleHoldings.IdOf("ilka-chronik"),
            HandedOver2020,
            HeldSince2017
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([EndBeforeStartMessage], failures[ValidationField]);
        await ctx
            .Expected.RoleHolding(ctx.Roles.RoleHoldings.IdOf("ilka-chronik"))
            .ToHavePeriod(HeldSince2017, HandedOver2020)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheRoleIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("ilka", "Ilka", "Reineke"))
                    .Roles(roles =>
                        roles
                            .AddRoleWithDetails(
                                "chronik",
                                "Chronik",
                                "Führt die Vereinschronik.",
                                ArchivedIn2021
                            )
                            .AddRoleHolding(
                                "ilka-chronik",
                                "chronik",
                                "ilka",
                                HeldSince2017,
                                HandedOver2020
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await CorrectHoldingAsync(
            client,
            ctx.Roles.Roles.IdOf("chronik"),
            ctx.Roles.RoleHoldings.IdOf("ilka-chronik"),
            HeldSince2017,
            ReallyHandedOver2020
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([ArchivedRoleMessage], failures[ConflictField]);
        await ctx
            .Expected.RoleHolding(ctx.Roles.RoleHoldings.IdOf("ilka-chronik"))
            .ToHavePeriod(HeldSince2017, HandedOver2020)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_LiftHerArchive_When_TheCorrectedRoleHoldingRunsAgain()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithArchivedFormerHolderAsync(ct);

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await CorrectHoldingAsync(
            client,
            ctx.Roles.Roles.IdOf("chronik"),
            ctx.Roles.RoleHoldings.IdOf("ilka-chronik"),
            HeldSince2017,
            _fixture.Today.AddDays(30)
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("ilka"))
            .ToNotBeArchived()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepHerArchive_When_TheCorrectedRoleHoldingStaysInThePast()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithArchivedFormerHolderAsync(ct);

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await CorrectHoldingAsync(
            client,
            ctx.Roles.Roles.IdOf("chronik"),
            ctx.Roles.RoleHoldings.IdOf("ilka-chronik"),
            HeldSince2017,
            ReallyHandedOver2020
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("ilka"))
            .ToBeArchived(ArchivedIn2021, null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheRoleHoldingBelongsToAnotherRole()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("ilka", "Ilka", "Reineke"))
                    .Roles(roles =>
                        roles
                            .AddRole("chronik", "Chronik")
                            .AddRole("zeugwart", "Zeugwart")
                            .AddRoleHolding(
                                "ilka-chronik",
                                "chronik",
                                "ilka",
                                HeldSince2017,
                                HandedOver2020
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await CorrectHoldingAsync(
            client,
            ctx.Roles.Roles.IdOf("zeugwart"),
            ctx.Roles.RoleHoldings.IdOf("ilka-chronik"),
            HeldSince2017,
            ReallyHandedOver2020
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await ctx
            .Expected.RoleHolding(ctx.Roles.RoleHoldings.IdOf("ilka-chronik"))
            .ToHavePeriod(HeldSince2017, HandedOver2020)
            .AssertAsync(ct);
    }

    private Task<SeededContext> BuildWithEndedRoleHoldingAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("ilka", "Ilka", "Reineke"))
                    .Roles(roles =>
                        roles
                            .AddRole("chronik", "Chronik")
                            .AddRoleHolding(
                                "ilka-chronik",
                                "chronik",
                                "ilka",
                                HeldSince2017,
                                HandedOver2020
                            )
                    ),
            ct
        );

    private Task<SeededContext> BuildWithReappointmentAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("ilka", "Ilka", "Reineke"))
                    .Roles(roles =>
                        roles
                            .AddRole("chronik", "Chronik")
                            .AddRoleHolding(
                                "ilka-chronik",
                                "chronik",
                                "ilka",
                                HeldSince2017,
                                HandedOver2020
                            )
                            .AddRoleHolding(
                                "ilka-chronik-again",
                                "chronik",
                                "ilka",
                                ReappointedIn2021
                            )
                    ),
            ct
        );

    private Task<SeededContext> BuildWithArchivedFormerHolderAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("ilka", "Ilka", "Reineke")
                            .AddArchive("ilka", ArchivedIn2021)
                    )
                    .Roles(roles =>
                        roles
                            .AddRole("chronik", "Chronik")
                            .AddRoleHolding(
                                "ilka-chronik",
                                "chronik",
                                "ilka",
                                HeldSince2017,
                                HandedOver2020
                            )
                    ),
            ct
        );

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
