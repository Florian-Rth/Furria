namespace Furria.Tests.Common;

// MET007 escape hatch. MET007 resolves builder aliases at class scope, so a test whose
// Add*("alias") declarations and IdOf/ClientFor/NameOf("alias") references both live in the
// same class needs no marker. Apply this to the rare class that seeds its aliases through a helper
// in a *different* class (a shared base or a static seed extension) which the purely-syntactic
// analyzer cannot follow — it suppresses the dangling-alias check for the whole annotated class.
[AttributeUsage(AttributeTargets.Class, Inherited = false)]
public sealed class SeedsAliasesAttribute : Attribute;
