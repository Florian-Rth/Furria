using System.Diagnostics.Contracts;
using Furria.Core.Club;
using Furria.Core.Groups;
using Furria.Core.Identity;
using Furria.Core.Media;
using Furria.Core.News;
using Furria.Core.Roles;
using Furria.Core.RunningOrders;
using Furria.Core.Studio;
using Furria.Core.Website;
using Furria.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace Furria.Infrastructure.Registry;

public static class ReferencesToPerson
{
    public static readonly IReadOnlyList<ReferenceToPerson> All =
    [
        HerOwn<Membership>(nameof(Membership.PersonId)),
        HerOwn<FeeReduction>(nameof(FeeReduction.PersonId)),
        HerOwn<GroupMembership>(nameof(GroupMembership.PersonId)),
        HerOwn<GroupAdmin>(nameof(GroupAdmin.PersonId)),
        HerOwn<RoleHolding>(nameof(RoleHolding.PersonId)),
        HerOwn<BoardSeat>(nameof(BoardSeat.PersonId)),
        HerOwn<KeyHolding>(nameof(KeyHolding.PersonId)),
        HerOwn<AttendanceResponse>(nameof(AttendanceResponse.PersonId)),
        HerOwn<AttendanceResponseChange>(nameof(AttendanceResponseChange.PersonId)),
        HerOwn<NewsPostMention>(nameof(NewsPostMention.PersonId)),
        HerOwn<ActCastChange>(nameof(ActCastChange.PersonId)),
        HerOwn<FrozenCastMember>(nameof(FrozenCastMember.PersonId)),
        HerOwn<AppearanceCastChange>(nameof(AppearanceCastChange.PersonId)),
        HerOwn<ActCoEditor>(nameof(ActCoEditor.PersonId)),
        Reference<Spot>(nameof(Spot.PersonId), OnAbsorption.BlocksIt, OnErasure.KeptNamingNobody),
        HerOwn<AppearanceSpot>(nameof(AppearanceSpot.PersonId)),
        Reference<Announcement>(
            nameof(Announcement.AuthorPersonId),
            OnAbsorption.BlocksIt,
            OnErasure.KeptNamingNobody
        ),
        Reference<NewsPost>(
            nameof(NewsPost.AuthorPersonId),
            OnAbsorption.BlocksIt,
            OnErasure.KeptNamingNobody
        ),
        Reference<Account>(
            nameof(Account.PersonId),
            OnAbsorption.MovesToKeeper,
            OnErasure.ErasedWithHer
        ),
        Reference<AccountEvent>(
            nameof(AccountEvent.PersonId),
            OnAbsorption.MovesToKeeper,
            OnErasure.ErasedWithHer
        ),
        Reference<Invitation>(
            nameof(Invitation.PersonId),
            OnAbsorption.MovesToKeeper,
            OnErasure.ErasedWithHer
        ),
        Reference<MediaItem>(
            nameof(MediaItem.OwnerPersonId),
            OnAbsorption.MovesToKeeperUnlessSheHoldsOne,
            OnErasure.ErasedWithHer
        ),
        HerAct<AccountEvent>(nameof(AccountEvent.ActorPersonId)),
        HerAct<Invitation>(nameof(Invitation.IssuedByPersonId)),
        HerAct<Membership>(nameof(Membership.AdmittedByPersonId)),
        HerAct<Person>(nameof(Person.ContactChangedByPersonId)),
        HerAct<Person>(nameof(Person.ArchivedByPersonId)),
        HerAct<MediaItem>(nameof(MediaItem.UploadedByPersonId)),
        HerAct<NewsPost>(nameof(NewsPost.LastSavedByPersonId)),
        HerAct<WebsitePicture>(nameof(WebsitePicture.UpdatedByPersonId)),
        HerAct<ActCoEditor>(nameof(ActCoEditor.GrantedByPersonId)),
        HerAct<ChoreographyVersion>(nameof(ChoreographyVersion.SavedByPersonId)),
        HerAct<AttendanceResponse>(nameof(AttendanceResponse.RecordedByPersonId)),
        HerAct<AttendanceResponseChange>(nameof(AttendanceResponseChange.RecordedByPersonId)),
    ];

    [Pure]
    public static IReadOnlyList<string> DisagreementsWith(IModel model)
    {
        var foreignKeys = model
            .FindEntityType(typeof(Person))!
            .GetReferencingForeignKeys()
            .ToList();

        return
        [
            .. foreignKeys
                .Where(foreignKey => ClassificationOf(foreignKey) is null)
                .Select(foreignKey => $"{NameOf(foreignKey)} is not classified"),
            .. foreignKeys
                .Select(foreignKey =>
                    (ForeignKey: foreignKey, Reference: ClassificationOf(foreignKey))
                )
                .Where(pair =>
                    pair.Reference is { } reference
                    && pair.ForeignKey.DeleteBehavior != DeleteBehaviorOf(reference.OnErasure)
                )
                .Select(pair =>
                    $"{pair.Reference!.Name} is {pair.Reference.OnErasure} but its foreign key "
                    + $"says {pair.ForeignKey.DeleteBehavior}"
                ),
            .. All.Where(reference => !foreignKeys.Any(foreignKey => Names(foreignKey, reference)))
                .Select(reference => $"{reference.Name} is no foreign key to a person"),
        ];
    }

    [Pure]
    private static ReferenceToPerson HerOwn<TEntity>(string property) =>
        Reference<TEntity>(property, OnAbsorption.BlocksIt, OnErasure.ErasedWithHer);

    [Pure]
    private static ReferenceToPerson HerAct<TEntity>(string property) =>
        Reference<TEntity>(property, OnAbsorption.MovesToKeeper, OnErasure.KeptNamingNobody);

    [Pure]
    private static ReferenceToPerson Reference<TEntity>(
        string property,
        OnAbsorption onAbsorption,
        OnErasure onErasure
    ) => new(typeof(TEntity), property, onAbsorption, onErasure);

    [Pure]
    private static ReferenceToPerson? ClassificationOf(IReadOnlyForeignKey foreignKey) =>
        All.SingleOrDefault(reference => Names(foreignKey, reference));

    [Pure]
    private static bool Names(IReadOnlyForeignKey foreignKey, ReferenceToPerson reference) =>
        foreignKey.DeclaringEntityType.ClrType == reference.Entity
        && foreignKey.Properties is [var property]
        && property.Name == reference.Property;

    [Pure]
    private static string NameOf(IReadOnlyForeignKey foreignKey) =>
        $"{foreignKey.DeclaringEntityType.ClrType.Name}."
        + string.Join("+", foreignKey.Properties.Select(property => property.Name));

    [Pure]
    private static DeleteBehavior DeleteBehaviorOf(OnErasure onErasure) =>
        onErasure == OnErasure.ErasedWithHer ? DeleteBehavior.Cascade : DeleteBehavior.SetNull;
}
