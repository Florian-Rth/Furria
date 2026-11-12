using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Calendar;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Calendar;

public sealed class DeleteCalendarSignUpLineByIdTests : IClassFixture<ApiTestFixture>
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

    public DeleteCalendarSignUpLineByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Theory]
    [InlineData("cakes", "chris-cake")]
    [InlineData("closed", "dana-closed")]
    public async Task Should_RemoveTheLine_When_AnEditorRemovesIt(
        string listAlias,
        string lineAlias
    )
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var listId = ctx.Club.SignUpLists.IdOf(listAlias);

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var response = await RemoveAsync(ctx, "ilka", lineAlias, ct);

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
            }
        );

        await ctx
            .Expected.SignUpList(listId)
            .ToHaveLines([
                .. listAlias == "cakes"
                    ? [(ctx.Identity.People.IdOf("ilka"), (string?)"Brezeln")]
                    : Array.Empty<(int, string?)>(),
            ])
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerMayNotEditTheEntry()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var listId = ctx.Club.SignUpLists.IdOf("cakes");

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var response = await RemoveAsync(ctx, "dana", "chris-cake", ct);

                Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
            }
        );

        await ctx
            .Expected.SignUpList(listId)
            .ToHaveLines(
                (ctx.Identity.People.IdOf("chris"), "Käsekuchen"),
                (ctx.Identity.People.IdOf("ilka"), "Brezeln")
            )
            .AssertAsync(ct);
    }

    private static async Task<HttpResponseMessage> RemoveAsync(
        SeededContext ctx,
        string callerAlias,
        string lineAlias,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync(callerAlias, ct);

        return await client.DELETEAsync<
            DeleteCalendarSignUpLineById,
            DeleteCalendarSignUpLineByIdRequest
        >(
            new DeleteCalendarSignUpLineByIdRequest
            {
                LineId = ctx.Club.SignUpLines.IdOf(lineAlias),
            }
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
                    ),
            ct
        );
}
