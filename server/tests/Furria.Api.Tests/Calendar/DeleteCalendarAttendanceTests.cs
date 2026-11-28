using System.Net;
using Furria.Core.Club;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Calendar.MarkingSeeds;

namespace Furria.Api.Tests.Calendar;

[SeedsAliases]
public sealed class DeleteCalendarAttendanceTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public DeleteCalendarAttendanceTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public Task Should_RestoreHerOwnAnswer_When_TheMarkIsWithdrawn() =>
        _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var ctx = await _fixture.BuildAsync(GardeAndElferrat, ct);
                var gerd = await ctx.Identity.ClientForAsync(Gerd, ct);
                var anna = await ctx.Identity.ClientForAsync(Anna, ct);
                var trainingId = ctx.Club.CalendarEntries.IdOf(GardeTraining);
                var annaId = ctx.Identity.People.IdOf(Anna);
                await AnswerAsync(anna, trainingId, AttendanceAnswer.Yes);
                await MarkAsync(gerd, trainingId, annaId, AttendanceAnswer.No);

                var withdrawn = await WithdrawMarkAsync(gerd, trainingId, annaId);

                Assert.Equal(HttpStatusCode.NoContent, withdrawn.StatusCode);
                await ctx
                    .Expected.AttendanceResponsesFor(trainingId)
                    .ToCarryAnswerFrom(annaId, AttendanceAnswer.Yes)
                    .AttendanceResponsesFor(trainingId)
                    .ToCarryTrailFrom(annaId, (AttendanceAnswer.Yes, false))
                    .AssertAsync(ct);
            }
        );

    [Fact]
    public Task Should_LeaveNoAnswer_When_TheOnlyMarkIsWithdrawn() =>
        _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var ctx = await _fixture.BuildAsync(GardeAndElferrat, ct);
                var gerd = await ctx.Identity.ClientForAsync(Gerd, ct);
                var trainingId = ctx.Club.CalendarEntries.IdOf(GardeTraining);
                var kimId = ctx.Identity.People.IdOf(Kim);
                await MarkAsync(gerd, trainingId, kimId, AttendanceAnswer.No);

                var withdrawn = await WithdrawMarkAsync(gerd, trainingId, kimId);

                Assert.Equal(HttpStatusCode.NoContent, withdrawn.StatusCode);
                await ctx
                    .Expected.AttendanceResponsesFor(trainingId)
                    .ToCarryNoAnswerFrom(kimId)
                    .AttendanceResponsesFor(trainingId)
                    .ToCarryTrailFrom(kimId)
                    .AssertAsync(ct);
            }
        );

    [Fact]
    public Task Should_KeepHerAnswer_When_SheAnsweredAfterTheMark() =>
        _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var ctx = await _fixture.BuildAsync(GardeAndElferrat, ct);
                var gerd = await ctx.Identity.ClientForAsync(Gerd, ct);
                var anna = await ctx.Identity.ClientForAsync(Anna, ct);
                var trainingId = ctx.Club.CalendarEntries.IdOf(GardeTraining);
                var annaId = ctx.Identity.People.IdOf(Anna);
                await MarkAsync(gerd, trainingId, annaId, AttendanceAnswer.No);
                await AnswerAsync(anna, trainingId, AttendanceAnswer.Yes);

                var withdrawn = await WithdrawMarkAsync(gerd, trainingId, annaId);

                Assert.Equal(HttpStatusCode.Conflict, withdrawn.StatusCode);
                await ctx
                    .Expected.AttendanceResponsesFor(trainingId)
                    .ToCarryAnswerFrom(annaId, AttendanceAnswer.Yes)
                    .AssertAsync(ct);
            }
        );

    [Fact]
    public Task Should_Refuse_When_TheWithdrawerLeadsNoneOfTheTrainingsGroups() =>
        _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var ctx = await _fixture.BuildAsync(GardeAndElferrat, ct);
                var gerd = await ctx.Identity.ClientForAsync(Gerd, ct);
                var erik = await ctx.Identity.ClientForAsync(Erik, ct);
                var trainingId = ctx.Club.CalendarEntries.IdOf(GardeTraining);
                var kimId = ctx.Identity.People.IdOf(Kim);
                await MarkAsync(gerd, trainingId, kimId, AttendanceAnswer.No);

                var withdrawn = await WithdrawMarkAsync(erik, trainingId, kimId);

                Assert.Equal(HttpStatusCode.Forbidden, withdrawn.StatusCode);
                await ctx
                    .Expected.AttendanceResponsesFor(trainingId)
                    .ToCarryMarkFrom(kimId, AttendanceAnswer.No, ctx.Identity.People.IdOf(Gerd))
                    .AssertAsync(ct);
            }
        );
}
