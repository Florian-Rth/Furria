using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Calendar;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Calendar;

public sealed class PutOwnCalendarSignUpLineTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);

    private static readonly DateTimeOffset Now = new(2027, 1, 15, 12, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset AtTheCoffee = new(2027, 1, 20, 15, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset AtTheBreakfast = new(
        2027,
        1,
        10,
        9,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset LastWeek = new(2027, 1, 8, 12, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public PutOwnCalendarSignUpLineTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_AddHerLine_When_SheSignsUpForTheFirstTime()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var listId = ctx.Club.CalendarSignUpLists.IdOf("cakes");

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var response = await SignUpAsync(ctx, "dana", listId, " Obstsalat ", ct);

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
            }
        );

        await ctx
            .Expected.CalendarSignUpList(listId)
            .ToHaveLines(
                (ctx.Identity.People.IdOf("chris"), "Käsekuchen"),
                (ctx.Identity.People.IdOf("ilka"), "Brezeln"),
                (ctx.Identity.People.IdOf("dana"), "Obstsalat")
            )
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RewriteHerOwnLine_When_SheSignsUpAgain()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var listId = ctx.Club.CalendarSignUpLists.IdOf("cakes");

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var response = await SignUpAsync(ctx, "chris", listId, "Apfelkuchen", ct);

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
            }
        );

        await ctx
            .Expected.CalendarSignUpList(listId)
            .ToHaveLines(
                (ctx.Identity.People.IdOf("chris"), "Apfelkuchen"),
                (ctx.Identity.People.IdOf("ilka"), "Brezeln")
            )
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepOnlyHerName_When_SheSignsUpWithoutText()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var listId = ctx.Club.CalendarSignUpLists.IdOf("cakes");

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var response = await SignUpAsync(ctx, "chris", listId, "  ", ct);

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
            }
        );

        await ctx
            .Expected.CalendarSignUpList(listId)
            .ToHaveLines(
                (ctx.Identity.People.IdOf("chris"), null),
                (ctx.Identity.People.IdOf("ilka"), "Brezeln")
            )
            .AssertAsync(ct);
    }

    [Theory]
    [InlineData("closed")]
    [InlineData("deadline")]
    [InlineData("late")]
    public async Task Should_RefuseTheLine_When_TheListHasClosed(string listAlias)
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var listId = ctx.Club.CalendarSignUpLists.IdOf(listAlias);

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var response = await SignUpAsync(ctx, "chris", listId, "Ich", ct);

                Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
            }
        );

        await ctx
            .Expected.CalendarSignUpList(listId)
            .ToHaveLines([
                .. listAlias == "closed"
                    ? [(ctx.Identity.People.IdOf("dana"), (string?)null)]
                    : Array.Empty<(int, string?)>(),
            ])
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_SheDoesNotSeeTheEntry()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var listId = ctx.Club.CalendarSignUpLists.IdOf("secret");

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var response = await SignUpAsync(ctx, "dana", listId, "Blumen", ct);

                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        );

        await ctx.Expected.CalendarSignUpList(listId).ToHaveLines().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_AddTheLine_When_SheIsChosenForTheEntry()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var listId = ctx.Club.CalendarSignUpLists.IdOf("secret");

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var response = await SignUpAsync(ctx, "chris", listId, "Blumen", ct);

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
            }
        );

        await ctx
            .Expected.CalendarSignUpList(listId)
            .ToHaveLines((ctx.Identity.People.IdOf("chris"), "Blumen"))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepOneLinePerPerson_When_SheSignsUpTwiceAtOnce()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var listId = ctx.Club.CalendarSignUpLists.IdOf("cakes");

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var responses = await Task.WhenAll(
                    SignUpAsync(ctx, "dana", listId, "Obst", ct),
                    SignUpAsync(ctx, "dana", listId, "Obst", ct)
                );

                Assert.All(
                    responses,
                    response => Assert.Equal(HttpStatusCode.NoContent, response.StatusCode)
                );
            }
        );

        await ctx
            .Expected.CalendarSignUpList(listId)
            .ToHaveLines(
                (ctx.Identity.People.IdOf("chris"), "Käsekuchen"),
                (ctx.Identity.People.IdOf("ilka"), "Brezeln"),
                (ctx.Identity.People.IdOf("dana"), "Obst")
            )
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheLine_When_TheEntryIsMeantForAnotherGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var listId = ctx.Club.CalendarSignUpLists.IdOf("garde-helpers");

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var response = await SignUpAsync(ctx, "dana", listId, "Aufbau", ct);

                Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
            }
        );

        await ctx.Expected.CalendarSignUpList(listId).ToHaveLines().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_AddTheLine_When_SheBelongsToTheGroupTheEntryIsMeantFor()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var listId = ctx.Club.CalendarSignUpLists.IdOf("garde-helpers");

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var response = await SignUpAsync(ctx, "elli", listId, "Aufbau", ct);

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
            }
        );

        await ctx
            .Expected.CalendarSignUpList(listId)
            .ToHaveLines((ctx.Identity.People.IdOf("elli"), "Aufbau"))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_AddTheLine_When_SheSchedulesAnEntryNotMeantForHer()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var listId = ctx.Club.CalendarSignUpLists.IdOf("board-helpers");

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var response = await SignUpAsync(ctx, "ilka", listId, "Kaffee", ct);

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
            }
        );

        await ctx
            .Expected.CalendarSignUpList(listId)
            .ToHaveLines((ctx.Identity.People.IdOf("ilka"), "Kaffee"))
            .AssertAsync(ct);
    }

    private static async Task<HttpResponseMessage> SignUpAsync(
        SeededContext ctx,
        string personAlias,
        int signUpListId,
        string? text,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync(personAlias, ct);

        return await client.PUTAsync<PutOwnCalendarSignUpLine, PutOwnCalendarSignUpLineRequest>(
            new PutOwnCalendarSignUpLineRequest { SignUpListId = signUpListId, Text = text }
        );
    }

    private Task<SeededContext> BuildClubAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("ilka", "Ilka", "Kalender")
                            .AddAccount("ilka")
                            .AddMembership("ilka-first", "ilka", JoinedIn2017)
                            .AddPerson("chris", "Chris", "Trainer")
                            .AddAccount("chris")
                            .AddMembership("chris-first", "chris", JoinedIn2017)
                            .AddPerson("dana", "Dana", "Doppelt")
                            .AddAccount("dana")
                            .AddMembership("dana-first", "dana", JoinedIn2017)
                            .AddPerson("elli", "Elli", "Garde")
                            .AddAccount("elli")
                            .AddMembership("elli-first", "elli", JoinedIn2017)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership("elli-tanzgarde", "tanzgarde", "elli", JoinedIn2017)
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "terminpflege",
                            "ilka-terminpflege",
                            "Terminpflege",
                            "ilka",
                            FurriaPermissions.CalendarManageClub
                        )
                    )
                    .Club(club =>
                        club.AddCalendarEntry("coffee", "Kaffeekränzchen", AtTheCoffee)
                            .AddCalendarEntry("breakfast", "Frühschoppen", AtTheBreakfast)
                            .AddCalendarEntry(
                                "farewell",
                                "Abschied planen",
                                AtTheCoffee,
                                audiencePersonAliases: ["chris", "ilka"]
                            )
                            .AddCalendarSignUpList("cakes", "coffee", "Wer bringt was mit?")
                            .AddCalendarSignUpLine("chris-cake", "cakes", "chris", "Käsekuchen")
                            .AddCalendarSignUpLine("ilka-cake", "cakes", "ilka", "Brezeln")
                            .AddCalendarSignUpList("closed", "coffee", "Aufbau", closedAt: LastWeek)
                            .AddCalendarSignUpLine("dana-closed", "closed", "dana")
                            .AddCalendarSignUpList(
                                "deadline",
                                "coffee",
                                "Abbau",
                                signUpUntil: LastWeek
                            )
                            .AddCalendarSignUpList("late", "breakfast", "Weißwürste")
                            .AddCalendarSignUpList("secret", "farewell", "Geschenk")
                            .AddCalendarEntry(
                                "board-meeting",
                                "Vorstandstreffen",
                                AtTheCoffee,
                                audiencePersonAliases: ["chris"]
                            )
                            .AddCalendarSignUpList("board-helpers", "board-meeting", "Helfer")
                            .AddCalendarEntry(
                                "garde-meeting",
                                "Gardetreffen",
                                AtTheCoffee,
                                ownerGroupAlias: "tanzgarde"
                            )
                            .AddCalendarSignUpList("garde-helpers", "garde-meeting", "Helfer")
                    ),
            ct
        );
}
