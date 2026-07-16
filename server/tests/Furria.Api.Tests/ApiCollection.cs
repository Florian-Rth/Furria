using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests;

// Must live in the test assembly - xunit only discovers collection definitions locally.
[CollectionDefinition("Api")]
public sealed class ApiCollection : ICollectionFixture<ApiTestFixture>;
