using FastEndpoints;
using Furria.Api.Endpoints.News;
using Furria.Api.Tests.Media;
using Furria.Core.Groups;
using Furria.Core.Media;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.News;

public sealed class GetNewsMentionablesTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateOnly LongAgo = new(2020, 1, 1);
    private static readonly DateOnly Archived = new(2024, 6, 1);

    private readonly ApiTestFixture _fixture;

    public GetNewsMentionablesTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_OfferOnlyShownGroupsAndHoldersOfAPublicBoardSeat_When_TheWriterMentions()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Club(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (_, result) = await client.GETAsync<GetNewsMentionables, GetNewsMentionablesResponse>();

        Assert.Equal(["Männerballett", "Stadtgarde"], result.Groups.Select(group => group.Name));
        Assert.Equal(
            [("Paula", "Präsidentin")],
            result.Persons.Select(person => (person.FirstName, person.OfficeName))
        );
    }

    [Fact]
    public async Task Should_CarryWhatTheMentionCardShows_When_TheWriterMentions()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Club(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var paulaId = ctx.Identity.People.IdOf("paula");
        var portraitId = await PictureSteps.RenderedPortraitAsync(_fixture, client, paulaId, ct);

        var (_, result) = await client.GETAsync<GetNewsMentionables, GetNewsMentionablesResponse>();

        var garde = result.Groups.Single(group => group.Name == "Stadtgarde");
        Assert.Equal(GroupTone.Teal, garde.Tone);
        Assert.Equal("Unsere Tanzgarde", garde.Description);
        Assert.Null(garde.Picture);
        Assert.StartsWith(
            _fixture.SignedMediaUrl(portraitId, MediaOwner.Person(paulaId), MediaRendition.Small),
            result.Persons.Single().Portrait?.SmallUrl
        );
    }

    private static Action<SeedContextBuilder> Club() =>
        builder =>
            builder
                .Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Becker")
                        .AddPerson("kai", "Kai", "Kassierer")
                        .AddPerson("ex", "Erik", "Ehemals")
                )
                .Groups(groups =>
                    groups
                        .AddGroup("garde", "Stadtgarde", "Unsere Tanzgarde", tone: GroupTone.Teal)
                        .AddGroup("ballett", "Männerballett")
                        .AddGroup("alt", "Altherren", archivedOn: Archived)
                )
                .Club(club =>
                    club.AddBoardOffice("praesidentin", "Präsidentin", 1, isPublic: true)
                        .AddBoardOffice("kasse", "Kasse", 2)
                        .AddBoardSeat("paula-seat", "praesidentin", "paula", LongAgo)
                        .AddBoardSeat("kai-seat", "kasse", "kai", LongAgo)
                        .AddBoardSeat("ex-seat", "praesidentin", "ex", LongAgo, Archived)
                );
}
