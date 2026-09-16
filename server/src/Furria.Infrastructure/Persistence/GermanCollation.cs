namespace Furria.Infrastructure.Persistence;

// Decision AS: one spelling of the ICU collation. A seventh file typing "de_DE.icu" would sort
// almost right. The EF.Functions.Collate(...) calls in the query layer are deliberately redundant
// with the columns' UseCollation — do not remove them as dead weight.
public static class GermanCollation
{
    public const string Name = "de-DE-x-icu";
}
