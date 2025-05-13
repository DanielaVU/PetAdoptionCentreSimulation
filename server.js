const express = require("express");
const session = require("express-session");
const app = express();
const fs = require("fs");

app.use(express.urlencoded({ extended: false })); // Will be needed to read data from form sent with POST method
app.use(express.static(__dirname + "/public"));

app.use(
  session({
    secret: "my-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

const PORT = 5000;

const title = [
  "HOME PAGE",
  "CAT CARE",
  "DOG CARE",
  "CONTACT US",
  "FIND A DOG OR CAT",
  "PET GIVE AWAY",
  "PRIVACY STATEMENT",
  "LOGIN FORM",
  "CREATE AN ACCOUNT FORM",
  "PET GIVE AWAY - LOGIN",
  "LOG IN - LOGGED IN"
];

app.listen(PORT, () => {
    console.log(`The server is running on port ${PORT}`);
  });

app.get("/", (request, response) => {

    mergeContentWithTemplates(response, "/public/homePage.html");
    return;
});

app.get("/homePage", (request, response) => {
    mergeContentWithTemplates(response, "/public/homePage.html");
    return;
});

app.get("/catCare", (request, response) => {
  mergeContentWithTemplates(response, "/public/CatCare.html");
  return;
});

app.get("/dogCare", (request, response) => {
  mergeContentWithTemplates(response, "/public/DogCare.html");
  return;
});

app.get("/contactUs", (request, response) => {
  mergeContentWithTemplates(response, "/public/contactUs.html");
  return;
});

app.get("/findADogCat", (request, response) => {
  mergeContentWithTemplates(response, "/public/findADogCat.html");
  return;
});

app.get("/petGiveAway", (request, response) => {
  if(request.session.username){
    mergeContentWithTemplates(response, "/public/petGiveAway.html");
  }
  else mergeContentWithTemplates(response, "/public/mustLoginPetGiveAway.html")
  return;
});

app.post("/loginResponsePetGiveAway", (request, response) => { // From a forms with method POST and action "/loginResponsePetGiveAway"
  const username = request.body.username;
  const password = request.body.password;

  if (checkExistingUser(username, password)) {
    request.session.username = username;
    
    response.redirect("/petGiveAway");
    return;
  }
  else {
    response.send(`
      <script>
        alert("Invalid username or password! Please try again.");
        window.location.href = "/petGiveAway";
      </script>
    `);
    return;
  }
});

app.get("/privacyStatement", (request, response) => {
  mergeContentWithTemplates(response, "/public/privacyStatement.html");
  return;
});

app.get("/loginForm", (request, response) => {
  if(request.session.username){
    mergeContentWithTemplates(response, "/public/loginStatus.html")
  }
  else mergeContentWithTemplates(response, "/public/loginForm.html");
})

app.post("/loginResponse", (request, response) => { // From a forms with method POST and action "/loginResponse"
  const username = request.body.username;
  const password = request.body.password;

  if (checkExistingUser(username, password)) {
    request.session.username = username;
    
    response.send(`
      <script>
        alert("You have logged in into your account successfully!");
        window.location.href = "/loginForm";
      </script>  
    `);
    return;
  }
  else {
    response.send(`
      <script>
        alert("Invalid username or password! Please try again.");
        window.location.href = "/loginForm";
      </script>  
    `);
    return;
  }
});

app.get("/createAccountForm", (request, response) => {
  if(request.session.username){
    mergeContentWithTemplates(response, "/public/createAccountStatus.html")
  }
  else mergeContentWithTemplates(response, "/public/createAccountForm.html");
});

app.post("/createAccountResponse", (request, response) => {
  const username = request.body.username;
  const password = request.body.password;

  if(checkExistingUser(username)){
    response.send(`
      <script>
        alert("This username already exist! Please try again.");
        window.location.href = "/createAccountForm";
      </script>  
    `);
    return;
  }
  else{
    registerNewUser(username, password);
    response.redirect("/loginForm");
    return;
  }
});

app.post("/petGiveAwayFormSubmitted", (request, response) => {
  const username = request.session.username;
  
  const petType = request.body.pet_type;
  const breed = request.body.breed;
  const age = request.body.age;
  const gender = request.body.gender;
  const friendlyWithDogs = request.body.friendly_with_dogs;
  const friendlyWithCats = request.body.friendly_with_cats;
  const friendlyWithChildren = request.body.friendly_with_children;
  const comments = request.body.comments;
  const ownerGivenName = request.body.ownerGivenName;
  const ownerFamilyName = request.body.ownerFamilyName;
  const ownerEmail = request.body.ownerEmail;
  
  const contentAvailablePetsInfoFile = fs.readFileSync(__dirname + "/public/availablePetInformation.txt", "utf-8");
  const infoLines = contentAvailablePetsInfoFile.split("\n");

  const lastLine = infoLines[infoLines.length - 2];

  let counter;

  if (lastLine && lastLine.trim() !== "") {
    counter = parseInt(lastLine.split(":")[0]);
    counter++;
  } 
  else {
    counter = 1;
  }

  // Registering the new pet
    fs.appendFileSync(__dirname + "/public/availablePetInformation.txt",
      `${counter}:${username}:${petType}:${breed}:${age}:${gender}:${friendlyWithDogs}:${friendlyWithCats}:${friendlyWithChildren}:${comments}:${ownerGivenName}:${ownerFamilyName}:${ownerEmail}\n`);
    
    response.send(`
      <script>
        alert("New pet registered successfully!");
        window.location.href = "/petGiveAway";
      </script>  
    `);
});

app.post("/findPetFormSubmitted", (request, response) => {
  let petFound = false;
  let linesPetFound = [];

  const petType = request.body.pet_type;
  const breed = request.body.breed;
  const age = request.body.age;
  const gender = request.body.gender;
  const friendlyWithDogs = request.body.friendly_with_dogs;
  const friendlyWithCats = request.body.friendly_with_cats;
  const friendlyWithChildren = request.body.friendly_with_children;

  const contentAvailablePetsInfoFile = fs.readFileSync(__dirname + "/public/availablePetInformation.txt", "utf-8");
  const infoLines = contentAvailablePetsInfoFile.split("\n");

  for (let i = 0; i < infoLines.length; i++) {
    const currentLine = infoLines[i];
    const infos = currentLine.split(":");

    if (infos.length < 7) continue; // skip invalid lines

    const infoLinePetType = infos[2];
    const infoLineBreed = infos[3];
    const infoLineAge = infos[4];
    const infoLineGender = infos[5];
    const infoLineFriendlyWithDogs = infos[6];
    const infoLineFriendlyWithCats = infos[7];
    const infoLineFriendlyWithChildren = infos[8];

    if (petType === infoLinePetType && breed.toUpperCase() === infoLineBreed.toUpperCase() &&
      (age === infoLineAge || age === "does_not_matter") && (gender === infoLineGender || gender === "does_not_matter") &&
      friendlyWithDogs === infoLineFriendlyWithDogs && friendlyWithCats === infoLineFriendlyWithCats &&
      friendlyWithChildren === infoLineFriendlyWithChildren) {
      petFound = true;
      linesPetFound.push(infoLines[i]);
    }
  }

  if (petFound) {

    let listPetsFound = "";
    let petLineInfos;

    for(let i = 0 ; i < linesPetFound.length ; i++){
      petLineInfos = linesPetFound[i].split(":");
      listPetsFound += `<b>Type of pet:</b> ${petLineInfos[2]}, <br>
      <b>Breed:</b> ${petLineInfos[3]}, <br>
      <b>Age:</b> ${petLineInfos[4]}, <br>
      <b>Gender:</b> ${petLineInfos[5]}, <br>
      <b>Gets along with other dogs:</b> ${petLineInfos[6]}, <br>
      <b>Gets along with other cats:</b> ${petLineInfos[7]}, <br>
      <b>Suitable for a family with small children:</b> ${petLineInfos[8]}, <br>
      <b>Comments:</b>  ${petLineInfos[9]}, <br>
      <b>Owner's given name:</b> ${petLineInfos[10]}, <br>
      <b>Owner's family name:</b> ${petLineInfos[11]}, <br>
      <b>Owner's email:</b> ${petLineInfos[12]} <br><br><br>`;
    }

    response.send(
      `<!DOCTYPE html>
      <html lang="en">
      <head>
          <title>Adopt A Cat or Dog! - PETS FOUND</title>
          <meta charset="utf-8">
          <link rel="stylesheet" href="/AllCSS.css">
      </head>
      <body onload="startDisplayingTimeAndDate()">
          <header>
          <table>
              <tr>
                  <td><h1 class="title">Adopt-A-Pet!</h1></td>
                  <td><a href="/homePage"><img class="logo" src="/pictures/dog_and_cat_picture.jpg" alt="picture of dog"></a><br>
                  <div class="credits"><a href="https://es.pinterest.com/pin/708683691371939264/">click here for credits of the picture</a></div></td>
              </tr>
          </table>
          <p id="dateAndTime"></p>
          </header>
          <nav>
              <ul>
                  <li class="home"><a href="/homePage" id="home">Home Page</a></li>
                  <li class="findPet"><a href="/findADogCat" id="findAPet">Find A Dog/Cat</a></li>
                  <li class="dogCare"><a href="/dogCare" id="dogCare">Dog Care</a></li>
                  <li class="catCare"><a href="/catCare" id="catCare">Cat Care</a></li>
                  <li class="petGiveAway"><a href="/petGiveAway" id="petGiveAway">Have a Pet Give Away</a></li>
                  <li class="createAccount"><a href="/createAccountForm" id="createAccount">Create an account</a></li>
                  <li class="login"><a href="/loginForm" id="login">Login</a></li>
                  <li class="contact"><a href="/contactUs" id="contact">Contact Us</a></li>
                  <li class="logout"><a href="/logout" id="logout">Log out</a></li>
              </ul>
          </nav>
          <div class="content">
          <h3>Matching pet(s) found:</h3>
          <p>${listPetsFound}</p>
          <a href="/findADogCat">Click here to go back to the Find A Dog or Cat forms.</a>
          </div>
      </body>
      </html>
    `);    
  }
  else {
    response.send(`
      <script>
        alert("No pets were found with these informations. Please try again.");
        window.location.href = "/findADogCat";
      </script>  
    `);
  }
});

app.get("/logout", (request, response) => {
  if(request.session.username !== undefined){
    request.session.destroy((err) => {
      if (err) {
          return response.send("Error logging out.");
      }

      response.send(`
        <script>
          alert("You logged out successfully!");
          window.location.href = "/homePage";
        </script>  
      `);
  });
  }
  else response.send(`
    <script>
      alert("You are not logged in!");
      window.location.href = "/homePage";
    </script>  
  `);
});

function mergeContentWithTemplates(response, filePath) {

  const fullPath = __dirname + filePath;
  const content = fs.readFileSync(fullPath, "utf-8");

  let a;

  switch(filePath) {
    case "/public/homePage.html": a = 0; break;
    case "/public/CatCare.html": a = 1; break;
    case "/public/DogCare.html": a = 2; break;
    case "/public/contactUs.html": a = 3; break;
    case "/public/findADogCat.html": a = 4; break;
    case "/public/petGiveAway.html": a = 5; break;
    case "/public/privacyStatement.html": a = 6; break;
    case "/public/loginForm.html": a = 7; break;
    case "/public/createAccountForm.html": a = 8; break;
    case "/public/mustLoginPetGiveAway.html": a = 9; break;
    case "/public/loginStatus.html": a = 10; break;
  }

  const mergedWithTemplate = 
`<!DOCTYPE html>
<html lang="en">
<head>
    <title>Adopt A Cat or Dog! - ${title[a]}</title>
    <meta charset="utf-8">
    <link rel="stylesheet" href="/AllCSS.css">
</head>
<body onload="startDisplayingTimeAndDate()">
    <header>
        <table>
            <tr>
                <td><h1 class="title">Adopt-A-Pet!</h1></td>
                <td><a href="/homePage"><img class="logo" src="/pictures/dog_and_cat_picture.jpg" alt="picture of dog"></a><br>
                <div class="credits"><a href="https://es.pinterest.com/pin/708683691371939264/">click here for credits of the picture</a></div></td>
            </tr>
        </table>
        <p id="dateAndTime"></p>
    </header>
    <nav>
        <ul>
            <li class="home"><a href="/homePage" id="home">Home Page</a></li>
            <li class="findPet"><a href="/findADogCat" id="findAPet">Find A Dog/Cat</a></li>
            <li class="dogCare"><a href="/dogCare" id="dogCare">Dog Care</a></li>
            <li class="catCare"><a href="/catCare" id="catCare">Cat Care</a></li>
            <li class="petGiveAway"><a href="/petGiveAway" id="petGiveAway">Have a Pet Give Away</a></li>
            <li class="createAccount"><a href="/createAccountForm" id="createAccount">Create an account</a></li>
            <li class="login"><a href="/loginForm" id="login">Login</a></li>
            <li class="contact"><a href="/contactUs" id="contact">Contact Us</a></li>
            <li class="logout"><a href="/logout" id="logout">Log out</a></li>
        </ul>
    </nav>
    ` 
    + content + 
    `
    <footer><a href="/privacyStatement">Click <b>here</b> to view the Privacy Statement</a></footer>
    <script src="/commonScript.js"></script>
</body>
</html>`;

  response.send(mergedWithTemplate);
}

function registerNewUser(username, password) {
  fs.appendFileSync(__dirname + "/public/loginFile.txt", `${username}:${password}\n`);
}


function checkExistingUser(username, password){
  const allUsersData = fs.readFileSync(__dirname + "/public/loginFile.txt", "utf-8");
  const allUsersDataStrings = allUsersData.split("\n"); // This will give an array of strings where each string is a line in the file

  if(password !== undefined){
    for(let i = 0; i < allUsersDataStrings.length; i++){
      const oneUserInfo = allUsersDataStrings[i].split(":"); // This will give an array of strings with the username and password of an user
        if(oneUserInfo[0] === username && oneUserInfo[1] === password){
          return true;
        }
      }
    return false;
  }
  else {
    for(let i = 0; i < allUsersDataStrings.length; i++){
      const oneUserInfo = allUsersDataStrings[i].split(":"); // This will give an array of strings with the username and password of an user
        if(oneUserInfo[0] === username){
          return true;
        }
      }
    return false;
  }
}