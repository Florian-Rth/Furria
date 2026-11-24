using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Board;
using Furria.Api.Tests.Authorization;
using Furria.Application.Authorization;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Board;

public sealed class RestoreBoardOfficeTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateOnly Elected2016 = new(2016, 11, 11);
    private static readonly DateOnly HandedOver2020 = new(2020, 11, 10);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);
    private static readonly DateOnly Elected2026 = new(2026, 1, 15);

    private readonly ApiTestFixture _fixture;

    public RestoreBoardOfficeTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<HttpResponseMessage> RestoreOfficeAsync(
        HttpClient client,
        int boardOfficeId
    ) =>
        client.POSTAsync<RestoreBoardOffice, RestoreBoardOfficeRequest>(
            new RestoreBoardOfficeRequest { BoardOfficeId = boardOfficeId }
        );

    [Fact]
    public async Task Should_LiftTheArchiveOfEveryoneWhoseSeatRunsAgain_When_TheOfficeIsRestored()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddArchive("paula", ArchivedIn2021)
                            .AddPerson("anna", "Anna", "Vogt")
                            .AddArchive("anna", ArchivedIn2021)
                    )
                    .Club(club =>
                        club.AddBoardOffice("archivar", "Archivar", archivedOn: ArchivedIn2021)
                            .AddBoardSeat("paula-archivar", "archivar", "paula", Elected2016)
                            .AddBoardSeat(
                                "anna-archivar",
                                "archivar",
                                "anna",
                                Elected2016,
                                HandedOver2020
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await RestoreOfficeAsync(client, ctx.Club.BoardOffices.IdOf("archivar"));

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("paula"))
            .ToNotBeArchived()
            .Person(ctx.Identity.People.IdOf("anna"))
            .ToBeArchived(ArchivedIn2021, null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_HandTheImpliedPermissionsBack_When_TheOfficeIsFilledAgain()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("nadine"))
                    .Roles(roles =>
                        roles.AddRole(
                            "personenpflege",
                            "Personenpflege",
                            FurriaPermissions.PersonsManage
                        )
                    )
                    .Club(club =>
                        club.AddBoardOffice(
                            "praesident",
                            "Präsident",
                            1,
                            "personenpflege",
                            ArchivedIn2021
                        )
                    ),
            ct
        );

        var admin = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await RestoreOfficeAsync(admin, ctx.Club.BoardOffices.IdOf("praesident"));
        var (seated, _) = await admin.POSTAsync<
            PostBoardSeat,
            PostBoardSeatRequest,
            PostBoardSeatResponse
        >(
            new PostBoardSeatRequest
            {
                BoardOfficeId = ctx.Club.BoardOffices.IdOf("praesident"),
                PersonId = ctx.Identity.People.IdOf("nadine"),
                SinceOn = Elected2026,
            }
        );

        var nadine = await ctx.Identity.ClientForAsync("nadine", ct);
        var (probe, _) = await nadine.GETAsync<PermissionProbe, EmptyResponse>();

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal(HttpStatusCode.OK, seated.StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, probe.StatusCode);
        await ctx
            .Expected.BoardOffice(ctx.Club.BoardOffices.IdOf("praesident"))
            .ToImplyRole(ctx.Roles.Roles.IdOf("personenpflege"))
            .AssertAsync(ct);
    }
}
