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

    public static void RequireAnyPermission(
        this EndpointDefinition definition,
        params string[] permissionKeys
    ) =>
        definition.Options(route =>
            route.WithMetadata(new AnyPermissionRequirement { PermissionKeys = permissionKeys })
        );

    public static void RequireAffiliation(this EndpointDefinition definition) =>
        definition.Options(route => route.WithMetadata(new AffiliationRequirement()));
}
