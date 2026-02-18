namespace TyperacerAPI.Services;

public interface IWordService
{
    string[] GenerateWords(int count);
}

public class WordService : IWordService
{
    private static readonly string[] CommonWords =
    [
        "the", "be", "to", "of", "and", "a", "in", "that", "have", "I",
        "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
        "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
        "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
        "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
        "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
        "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
        "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
        "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
        "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
        "world", "very", "through", "form", "much", "great", "where", "help",
        "long", "things", "place", "point", "right", "down", "same", "another", "found",
        "study", "still", "learn", "should", "system", "every", "city", "tree", "cross", "farm",
        "hard", "start", "might", "story", "being", "left", "once", "book", "heard", "white",
        "without", "second", "later", "miss", "idea", "enough", "eat", "face", "watch", "last",
        "door", "between", "never", "really", "almost", "along", "let", "father", "keep", "food",
        "important", "young", "those", "seem", "name", "nothing", "example", "paper", "group", "always",
        "music", "quickly", "write", "move", "run", "feet", "read", "hand", "such", "old",
        "too", "under", "home", "away", "here", "part", "add", "did", "each", "body",
        "school", "area", "house", "turn", "water", "high", "air", "against", "answer", "while"
    ];

    public string[] GenerateWords(int count)
    {
        var random = Random.Shared;
        var shuffled = CommonWords.OrderBy(_ => random.Next()).ToArray();
        return shuffled.Take(Math.Min(count, shuffled.Length)).ToArray();
    }
}
