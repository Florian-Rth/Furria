using System.Net;
using Furria.Api.Endpoints.Acts;
using Furria.Core.Club;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.Studio.AttendanceSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class PutActTrainingAttendanceTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutActTrainingAttendanceTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public Task Should_OpenTheSpotAndNameWhoMarkedIt_When_TheGroupAdminMarksAKidAbsent() =>
        _fixture.AtInstantAsync(
            InTheRunningSession,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var ctx = await _fixture.BuildAsync(GardeWithTrainings(_fixture.Today), ct);
                var actId = await GardetanzAsync(ctx, ct);
                var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
                var kimId = ctx.Identity.People.IdOf(Kim);
                var trainingId = ctx.Club.CalendarEntries.IdOf(GardeTraining);
                var kimsSpot = await AddSpotAsync(admin, actId);
                await AssignSpotAsync(admin, actId, kimsSpot, kimId);

                var response = await MarkAttendanceAsync(
                    admin,
                    actId,
                    trainingId,
                    kimId,
                    AttendanceAnswer.No
                );

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
                var studio = await StudioOfAsync(admin, actId);
                Assert.NotNull(studio.Studio);
                var training = Assert.Single(
                    studio.Studio.Trainings,
                    candidate => candidate.CalendarEntryId == trainingId
                );
                var marked = Assert.Single(training.Responses);
                Assert.Equal(
                    ($"{kimsSpot}", kimId, AttendanceAnswer.No, true, "Gerd Gardist"),
                    (
                        string.Join(",", training.OpenSpotIds),
                        marked.PersonId,
                        marked.Answer,
                        marked.IsRecordedOnBehalf,
                        marked.RecordedBy
                    )
                );
            }
        );

    [Fact]
    public Task Should_ReplaceTheMarkAndKeepBothInTheTrail_When_SheAnswersHerself() =>
        _fixture.AtInstantAsync(
            InTheRunningSession,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var ctx = await _fixture.BuildAsync(GardeWithTrainings(_fixture.Today), ct);
                var actId = await GardetanzAsync(ctx, ct);
                var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
                var anna = await ctx.Identity.ClientForAsync(Anna, ct);
                var annaId = ctx.Identity.People.IdOf(Anna);
                var trainingId = ctx.Club.CalendarEntries.IdOf(GardeTraining);
                await MarkAttendanceAsync(admin, actId, trainingId, annaId, AttendanceAnswer.No);

                await AnswerAsync(anna, trainingId, AttendanceAnswer.Yes);

                await ctx
                    .Expected.AttendanceResponsesFor(trainingId)
                    .ToCarryAnswerFrom(annaId, AttendanceAnswer.Yes)
                    .AttendanceResponsesFor(trainingId)
                    .ToCarryTrailFrom(
                        annaId,
                        (AttendanceAnswer.Yes, false),
                        (AttendanceAnswer.No, true)
                    )
                    .AssertAsync(ct);
            }
        );

    [Fact]
    public Task Should_ReplaceHerAnswer_When_TheGroupAdminMarksHerAfterwards() =>
        _fixture.AtInstantAsync(
            InTheRunningSession,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var ctx = await _fixture.BuildAsync(GardeWithTrainings(_fixture.Today), ct);
                var actId = await GardetanzAsync(ctx, ct);
                var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
                var anna = await ctx.Identity.ClientForAsync(Anna, ct);
                var annaId = ctx.Identity.People.IdOf(Anna);
                var trainingId = ctx.Club.CalendarEntries.IdOf(GardeTraining);
                await AnswerAsync(anna, trainingId, AttendanceAnswer.Yes);

                await MarkAttendanceAsync(admin, actId, trainingId, annaId, AttendanceAnswer.No);

                await ctx
                    .Expected.AttendanceResponsesFor(trainingId)
                    .ToCarryMarkFrom(
                        annaId,
                        AttendanceAnswer.No,
                        ctx.Identity.People.IdOf(GardeAdmin)
                    )
                    .AttendanceResponsesFor(trainingId)
                    .ToCarryTrailFrom(
                        annaId,
                        (AttendanceAnswer.No, true),
                        (AttendanceAnswer.Yes, false)
                    )
                    .AssertAsync(ct);
            }
        );

    [Fact]
    public Task Should_Refuse_When_TheMarkerDoesNotLeadTheActsGroup() =>
        _fixture.AtInstantAsync(
            InTheRunningSession,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var ctx = await _fixture.BuildAsync(GardeWithTrainings(_fixture.Today), ct);
                var actId = await GardetanzAsync(ctx, ct);
                var anna = await ctx.Identity.ClientForAsync(Anna, ct);

                var response = await MarkAttendanceAsync(
                    anna,
                    actId,
                    ctx.Club.CalendarEntries.IdOf(GardeTraining),
                    ctx.Identity.People.IdOf(Ben),
                    AttendanceAnswer.No
                );

                Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
            }
        );

    [Fact]
    public Task Should_Refuse_When_ThePersonIsNotInTheCast() =>
        _fixture.AtInstantAsync(
            InTheRunningSession,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var ctx = await _fixture.BuildAsync(GardeWithTrainings(_fixture.Today), ct);
                var actId = await GardetanzAsync(ctx, ct);
                var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);

                var response = await MarkAttendanceAsync(
                    admin,
                    actId,
                    ctx.Club.CalendarEntries.IdOf(GardeTraining),
                    ctx.Identity.People.IdOf(Clara),
                    AttendanceAnswer.No
                );

                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        );

    [Fact]
    public Task Should_Refuse_When_TheEntryIsNoTrainingOfTheActsGroup() =>
        _fixture.AtInstantAsync(
            InTheRunningSession,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var ctx = await _fixture.BuildAsync(GardeWithTrainings(_fixture.Today), ct);
                var actId = await GardetanzAsync(ctx, ct);
                var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);

                var response = await MarkAttendanceAsync(
                    admin,
                    actId,
                    ctx.Club.CalendarEntries.IdOf(ElferratTraining),
                    ctx.Identity.People.IdOf(Anna),
                    AttendanceAnswer.No
                );

                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        );

    [Fact]
    public Task Should_RefuseMaybe_When_TheGroupAdminMarks() =>
        _fixture.AtInstantAsync(
            InTheRunningSession,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var ctx = await _fixture.BuildAsync(GardeWithTrainings(_fixture.Today), ct);
                var actId = await GardetanzAsync(ctx, ct);
                var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);

                var response = await MarkAttendanceAsync(
                    admin,
                    actId,
                    ctx.Club.CalendarEntries.IdOf(GardeTraining),
                    ctx.Identity.People.IdOf(Anna),
                    AttendanceAnswer.Maybe
                );

                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            }
        );
}
