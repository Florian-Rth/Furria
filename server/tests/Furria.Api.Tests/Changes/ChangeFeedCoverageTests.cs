using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Changes;

public sealed class ChangeFeedCoverageTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public ChangeFeedCoverageTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public void Should_NameTheChangesOfEveryTable_When_TheModelIsRead()
    {
        Assert.Empty(_fixture.ChangedTablesDisagreements());
    }

    [Fact]
    public async Task Should_NotifyExactlyTheTablesThatNameChanges_When_TheSchemaIsMigrated()
    {
        var ct = TestContext.Current.CancellationToken;

        var disagreements = await _fixture.ChangeNotificationDisagreementsAsync(ct);

        Assert.True(
            disagreements.Count == 0,
            string.Join("; ", disagreements)
                + ". A table that names changes in ChangedTables gets "
                + "migrationBuilder.NotifyChangesOf(\"<table>\") in the migration that creates it; "
                + "a table declared unrelated gets no trigger."
        );
    }
}
