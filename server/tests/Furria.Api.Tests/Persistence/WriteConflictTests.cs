using Furria.Application.Results;
using Furria.Infrastructure.Persistence;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Persistence;

public sealed class WriteConflictTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public WriteConflictTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_AnswerConflict_When_ASecondOpenGroupMembershipLosesTheRace()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("mara", "Mara", "Lenz"))
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership("mara-tanzgarde", "tanzgarde", "mara")
                    ),
            ct
        );

        var result = await _fixture.SaveSecondOpenGroupMembershipAsync(
            ctx.Groups.Groups.IdOf("tanzgarde"),
            ctx.Identity.People.IdOf("mara"),
            ct
        );

        Assert.False(result.IsSuccess);
        Assert.Equal(ResultErrorKind.Conflict, result.Error.Kind);
        Assert.Equal(WriteConflictMessages.OpenGroupMembership, result.Error.Message);
    }

    [Fact]
    public async Task Should_AnswerConflict_When_ASecondActiveGroupLosesTheRaceForTheName()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(
            builder => builder.Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde")),
            ct
        );

        var result = await _fixture.SaveSecondActiveGroupAsync("tanzgarde", ct);

        Assert.False(result.IsSuccess);
        Assert.Equal(ResultErrorKind.Conflict, result.Error.Kind);
        Assert.Equal(WriteConflictMessages.DuplicateGroupName, result.Error.Message);
    }
}
