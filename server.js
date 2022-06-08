const http = require('http');
const pug = require("pug");
const fs = require("fs");
const express = require('express');
const session = require('express-session');
let app = express();

const Database = require('better-sqlite3');
const { query } = require('express');
const db = new Database('movieDB.db');

app.use(express.json());
app.use(express.static("./views/public"));
app.use(session({
	cookie: {
		maxAge: 500000
	},
	secret: "secret key"
}));
app.use(express.urlencoded({extended:true}));

//Movie requests
app.get("/movies", (request, response) => {
    let pageHeader = "List of all Movies";
    let query = request.query.title || ""
    let searchQuery = {
        title: '%' + (query) + '%'
    } 
	//let genre = request.query.genre || "";
	//let actor = request.query.actor || "";
	let pageNumber = parseInt(request.query.page) || 1;
	/*searchQuery.Title = {$regex:title,$options:'i'};
	searchQuery.Genre = {$regex:genre,$options:'i'};
	searchQuery.Actors = {$regex:actor,$options:'i'};
	if (searchQuery.Title == '') {
		delete searchQuery.Title;
	}
	if (searchQuery.Genre == '') {
		delete searchQuery.Genre;
	}
	if (searchQuery.Actors == '') {
		delete searchQuery.Actors;
	}*/
    results = db.prepare(`select * from movies where (Title like @title) collate nocase`).all(searchQuery);
    if (query != "") {
        pageHeader = `Top Search Results for "${query}"`;
    }
    response.status(200);
	response.contentType(".html");
	results = results.slice((pageNumber-1)*25,(pageNumber*25)-1);
	response.send(pug.renderFile("views/pages/movies.pug", {movies:results, title:pageHeader, page:pageNumber}))
});

app.get("/movies/:id", (request, response)=> {
	let averageScore = 0;
	//recommendedMovies = [];
	let mID = request.params.id;

    //constructing movie object fully to send to template engine
    let movieInfo = db.prepare(`select * from movies where mID = ?`).all(mID);
    let genreQuery = db.prepare(`select genre from genres where mID = ?`).all(mID);
    let directorQuery = db.prepare(`select name from peopleRoles where (mID = ? and role = 'Director')`).all(mID);
    let writerQuery = db.prepare(`select name from peopleRoles where (mID = ? and role = 'Writer')`).all(mID);
    let actorQuery = db.prepare(`select name from peopleRoles where (mID = ? and role = 'Actor')`).all(mID);
    let watchQuery = db.prepare(`select mID, Title from watchedMovies natural join movies where username = ?`).all(request.session.username);
    
    if (movieInfo.length != 1) {
        response.status(404).send("Unknown ID");
		return;
    } else {
        movieInfo = movieInfo[0];
        movieInfo['Genre'] = [];
        movieInfo['Director'] = [];
        movieInfo['Writer'] = [];
        movieInfo['Actors'] = [];
    }
    for (genre of genreQuery) {
        movieInfo['Genre'].push(genre.genre);
    }
    for (director of directorQuery) {
        movieInfo['Director'].push(director.name);
    }
    for (writer of writerQuery) {
        movieInfo['Writer'].push(writer.name);
    }
    for (actor of actorQuery) {
        movieInfo['Actors'].push(actor.name);
    }
    let user;
    if (!request.session.loggedIn) {
        user = "guest";
    } else {
        user = {
            usernsame: request.session.username,
            watchedMovies: []
        };
        for (movie of watchQuery) {
            let obj = db.prepare(`select mID, Title from movies where mID = ?`).all(movie.mID);
            if (obj.length != 0) {
                user.watchedMovies.push(obj[0]);
            }
        }
    }
    let targetReviews = db.prepare(`select * from reviews where mID = ?`).all(mID); 
    for (review of targetReviews) {
        averageScore += review.rating;
    }
    if (averageScore != 0) {
        averageScore = (averageScore/targetReviews.length).toFixed(1);
    } else {
        if (targetReviews.length == 0) {
            averageScore = -1;
        }
    }

    response.status(200);
    response.send(pug.renderFile("./views/pages/movie.pug", {movie: movieInfo, reviews: targetReviews, rating: averageScore, currentUser: user, similarMovies: []}));
});

