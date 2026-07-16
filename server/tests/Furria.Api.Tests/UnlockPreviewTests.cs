using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests;

[Collection("Api")]
public sealed class UnlockPreviewTests
{
    private readonly ApiTestFixture _fixture;

    public UnlockPreviewTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReturnGranted_When_PasswordIsCorrect()
    {
        var client = _fixture.CreateClient();

        var (response, result) = await client.POSTAsync<
            UnlockPreview,
            UnlockPreviewRequest,
            UnlockPreviewResponse
        >(new() { Password = ApiTestFixture.PreviewPassword });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(result.Granted);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_PasswordIsWrong()
    {
        var client = _fixture.CreateClient();

        var (response, _) = await client.POSTAsync<
            UnlockPreview,
            UnlockPreviewRequest,
            UnlockPreviewResponse
        >(new() { Password = "wrong-password" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_PasswordIsEmpty()
    {
        var client = _fixture.CreateClient();

        var (response, _) = await client.POSTAsync<
            UnlockPreview,
            UnlockPreviewRequest,
            UnlockPreviewResponse
        >(new() { Password = "" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
