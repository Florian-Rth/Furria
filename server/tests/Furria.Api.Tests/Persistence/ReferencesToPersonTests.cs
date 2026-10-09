using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Persistence;

public sealed class ReferencesToPersonTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public ReferencesToPersonTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public void Should_StateWhatAbsorptionAndErasureDo_When_ARowReferencesAPerson()
    {
        Assert.Empty(_fixture.ReferencesToPersonDisagreements());
    }
}
