const Database = require('better-sqlite3');
const db = new Database('movieDB.db');
const {v4: uuidv4} = require('uuid');
let movies = require('./data/movie-data/movie-data-2500.json');

let people = {};

let users = [{
	name: "mromarkhan", 
	password: "12345",
	accountType: 1, 
	following: ["Elijah Wood", "Robb Wells", "Adam Sandler", "Peter Jackson"], 
	userFollowing: ["davemckenney", "seanbenjamin"], 
	watchedMovies: [],
    reviews: [],
	notifications: []
}, {
    name: "davemckenney",
	password: "lotr",
	accountType: 1,
	following: ["Elijah Wood", "Sandra Bullock", "Adam Sandler"],
	userFollowing: ["mromarkhan", "seanbenjamin"], 
	watchedMovies: [],
    reviews: [],
	notifications: []
}, {
    name: "seanbenjamin",
	password: "labcoordinator",
	accountType: 1, 
	following: ["Morgan Freeman", "Ashley Judd", "Cary Elwes", "Alex McArthur"], 
	userFollowing: ["mromarkhan", "davemckenney"], 
	watchedMovies: [],
    reviews: [],
	notifications: []
}, {
    name: "yizhang",
	password: "cao",
	accountType: 0, 
	following: ["Morgan Freeman", "Ashley Judd", "Cary Elwes", "Alex McArthur"], 
	userFollowing: ["mromarkhan", "davemckenney", "seanbenjamin"], 
	watchedMovies: [],
    reviews: [],
	notifications: []
}, {
    name: "bruce",
	password: "fernandes",
	accountType: 0, 
	following: ["Morgan Freeman", "Ashley Judd", "Cary Elwes", "Alex McArthur"], 
	userFollowing: ["mromarkhan", "davemckenney", "seanbenjamin"], 
	watchedMovies: [],
    reviews: [],
	notifications: []
}, {
    name: "omar",
	password: "flores",
	accountType: 0, 
	following: ["Morgan Freeman", "Ashley Judd", "Cary Elwes", "Alex McArthur"], 
	userFollowing: ["mromarkhan", "davemckenney", "seanbenjamin"], 
	watchedMovies: [],
    reviews: [],
	notifications: []
}, {
    name: "raahim",
	password: "ghauri",
	accountType: 0, 
	following: ["Morgan Freeman", "Ashley Judd", "Cary Elwes", "Alex McArthur"], 
	userFollowing: ["mromarkhan", "davemckenney", "seanbenjamin"], 
	watchedMovies: [],
    reviews: [],
	notifications: []
}, {
    name: "victor",
	password: "litzanov",
	accountType: 0, 
	following: ["Morgan Freeman", "Ashley Judd", "Cary Elwes", "Alex McArthur"], 
	userFollowing: ["mromarkhan", "davemckenney", "seanbenjamin"], 
	watchedMovies: [],
    reviews: [],
	notifications: []
}, {
    name: "patrick",
	password: "mckay",
	accountType: 0, 
	following: ["Morgan Freeman", "Ashley Judd", "Cary Elwes", "Alex McArthur"], 
	userFollowing: ["mromarkhan", "davemckenney", "seanbenjamin"], 
	watchedMovies: [],
    reviews: [],
	notifications: []
}, {
    name: "erica",
	password: "morgan",
	accountType: 0, 
	following: ["Morgan Freeman", "Ashley Judd", "Cary Elwes", "Alex McArthur"], 
	userFollowing: ["mromarkhan", "davemckenney", "seanbenjamin"], 
	watchedMovies: [],
    reviews: [],
	notifications: []
}, {
    name: "temitayo",
	password: "oyelowo",
	accountType: 0, 
	following: ["Morgan Freeman", "Ashley Judd", "Cary Elwes", "Alex McArthur"], 
	userFollowing: ["mromarkhan", "davemckenney", "seanbenjamin"], 
	watchedMovies: [],
    reviews: [],
	notifications: []
}, {
    name: "shriya",
	password: "satish",
	accountType: 0, 
	following: ["Morgan Freeman", "Ashley Judd", "Cary Elwes", "Alex McArthur"], 
	userFollowing: ["mromarkhan", "davemckenney", "seanbenjamin"], 
	watchedMovies: [],
    reviews: [],
	notifications: []
}, {
    name: "ammar",
	password: "tosun",
	accountType: 0, 
	following: ["Morgan Freeman", "Ashley Judd", "Cary Elwes", "Alex McArthur"], 
	userFollowing: ["mromarkhan", "davemckenney", "seanbenjamin"], 
	watchedMovies: [],
    reviews: [],
	notifications: []
}, {
    name: "wal",
	password: "wal",
	accountType: 0, 
	following: ["Morgan Freeman", "Ashley Judd", "Cary Elwes", "Alex McArthur"], 
	userFollowing: ["mromarkhan", "davemckenney", "seanbenjamin"], 
	watchedMovies: [],
    reviews: [],
	notifications: []
}]

