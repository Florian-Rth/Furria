using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Persons;
using Furria.Api.Tests.Media;
using Furria.Application.Authorization;
using Furria.Core.Media;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Persons;

public sealed class DeletePortraitTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public DeletePortraitTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_TakeThePortraitAndItsFilesAway_When_SheWithdrawsIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );
        var aliceId = ctx.Identity.People.IdOf("alice");
        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var portraitId = await PictureSteps.RenderedPortraitAsync(_fixture, client, aliceId, ct);
        var original = await _fixture.MediaFileOfAsync(portraitId, MediaRendition.Original, ct);

        var response = await client.DELETEAsync<DeletePortrait, DeletePortraitRequest>(
            new() { PersonId = aliceId }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx.Expected.MediaItem(portraitId).ToBeGone().AssertAsync(ct);
        Assert.False(File.Exists(original));
    }

    [Fact]
    public async Task Should_TakeAnotherPersonsPortraitAway_When_TheCallerManagesPersons()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("vera").AddAccount("bernd"))
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "mitglieder",
                            "vera-mitglieder",
                            "Mitgliederverwaltung",
                            "vera",
                            FurriaPermissions.PersonsManage
                        )
                    ),
            ct
        );
        var berndId = ctx.Identity.People.IdOf("bernd");
        var portraitId = await PictureSteps.RenderedPortraitAsync(
            _fixture,
            await ctx.Identity.ClientForAsync("bernd", ct),
            berndId,
            ct
        );
        var client = await ctx.Identity.ClientForAsync("vera", ct);

        var response = await client.DELETEAsync<DeletePortrait, DeletePortraitRequest>(
            new() { PersonId = berndId }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx.Expected.MediaItem(portraitId).ToBeGone().AssertAsync(ct);
    }
}
