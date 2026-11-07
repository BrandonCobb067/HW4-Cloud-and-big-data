// HW4 - Parts 1, 2, and 3
const transactions = db.getSiblingDB("rtr").transactions;

// Part 1 - Problem 1
print("Part 1 - Problem 1");
const count = transactions.countDocuments({user_id: {$in: ["420272", 420272]}});
print(JSON.stringify({user_id: "420272", transactions: count}, ["user_id", "transactions"], 2));

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
  print(JSON.stringify(result, ["user_id", "first_review"], 2));
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
  print(JSON.stringify(result, ["user_id", "category", "rentals", "avg_rating"], 2));
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
  print(JSON.stringify(result, ["item_id", "avg_rating", "reviews"], 2));
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
  print(JSON.stringify(result, ["item_id", "category", "mentions"], 2));
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
  print(JSON.stringify(result, ["word", "count"], 2));
});

// Part 3 - Problem 1
print("\nPart 3 - Problem 1");
// Get total valid records first to compute percentages
const totalRentals = transactions.countDocuments({"rented for": {$nin: [null, ""]}});

const problem7 = transactions.aggregate([
  {$match: {"rented for": {$nin: [null, ""]}}},
  {$group: {
    _id: "$rented for",
    count: {$sum: 1}
  }},
  {$sort: {count: -1}},
  {$project: {
    _id: 0,
    rented_for: "$_id",
    count: 1,
    pct: {$round: [{$multiply: [{$divide: ["$count", totalRentals]}, 100]}, 1]}
  }}
], {allowDiskUse: true});

problem7.forEach(function(result) {
  print(JSON.stringify(result, ["rented_for", "count", "pct"], 2));
});

// Part 3 - Problem 2
print("\nPart 3 - Problem 2");
const problem8 = transactions.aggregate([
  {$match: {review_date: {$nin: [null, ""]}}},
  {$project: {
    date: {$dateFromString: {dateString: "$review_date"}}
  }},
  {$project: {
    year: {$year: "$date"},
    month: {$month: "$date"}
  }},
  {$match: {year: 2016}},
  {$group: {
    _id: "$month",
    rentals: {$sum: 1}
  }},
  {$sort: {_id: 1}},
  {$project: {
    _id: 0,
    year: {$literal: 2016},
    month: "$_id",
    rentals: 1
  }}
], {allowDiskUse: true});

problem8.forEach(function(result) {
  print(JSON.stringify(result, ["year", "month", "rentals"], 2));
});

// Part 3 - Problem 3
print("\nPart 3 - Problem 3");
// Match valid user and date fields
const problem9 = transactions.aggregate([
  {$match: {
    user_id: {$nin: [null, ""]},
    review_date: {$nin: [null, ""]}
  }},
  {$project: {
    user_id: {$toString: "$user_id"},
    date: {$dateFromString: {dateString: "$review_date"}}
  }},
  // Truncate the transaction dates to the start of the month to simplify cohort math
  {$project: {
    user_id: 1,
    txn_month_date: {$dateTrunc: {date: "$date", unit: "month"}}
  }},
  // Group by user to find their cohort (first rental month) and all months they rented
  {$group: {
    _id: "$user_id",
    cohort_date: {$min: "$txn_month_date"},
    active_months: {$addToSet: "$txn_month_date"}
  }},
  // Check if they were active 1, 2, and 3 months after their cohort date
  {$project: {
    cohort: {$dateToString: {format: "%Y-%m", date: "$cohort_date"}},
    m1_active: {$in: [{$dateAdd: {startDate: "$cohort_date", unit: "month", amount: 1}}, "$active_months"]},
    m2_active: {$in: [{$dateAdd: {startDate: "$cohort_date", unit: "month", amount: 2}}, "$active_months"]},
    m3_active: {$in: [{$dateAdd: {startDate: "$cohort_date", unit: "month", amount: 3}}, "$active_months"]}
  }},
  // Group by the cohort month to aggregate retention counts
  {$group: {
    _id: "$cohort",
    size: {$sum: 1},
    m1_count: {$sum: {$cond: ["$m1_active", 1, 0]}},
    m2_count: {$sum: {$cond: ["$m2_active", 1, 0]}},
    m3_count: {$sum: {$cond: ["$m3_active", 1, 0]}}
  }},
  // Format percentages
  {$project: {
    _id: 0,
    cohort: "$_id",
    size: 1,
    m1_pct: {$round: [{$multiply: [{$divide: ["$m1_count", "$size"]}, 100]}, 1]},
    m2_pct: {$round: [{$multiply: [{$divide: ["$m2_count", "$size"]}, 100]}, 1]},
    m3_pct: {$round: [{$multiply: [{$divide: ["$m3_count", "$size"]}, 100]}, 1]}
  }},
  // Sort chronologically by cohort
  {$sort: {cohort: 1}}
], {allowDiskUse: true});

problem9.forEach(function(result) {
  print(JSON.stringify(result, ["cohort", "size", "m1_pct", "m2_pct", "m3_pct"], 2));
});
