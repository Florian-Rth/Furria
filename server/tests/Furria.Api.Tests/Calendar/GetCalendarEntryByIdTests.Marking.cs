using System.Net;
using Furria.Api.Endpoints.Calendar;
using Furria.Core.Club;
using Furria.Tests.Common;
using Xunit;

namespace Furria.Api.Tests.Calendar;

[SeedsAliases]
public sealed partial class GetCalendarEntryByIdTests
{
    [Fact]
    public Task Should_ListHerGroupsMembersWithAnswerAndTrail_When_AGroupAdminReadsAComingTraining() =>
        _fixture.AtInstantAsync(
            MarkingSeeds.Now,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var ctx = await _fixture.BuildAsync(MarkingSeeds.GardeAndElferrat, ct);
                var gerd = await ctx.Identity.ClientForAsync(MarkingSeeds.Gerd, ct);
                var anna = await ctx.Identity.ClientForAsync(MarkingSeeds.Anna, ct);
                var trainingId = ctx.Club.CalendarEntries.IdOf(MarkingSeeds.GardeTraining);
                await MarkingSeeds.AnswerAsync(anna, trainingId, AttendanceAnswer.Yes);
                await MarkingSeeds.MarkAsync(
                    gerd,
                    trainingId,
                    ctx.Identity.People.IdOf(MarkingSeeds.Kim),
                    AttendanceAnswer.No
                );

                var (response, result) = await ReadAsync(ctx, MarkingSeeds.Gerd, trainingId, ct);

                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                Assert.Equal(
                    ["Anna Albers: Yes · Yes self", "Kim Klein: No · No by Gerd Gardist"],
                    MarkableLinesOf(result.Entry)
                );
            }
        );

    [Fact]
    public Task Should_ListOnlyTheMembersOfTheGroupsSheLeads_When_AnAudienceGroupsAdminReadsAJointTraining() =>
        _fixture.AtInstantAsync(
            MarkingSeeds.Now,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var ctx = await _fixture.BuildAsync(MarkingSeeds.GardeAndElferrat, ct);

                var (_, result) = await ReadAsync(
                    ctx,
                    MarkingSeeds.Erik,
                    ctx.Club.CalendarEntries.IdOf(MarkingSeeds.JointTraining),
                    ct
                );

                Assert.Equal(["Emil Ernst: – · "], MarkableLinesOf(result.Entry));
            }
        );

    [Theory]
    [InlineData(MarkingSeeds.Anna, MarkingSeeds.GardeTraining)]
    [InlineData(MarkingSeeds.Gerd, MarkingSeeds.PastTraining)]
    public Task Should_OfferNobodyToMark_When_TheReaderLeadsNoGroupOfAComingTraining(
        string readerAlias,
        string entryAlias
    ) =>
        _fixture.AtInstantAsync(
            MarkingSeeds.Now,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var ctx = await _fixture.BuildAsync(MarkingSeeds.GardeAndElferrat, ct);

                var (_, result) = await ReadAsync(
                    ctx,
                    readerAlias,
                    ctx.Club.CalendarEntries.IdOf(entryAlias),
                    ct
                );

                Assert.NotNull(result.Entry.Attendance);
                Assert.Null(result.Entry.Attendance.Markable);
            }
        );

    private static IEnumerable<string> MarkableLinesOf(CalendarEntryDto entry) =>
        (entry.Attendance?.Markable ?? []).Select(person =>
            $"{person.FirstName} {person.LastName}: {person.Answer?.ToString() ?? "–"} · "
            + string.Join(
                ", ",
                person.Trail.Select(change =>
                    change.IsRecordedOnBehalf
                        ? $"{change.Answer} by {change.RecordedByFirstName} {change.RecordedByLastName}"
                        : $"{change.Answer} self"
                )
            )
        );
}
