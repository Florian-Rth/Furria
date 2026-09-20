namespace Furria.Tests.Common.Builder;

public sealed class GroupSeedBuilder
{
    private static readonly DateOnly DefaultJoinedOn = new(2020, 11, 11);

    private readonly List<GroupKindIntent> _groupKinds = [];
    private readonly List<GroupIntent> _groups = [];
    private readonly List<GroupMembershipIntent> _memberships = [];
    private readonly List<GroupAdminIntent> _admins = [];

    internal IReadOnlyList<GroupKindIntent> GroupKinds => _groupKinds;

    internal IReadOnlyList<GroupIntent> Groups => _groups;

    internal IReadOnlyList<GroupMembershipIntent> Memberships => _memberships;

    internal IReadOnlyList<GroupAdminIntent> Admins => _admins;

    public GroupSeedBuilder AddGroupKind(
        string alias,
        string name,
        int sortOrder = 1,
        DateOnly? archivedOn = null
    )
    {
        _groupKinds.Add(new GroupKindIntent(alias, name, sortOrder, archivedOn));
        return this;
    }

    public GroupSeedBuilder AddGroup(
        string alias,
        string name,
        string description = "",
        bool isRecruiting = false,
        DateOnly? archivedOn = null,
        string? groupKindAlias = null
    )
    {
        _groups.Add(
            new GroupIntent(alias, name, description, isRecruiting, archivedOn, groupKindAlias)
        );
        return this;
    }

    public GroupSeedBuilder AddGroupMembership(
        string alias,
        string groupAlias,
        string personAlias,
        DateOnly? joinedOn = null,
        DateOnly? leftOn = null
    )
    {
        _memberships.Add(
            new GroupMembershipIntent(
                alias,
                groupAlias,
                personAlias,
                joinedOn ?? DefaultJoinedOn,
                leftOn
            )
        );
        return this;
    }

    public GroupSeedBuilder AddGroupAdmin(
        string alias,
        string groupAlias,
        string personAlias,
        string? function = null,
        DateOnly? sinceOn = null,
        DateOnly? untilOn = null
    )
    {
        _admins.Add(
            new GroupAdminIntent(
                alias,
                groupAlias,
                personAlias,
                function,
                sinceOn ?? DefaultJoinedOn,
                untilOn
            )
        );
        return this;
    }

    internal sealed record GroupKindIntent(
        string Alias,
        string Name,
        int SortOrder,
        DateOnly? ArchivedOn
    );

    internal sealed record GroupIntent(
        string Alias,
        string Name,
        string Description,
        bool IsRecruiting,
        DateOnly? ArchivedOn,
        string? GroupKindAlias
    );

    internal sealed record GroupMembershipIntent(
        string Alias,
        string GroupAlias,
        string PersonAlias,
        DateOnly JoinedOn,
        DateOnly? LeftOn
    );

    internal sealed record GroupAdminIntent(
        string Alias,
        string GroupAlias,
        string PersonAlias,
        string? Function,
        DateOnly SinceOn,
        DateOnly? UntilOn
    );
}
