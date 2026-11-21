using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Intakes;
using Furria.Api.Tests.Media;
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
    public async Task Should_HoldThePortraitOnTheIntake_When_TheNewcomerUploadsItThroughHerLink()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            With(intakes => intakes.AddIntake("fresh", Manager, _fixture.Today)),
            ct
        );
        var intakeId = ctx.Intakes.Intakes.IdOf("fresh");

        var status = await IntakePortraits.UploadAsync(
            _fixture.CreateClient(),
            ctx.Intakes.LinkTokens.IdOf("fresh"),
            MediaSamples.Jpeg(IntakePortraits.ChunkLength),
            ct,
            crop: "0.1,0.1,0.5,0.625"
        );

        Assert.Equal(HttpStatusCode.NoContent, status);
        var portraitId = Assert.Single(await IntakePortraits.HeldByAsync(_fixture, intakeId, ct));
        await ctx
            .Expected.MediaItem(portraitId)
            .ToBeOwnedBy(MediaOwner.Intake(intakeId))
            .MediaItem(portraitId)
            .ToBeCroppedTo(new PictureCrop(0.1, 0.1, 0.5, 0.625))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepOnlyTheLatestPortrait_When_SheUploadsAnotherOne()
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
        var first = Assert.Single(await IntakePortraits.HeldByAsync(_fixture, intakeId, ct));

        await IntakePortraits.UploadedAsync(client, token, ct);

        var latest = Assert.Single(await IntakePortraits.HeldByAsync(_fixture, intakeId, ct));
        Assert.NotEqual(first, latest);
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
    public async Task Should_RefuseTheUpload_When_TheLinkHasExpired()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            With(intakes =>
                intakes.AddIntake(
                    "expired",
                    Manager,
                    _fixture.Today,
                    expiresAt: _fixture.TimeProvider.GetUtcNow().AddSeconds(-1)
                )
            ),
            ct
        );

        var response = await IntakePortraits.CreateAsync(
            _fixture.CreateClient(),
            ctx.Intakes.LinkTokens.IdOf("expired"),
            IntakePortraits.ChunkLength,
            ct
        );

        Assert.Equal(HttpStatusCode.Gone, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseAVideo_When_SheUploadsOneAsHerPortrait()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            With(intakes => intakes.AddIntake("fresh", Manager, _fixture.Today)),
            ct
        );

        var status = await IntakePortraits.UploadAsync(
            _fixture.CreateClient(),
            ctx.Intakes.LinkTokens.IdOf("fresh"),
            MediaSamples.Mp4(IntakePortraits.ChunkLength),
            ct
        );

        Assert.Equal(HttpStatusCode.UnsupportedMediaType, status);
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

    [Fact]
    public async Task Should_DropThePortrait_When_TheIntakeIsDiscarded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            With(intakes => intakes.AddIntake("fresh", Manager, _fixture.Today)),
            ct
        );
        var intakeId = ctx.Intakes.Intakes.IdOf("fresh");
        await IntakePortraits.UploadedAsync(
            _fixture.CreateClient(),
            ctx.Intakes.LinkTokens.IdOf("fresh"),
            ct
        );
        var portraitId = Assert.Single(await IntakePortraits.HeldByAsync(_fixture, intakeId, ct));
        var manager = await ctx.Identity.ClientForAsync(Manager, ct);

        await manager.POSTAsync<DiscardIntake, DiscardIntakeRequest>(new() { IntakeId = intakeId });

        await ctx.Expected.MediaItem(portraitId).ToBeGone().AssertAsync(ct);
    }
}
