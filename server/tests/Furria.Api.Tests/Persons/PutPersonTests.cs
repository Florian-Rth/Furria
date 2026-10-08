using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Persons;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Persons;

public sealed class PutPersonTests : IClassFixture<ApiTestFixture>
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

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
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
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
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
        var (_, registry) = await client.GETAsync<
            GetPersons,
            GetPersonsRequest,
            GetPersonsResponse
        >(new GetPersonsRequest());
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
    public async Task Should_ShareTheContactOnHerWord_When_ThePersonHasNoAccount()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity => identity.AddPerson("paula", "Paula", "Brendel")),
            ct
        );

        var personId = ctx.Identity.People.IdOf("paula");
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
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

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await client.PUTAsync<PutPerson, PutPersonRequest>(
            FormOf(ctx.Identity.People.IdOf("paula") + 1_000, "Paula", "Brendel")
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
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

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await client.PUTAsync<PutPerson, PutPersonRequest>(
            FormOf(ctx.Identity.People.IdOf("paula"), "Paula", "")
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_RecordTheManagerAsTheOneWhoChangedThem_When_SheCorrectsTheContactDetails()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddPersonContact("paula", "paula@example.test", "0170 1234567")
                ),
            ct
        );

        var personId = ctx.Identity.People.IdOf("paula");
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromMinutes(1),
            async () =>
            {
                var changedAt = _fixture.TimeProvider.GetUtcNow();

                var response = await client.PUTAsync<PutPerson, PutPersonRequest>(
                    FormOf(personId, "Paula", "Brendel") with
                    {
                        Email = "paula@example.test",
                        Phone = "03632 123456",
                    }
                );

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
                await ctx
                    .Expected.Person(personId)
                    .ToHaveContactChangedBy(null, changedAt)
                    .AssertAsync(ct);
            }
        );
    }

    [Fact]
    public async Task Should_RecordNoContactChange_When_TheManagerOnlyCorrectsTheName()
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
                ),
            ct
        );

        var personId = ctx.Identity.People.IdOf("paula");
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await client.PUTAsync<PutPerson, PutPersonRequest>(
            FormOf(personId, "Paula", "Brendel-Kühnel") with
            {
                Email = "paula@example.test",
                Phone = "0170 1234567",
                Street = "Hauptstraße 12",
                Zip = "99713",
                City = "Großfurra",
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Person(personId)
            .ToHaveName("Paula", "Brendel-Kühnel")
            .Person(personId)
            .ToHaveNoContactChange()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_LeaveHerLoginEmailAlone_When_TheManagerChangesHerContactEmail()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddPerson("paula", "Paula", "Brendel").AddAccount("paula")
                ),
            ct
        );

        var personId = ctx.Identity.People.IdOf("paula");
        var loginEmail = ctx.Identity.EmailOf("paula");
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await client.PUTAsync<PutPerson, PutPersonRequest>(
            FormOf(personId, "Paula", "Brendel") with
            {
                Email = "paula.neu@example.test",
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Person(personId)
            .ToHaveContactDetails("paula.neu@example.test", null, null, null, null)
            .Account(ctx.Identity.Accounts.IdOf("paula"))
            .ToHaveEmail(loginEmail)
            .AssertAsync(ct);
    }
}
