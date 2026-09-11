using System.Net;
using System.Text;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Auth;

[Collection("Api")]
public sealed class PutMyContactVisibilityTests
{
    private const string ContactVisibilityRoute = "/api/auth/me/contact-visibility";

    private readonly ApiTestFixture _fixture;

    public PutMyContactVisibilityTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReleaseHerContactData_When_SheTurnsTheSwitchOn()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddPersonContact("paula", phone: "0561 123456")
                        .AddAccount("paula")
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);
        var response = await client.PUTAsync<PutMyContactVisibility, PutMyContactVisibilityRequest>(
            new() { ContactVisibleToMembers = true }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("paula"))
            .ToHaveContactVisible(true)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_WithholdHerContactData_When_SheTurnsTheSwitchOff()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddPersonContact(
                            "paula",
                            phone: "0561 123456",
                            contactVisibleToMembers: true
                        )
                        .AddAccount("paula")
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);
        var response = await client.PUTAsync<PutMyContactVisibility, PutMyContactVisibilityRequest>(
            new() { ContactVisibleToMembers = false }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("paula"))
            .ToHaveContactVisible(false)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReportTheNewValue_When_MeIsReadAfterTheToggle()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddPersonContact("paula", phone: "0561 123456")
                        .AddAccount("paula")
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);
        await client.PUTAsync<PutMyContactVisibility, PutMyContactVisibilityRequest>(
            new() { ContactVisibleToMembers = true }
        );

        var (response, me) = await client.GETAsync<GetMe, GetMeResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(me.Person.ContactVisibleToMembers);
    }

    [Fact]
    public async Task Should_LeaveEveryOtherPersonAlone_When_SheTurnsHerOwnSwitchOff()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("wilma", "Wilma", "Ahrens")
                        .AddPersonContact("wilma", contactVisibleToMembers: true)
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddPersonContact("paula", contactVisibleToMembers: true)
                        .AddAccount("paula")
                        .AddPerson("bodo", "Bodo", "Löffler")
                        .AddPersonContact("bodo", contactVisibleToMembers: true)
                        .AddAccount("bodo")
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);
        var response = await client.PUTAsync<PutMyContactVisibility, PutMyContactVisibilityRequest>(
            new() { ContactVisibleToMembers = false }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("paula"))
            .ToHaveContactVisible(false)
            .Person(ctx.Identity.People.IdOf("wilma"))
            .ToHaveContactVisible(true)
            .Person(ctx.Identity.People.IdOf("bodo"))
            .ToHaveContactVisible(true)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_AnswerUnauthorized_When_TheCallerCarriesNoToken()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var response = await _fixture
            .CreateClient()
            .PUTAsync<PutMyContactVisibility, PutMyContactVisibilityRequest>(
                new() { ContactVisibleToMembers = true }
            );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Should_AcceptTheToggle_When_TheCallerIsNotAffiliated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("tina")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("tina", ct);
        var response = await client.PUTAsync<PutMyContactVisibility, PutMyContactVisibilityRequest>(
            new() { ContactVisibleToMembers = true }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("tina"))
            .ToHaveContactVisible(true)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_AnswerNotFound_When_HerPersonIsGone()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("paula")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);
        await _fixture.DeletePersonDirectlyAsync(ctx.Identity.People.IdOf("paula"), ct);

        var response = await client.PUTAsync<PutMyContactVisibility, PutMyContactVisibilityRequest>(
            new() { ContactVisibleToMembers = true }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ChangeNothing_When_TheBodyCarriesNoSwitchValue()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddPersonContact("paula", contactVisibleToMembers: true)
                        .AddAccount("paula")
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);
        var response = await client.PutAsync(
            ContactVisibilityRoute,
            new StringContent("{}", Encoding.UTF8, "application/json"),
            ct
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("paula"))
            .ToHaveContactVisible(true)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_StampUpdatedAt_When_SheTurnsTheSwitchOn()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddPerson("paula", "Paula", "Brendel").AddAccount("paula")
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);

        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromMinutes(1),
            async () =>
            {
                var toggledAt = _fixture.TimeProvider.GetUtcNow();

                await client.PUTAsync<PutMyContactVisibility, PutMyContactVisibilityRequest>(
                    new() { ContactVisibleToMembers = true }
                );

                await ctx
                    .Expected.Person(ctx.Identity.People.IdOf("paula"))
                    .ToHaveBeenTouchedAt(toggledAt)
                    .AssertAsync(ct);
            }
        );
    }
}
