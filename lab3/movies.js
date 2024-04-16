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
    populateMovies(jimCarrey, "Jim Carrey Movies");
    console.table(jimCarrey, 'title')
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
