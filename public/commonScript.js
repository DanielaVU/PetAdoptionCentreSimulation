function startDisplayingTimeAndDate(){ // calls the function displayDateAndTime, which updates the time and date, every 1 second (1000 milliseconds)
    displayDateAndTime(); // displays the time and date as soon as the page is loaded
    setInterval(displayDateAndTime, 1000); // displays the time and date every 1 second (1000 milliseconds)
}

function displayDateAndTime(){
    let date = new Date();

    let day = date.getDate();
    let month = date.getMonth();
    let year = date.getFullYear();

    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();

    if (seconds < 10) {
        seconds = "0" + seconds; // makes sure that the seconds are displayed with 2 digits (e.g. 01 instead of 1 in 14:57:01)
    }
    if (minutes < 10) {
        minutes = "0" + minutes; // makes sure that the minutes are displayed with 2 digits
    }
    if (hours < 10) {
        hours = "0" + hours; // makes sure that the hours are displayed with 2 digits
    }

    if (day < 10) {
        day = "0" + day; // makes sure that the day is displayed with 2 digits
    }
    if (month < 10) {
        month = "0" + (month + 1); // makes sure that the month is displayed with 2 digits
    }
    
    let dateAndTimeString = day + "/" + month + "/" + year + ", " + hours + ":" + minutes + ":" + seconds;

    document.getElementById("dateAndTime").innerHTML = dateAndTimeString;
}