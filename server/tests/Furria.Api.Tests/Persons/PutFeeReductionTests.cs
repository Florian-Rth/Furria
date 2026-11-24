using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Persons;
using Furria.Core.Identity;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Persons;

public sealed class PutFeeReductionTests : IClassFixture<ApiTestFixture>
{
    private const string ConflictField = "conflict";
    private const string ArchivedPersonMessage =
        "Paula ist archiviert – Beitragsermäßigungen lassen sich erst nach dem "
        + "Wiederherstellen festhalten.";
    private const int ReducedFrom2018 = 2018;
    private const int ReducedUntil2019 = 2019;
    private const int ReducedFrom2021 = 2021;
    private const int ReducedUntil2022 = 2022;

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly LeftIn2020 = new(2020, 3, 1);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public PutFeeReductionTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RefuseAndKeepTheSpan_When_SheIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddMembership("paula-erste", "paula", JoinedIn2017, LeftIn2020)
                        .AddFeeReduction(
                            "paula-schule",
                            "paula",
                            FeeReductionBasis.School,
                            ReducedFrom2018,
                            ReducedUntil2019
                        )
                        .AddArchive("paula", ArchivedIn2021)
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await client.PUTAsync<PutFeeReduction, PutFeeReductionRequest>(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                FeeReductionId = ctx.Identity.FeeReductions.IdOf("paula-schule"),
                Basis = FeeReductionBasis.School,
                FirstSessionYear = ReducedFrom2018,
                LastSessionYear = ReducedFrom2018,
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([ArchivedPersonMessage], failures[ConflictField]);
        await ctx
            .Expected.FeeReduction(ctx.Identity.FeeReductions.IdOf("paula-schule"))
            .ToHaveSpan(ReducedFrom2018, ReducedUntil2019)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheCorrectedSpanOverlapsAnotherReduction()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddMembership("paula-erste", "paula", JoinedIn2017)
                        .AddFeeReduction(
                            "paula-schule",
                            "paula",
                            FeeReductionBasis.School,
                            ReducedFrom2018,
                            ReducedUntil2019
                        )
                        .AddFeeReduction(
                            "paula-studium",
                            "paula",
                            FeeReductionBasis.Studies,
                            ReducedFrom2021,
                            ReducedUntil2022
                        )
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await client.PUTAsync<PutFeeReduction, PutFeeReductionRequest>(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                FeeReductionId = ctx.Identity.FeeReductions.IdOf("paula-schule"),
                Basis = FeeReductionBasis.School,
                FirstSessionYear = ReducedFrom2018,
                LastSessionYear = ReducedFrom2021,
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Dieser Zeitraum überschneidet sich mit einer bestehenden Beitragsermäßigung."],
            failures[ConflictField]
        );
        await ctx
            .Expected.FeeReduction(ctx.Identity.FeeReductions.IdOf("paula-schule"))
            .ToHaveSpan(ReducedFrom2018, ReducedUntil2019)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheReductionBelongsToAnotherPerson()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddPerson("mara", "Mara", "Lenz")
                        .AddFeeReduction(
                            "paula-schule",
                            "paula",
                            FeeReductionBasis.School,
                            ReducedFrom2018,
                            ReducedUntil2019
                        )
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await client.PUTAsync<PutFeeReduction, PutFeeReductionRequest>(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("mara"),
                FeeReductionId = ctx.Identity.FeeReductions.IdOf("paula-schule"),
                Basis = FeeReductionBasis.Studies,
                FirstSessionYear = ReducedFrom2021,
                LastSessionYear = ReducedUntil2022,
            }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await ctx
            .Expected.FeeReduction(ctx.Identity.FeeReductions.IdOf("paula-schule"))
            .ToHaveBasis(FeeReductionBasis.School)
            .FeeReduction(ctx.Identity.FeeReductions.IdOf("paula-schule"))
            .ToHaveSpan(ReducedFrom2018, ReducedUntil2019)
            .AssertAsync(ct);
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
