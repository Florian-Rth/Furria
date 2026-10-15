using System.Diagnostics.Contracts;

namespace Furria.Application.Registry;

public sealed class PersonHonoursLookup
{
    private readonly IReadOnlyDictionary<int, PersonHonoursDetails> _byPerson;

    public PersonHonoursLookup(IReadOnlyDictionary<int, PersonHonoursDetails> byPerson)
    {
        _byPerson = byPerson;
    }

    [Pure]
    public PersonHonoursDetails Of(int personId) =>
        _byPerson.GetValueOrDefault(personId, PersonHonoursDetails.None);
}
