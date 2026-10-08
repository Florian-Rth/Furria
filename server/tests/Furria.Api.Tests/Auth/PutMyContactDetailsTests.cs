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
    public async Task Should_WriteHerContactDetails_When_SheSavesThem()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddPersonContact(
                            "paula",
                            "paula@example.test",
                            "0170 1234567",
                            "Hauptstraße 12",
                            "99713",
                            "Großfurra"
                        )
                        .AddAccount("paula")
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);
        var response = await client.PUTAsync<PutMyContactDetails, PutMyContactDetailsRequest>(
            new()
            {
                Email = "paula@example.test",
                Phone = "03632 123456",
                Street = "Am Anger 3",
                Zip = "99706",
                City = "Sondershausen",
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("paula"))
            .ToHaveContactDetails(
                "paula@example.test",
                "03632 123456",
                "Am Anger 3",
                "99706",
                "Sondershausen"
            )
            .Person(ctx.Identity.People.IdOf("paula"))
            .ToHaveName("Paula", "Brendel")
            .AssertAsync(ct);
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

    [Fact]
    public async Task Should_AcceptHerChange_When_SheIsNoLongerAffiliated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddAccount("tina")
                        .AddMembership(
                            "tina-past",
                            "tina",
                            new DateOnly(2017, 9, 1),
                            new DateOnly(2020, 3, 1)
                        )
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("tina", ct);
        var response = await client.PUTAsync<PutMyContactDetails, PutMyContactDetailsRequest>(
            OwnDetails("tina@example.test", "0170 7654321")
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("tina"))
            .ToHaveContactDetails("tina@example.test", "0170 7654321", null, null, null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RejectTheChange_When_TheContactEmailIsNoAddress()
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
            OwnDetails("keine-adresse", "03632 123456")
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("paula"))
            .ToHaveContactDetails("paula@example.test", "0170 1234567", null, null, null)
            .Person(ctx.Identity.People.IdOf("paula"))
            .ToHaveNoContactChange()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RejectTheChange_When_TheZipIsLongerThanTheRegisterHolds()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("paula")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);
        var response = await client.PUTAsync<PutMyContactDetails, PutMyContactDetailsRequest>(
            OwnDetails(null, null) with
            {
                Zip = new string('9', 17),
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("paula"))
            .ToHaveNoContactChange()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_AnswerUnauthorized_When_TheCallerCarriesNoToken()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var response = await _fixture
            .CreateClient()
            .PUTAsync<PutMyContactDetails, PutMyContactDetailsRequest>(
                OwnDetails("paula@example.test", null)
            );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
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
