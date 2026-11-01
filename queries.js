// HW4 - Parts 1 and 2
const transactions = db.getSiblingDB("rtr").transactions;

// Part 1 - Problem 1
print("Part 1 - Problem 1");
const count = transactions.countDocuments({user_id: {$in: ["420272", 420272]}});
printjson({user_id: "420272", transactions: count});

// Part 1 - Problem 2
print("\nPart 1 - Problem 2");
const problem2 = transactions.aggregate([
  {$match: {user_id: {$nin: [null, ""]}}},
  {$project: {
    user_id: {$toString: "$user_id"},
    review_date: {$dateFromString: {dateString: "$review_date"}}
  }},
  {$match: {review_date: {$ne: null}}},
  {$group: {_id: "$user_id", first_review: {$min: "$review_date"}}},
  {$sort: {first_review: 1, _id: 1}},
  {$limit: 10},
  {$project: {_id: 0, user_id: "$_id", first_review: 1}}
], {allowDiskUse: true});
problem2.forEach(function(result) {
  printjson(result);
});

// Part 1 - Problem 3
print("\nPart 1 - Problem 3");
const problem3 = transactions.aggregate([
  {$match: {user_id: {$nin: [null, ""]}, category: {$nin: [null, ""]}}},
  {$project: {
    user_id: {$toString: "$user_id"},
    category: 1,
    rating: {$convert: {input: "$rating", to: "double", onError: null, onNull: null}}
  }},
  {$group: {
    _id: {user_id: "$user_id", category: "$category"},
    rentals: {$sum: 1},
    avg_rating: {$avg: "$rating"}
  }},
  {$match: {rentals: {$gte: 3}, avg_rating: {$gte: 9}}},
  {$sort: {"_id.user_id": 1, "_id.category": 1}},
  {$project: {
    _id: 0,
    user_id: "$_id.user_id",
    category: "$_id.category",
    rentals: 1,
    avg_rating: {$round: ["$avg_rating", 2]}
  }}
], {allowDiskUse: true});
problem3.forEach(function(result) {
  printjson(result);
});

// Part 2 - Problem 1
print("\nPart 2 - Problem 1");
const problem4 = transactions.aggregate([
  {$match: {item_id: {$in: ["2260466", 2260466]}}},
  {$project: {
    item_id: {$toString: "$item_id"},
    rating: {$convert: {input: "$rating", to: "double", onError: null, onNull: null}}
  }},
  {$group: {_id: "$item_id", avg_rating: {$avg: "$rating"}, reviews: {$sum: 1}}},
  {$project: {
    _id: 0,
    item_id: "$_id",
    avg_rating: {$round: ["$avg_rating", 2]},
    reviews: 1
  }}
], {allowDiskUse: true});
problem4.forEach(function(result) {
  printjson(result);
});

// Part 2 - Problem 2
print("\nPart 2 - Problem 2");
const problem5 = transactions.aggregate([
  {$match: {
    item_id: {$nin: [null, ""]},
    review_text: {$regex: "zipper|pockets", $options: "i"}
  }},
  {$group: {
    _id: {$toString: "$item_id"},
    category: {$first: "$category"},
    mentions: {$sum: 1}
  }},
  {$sort: {mentions: -1, _id: 1}},
  {$limit: 5},
  {$project: {_id: 0, item_id: "$_id", category: 1, mentions: 1}}
], {allowDiskUse: true});
problem5.forEach(function(result) {
  printjson(result);
});

// Part 2 - Problem 3
print("\nPart 2 - Problem 3");
const stopWords = ["", "a", "an", "the", "and", "or", "to", "of", "in", "on", "for",
  "i", "it", "is", "was", "this", "that", "with", "my", "as", "at", "but", "so"];
const problem6 = transactions.aggregate([
  {$match: {category: "romper"}},
  {$project: {
    words: {$split: [{$toLower: {$ifNull: ["$review_text", ""]}}, " "]}
  }},
  {$unwind: "$words"},
  {$match: {words: {$nin: stopWords}}},
  {$group: {_id: "$words", count: {$sum: 1}}},
  {$sort: {count: -1, _id: 1}},
  {$limit: 10},
  {$project: {_id: 0, word: "$_id", count: 1}}
], {allowDiskUse: true});
problem6.forEach(function(result) {
  printjson(result);
});
