using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Auth;

public sealed class PutMyContactDetailsTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutMyContactDetailsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RecordHerAsTheOneWhoChangedThem_When_SheChangesHerPhone()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPersonContact("paula", "paula@example.test", "0170 1234567")
                        .AddAccount("paula")
                ),
            ct
        );

        var personId = ctx.Identity.People.IdOf("paula");
        var client = await ctx.Identity.ClientForAsync("paula", ct);

        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromMinutes(1),
            async () =>
            {
                var changedAt = _fixture.TimeProvider.GetUtcNow();

                var response = await client.PUTAsync<
                    PutMyContactDetails,
                    PutMyContactDetailsRequest
                >(OwnDetails("paula@example.test", "03632 123456"));

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
                await ctx
                    .Expected.Person(personId)
                    .ToHaveContactChangedBy(personId, changedAt)
                    .AssertAsync(ct);
            }
        );
    }

    [Fact]
    public async Task Should_LeaveHerLoginEmailAlone_When_SheChangesHerContactEmail()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("paula")),
            ct
        );

        var loginEmail = ctx.Identity.EmailOf("paula");
        var client = await ctx.Identity.ClientForAsync("paula", ct);
        var response = await client.PUTAsync<PutMyContactDetails, PutMyContactDetailsRequest>(
            OwnDetails("paula.neu@example.test", null)
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("paula"))
            .ToHaveContactDetails("paula.neu@example.test", null, null, null, null)
            .Account(ctx.Identity.Accounts.IdOf("paula"))
            .ToHaveEmail(loginEmail)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RecordNoChange_When_SheSavesHerDetailsUnchanged()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPersonContact("paula", "paula@example.test", "0170 1234567")
                        .AddAccount("paula")
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);
        var response = await client.PUTAsync<PutMyContactDetails, PutMyContactDetailsRequest>(
            OwnDetails("paula@example.test", "0170 1234567")
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("paula"))
            .ToHaveNoContactChange()
            .AssertAsync(ct);
    }

    private static PutMyContactDetailsRequest OwnDetails(string? email, string? phone) =>
        new()
        {
            Email = email,
            Phone = phone,
            Street = null,
            Zip = null,
            City = null,
        };
}
