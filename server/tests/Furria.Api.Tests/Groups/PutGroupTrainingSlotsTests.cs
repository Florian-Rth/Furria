using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Application.Authorization;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Groups;

[Collection("Api")]
public sealed class PutGroupTrainingSlotsTests
{
    private const string ConflictField = "conflict";
    private const int UnknownGroupId = 999_999;
    private const int UnknownVenueId = 999_999;
    private const int TrainingMinutes = 90;

    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);
    private static readonly TimeOnly HalfPastSeven = new(19, 30);
    private static readonly TimeOnly SixInTheEvening = new(18, 0);

    private readonly ApiTestFixture _fixture;

    public PutGroupTrainingSlotsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_WriteTheRhythm_When_TheGroupAdminStatesTwoSlots()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity.AddPerson("anna", "Anna", "Kaiser").AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                    )
                    .Club(club => club.AddVenue("sporthalle", "Sporthalle")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var response = await client.PUTAsync<PutGroupTrainingSlots, PutGroupTrainingSlotsRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                Slots =
                [
                    new()
                    {
                        Weekday = DayOfWeek.Tuesday,
                        StartsAt = HalfPastSeven,
                        DurationMinutes = TrainingMinutes,
                        VenueId = ctx.Club.Venues.IdOf("sporthalle"),
                    },
                    new()
                    {
                        Weekday = DayOfWeek.Thursday,
                        StartsAt = SixInTheEvening,
                        DurationMinutes = TrainingMinutes,
                        VenueId = null,
                    },
                ],
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.TrainingSlotsOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveCount(2)
            .TrainingSlotsOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToCarrySlot(
                DayOfWeek.Tuesday,
                HalfPastSeven,
                TrainingMinutes,
                ctx.Club.Venues.IdOf("sporthalle")
            )
            .TrainingSlotsOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToCarrySlot(DayOfWeek.Thursday, SixInTheEvening, TrainingMinutes, null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReplaceTheWholeList_When_TheGroupAdminSavesAgain()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity.AddPerson("anna", "Anna", "Kaiser").AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                    )
                    .Club(club =>
                        club.AddVenue("sporthalle", "Sporthalle")
                            .AddTrainingSlot(
                                "montags",
                                "tanzgarde",
                                DayOfWeek.Monday,
                                SixInTheEvening,
                                TrainingMinutes,
                                "sporthalle"
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var response = await client.PUTAsync<PutGroupTrainingSlots, PutGroupTrainingSlotsRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                Slots =
                [
                    new()
                    {
                        Weekday = DayOfWeek.Tuesday,
                        StartsAt = HalfPastSeven,
                        DurationMinutes = TrainingMinutes,
                        VenueId = null,
                    },
                ],
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.TrainingSlotsOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveCount(1)
            .TrainingSlotsOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToCarrySlot(DayOfWeek.Tuesday, HalfPastSeven, TrainingMinutes, null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ClearTheRhythm_When_TheGroupAdminSendsAnEmptyList()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity.AddPerson("anna", "Anna", "Kaiser").AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                    )
                    .Club(club =>
                        club.AddTrainingSlot(
                            "montags",
                            "tanzgarde",
                            DayOfWeek.Monday,
                            SixInTheEvening,
                            TrainingMinutes
                        )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var response = await client.PUTAsync<PutGroupTrainingSlots, PutGroupTrainingSlotsRequest>(
            new() { GroupId = ctx.Groups.Groups.IdOf("tanzgarde"), Slots = [] }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.TrainingSlotsOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToBeEmpty()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_AllowTheHigherInstance_When_TheCallerHoldsGroupsManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity.AddPerson("ilka", "Ilka", "Reineke").AddAccount("ilka")
                    )
                    .Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde"))
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "gruppenpflege",
                            "gruppenpflege-holding",
                            "Gruppenpflege",
                            "ilka",
                            FurriaPermissions.GroupsManage
                        )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var response = await client.PUTAsync<PutGroupTrainingSlots, PutGroupTrainingSlotsRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                Slots =
                [
                    new()
                    {
                        Weekday = DayOfWeek.Tuesday,
                        StartsAt = HalfPastSeven,
                        DurationMinutes = TrainingMinutes,
                        VenueId = null,
                    },
                ],
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.TrainingSlotsOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheVenueIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity.AddPerson("anna", "Anna", "Kaiser").AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var response = await client.PUTAsync<PutGroupTrainingSlots, PutGroupTrainingSlotsRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                Slots =
                [
                    new()
                    {
                        Weekday = DayOfWeek.Tuesday,
                        StartsAt = HalfPastSeven,
                        DurationMinutes = TrainingMinutes,
                        VenueId = UnknownVenueId,
                    },
                ],
            }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await ctx
            .Expected.TrainingSlotsOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToBeEmpty()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheVenueIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity.AddPerson("anna", "Anna", "Kaiser").AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                    )
                    .Club(club =>
                        club.AddVenue("alte-halle", "Alte Halle", archivedOn: ArchivedIn2021)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var response = await client.PUTAsync<PutGroupTrainingSlots, PutGroupTrainingSlotsRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                Slots =
                [
                    new()
                    {
                        Weekday = DayOfWeek.Tuesday,
                        StartsAt = HalfPastSeven,
                        DurationMinutes = TrainingMinutes,
                        VenueId = ctx.Club.Venues.IdOf("alte-halle"),
                    },
                ],
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Ein archivierter Ort kann nicht mehr gewählt werden."],
            failures[ConflictField]
        );
        await ctx
            .Expected.TrainingSlotsOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToBeEmpty()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheGroupIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity.AddPerson("anna", "Anna", "Kaiser").AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde", archivedOn: ArchivedIn2021)
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var response = await client.PUTAsync<PutGroupTrainingSlots, PutGroupTrainingSlotsRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                Slots =
                [
                    new()
                    {
                        Weekday = DayOfWeek.Tuesday,
                        StartsAt = HalfPastSeven,
                        DurationMinutes = TrainingMinutes,
                        VenueId = null,
                    },
                ],
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Eine archivierte Gruppe kann nicht bearbeitet werden."],
            failures[ConflictField]
        );
        await ctx
            .Expected.TrainingSlotsOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToBeEmpty()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheGroupIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity.AddPerson("ilka", "Ilka", "Reineke").AddAccount("ilka")
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "gruppenpflege",
                            "gruppenpflege-holding",
                            "Gruppenpflege",
                            "ilka",
                            FurriaPermissions.GroupsManage
                        )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var response = await client.PUTAsync<PutGroupTrainingSlots, PutGroupTrainingSlotsRequest>(
            new()
            {
                GroupId = UnknownGroupId,
                Slots =
                [
                    new()
                    {
                        Weekday = DayOfWeek.Tuesday,
                        StartsAt = HalfPastSeven,
                        DurationMinutes = TrainingMinutes,
                        VenueId = null,
                    },
                ],
            }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheTrainingRunsLongerThanADay()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity.AddPerson("anna", "Anna", "Kaiser").AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var response = await client.PUTAsync<PutGroupTrainingSlots, PutGroupTrainingSlotsRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                Slots =
                [
                    new()
                    {
                        Weekday = DayOfWeek.Tuesday,
                        StartsAt = HalfPastSeven,
                        DurationMinutes = 1_441,
                        VenueId = null,
                    },
                ],
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await ctx
            .Expected.TrainingSlotsOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToBeEmpty()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerOnlyBelongsToTheGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity.AddPerson("mara", "Mara", "Lenz").AddAccount("mara")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership("mara-tanzgarde", "tanzgarde", "mara")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("mara", ct);
        var response = await client.PUTAsync<PutGroupTrainingSlots, PutGroupTrainingSlotsRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                Slots =
                [
                    new()
                    {
                        Weekday = DayOfWeek.Tuesday,
                        StartsAt = HalfPastSeven,
                        DurationMinutes = TrainingMinutes,
                        VenueId = null,
                    },
                ],
            }
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.TrainingSlotsOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToBeEmpty()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerSendsNoToken()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde")),
            ct
        );

        var response = await _fixture
            .CreateClient()
            .PUTAsync<PutGroupTrainingSlots, PutGroupTrainingSlotsRequest>(
                new()
                {
                    GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                    Slots =
                    [
                        new()
                        {
                            Weekday = DayOfWeek.Tuesday,
                            StartsAt = HalfPastSeven,
                            DurationMinutes = TrainingMinutes,
                            VenueId = null,
                        },
                    ],
                }
            );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    private static async Task<IDictionary<string, List<string>>> ReadFailuresAsync(
        HttpResponseMessage response,
        CancellationToken ct
    )
    {
        var payload = await response.Content.ReadFromJsonAsync<ErrorResponse>(ct);
        return payload?.Errors
            ?? throw new InvalidOperationException("The failure response carried no errors.");
    }
}
