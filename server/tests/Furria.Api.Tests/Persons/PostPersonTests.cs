using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Persons;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Persons;

[Collection("Api")]
public sealed class PostPersonTests
{
    private static readonly DateOnly BornIn1996 = new(1996, 4, 3);

    private readonly ApiTestFixture _fixture;

    public PostPersonTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CreateHer_When_AManagerSubmitsNothingButAName()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.POSTAsync<
            PostPerson,
            PostPersonRequest,
            PostPersonResponse
        >(
            new PostPersonRequest
            {
                FirstName = "Paula",
                LastName = "Brendel",
                Email = null,
                Phone = null,
                Street = null,
                Zip = null,
                City = null,
                BirthDate = null,
                ContactVisibleToMembers = false,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx.Expected.Person(result.PersonId).ToHaveName("Paula", "Brendel").AssertAsync(ct);
    }

    [Fact]
    public async Task Should_StoreTheWholeForm_When_AManagerFillsEveryField()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, created) = await client.POSTAsync<
            PostPerson,
            PostPersonRequest,
            PostPersonResponse
        >(
            new PostPersonRequest
            {
                FirstName = "Paula",
                LastName = "Brendel",
                Email = "paula@example.test",
                Phone = "0170 1234567",
                Street = "Hauptstraße 12",
                Zip = "99713",
                City = "Großfurra",
                BirthDate = BornIn1996,
                ContactVisibleToMembers = true,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var (_, registry) = await client.GETAsync<GetPersons, GetPersonsResponse>();
        var paula = Assert.Single(registry.Persons, person => person.PersonId == created.PersonId);
        Assert.Equal("paula@example.test", paula.Email);
        Assert.Equal("0170 1234567", paula.Phone);
        Assert.Equal("Hauptstraße 12", paula.Street);
        Assert.Equal("99713", paula.Zip);
        Assert.Equal("Großfurra", paula.City);
        Assert.Equal(BornIn1996, paula.BirthDate);
        Assert.True(paula.ContactVisibleToMembers);
    }

    [Fact]
    public async Task Should_RecordNeitherMembershipNorAccount_When_APersonIsCreated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, created) = await client.POSTAsync<
            PostPerson,
            PostPersonRequest,
            PostPersonResponse
        >(
            new PostPersonRequest
            {
                FirstName = "Paula",
                LastName = "Brendel",
                Email = "paula@example.test",
                Phone = null,
                Street = null,
                Zip = null,
                City = null,
                BirthDate = null,
                ContactVisibleToMembers = false,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.MembershipsOfPerson(created.PersonId)
            .ToHaveCount(0)
            .Accounts()
            .ToHaveCount(1)
            .AssertAsync(ct);

        var (_, registry) = await client.GETAsync<GetPersons, GetPersonsResponse>();
        var paula = Assert.Single(registry.Persons, person => person.PersonId == created.PersonId);
        Assert.Equal(MembershipState.None, paula.MembershipState);
        Assert.Null(paula.MemberSince);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheNameIsBlank()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await client.POSTAsync<
            PostPerson,
            PostPersonRequest,
            PostPersonResponse
        >(FormOf("", "Brendel"));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheNameIsLongerThanTheColumn()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await client.POSTAsync<
            PostPerson,
            PostPersonRequest,
            PostPersonResponse
        >(FormOf("Paula", new string('B', 129)));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheEmailIsNotAnAddress()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await client.POSTAsync<
            PostPerson,
            PostPersonRequest,
            PostPersonResponse
        >(FormOf("Paula", "Brendel") with { Email = "paula(at)example.test" });

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
                        identity.AddPerson("ilka", "Ilka", "Reineke").AddAccount("ilka")
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

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, _) = await client.POSTAsync<
            PostPerson,
            PostPersonRequest,
            PostPersonResponse
        >(FormOf("Paula", "Brendel"));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var (response, _) = await _fixture
            .CreateClient()
            .POSTAsync<PostPerson, PostPersonRequest, PostPersonResponse>(
                FormOf("Paula", "Brendel")
            );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    private static PostPersonRequest FormOf(string firstName, string lastName) =>
        new()
        {
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
}
