using System.Net;
using System.Text.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Persons;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Core.Identity;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Persons;

[Collection("Api")]
public sealed class GetPersonByIdTests
{
    private const string PersonsRoute = "/api/manage/persons";

    private static readonly DateOnly BornIn1996 = new(1996, 4, 3);
    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly LeftIn2020 = new(2020, 3, 1);
    private static readonly DateOnly RejoinedIn2021 = new(2021, 1, 1);
    private static readonly DateOnly ArchivedIn2024 = new(2024, 1, 1);

    private readonly ApiTestFixture _fixture;

    public GetPersonByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<TestResult<GetPersonByIdResponse>> ReadPersonAsync(
        HttpClient client,
        int personId
    ) =>
        client.GETAsync<GetPersonById, GetPersonByIdRequest, GetPersonByIdResponse>(
            new GetPersonByIdRequest { PersonId = personId }
        );

    [Fact]
    public async Task Should_CarryTheAddressAndTheBirthDate_When_APersonIsOpenedForEditing()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("alice", "Alice", "Muster")
                        .AddPersonContact(
                            "alice",
                            "alice@example.test",
                            "0170 1234567",
                            "Hauptstraße 12",
                            "99713",
                            "Großfurra",
                            contactVisibleToMembers: true,
                            BornIn1996
                        )
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await ReadPersonAsync(client, ctx.Identity.People.IdOf("alice"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("Alice", result.FirstName);
        Assert.Equal("Muster", result.LastName);
        Assert.Equal("alice@example.test", result.Email);
        Assert.Equal("0170 1234567", result.Phone);
        Assert.Equal("Hauptstraße 12", result.Street);
        Assert.Equal("99713", result.Zip);
        Assert.Equal("Großfurra", result.City);
        Assert.Equal(BornIn1996, result.BirthDate);
        Assert.True(result.ContactVisibleToMembers);
    }

    [Fact]
    public async Task Should_ListThePeriodsNewestFirst_When_APersonRejoinedAfterLeaving()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("frank", "Frank", "Wiederkehr")
                        .AddMembership("frank-first", "frank", JoinedIn2017, LeftIn2020)
                        .AddMembership("frank-again", "frank", RejoinedIn2021)
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await ReadPersonAsync(client, ctx.Identity.People.IdOf("frank"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            [
                ctx.Identity.Memberships.IdOf("frank-again"),
                ctx.Identity.Memberships.IdOf("frank-first"),
            ],
            result.Memberships.Select(period => period.MembershipId).ToArray()
        );
        Assert.Equal(MembershipState.Active, result.MembershipState);
        Assert.Equal(JoinedIn2017, result.MemberSince);
    }

    [Fact]
    public async Task Should_NestTheMembershipPauseInsideItsPeriod_When_APersonPausedHerMembership()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("rita", "Rita", "Ruhend")
                        .AddMembership("rita-first", "rita", JoinedIn2017)
                        .AddMembershipPause("rita-pause", "rita-first", 2019, 2020)
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await ReadPersonAsync(client, ctx.Identity.People.IdOf("rita"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var period = Assert.Single(result.Memberships);
        var pause = Assert.Single(period.Pauses);
        Assert.Equal(ctx.Identity.Pauses.IdOf("rita-pause"), pause.PauseId);
        Assert.Equal(2019, pause.FirstSessionYear);
        Assert.Equal(2020, pause.LastSessionYear);
    }

    [Fact]
    public async Task Should_MarkThePeriodAsFuture_When_TheMembershipHasNotBegunYet()
    {
        var ct = TestContext.Current.CancellationToken;
        var startsNextMonth = _fixture.Today.AddMonths(1);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("nora", "Nora", "Neumitglied")
                        .AddMembership("nora-first", "nora", startsNextMonth)
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await ReadPersonAsync(client, ctx.Identity.People.IdOf("nora"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var period = Assert.Single(result.Memberships);
        Assert.True(period.IsFuture);
        Assert.False(period.IsRunning);
        Assert.Equal(MembershipState.None, result.MembershipState);
        Assert.Null(result.MemberSince);
    }

    [Fact]
    public async Task Should_ListTheFeeReductionsNewestFirst_When_APersonCarriesSeveral()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("bea", "Bea", "Beitrag")
                        .AddFeeReduction("bea-school", "bea", FeeReductionBasis.School, 2016, 2019)
                        .AddFeeReduction(
                            "bea-studies",
                            "bea",
                            FeeReductionBasis.Studies,
                            2020,
                            2025
                        )
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await ReadPersonAsync(client, ctx.Identity.People.IdOf("bea"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            [
                ctx.Identity.FeeReductions.IdOf("bea-studies"),
                ctx.Identity.FeeReductions.IdOf("bea-school"),
            ],
            result.FeeReductions.Select(reduction => reduction.FeeReductionId).ToArray()
        );
        var studies = result.FeeReductions[0];
        Assert.Equal(FeeReductionBasis.Studies, studies.Basis);
        Assert.Equal(2020, studies.FirstSessionYear);
        Assert.Equal(2025, studies.LastSessionYear);
    }

    [Fact]
    public async Task Should_ListTheEndedTiesToo_When_ThePersonLeftAGroupAndARole()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("paula", "Paula", "Brendel"))
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                JoinedIn2017,
                                LeftIn2020
                            )
                    )
                    .Roles(roles =>
                        roles
                            .AddRole("kassenpruefung", "Kassenpruefung")
                            .AddRoleHolding(
                                "paula-kassenpruefung",
                                "kassenpruefung",
                                "paula",
                                JoinedIn2017,
                                LeftIn2020
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await ReadPersonAsync(client, ctx.Identity.People.IdOf("paula"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var tanzgarde = Assert.Single(result.Groups);
        Assert.Equal(ctx.Groups.Groups.IdOf("tanzgarde"), tanzgarde.GroupId);
        Assert.Equal("Tanzgarde", tanzgarde.Name);
        Assert.Equal(JoinedIn2017, tanzgarde.JoinedOn);
        Assert.Equal(LeftIn2020, tanzgarde.LeftOn);
        var kassenpruefung = Assert.Single(result.Roles);
        Assert.Equal(ctx.Roles.Roles.IdOf("kassenpruefung"), kassenpruefung.RoleId);
        Assert.Equal("Kassenpruefung", kassenpruefung.Name);
        Assert.Equal(JoinedIn2017, kassenpruefung.SinceOn);
        Assert.Equal(LeftIn2020, kassenpruefung.UntilOn);
    }

    [Fact]
    public async Task Should_LeaveOutTheArchivedOnes_When_ThePersonBelongedToAnArchivedGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("paula", "Paula", "Brendel"))
                    .Groups(groups =>
                        groups
                            .AddGroup(
                                "showtanz",
                                "Showtanz",
                                "Aufgeloest.",
                                isRecruiting: false,
                                ArchivedIn2024
                            )
                            .AddGroupMembership("paula-showtanz", "showtanz", "paula", JoinedIn2017)
                    )
                    .Roles(roles =>
                        roles
                            .AddRoleWithDetails(
                                "schriftfuehrung",
                                "Schriftfuehrung",
                                "Aufgeloest.",
                                ArchivedIn2024
                            )
                            .AddRoleHolding(
                                "paula-schriftfuehrung",
                                "schriftfuehrung",
                                "paula",
                                JoinedIn2017
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await ReadPersonAsync(client, ctx.Identity.People.IdOf("paula"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Empty(result.Groups);
        Assert.Empty(result.Roles);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_ThePersonDoesNotExist()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await ReadPersonAsync(client, 999_999);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerDoesNotHoldPersonsManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("ilka", "Ilka", "Reineke")
                            .AddAccount("ilka")
                            .AddMembership("ilka-first", "ilka", JoinedIn2017)
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "gruppenpflege",
                            "ilka-gruppenpflege",
                            "Gruppenpflege",
                            "ilka",
                            FurriaPermissions.GroupsManage
                        )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, _) = await ReadPersonAsync(client, ctx.Identity.People.IdOf("ilka"));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var (response, _) = await ReadPersonAsync(_fixture.CreateClient(), 1);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Should_NameTheBasisAsAString_When_ThePayloadIsReadRaw()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("bea", "Bea", "Beitrag")
                        .AddMembership("bea-first", "bea", JoinedIn2017)
                        .AddFeeReduction(
                            "bea-minor",
                            "bea",
                            FeeReductionBasis.Apprenticeship,
                            2020,
                            2023
                        )
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var payload = await client.GetStringAsync(
            $"{PersonsRoute}/{ctx.Identity.People.IdOf("bea")}",
            ct
        );

        using var document = JsonDocument.Parse(payload);
        var fields = document.RootElement.EnumerateObject().Select(field => field.Name).ToArray();
        Assert.Equal(
            [
                "personId",
                "firstName",
                "lastName",
                "email",
                "phone",
                "street",
                "zip",
                "city",
                "birthDate",
                "contactVisibleToMembers",
                "membershipState",
                "memberSince",
                "memberships",
                "feeReductions",
                "groups",
                "roles",
            ],
            fields
        );
        Assert.Equal("active", document.RootElement.GetProperty("membershipState").GetString());
        var reduction = document.RootElement.GetProperty("feeReductions").EnumerateArray().Single();
        Assert.Equal("apprenticeship", reduction.GetProperty("basis").GetString());
    }
}
