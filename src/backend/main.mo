import Text "mo:core/Text";
import Array "mo:core/Array";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Char "mo:core/Char";
import Int "mo:core/Int";
import Nat "mo:core/Nat";

actor {
  type SpamResult = {
    score : Nat;
    isSpam : Bool;
    confidence : Float;
    reasons : [Text];
    snippet : Text;
    timestamp : Int;
  };

  type HistoryEntry = {
    id : Nat;
    snippet : Text;
    isSpam : Bool;
    confidence : Float;
    timestamp : Int;
  };

  // Keyword definitions
  let financialKeywords = [
    "free money",
    "winner",
    "prize",
    "lottery",
    "claim",
    "guaranteed",
    "no risk",
    "investment",
    "bank",
    "credit card",
    "account",
    "wire transfer",
    "inheritance",
    "check",
    "cheque",
  ];

  let phishingKeywords = [
    "verify account",
    "click here",
    "password",
    "login",
    "confirm",
    "update information",
    "security alert",
    "unauthorized",
    "access",
    "breach",
    "urgent action",
  ];

  let urgencyKeywords = [
    "act now",
    "limited time",
    "expires",
    "urgent",
    "immediate",
    "only",
    "last chance",
    "exclusive",
    "offer",
    "hurry",
    "sale",
  ];

  let pharmaKeywords = [
    "pills",
    "medication",
    "viagra",
    "cialis",
    "pharmacy",
    "prescription",
    "generic",
    "discount",
    "cure",
    "treatment",
  ];

  // Spam detection function
  public shared ({ caller }) func analyzeMessage(text : Text) : async SpamResult {
    let timestamp = Time.now();
    let lowerText = text.toLower();
    let snippet = if (text.size() > 100) { text.toArray().sliceToArray(0, 100).toText() } else { text };

    let reasons = List.empty<Text>();
    var score = 0;

    // Keyword checks
    checkKeywords("financial", financialKeywords, lowerText, reasons);
    checkKeywords("phishing", phishingKeywords, lowerText, reasons);
    checkKeywords("urgency", urgencyKeywords, lowerText, reasons);
    checkKeywords("pharmaceutical", pharmaKeywords, lowerText, reasons);

    // Scoring and threshold
    score := reasons.size().toNat() * 10;
    let isSpam = score > 50;
    let confidence = if (score > 100) { 1.0 } else { score.toFloat() / 100.0 };

    // SpamResult
    {
      score;
      isSpam;
      confidence;
      reasons = reasons.toArray();
      snippet;
      timestamp;
    };
  };

  func checkKeywords(category : Text, keywords : [Text], text : Text, reasons : List.List<Text>) {
    for (keyword in keywords.values()) {
      if (text.contains(#text keyword)) {
        reasons.add("contains " # category # " keyword: " # keyword);
      };
    };
  };

  public query ({ caller }) func getHistory() : async [HistoryEntry] {
    Runtime.trap("Feature not implemented");
  };

  public shared ({ caller }) func clearHistory() : async () {
    Runtime.trap("Feature not implemented");
  };
};
