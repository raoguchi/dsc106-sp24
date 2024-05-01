/* This file starts out empty; you will be adding to it in Lab 3 */
async function populate() {
    const requestURL = 'https://dsc106.com/resources/data/movies.json';
    const request = new Request(requestURL);
    const response = await fetch(request);
    const movies = await response.json();

    console.log("Numbers of movies in the Webfilms collection: ",
Object.keys(movies).length);
    let jimCarrey = movies.filter(movie =>
        !movie.genres.includes("Comedy") &&
        !movie.genres.includes("Family") &&
        !movie.genres.includes('Animated') &&
         movie.cast.includes("Jim Carrey"));
    populateMovies(jimCarrey, "Serious Side of Jim Carrey");
    console.table(jimCarrey, 'title');

    console.log("Num movies Paris in Title: ",
Object.keys(movies).length);
    let cdg = movies.filter(movie =>
        movie.title.includes("Paris"));
    console.table(cdg.length);

    console.log("Num movies London in Title: ",
Object.keys(movies).length);
    let lhr = movies.filter(movie =>
        movie.title.includes("London"));
    console.log(lhr.length);

    console.log("Num movies New York in Title: ",
Object.keys(movies).length);
    let nyc = movies.filter(movie =>
        movie.title.includes("New York"));
    console.log(nyc.length);

    console.log("DR or RF Movies", 
Object.keys(movies).length);
    let dr_rf = movies.filter(movie =>
        (movie.cast.includes("Daniel Radcliffe") &&
        !movie.cast.includes("Ralph Fiennes")) ||
        (!movie.cast.includes("Daniel Radcliffe") &&
        movie.cast.includes("Ralph Fiennes")));
    populateMovies(dr_rf, "DR or RF Movies");
    console.table(dr_rf, "title");

    console.log("Total Adventure or Action Movies:",
Object.keys(movies).length);
    let tallys = {};
    movies.forEach(movie => {
        const decade = Math.floor(movie.year / 10) * 10;
        if (!tallys[decade]) {
            tallys[decade] = 0;
        }
        if (movie.title.includes("Adventure") || movie.title.includes("Exploration")) {
            tallys[decade]++;
        }
    });

    console.log(tallys)

}
populate();


function populateMovies(movies, categoryTitle) {
    const section = document.querySelector('section');
    const subsection = document.createElement('subsection');
    section.appendChild(subsection);
    const myH1 = document.createElement('h1');
    myH1.textContent = categoryTitle;
    subsection.appendChild(myH1);
    for (const movie of movies) {
        const myEntry = document.createElement('movie_entry');
        const myH2 = document.createElement('h2');
        const myPara2 = document.createElement('p');
        const myPara3 = document.createElement('p');
        const myPara4 = document.createElement('p');
        const myList = document.createElement('ul');
        myH2.textContent = movie.title;
        myPara2.textContent = `Year: ${movie.year}`;
        myPara3.textContent = 'Cast:';
        const castList = movie.cast;
        for (const actor of castList) {
          const listItem = document.createElement('li');
          listItem.textContent = actor;
          myList.appendChild(listItem);
        }       
        if (movie.genres) {
            myPara4.textContent = `Genres: ${movie.genres}`;
        }
        myEntry.appendChild(myH2);
        myEntry.appendChild(myPara2);
        myEntry.appendChild(myPara3);
        myEntry.appendChild(myList);
        myEntry.appendChild(myPara4);
        subsection.appendChild(myEntry);
      }
}