for (let i = 0; i < movies.length; i++) {
    for (let j = 0; j < movies[i].Director.length; j++) {
        let x = String(movies[i].Director[j]);
        if (people.hasOwnProperty(x)) {
            people[x].director.push(movies[i].Title);
        } else {
            people[x] = {
                director: [movies[i].Title],
                writer: [],
                actor: [],
                collabs: [],
                frequentCollabs: {}
            }
        }
        let movieCollabs = movies[i].Director.concat(movies[i].Actors, movies[i].Writer);
        movieCollabs = Array.from([...new Set(movieCollabs)]);
        people[x].collabs = people[x].collabs.concat(movieCollabs);
    }
    for (let j = 0; j < movies[i].Writer.length; j++) {
        let x = movies[i].Writer[j];
        if (people.hasOwnProperty(x)) {
            people[x].writer.push(movies[i].Title);
        } else {
            people[x] = {
                director: [],
                writer: [movies[i].Title],
                actor: [],
                collabs: [],
                frequentCollabs: {}
            }
        }
        let movieCollabs = movies[i].Director.concat(movies[i].Actors, movies[i].Writer);
        movieCollabs = Array.from([...new Set(movieCollabs)]);
        people[x].collabs = people[x].collabs.concat(movieCollabs);
    }
    for (let j = 0; j < movies[i].Actors.length; j++) {
        let x = movies[i].Actors[j];
        if (people.hasOwnProperty(x)) {
            people[x].actor.push(movies[i].Title);
        } else {
            people[x] = {
                director: [],
                writer: [],
                actor: [movies[i].Title],
                collabs: [],
                frequentCollabs: {}
            }
        }
        let movieCollabs = movies[i].Director.concat(movies[i].Actors, movies[i].Writer);
        movieCollabs = Array.from([...new Set(movieCollabs)]);
        people[x].collabs = people[x].collabs.concat(movieCollabs);
    }
}

let peopleNames = Object.keys(people);

for (let i = 0; i < peopleNames.length; i++) {
    let x = peopleNames[i];
    for (let j = 0; j < people[x].collabs.length; j++) {
        if(people[x].frequentCollabs.hasOwnProperty(people[x].collabs[j].replace(/\./g, "-"))) {
            people[x].frequentCollabs[people[x].collabs[j].replace(/\./g, "-")] += 1;
        } else {
            people[x].frequentCollabs[String(people[x].collabs[j]).replace(/\./g, "-")] = 1;
        }
    }
    let counted = Object.entries(people[x].frequentCollabs);
    counted.sort(function(a, b) {
        return a[1] - b[1];
    });
    people[x].frequentCollabs = {};
    counted.forEach(function(item){
        people[x].frequentCollabs[item[0]]=item[1]
    })
}
for (let i = 0; i < peopleNames.length; i++) {
    let x = peopleNames[i];
    if (people[x].frequentCollabs.hasOwnProperty(x)) {
        delete people[x].frequentCollabs[x];
    }
}

