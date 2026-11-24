using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Persons;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Persons;

public sealed class PutPersonTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutPersonTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
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
