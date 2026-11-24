using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Management;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Management;

public sealed class PostSessionRecordTests : IClassFixture<ApiTestFixture>
{
    private const string ConflictField = "conflict";
    private const string DuplicateStartYearMessage =
        "Für diese Session gibt es schon einen Eintrag.";
    private const string DuplicateNumberMessage = "Diese Nº steht schon bei einer anderen Session.";
    private const string Motto = "FURRIA — Der Mittelpunkt des Universums";

    private readonly ApiTestFixture _fixture;

    public PostSessionRecordTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheSeasonAlreadyCarriesAnEntry()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Club(club => club.AddSession("laufende", 2026, 53)),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, _) = await RecordAsync(client, 2026, null, Motto);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([DuplicateStartYearMessage], failures[ConflictField]);
        await ctx
            .Expected.Session(ctx.Club.Sessions.IdOf("laufende"))
            .ToHaveMotto(null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_AnotherSeasonAlreadyCarriesTheNumber()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Club(club => club.AddSession("vorige", 2025, 53)),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, _) = await RecordAsync(client, 2026, 53, null);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([DuplicateNumberMessage], failures[ConflictField]);
        await ctx
            .Expected.Session(ctx.Club.Sessions.IdOf("vorige"))
            .ToHaveStartYear(2025)
            .AssertAsync(ct);
    }

    private static Task<TestResult<PostSessionRecordResponse>> RecordAsync(
        HttpClient client,
        int startYear,
        int? number,
        string? motto
    ) =>
        client.POSTAsync<PostSessionRecord, PostSessionRecordRequest, PostSessionRecordResponse>(
            new PostSessionRecordRequest
            {
                StartYear = startYear,
                Number = number,
                Motto = motto,
            }
        );

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
