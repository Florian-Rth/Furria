using System.Net;
using Furria.Api.Endpoints.MembershipApplications;
using Furria.Api.RateLimiting;
using Furria.Api.Tests.Auth;
using Furria.Tests.Common.Expectations;
using Furria.Tests.Common.Fixtures;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Furria.Api.Tests.MembershipApplications;

public sealed class PostMembershipApplicationTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PostMembershipApplicationTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_MailTheApplicantALinkToConfirm_When_ASolvedApplicationArrives()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);
        var email = InvitationSteps.UniqueContactEmail("mia");

        var response = await MembershipApplicationSteps.ApplyAsync(
            _fixture.CreateClient(),
            MembershipApplicationSteps.ApplicationOf(email, _fixture.Today.AddYears(-30))
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("{}", await response.Content.ReadAsStringAsync(ct));
        var mail = await _fixture.Mailbox.SingleMailToAsync(email, ct);
        Assert.Equal(MembershipApplicationSteps.ConfirmationSubject, mail.Subject);
        Assert.StartsWith(
            MembershipApplicationSteps.ConfirmationLinkPrefix,
            mail.Link(),
            StringComparison.Ordinal
        );
        Assert.StartsWith("Hallo Mia,", mail.Text, StringComparison.Ordinal);
    }

    [Fact]
    public async Task Should_RefuseTheApplication_When_TheApplicantIsYoungerThanTheClubsOwnAgeOfConsent()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Club(club => club.SetClubRecord(ageOfConsent: 18)),
            ct
        );

        var response = await MembershipApplicationSteps.ApplyAsync(
            _fixture.CreateClient(),
            MembershipApplicationSteps.ApplicationOf(
                InvitationSteps.UniqueContactEmail("ida"),
                _fixture.Today.AddYears(-17)
            )
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        await ctx.Expected.MembershipApplications().ToHaveCount(0).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheApplication_When_TheSolutionDoesNotSolveTheChallenge()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = _fixture.CreateClient();
        var challenge = await MembershipApplicationSteps.ChallengeAsync(client);
        var wrong = new AltchaSolution(0, new string('0', 64));

        var response = await MembershipApplicationSteps.SubmitAsync(
            client,
            AdultApplication() with
            {
                Altcha = AltchaSolver.PayloadOf(challenge, wrong),
            }
        );

        await AssertAltchaRefusedAsync(response, ctx.Expected, ct);
    }

    [Fact]
    public async Task Should_RefuseTheApplication_When_TheChallengeExpiredBeforeItArrived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = _fixture.CreateClient();
        var altcha = await MembershipApplicationSteps.SolvedAltchaAsync(client);

        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromMinutes(10) + TimeSpan.FromSeconds(1),
            async () =>
            {
                var response = await MembershipApplicationSteps.SubmitAsync(
                    client,
                    AdultApplication() with
                    {
                        Altcha = altcha,
                    }
                );

                await AssertAltchaRefusedAsync(response, ctx.Expected, ct);
            }
        );
    }

    [Fact]
    public async Task Should_RefuseTheApplication_When_ASolvedChallengeIsSentASecondTime()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = _fixture.CreateClient();
        var altcha = await MembershipApplicationSteps.SolvedAltchaAsync(client);
        var first = await MembershipApplicationSteps.SubmitAsync(
            client,
            AdultApplication() with
            {
                Altcha = altcha,
            }
        );
        Assert.Equal(HttpStatusCode.OK, first.StatusCode);

        var second = await MembershipApplicationSteps.SubmitAsync(
            client,
            AdultApplication() with
            {
                Altcha = altcha,
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, second.StatusCode);
        Assert.Equal(["altcha"], await MembershipApplicationSteps.RefusedFieldsAsync(second, ct));
        await ctx.Expected.MembershipApplications().ToHaveCount(1).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnTooManyRequests_When_OneAddressAppliesTooOften()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = _fixture.CreateClient();
        var application = AdultApplication();
        var permits = new SignedOutRateLimitOptions().PermitsPerAddress;

        for (var attempt = 0; attempt < permits; attempt++)
            Assert.Equal(
                HttpStatusCode.OK,
                (await MembershipApplicationSteps.ApplyAsync(client, application)).StatusCode
            );
        var refused = await MembershipApplicationSteps.ApplyAsync(client, application);

        Assert.Equal(HttpStatusCode.TooManyRequests, refused.StatusCode);
        await ctx.Expected.MembershipApplications().ToHaveCount(permits).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepNoApplication_When_ItsConfirmationMailCannotBeStored()
    {
        var ct = TestContext.Current.CancellationToken;
        await using var host = await _fixture.HostOnOwnDatabaseAsync(
            new Dictionary<string, string>(),
            ct
        );
        var client = host.CreateClient();
        var application = AdultApplication() with
        {
            Altcha = await MembershipApplicationSteps.SolvedAltchaAsync(client),
        };

        await using (await RejectedWrites.OnAsync(host, "outbox_mail", ct))
        {
            var refused = await MembershipApplicationSteps.SubmitAsync(client, application);
            Assert.Equal(HttpStatusCode.InternalServerError, refused.StatusCode);
        }

        await new Expected(host.Services.GetRequiredService<IServiceScopeFactory>())
            .MembershipApplications()
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    private PostMembershipApplicationRequest AdultApplication() =>
        MembershipApplicationSteps.ApplicationOf(
            InvitationSteps.UniqueContactEmail("mia"),
            _fixture.Today.AddYears(-30)
        );

    private static async Task AssertAltchaRefusedAsync(
        HttpResponseMessage response,
        Expected expected,
        CancellationToken ct
    )
    {
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(["altcha"], await MembershipApplicationSteps.RefusedFieldsAsync(response, ct));
        await expected.MembershipApplications().ToHaveCount(0).AssertAsync(ct);
    }
}
