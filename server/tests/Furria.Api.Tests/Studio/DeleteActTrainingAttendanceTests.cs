using System.Net;
using Furria.Core.Club;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.Studio.AttendanceSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class DeleteActTrainingAttendanceTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public DeleteActTrainingAttendanceTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public Task Should_RestoreHerOwnAnswer_When_TheMarkIsWithdrawn() =>
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

                var withdrawn = await WithdrawAttendanceAsync(admin, actId, trainingId, annaId);

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
            InTheRunningSession,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var ctx = await _fixture.BuildAsync(GardeWithTrainings(_fixture.Today), ct);
                var actId = await GardetanzAsync(ctx, ct);
                var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
                var kimId = ctx.Identity.People.IdOf(Kim);
                var trainingId = ctx.Club.CalendarEntries.IdOf(GardeTraining);
                await MarkAttendanceAsync(admin, actId, trainingId, kimId, AttendanceAnswer.No);

                var withdrawn = await WithdrawAttendanceAsync(admin, actId, trainingId, kimId);

                Assert.Equal(HttpStatusCode.NoContent, withdrawn.StatusCode);
                await ctx
                    .Expected.AttendanceResponsesFor(trainingId)
                    .ToCarryNoAnswerFrom(kimId)
                    .AssertAsync(ct);
            }
        );

    [Fact]
    public Task Should_KeepHerAnswer_When_SheAnsweredAfterTheMark() =>
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

                var withdrawn = await WithdrawAttendanceAsync(admin, actId, trainingId, annaId);

                Assert.Equal(HttpStatusCode.Conflict, withdrawn.StatusCode);
                await ctx
                    .Expected.AttendanceResponsesFor(trainingId)
                    .ToCarryAnswerFrom(annaId, AttendanceAnswer.Yes)
                    .AssertAsync(ct);
            }
        );

    [Fact]
    public Task Should_Refuse_When_TheWithdrawerDoesNotLeadTheActsGroup() =>
        _fixture.AtInstantAsync(
            InTheRunningSession,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var ctx = await _fixture.BuildAsync(GardeWithTrainings(_fixture.Today), ct);
                var actId = await GardetanzAsync(ctx, ct);
                var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
                var anna = await ctx.Identity.ClientForAsync(Anna, ct);
                var kimId = ctx.Identity.People.IdOf(Kim);
                var trainingId = ctx.Club.CalendarEntries.IdOf(GardeTraining);
                await MarkAttendanceAsync(admin, actId, trainingId, kimId, AttendanceAnswer.No);

                var withdrawn = await WithdrawAttendanceAsync(anna, actId, trainingId, kimId);

                Assert.Equal(HttpStatusCode.Forbidden, withdrawn.StatusCode);
            }
        );

    [Fact]
    public Task Should_FindNothing_When_NoAnswerIsRecorded() =>
        _fixture.AtInstantAsync(
            InTheRunningSession,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var ctx = await _fixture.BuildAsync(GardeWithTrainings(_fixture.Today), ct);
                var actId = await GardetanzAsync(ctx, ct);
                var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);

                var withdrawn = await WithdrawAttendanceAsync(
                    admin,
                    actId,
                    ctx.Club.CalendarEntries.IdOf(GardeTraining),
                    ctx.Identity.People.IdOf(Kim)
                );

                Assert.Equal(HttpStatusCode.NotFound, withdrawn.StatusCode);
            }
        );
}