app.post("/movies", (request, response) => {
    let newMovie = request.body;
    console.log(newMovie);
    //check if user is logged in and thier accountType = 1
    //check if newMovie.movieInfo.Title does not exists in table movies
    //insert movie to movies table
    //insert writer director actors to peopleRoles table
    //send response
});

//User requests
app.get("/user/:username", (request, response) => {
    let userQuery = db.prepare(`select username, accountType from users where username = ?`);
    let followQuery = db.prepare(`select personName from peopleFollows where username = ?`);
    let userFollowQuery = db.prepare(`select follows from userFollows where username = ?`);
    let watchedQuery = db.prepare(`select mID, Title from watchedMovies natural join (select * from movies) where username = ?`);
    if (request.params.username == "self" || request.params.username == request.session.username) {
		if (request.session.loggedIn == true) {
            targetUser = userQuery.all(request.session.username)[0];
            following = followQuery.all(targetUser.username);
            userFollowing = userFollowQuery.all(targetUser.username);
            watchedMovies = watchedQuery.all(targetUser.username);
            targetUser['following'] = [];
            targetUser['userFollowing'] = [];
            targetUser['watchedMovies'] = watchedMovies;
            targetUser['notifications'] = [];
            for (follow of following) {
                targetUser['following'].push(follow.personName);
            }
            for (userFollow of userFollowing) {
                targetUser['userFollowing'].push(userFollow.follows);
            }
            response.contentType(".html");
			response.status(200).send(pug.renderFile("./views/pages/selfprofile.pug", {user: targetUser, recommended: []}));
        } else {
            response.status(401);
			response.redirect("/signinup.html");
        }
    } else {

        targetUser = userQuery.all(request.params.username);
        if (targetUser.length == 0) {
            response.status(404).send('Cannot find user "' + request.params.username + '". Probably because the user does not exist.');
            return;
        } else {
            targetUser = targetUser[0];
        }
        following = followQuery.all(targetUser.username);
        userFollowing = userFollowQuery.all(targetUser.username);
        watchedMovies = watchedQuery.all(targetUser.username);
        targetReviews = db.prepare(`select * from reviews natural join (select mID, Title from movies) where username = ?`).all(targetUser.username);
        targetUser['following'] = [];
        targetUser['userFollowing'] = [];
        targetUser['watchedMovies'] = watchedMovies;
        targetUser['notifications'] = [];
        for (follow of following) {
            targetUser['following'].push(follow.personName);
        }
        for (userFollow of userFollowing) {
            targetUser['userFollowing'].push(userFollow.follows);
        }
        let client = "guest";
        if (request.session.loggedIn) {
            client = userQuery.all(request.session.username)[0];
            clientsFollowing = followQuery.all(client.username);
            clientsUserFollowing = userFollowQuery.all(client.username);
            client['following'] = [];
            client['userFollowing'] = [];
            for (follow of clientsFollowing) {
                client['following'].push(follow.personName);
            }
            for (userFollow of clientsUserFollowing) {
                client['userFollowing'].push(userFollow.follows);
            }

        }

        response.contentType(".html");
		response.status(200).send(pug.renderFile("./views/pages/user.pug", {user: targetUser, reviews: targetReviews, currentUser: client}))
    }
});

app.post("/user/login", (request, response) => {
    if (request.session.loggedIn) {
		response.send("You are already logged in")
	} else {
        let user = request.body;
        let targetUser = db.prepare(`select * from users where username = ?`).all(user.username);
        if (targetUser.length != 0) {
            targetUser = targetUser[0];
            if (targetUser.password == user.password) {
                request.session.username = targetUser.username;
				request.session.loggedIn = true;
				response.status(200).send("You are now logged as the user: " + targetUser.username);
            } else {
                response.send("Incorrect Password");
				response.status(401);
            }
        } else {
            response.send("User can't be found");
			response.status(404)
        }
    }
});

