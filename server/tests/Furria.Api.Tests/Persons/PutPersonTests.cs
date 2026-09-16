using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Persons;
using Furria.Application.Authorization;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Persons;

[Collection("Api")]
public sealed class PutPersonTests
{
    private static readonly DateOnly BornIn1996 = new(1996, 4, 3);
    private static readonly DateOnly BornIn1997 = new(1997, 5, 14);

    private readonly ApiTestFixture _fixture;

    public PutPersonTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CorrectTheName_When_AManagerEditsAPerson()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity => identity.AddPerson("paula", "Paula", "Brendel")),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutPerson, PutPersonRequest>(
            FormOf(ctx.Identity.People.IdOf("paula"), "Paula", "Brendel-Kühnel")
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("paula"))
            .ToHaveName("Paula", "Brendel-Kühnel")
            .AssertAsync(ct);
    }

    private static PutPersonRequest FormOf(int personId, string firstName, string lastName) =>
        new()
        {
            PersonId = personId,
            FirstName = firstName,
            LastName = lastName,
            Email = null,
            Phone = null,
            Street = null,
            Zip = null,
            City = null,
            BirthDate = null,
            ContactVisibleToMembers = false,
        };

    [Fact]
    public async Task Should_OverwriteEveryFieldAndClearWhatIsLeftBlank_When_AManagerSavesTheForm()
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
                            "Großfurra",
                            contactVisibleToMembers: true,
                            BornIn1996
                        )
                ),
            ct
        );

        var personId = ctx.Identity.People.IdOf("paula");
        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutPerson, PutPersonRequest>(
            FormOf(personId, "Paula", "Brendel") with
            {
                Email = null,
                Phone = "03632 123456",
                Street = "Am Anger 3",
                Zip = "99706",
                City = "Sondershausen",
                BirthDate = BornIn1997,
                ContactVisibleToMembers = false,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var (_, registry) = await client.GETAsync<GetPersons, GetPersonsResponse>();
        var paula = Assert.Single(registry.Persons, person => person.PersonId == personId);
        Assert.Null(paula.Email);
        Assert.Equal("03632 123456", paula.Phone);
        Assert.Equal("Am Anger 3", paula.Street);
        Assert.Equal("99706", paula.Zip);
        Assert.Equal("Sondershausen", paula.City);
        Assert.Equal(BornIn1997, paula.BirthDate);
        Assert.False(paula.ContactVisibleToMembers);
    }

    [Fact]
    public async Task Should_ShareTheContactOnHerWord_When_ThePersonHasNoKonto()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity => identity.AddPerson("paula", "Paula", "Brendel")),
            ct
        );

        var personId = ctx.Identity.People.IdOf("paula");
        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutPerson, PutPersonRequest>(
            FormOf(personId, "Paula", "Brendel") with
            {
                ContactVisibleToMembers = true,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx.Expected.Person(personId).ToHaveContactVisible(true).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_ThePersonIsNotInTheRegister()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity => identity.AddPerson("paula", "Paula", "Brendel")),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutPerson, PutPersonRequest>(
            FormOf(ctx.Identity.People.IdOf("paula") + 1_000, "Paula", "Brendel")
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheRouteCarriesNoUsableId()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutPerson, PutPersonRequest>(
            FormOf(0, "Paula", "Brendel")
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheNameIsBlank()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity => identity.AddPerson("paula", "Paula", "Brendel")),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutPerson, PutPersonRequest>(
            FormOf(ctx.Identity.People.IdOf("paula"), "Paula", "")
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerDoesNotHoldPersonsManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddPerson("ilka", "Ilka", "Reineke")
                            .AddAccount("ilka")
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "gruppenpflege",
                            "ilka-gruppenpflege",
                            "Gruppenpflege",
                            "ilka",
                            FurriaPermissions.GroupsManage
                        )
                    ),
            ct
        );

        var personId = ctx.Identity.People.IdOf("paula");
        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var response = await client.PUTAsync<PutPerson, PutPersonRequest>(
            FormOf(personId, "Paula", "Falschgeschrieben")
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx.Expected.Person(personId).ToHaveName("Paula", "Brendel").AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity => identity.AddPerson("paula", "Paula", "Brendel")),
            ct
        );

        var response = await _fixture
            .CreateClient()
            .PUTAsync<PutPerson, PutPersonRequest>(
                FormOf(ctx.Identity.People.IdOf("paula"), "Paula", "Brendel")
            );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
