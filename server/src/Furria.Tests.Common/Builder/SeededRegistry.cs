namespace Furria.Tests.Common.Builder;

internal sealed record SeededRegistry(
    SeededIdentity Identity,
    SeededGroups Groups,
    SeededRoles Roles
);