app.post("/user/logout", (request, response) => {
    request.session.loggedIn = false;
	request.session.username = "";
	response.status(200).send("Successfully signed out");
});

app.post("/user", (request, response) => {
    let newUser = request.body;
    let query = db.prepare(`select username from users where username = ?`).all(newUser.name);
    if (query.length != 0) {
        response.status(409).send("This account already exists. Try signing in!");
        return;
    }
    db.prepare(`insert into users values (@name, @password, @accountType)`).run(newUser);
    if (request.session.loggedIn) {
        response.status(201).send("You are already logged in. New user has been successfully created.");
    } else {
        request.session.loggedIn = true;
        request.session.username = newUser.name;
        response.status(201).send("New user has been successfully created.");
    }
});

app.post("/user/watchedMovies", (request, response) => {
    let movie = request.body;
    if (!request.session.loggedIn) {
        response.send("You are not logged in. This shouldn't even be possible");
		response.status(401);
        return;
    }
    let query = db.prepare(`select mID from movies where mID = @id`).all(movie);
    if (query.length == 0) {
        response.status(404).send("Unknown ID");
		return;
    }
    db.prepare(`insert into watchedMovies values (?, ?)`).run(request.session.username, movie.id);
    response.send(movie.title + " has been added to your watched list!")
	response.status(200);
});

app.post("/user/accountType", (request, response) => {
    if (request.session.loggedIn) {
		db.prepare(`update users set accountType = ? where username = ?`).run(request.body.accountType, request.session.username);
		response.status(200);
		response.redirect("/user/self");
	} else {
		console.log("This shouldn't be possible");
		response.status(200);
		response.redirect("/user/self");
	}
});

app.post("/user/following", (request, response) => {
    let person = request.body;
    if (!request.session.loggedIn) {
        response.send("You are not logged in. This shouldn't be possible");
		response.status(401);
    }
    let query = db.prepare(`select * from peopleFollows where (username = ? and personName = ?)`).all(request.session.username, person.name);
    if (query.length != 0) {
        response.send("You are already following this person");
		response.status(404);
        return;
    }
    db.prepare(`insert into peopleFollows values (?, ?)`).run(request.session.username, person.name);
    response.status(200).send("Followed " + person.name);
});

app.post("/user/userFollowing", (request, response) => {
    let user = request.body;
    if (!request.session.loggedIn) {
        response.send("You are not logged in. This shouldn't be possible");
		response.status(401);
    }
    let query = db.prepare(`select * from userFollows where (username = ? and follows = ?)`).all(request.session.username, user.name);
    if (query.length != 0) {
        response.send("You are already following this user");
		response.status(404);
        return;
    }
    db.prepare(`insert into userFollows values (?, ?)`).run(request.session.username, user.name);
    response.status(200).send("Followed " + user.name);
});

app.delete("/user/watchedMovies", (request, response) => {
    let movie = request.body;
    if (!request.session.loggedIn) {
        response.send("You are not logged in. This shouldn't be possible");
		response.status(401);
    }
    db.prepare(`delete from watchedMovies where (username = ? and mID = ?)`).run(request.session.username, movie.id);
    response.status(200).send("Removed " + movie.title + " from your watched list.");
});

app.delete("/user/following", (request, response) => {
    let person = request.body;
    if (!request.session.loggedIn) {
        response.send("You are not logged in. This shouldn't be possible");
		response.status(401);
    }
    db.prepare(`delete from peopleFollows where (username = ? and personName = ?)`).run(request.session.username, person.name);
    response.status(200).send("Unfollowed " + person.name);
});

app.delete("/user/userFollowing", (request, response) => {
    let user = request.body;
    if (!request.session.loggedIn) {
        response.send("You are not logged in. This shouldn't be possible");
		response.status(401);
    }
    db.prepare(`delete from userFollows where (username = ? and follows = ?)`).run(request.session.username, user.name);
    response.status(200).send("Unfollowed " + user.name);
});

