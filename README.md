
## ALEXA SKILL

### TODO's
#### Major
- State Management durcheinander!!!
#### Minor
- Lied Belohnungssystem überdenken
- Hilfe Übersicht
- Erstes Starten, Trailer?
- nach Kapitel direkt Übungen?
- weiter und zurück -> Kapitel?
- Fragen aktuell nur für 5 Kapitel verfügbar

### INSTALLATION

Please follow the instructions to install all needed dependencies. The following guide is for an ubuntu based distribution.

#### UPDATE SYSTEM

    $ sudo apt update && sudo apt upgrade -y

#### NODEJS
Our backend is powered by NodeJs, you can install it by following command:

    $ curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
    $ sudo apt install -y nodejs npm

We need additional libraries for our skill, navigate to the project folder and type:

    $ npm install
    $ sudo npm install -g nodemon

#### MYSQL
Our alexa skill stores data in a mysql database, we need to install it on our system:

    $ sudo apt install -y mysql-server mysql-client libmysqlclient-dev

Set your password and additional settings with:

    $ sudo mysql_secure_installation

### CREATING THE DATABASE STRUCTURE

Login and create an user and tables for our alexa app:

    $ sudo mysql -u root -p
    $ CREATE USER 'app'@'localhost' IDENTIFIED BY 'app'; GRANT ALL PRIVILEGES ON * . * TO 'app'@'localhost'; FLUSH PRIVILEGES;
    $ CREATE DATABASE IF NOT EXISTS app_alexa_virtuos;
    $ exit

Create a new database:

    name: app_alexa_virtuos
    type: utf8mb4_general_ci

Create the lecture data by comment following line in:

    hf.createAllLectures()

Run it once with

    node app.js

Cancel the application with CTRL+C and comment it out again

    // hf.createAllLectures()

We need the lecture data creation just once. You can run your Skill now with:

    nodemon

Nodemon helps you to reload your app after changing something in the source code, otherwise you have to do it on your own if you use node app.js.

### HOSTING THE APPLICATION

My hosting choice is currently ngrok (https://ngrok.com), this is a free service to tunnle your app fast and easy for developing any skill. The easiest way is to create an account and use their service. Download the tool and extract it in a location of your choice, link it to your account with your dashboard key:

    ./ngrok authtoken <yourkey>

After linking your computer to your ngrok account,  use following command to serve your tunnle:

    ./ngrok http 4567

Copy your ngrok link (example: https://c55596df.ngrok.io) to your config.js. If you are using nodemon, your application should reload automatically after saving your https link to the config.js.

    exports.SERVER = 'https://c55596df.ngrok.io'
    exports.PORT = 4567

### ALEXA SKILL CONSOLE

Go to your amazon alexa console (https://developer.amazon.com/alexa/console/ask) and create a new skill, use a empty template.

#### INVOCATION

Choose a name to be called for your skill, I used:

    testdemo

You can call the skill by saying:

    Alexa, starte testdemo

#### ENDPOINT

Here you use your ngrok https link:

    https://c55596df.ngrok.io/

And you should choose:

    My developing endpoint is a sub-domain of a domain that has a wildcard certificate from a certificate authority

Remember to save the Endpoint by clicking the "Save Endpoints" button.

#### JSON EDITOR

Copy everything from skill.json into the web json editor and save it, it contains everything the skill needs (intents, variables, ...)

#### FINAL STEPS

Now you should use the buttons "Save Model" and "Build Model" to accept the changes and finalize your skill.
You should be able to speak with alexa at this point.