for (let i = 0; i < peopleNames.length; i++) {
    people[peopleNames[i]].name = peopleNames[i];
}
let peopleArray = Object.values(people);

const moviesTrans = db.transaction(() => {
    //Creating all tables
    db.prepare(`drop table if exists movies;`).run();
    db.prepare(`create table if not exists movies(
            mID text primary key not null,
            Title text not null,
            Year text not null,
            Rated,
            Released,
            Runtime,
            Plot,
            Awards,
            Poster text not null);`
    ).run();
    db.prepare(`drop table if exists genres;`).run();
    db.prepare(`create table if not exists genres (genre, mID text,  primary key (genre, mID))`).run();
    db.prepare(`drop table if exists people`).run();
    db.prepare(`create table if not exists people (name text primary key not null)`).run();
    db.prepare(`drop table if exists peopleRoles`).run();
    db.prepare(`create table if not exists peopleRoles (name text, mID text, role text, primary key (name, mID, role))`).run();
    db.prepare(`drop table if exists peopleCollabs`).run();
    db.prepare(`create table if not exists peopleCollabs (name text, collab text, numMovies integer, primary key(name, collab))`).run();
    db.prepare(`drop table if exists users`).run();
    db.prepare(`create table if not exists users (username text primary key not null, password text not null, accountType integer not null)`).run();
    db.prepare(`drop table if exists userFollows`).run();
    db.prepare(`create table if not exists userFollows (username text, follows text, primary key(username, follows))`).run();
    db.prepare(`drop table if exists peopleFollows`).run();
    db.prepare(`create table if not exists peopleFollows (username text, personName text, primary key(username, personName))`).run();
    db.prepare(`drop table if exists watchedMovies`).run();
    db.prepare(`create table if not exists watchedMovies (username text, mID text, primary key(username, mID))`).run();
    db.prepare(`drop table if exists reviews`).run();
    db.prepare(`create table if not exists reviews (mID text, reviewNo integer not null, rating integer, summary text, description text, username text, primary key(mID, reviewNo))`).run();

    //Setting up prepared insert statements for tables
    let insertMovie = db.prepare(`insert into movies values(?, @Title, @Year, @Rated, @Released, @Runtime, @Plot, @Awards, @Poster);`);
    let insertGenre = db.prepare(`insert into genres values (?, ?)`);
    let insertPerson = db.prepare(`insert or ignore into people values (?)`);
    let insertRoles = db.prepare(`insert into peopleRoles values (?, ?, ?)`);
    let insertCollabs = db.prepare(`insert into peopleCollabs values (?, ?, ?)`);
    let insertUser = db.prepare(`insert into users values (?, ?, ?)`);
    let insertUserFollow = db.prepare(`insert into userFollows values (?, ?)`);
    let insertPeopleFollow = db.prepare(`insert into peopleFollows values (?, ?)`);

    //Inserting data into tables
    for (const movie of movies) {
        var id = uuidv4();
        insertMovie.run(id, movie);
        for (const genre of movie.Genre) insertGenre.run(genre, id);
        for (const person of movie.Director) {
            insertPerson.run(person);
            insertRoles.run(person, id, 'Director');
        }
        for (const person of movie.Writer) {
            insertPerson.run(person);
            insertRoles.run(person, id, 'Writer');
        }
        for (const person of movie.Actors) {
            insertPerson.run(person);
            insertRoles.run(person, id, 'Actor');
        }
    }
    for (const person of peopleArray) {
        let collabs = Object.keys(person.frequentCollabs);
        for (const collab of collabs) {
            insertCollabs.run(person.name, collab, person.frequentCollabs[collab]);
        }
    }
    for (const user of users) {
        insertUser.run(user.name, user.password, user.accountType);
        for (const userFollow of user.userFollowing) {
            insertUserFollow.run(user.name, userFollow);
        }
        for (const person of user.following) {
            insertPeopleFollow.run(user.name, person);
        }
    }
    
});
moviesTrans();
