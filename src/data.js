// Sample database used by every challenge. Small enough to reason about,
// rich enough to practice CRUD, operators, arrays, and aggregation.
//
// Collections: movies, users, reviews
// reviews.movie_id -> movies._id   (for $lookup joins)
// reviews.user_id  -> users._id
// users.favorites  -> [movies._id] (array membership practice)

export const collections = {
  movies: [
    { _id: 1,  title: "The Matrix",        year: 1999, genres: ["Action", "Sci-Fi"],            rating: 8.7, runtime: 136, director: "Lana Wachowski", type: "movie",  languages: ["English"],            countries: ["USA"],           boxOffice: 466,  awards: { wins: 42,  nominations: 52  }, cast: ["Keanu Reeves", "Carrie-Anne Moss", "Laurence Fishburne"] },
    { _id: 2,  title: "Inception",         year: 2010, genres: ["Action", "Sci-Fi", "Thriller"], rating: 8.8, runtime: 148, director: "Christopher Nolan", type: "movie",  languages: ["English", "Japanese"], countries: ["USA", "UK"],     boxOffice: 829,  awards: { wins: 157, nominations: 220 }, cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"] },
    { _id: 3,  title: "Parasite",          year: 2019, genres: ["Comedy", "Drama", "Thriller"],  rating: 8.5, runtime: 132, director: "Bong Joon-ho",     type: "movie",  languages: ["Korean"],             countries: ["South Korea"],   boxOffice: 258,  awards: { wins: 306, nominations: 271 }, cast: ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong"] },
    { _id: 4,  title: "Spirited Away",     year: 2001, genres: ["Animation", "Adventure"],       rating: 8.6, runtime: 125, director: "Hayao Miyazaki",   type: "movie",  languages: ["Japanese"],           countries: ["Japan"],         boxOffice: 396,  awards: { wins: 58,  nominations: 33  }, cast: ["Rumi Hiiragi", "Miyu Irino"] },
    { _id: 5,  title: "The Dark Knight",   year: 2008, genres: ["Action", "Crime", "Drama"],     rating: 9.0, runtime: 152, director: "Christopher Nolan", type: "movie",  languages: ["English"],            countries: ["USA", "UK"],     boxOffice: 1005, awards: { wins: 159, nominations: 163 }, cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"] },
    { _id: 6,  title: "Pulp Fiction",      year: 1994, genres: ["Crime", "Drama"],               rating: 8.9, runtime: 154, director: "Quentin Tarantino", type: "movie",  languages: ["English"],            countries: ["USA"],           boxOffice: 213,  awards: { wins: 69,  nominations: 75  }, cast: ["John Travolta", "Uma Thurman", "Samuel L. Jackson"] },
    { _id: 7,  title: "Interstellar",      year: 2014, genres: ["Adventure", "Drama", "Sci-Fi"], rating: 8.7, runtime: 169, director: "Christopher Nolan", type: "movie",  languages: ["English"],            countries: ["USA", "UK"],     boxOffice: 701,  awards: { wins: 44,  nominations: 148 }, cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"] },
    { _id: 8,  title: "Coco",              year: 2017, genres: ["Animation", "Adventure", "Comedy"], rating: 8.4, runtime: 105, director: "Lee Unkrich",   type: "movie",  languages: ["English", "Spanish"], countries: ["USA"],           boxOffice: 807,  awards: { wins: 109, nominations: 42  }, cast: ["Anthony Gonzalez", "Gael Garcia Bernal"] },
    { _id: 9,  title: "Whiplash",          year: 2014, genres: ["Drama", "Music"],               rating: 8.5, runtime: 106, director: "Damien Chazelle",  type: "movie",  languages: ["English"],            countries: ["USA"],           boxOffice: 49,   awards: { wins: 96,  nominations: 143 }, cast: ["Miles Teller", "J.K. Simmons"] },
    { _id: 10, title: "Your Name",         year: 2016, genres: ["Animation", "Drama", "Romance"], rating: 8.4, runtime: 106, director: "Makoto Shinkai",  type: "movie",  languages: ["Japanese"],           countries: ["Japan"],         boxOffice: 358,  awards: { wins: 15,  nominations: 20  }, cast: ["Ryunosuke Kamiki", "Mone Kamishiraishi"] },
    { _id: 11, title: "Breaking Bad",      year: 2008, genres: ["Crime", "Drama", "Thriller"],   rating: 9.5, runtime: 49,  director: "Vince Gilligan",   type: "series", languages: ["English"],            countries: ["USA"],           boxOffice: 0,    awards: { wins: 152, nominations: 239 }, cast: ["Bryan Cranston", "Aaron Paul"] },
    { _id: 12, title: "The Godfather",     year: 1972, genres: ["Crime", "Drama"],               rating: 9.2, runtime: 175, director: "Francis Ford Coppola", type: "movie", languages: ["English", "Italian"], countries: ["USA"],       boxOffice: 246,  awards: { wins: 30,  nominations: 31  }, cast: ["Marlon Brando", "Al Pacino", "James Caan"] },
    { _id: 13, title: "La La Land",        year: 2016, genres: ["Comedy", "Drama", "Music", "Romance"], rating: 8.0, runtime: 128, director: "Damien Chazelle", type: "movie", languages: ["English"],       countries: ["USA"],           boxOffice: 447,  awards: { wins: 244, nominations: 292 }, cast: ["Ryan Gosling", "Emma Stone"] },
    { _id: 14, title: "Oldboy",            year: 2003, genres: ["Action", "Drama", "Thriller"],  rating: 8.3, runtime: 120, director: "Park Chan-wook",   type: "movie",  languages: ["Korean"],             countries: ["South Korea"],   boxOffice: 15,   awards: { wins: 34,  nominations: 22  }, cast: ["Choi Min-sik", "Yoo Ji-tae"] },
    { _id: 15, title: "Stranger Things",   year: 2016, genres: ["Drama", "Fantasy", "Horror"],   rating: 8.7, runtime: 51,  director: "The Duffer Brothers", type: "series", languages: ["English"],        countries: ["USA"],           boxOffice: 0,    awards: { wins: 65,  nominations: 175 }, cast: ["Millie Bobby Brown", "Finn Wolfhard", "Winona Ryder"] }
  ],

  users: [
    { _id: 101, name: "Ava Chen",      age: 28, city: "Seattle",   membership: "premium", joined: 2019, favorites: [1, 2, 5, 7] },
    { _id: 102, name: "Liam Novak",    age: 34, city: "Austin",    membership: "free",    joined: 2021, favorites: [3, 14] },
    { _id: 103, name: "Mia Rossi",     age: 22, city: "Seattle",   membership: "premium", joined: 2022, favorites: [4, 10, 8] },
    { _id: 104, name: "Noah Kim",      age: 41, city: "Toronto",   membership: "premium", joined: 2018, favorites: [5, 6, 12] },
    { _id: 105, name: "Zoe Ahmed",     age: 19, city: "London",    membership: "free",    joined: 2023, favorites: [2, 13] },
    { _id: 106, name: "Ethan Park",    age: 30, city: "Austin",    membership: "free",    joined: 2020, favorites: [] },
    { _id: 107, name: "Sofia Garcia",  age: 26, city: "Toronto",   membership: "premium", joined: 2021, favorites: [8, 9, 13, 10] },
    { _id: 108, name: "Lucas Meyer",   age: 37, city: "London",    membership: "free",    joined: 2017, favorites: [11, 15] }
  ],

  reviews: [
    { _id: 1001, movie_id: 1,  user_id: 101, stars: 5, likes: 120, text: "Redefined sci-fi.",              tags: ["classic", "mindbending"] },
    { _id: 1002, movie_id: 2,  user_id: 101, stars: 5, likes: 88,  text: "A dream within a dream.",        tags: ["mindbending"] },
    { _id: 1003, movie_id: 2,  user_id: 105, stars: 4, likes: 15,  text: "Loud but brilliant.",            tags: ["rewatch"] },
    { _id: 1004, movie_id: 3,  user_id: 102, stars: 5, likes: 200, text: "Deserved every award.",          tags: ["classic", "social"] },
    { _id: 1005, movie_id: 5,  user_id: 104, stars: 5, likes: 340, text: "Ledger is unforgettable.",       tags: ["classic"] },
    { _id: 1006, movie_id: 5,  user_id: 101, stars: 4, likes: 50,  text: "Best superhero film.",           tags: ["rewatch"] },
    { _id: 1007, movie_id: 6,  user_id: 104, stars: 5, likes: 77,  text: "Tarantino at his peak.",         tags: ["classic"] },
    { _id: 1008, movie_id: 7,  user_id: 101, stars: 4, likes: 60,  text: "Emotional and grand.",           tags: ["rewatch"] },
    { _id: 1009, movie_id: 8,  user_id: 103, stars: 5, likes: 45,  text: "Made me cry.",                   tags: ["family"] },
    { _id: 1010, movie_id: 9,  user_id: 107, stars: 5, likes: 66,  text: "Intense from start to finish.",  tags: [] },
    { _id: 1011, movie_id: 13, user_id: 107, stars: 3, likes: 12,  text: "Beautiful but overhyped.",       tags: ["rewatch"] },
    { _id: 1012, movie_id: 4,  user_id: 103, stars: 5, likes: 150, text: "Pure magic.",                    tags: ["family", "classic"] },
    { _id: 1013, movie_id: 11, user_id: 108, stars: 5, likes: 410, text: "Greatest series ever.",          tags: ["classic", "bingeable"] },
    { _id: 1014, movie_id: 15, user_id: 108, stars: 4, likes: 90,  text: "Nostalgic and fun.",             tags: ["bingeable"] },
    { _id: 1015, movie_id: 12, user_id: 104, stars: 5, likes: 300, text: "The blueprint.",                 tags: ["classic"] }
  ]
};

// A short description of each collection, shown in the "Database" tab.
export const schema = {
  movies:  "_id, title, year, genres[], rating, runtime, director, type, languages[], countries[], boxOffice, awards{wins,nominations}, cast[]",
  users:   "_id, name, age, city, membership, joined, favorites[] (movie ids)",
  reviews: "_id, movie_id, user_id, stars, likes, text, tags[]"
};
