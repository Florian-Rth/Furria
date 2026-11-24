using FastEndpoints;
using Furria.Api.Endpoints.Push;
using Furria.Core.Push;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Push;

public sealed class PutMyPushTopicTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);

    private readonly ApiTestFixture _fixture;

    public PutMyPushTopicTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_LeaveOtherAccountsUntouched_When_AMemberMutesATopic()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(ct);
        var alice = await ctx.Identity.ClientForAsync("alice", ct);
        var bob = await ctx.Identity.ClientForAsync("bob", ct);

        await SwitchAsync(alice, PushTopic.Invitations, isEnabled: false);

        Assert.All(await TopicsOfAsync(bob), setting => Assert.True(setting.IsEnabled));
    }

    private static Task<HttpResponseMessage> SwitchAsync(
        HttpClient client,
        PushTopic topic,
        bool isEnabled
    ) =>
        client.PUTAsync<PutMyPushTopic, PutMyPushTopicRequest>(
            new PutMyPushTopicRequest { Topic = topic, IsEnabled = isEnabled }
        );

    private static async Task<IReadOnlyList<PushTopicSettingDto>> TopicsOfAsync(HttpClient client)
    {
        var (_, result) = await client.GETAsync<GetMyPushTopics, GetMyPushTopicsResponse>();

        return result.Topics;
    }

    private Task<SeededContext> BuildAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("alice", "Alice", "Ahrens")
                        .AddAccount("alice")
                        .AddMembership("alice-first", "alice", JoinedIn2017)
                        .AddPerson("bob", "Bob", "Brandt")
                        .AddAccount("bob")
                        .AddMembership("bob-first", "bob", JoinedIn2017)
                ),
            ct
        );
}
