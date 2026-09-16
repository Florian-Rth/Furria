using FastEndpoints;

namespace Furria.Api.Authorization;

public static class EndpointPermissionExtensions
{
    public static void RequirePermission(
        this EndpointDefinition definition,
        string permissionKey
    ) =>
        definition.Options(route =>
            route.WithMetadata(new PermissionRequirement { PermissionKey = permissionKey })
        );

    public static void RequireAffiliation(this EndpointDefinition definition) =>
        definition.Options(route => route.WithMetadata(new AffiliationRequirement()));
}
