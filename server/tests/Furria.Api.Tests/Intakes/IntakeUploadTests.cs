using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Intakes;
using Furria.Core.Media;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Intakes.IntakeScene;
using static Furria.Api.Tests.Intakes.IntakeSubmissions;

namespace Furria.Api.Tests.Intakes;

public sealed class IntakeUploadTests : IClassFixture<ApiTestFixture>
{
    private const string UnknownToken = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

    private readonly ApiTestFixture _fixture;

    public IntakeUploadTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RefuseTheUpload_When_TheTokenIsNotOneTheClubHandedOut()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(With(), ct);

        var response = await IntakePortraits.CreateAsync(
            _fixture.CreateClient(),
            UnknownToken,
            IntakePortraits.ChunkLength,
            ct
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_MakeItHerPortrait_When_SheIsEnteredOnSubmit()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            With(intakes => intakes.AddIntake("fresh", Manager, _fixture.Today)),
            ct
        );
        var intakeId = ctx.Intakes.Intakes.IdOf("fresh");
        var client = _fixture.CreateClient();
        var token = ctx.Intakes.LinkTokens.IdOf("fresh");
        await IntakePortraits.UploadedAsync(client, token, ct);
        var portraitId = Assert.Single(await IntakePortraits.HeldByAsync(_fixture, intakeId, ct));

        await client.POSTAsync<SubmitIntake, SubmitIntakeRequest, SubmitIntakeResponse>(
            Adult(token)
        );

        var personId = await MadePersonIdAsync(_fixture, intakeId, ct);
        await ctx
            .Expected.MediaItem(portraitId)
            .ToBeOwnedBy(MediaOwner.Person(personId))
            .MediaItem(portraitId)
            .ToBeThePortraitOf(personId)
            .AssertAsync(ct);
    }
}
