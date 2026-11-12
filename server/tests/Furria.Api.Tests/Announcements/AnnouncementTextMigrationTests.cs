using Furria.Core.Club;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Announcements;

public sealed class AnnouncementTextMigrationTests : IClassFixture<ApiTestFixture>
{
    private const string BeforeMentions = "20261111193840_GroupMatcherPoolOnly";

    private const string PlainBody =
        "# Saalputz\n"
        + "  eingerückt\r\n"
        + "\u00a0geschützt eingerückt\n"
        + "- Eimer *und* Lappen [mitbringen]\n"
        + "> Zitat <b>fett</b>\n"
        + "1. Punkt\n"
        + "___\n"
        + "_-_\n"
        + "===\n"
        + "~~~ Zaun\u2028# Neue Zeile\n"
        + "`Code` und C:\\Saal und @[Bea](person:1)";

    private const string EscapedBody =
        "\\# Saalputz\n"
        + "eingerückt\n"
        + "geschützt eingerückt\n"
        + "\\- Eimer \\*und\\* Lappen \\[mitbringen\\]\n"
        + "\\> Zitat \\<b>fett\\</b>\n"
        + "1\\. Punkt\n"
        + "\\___\n"
        + "\\_-_\n"
        + "\\===\n"
        + "\\~~~ Zaun\n"
        + "\\# Neue Zeile\n"
        + "\\`Code\\` und C:\\\\Saal und @\\[Bea\\](person:1)";

    private readonly ApiTestFixture _fixture;

    public AnnouncementTextMigrationTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_EscapeEveryMarkupLookalike_When_APlainBodyMovesIntoTheSubset()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(WithPlainAnnouncement, ct);
        await _fixture.MigrateDatabaseToAsync(BeforeMentions, ct);

        await _fixture.RunDatabaseMigratorAsync(ct);

        await ctx
            .Expected.Announcement(ctx.Club.Announcements.IdOf("putz"))
            .ToHaveBody(EscapedBody)
            .AssertAsync(ct);
        Assert.Null(AnnouncementText.Read(EscapedBody).Refusal);
        Assert.Empty(AnnouncementText.Read(EscapedBody).Mentions);
    }

    private static void WithPlainAnnouncement(SeedContextBuilder builder) =>
        builder
            .Identity(identity => identity.AddPerson("alice", "Alice", "Muster"))
            .Club(club => club.AddAnnouncement("putz", "alice", "Saalputz", PlainBody));
}
