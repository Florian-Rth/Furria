using System.Net;
using Furria.Core.Club;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Calendar.MarkingSeeds;

namespace Furria.Api.Tests.Calendar;

[SeedsAliases]
public sealed class PutCalendarAttendanceTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutCalendarAttendanceTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public Task Should_StoreTheMarkAsHerAnswerNamingTheMarker_When_TheGroupAdminMarksAKidWithoutAccount() =>
        _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var ctx = await _fixture.BuildAsync(GardeAndElferrat, ct);
                var gerd = await ctx.Identity.ClientForAsync(Gerd, ct);
                var trainingId = ctx.Club.CalendarEntries.IdOf(GardeTraining);
                var kimId = ctx.Identity.People.IdOf(Kim);

                var response = await MarkAsync(gerd, trainingId, kimId, AttendanceAnswer.No);

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
                await ctx
                    .Expected.AttendanceResponsesFor(trainingId)
                    .ToCarryMarkFrom(kimId, AttendanceAnswer.No, ctx.Identity.People.IdOf(Gerd))
                    .AssertAsync(ct);
            }
        );

    [Fact]
    public Task Should_ReplaceHerAnswerKeepingTheTrail_When_TheGroupAdminMarksHerAfterwards() =>
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

                await ctx
                    .Expected.AttendanceResponsesFor(trainingId)
                    .ToCarryMarkFrom(annaId, AttendanceAnswer.No, ctx.Identity.People.IdOf(Gerd))
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
    public Task Should_LetHerOwnAnswerReplaceTheMark_When_SheAnswersAfterBeingMarked() =>
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
    public Task Should_LetTheAudienceGroupsAdminMarkHerMember_When_AnotherGroupOwnsTheTraining() =>
        _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var ctx = await _fixture.BuildAsync(GardeAndElferrat, ct);
                var erik = await ctx.Identity.ClientForAsync(Erik, ct);
                var trainingId = ctx.Club.CalendarEntries.IdOf(JointTraining);
                var emilId = ctx.Identity.People.IdOf(Emil);

                var response = await MarkAsync(erik, trainingId, emilId, AttendanceAnswer.Yes);

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
                await ctx
                    .Expected.AttendanceResponsesFor(trainingId)
                    .ToCarryMarkFrom(emilId, AttendanceAnswer.Yes, ctx.Identity.People.IdOf(Erik))
                    .AssertAsync(ct);
            }
        );

    [Fact]
    public Task Should_Refuse_When_TheMarkerLeadsNoneOfTheTrainingsGroups() =>
        _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var ctx = await _fixture.BuildAsync(GardeAndElferrat, ct);
                var anna = await ctx.Identity.ClientForAsync(Anna, ct);
                var trainingId = ctx.Club.CalendarEntries.IdOf(GardeTraining);
                var kimId = ctx.Identity.People.IdOf(Kim);

                var response = await MarkAsync(anna, trainingId, kimId, AttendanceAnswer.No);

                Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
                await ctx
                    .Expected.AttendanceResponsesFor(trainingId)
                    .ToCarryNoAnswerFrom(kimId)
                    .AssertAsync(ct);
            }
        );

    [Fact]
    public Task Should_Refuse_When_ThePersonIsInNoGroupTheMarkerLeadsForTheTraining() =>
        _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var ctx = await _fixture.BuildAsync(GardeAndElferrat, ct);
                var erik = await ctx.Identity.ClientForAsync(Erik, ct);
                var trainingId = ctx.Club.CalendarEntries.IdOf(JointTraining);
                var kimId = ctx.Identity.People.IdOf(Kim);

                var response = await MarkAsync(erik, trainingId, kimId, AttendanceAnswer.No);

                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        );

    [Theory]
    [InlineData(SilentTraining)]
    [InlineData(PastTraining)]
    [InlineData(GardeMeeting)]
    public Task Should_Refuse_When_TheEntryIsNoComingTrainingAskingForAnswers(string entryAlias) =>
        _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var ctx = await _fixture.BuildAsync(GardeAndElferrat, ct);
                var gerd = await ctx.Identity.ClientForAsync(Gerd, ct);
                var entryId = ctx.Club.CalendarEntries.IdOf(entryAlias);
                var kimId = ctx.Identity.People.IdOf(Kim);

                var response = await MarkAsync(gerd, entryId, kimId, AttendanceAnswer.No);

                Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
                await ctx
                    .Expected.AttendanceResponsesFor(entryId)
                    .ToCarryNoAnswerFrom(kimId)
                    .AssertAsync(ct);
            }
        );

    [Fact]
    public Task Should_RejectTheMark_When_ItIsMaybe() =>
        _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var ctx = await _fixture.BuildAsync(GardeAndElferrat, ct);
                var gerd = await ctx.Identity.ClientForAsync(Gerd, ct);

                var response = await MarkAsync(
                    gerd,
                    ctx.Club.CalendarEntries.IdOf(GardeTraining),
                    ctx.Identity.People.IdOf(Kim),
                    AttendanceAnswer.Maybe
                );

                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            }
        );
}
