namespace Furria.Tests.Common.Builder;

public sealed class TestGroups
{
    public AliasRegistry<int> GroupKinds { get; }

    public AliasRegistry<int> Groups { get; }

    public AliasRegistry<int> GroupMemberships { get; }

    public AliasRegistry<int> GroupAdmins { get; }

    internal TestGroups(SeededGroups seeded)
    {
        GroupKinds = new AliasRegistry<int>("GroupKind", seeded.GroupKindIds);
        Groups = new AliasRegistry<int>("Group", seeded.GroupIds);
        GroupMemberships = new AliasRegistry<int>("GroupMembership", seeded.GroupMembershipIds);
        GroupAdmins = new AliasRegistry<int>("GroupAdmin", seeded.GroupAdminIds);
    }
}