//People requests
app.get("/people", (request, response) => {
    let query = request.query.name || "";
    let keyword = '%' + query + '%';
    targetPeople = db.prepare(`select * from people where (name like ?) collate nocase`).all(keyword);
    response.contentType("application/json");
    response.send(JSON.stringify(targetPeople));
    response.status(200);
});

app.get("/people/:personname", (request, response) => {
    personName = request.params.personname
    let query = db.prepare(`select collab from peopleCollabs where name = ? order by numMovies DESC limit 5`).all(personName);
    let frequentCollabs = [];
    for (const collab of query) {
        frequentCollabs.push(collab.collab);
    }
    let targetPerson = {
        name: personName,
        frequentCollabs: frequentCollabs,
        director: db.prepare(`select mID, Title from peopleRoles natural join movies where name = ? and role = 'Director'`).all(personName),
        writer: db.prepare(`select mID, Title from peopleRoles natural join movies where name = ? and role = 'Writer'`).all(personName),
        actor: db.prepare(`select mID, Title from peopleRoles natural join movies where name = ? and role = 'Actor'`).all(personName)
    }
    let client = "guest";
    if (request.session.loggedIn) {
        client = db.prepare(`select username, accountType from users where username = ?`).all(request.session.username)[0];
        clientsFollowing = db.prepare(`select personName from peopleFollows where username = ?`).all(client.username);
        client['following'] = [];
        for (follow of clientsFollowing) {
            client['following'].push(follow.personName);
        }
    }
    response.status(200);
    response.contentType(".html");
    response.send(pug.renderFile("./views/pages/person.pug", {person: targetPerson, frequentCollabs: targetPerson.frequentCollabs, currentUser: client}));
});

app.post("/people", (request, response) => {
    let newPerson = request.body;
    if (!request.session.loggedIn) {
        response.send("You must be logged in as a contributing user to add people.");
		response.status(401);
        return;
    }
    let user = db.prepare('select accountType from users where username = ?').all(request.session.username);
    if (user.length == 0) {
        response.send("You must be logged in as a contributing user to add people.");
        response.status(403);
        return;
    } else if (user[0].accountType != 1) {
        response.send("You must be logged in as a contributing user to add people.");
        response.status(403);
        return;
    }
    let query = db.prepare(`select * from people where name = @name collate nocase`).all(newPerson);
    if (query.length != 0) {
        response.send("This person already exists in the database.")
        response.status(400);
        return;
    }
    db.prepare(`insert into people values (@name)`).run(newPerson);
    response.status(201).send(newPerson.name + " has been added to the database.");
});

//Review requests
app.get("/reviews/:mID/:reviewNo", (request, response) => {
    let review = db.prepare(`select * from reviews natural join (select mID, Title from movies) where mID = @mID and reviewNo = @reviewNo`).all(request.params);
    if (review.length != 0) {
        review = review[0];
    }
    response.status(200);
    response.contentType(".html");
    response.send(pug.renderFile("./views/pages/review.pug", {review: review}))
});

app.post("/reviews", (request, response) => {
    let newReview = request.body;
    let query = db.prepare(`select * from movies where mID = @mID`).all(newReview);
    if (query.length == 0) {
        console.log('Unknown mID');
        return;
    }
    if (!request.session.loggedIn) {
        response.send("Login or signup to write reviews.")
		response.status(401);
    }
    query = db.prepare(`select count(reviewNo) from reviews where mID = @mID`).all(newReview);
    let count = 0;
    if (query.length != 0) {
        count = query[0]['count(reviewNo)'];
    }
    newReview.count = count + 1;
    newReview.user = request.session.username;
    db.prepare(`insert into reviews values (@mID, @count, @txtScore, @txtSum, @txtReview, @user)`).run(newReview);
    response.status(201).send("Review has been added!");
});

app.listen(3000);
console.log("Server listening at http://localhost:3000");