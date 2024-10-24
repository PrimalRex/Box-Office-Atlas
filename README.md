# Box Office Atlas : : JS/EJS/SQL Project for DAW 2024-2025
> Explore global box office film performances

<img src="art/BOABannerTransparent.png" width=100% />

----

**Box Office Atlas** aka **"BOA"** is a web-app that visualizes the global economic performance of box office films, providing users with an interactive way to explore their favourite films' success. 

**FILL OTHER INFORMATION ABOUT ARCHITECTURE HERE**

----

### Directory Navigation

| Folder 				| Description 							|
|-----------------------|---------------------------------------|
| `art`| Images and Keyart that are for the docs / repo. Non-essential to app functionality |
| `db` | All SQL files to Create, Insert and Update Tables to interface properly with the app |
| `src`| All the essential EJS, JavaScript, and CSS files for the application|

----

# Installation
Clone the repository.
```
git clone https://github.com/PrimalRex/Box-Office-Atlas.git
```

Install Node Dependencies & Packages.
```
npm init -y
```

Remove the 'template' prefix ```template.env``` on the environment config and fill with valid API Keys. It is important these are valid as the app will not execute without them.

Execute all SQL files in the ```db``` directory to ensure the app can properly communicate to the Database backend.

(OPTIONAL) Launch a local instance of the app to verify that everything has been setup properly.
```
node index.js
```

Grab some popcorn!



```

__/\\\\\\\\\\\\\___        _______/\\\\\______        _____/\\\\\\\\\____        
 _\/\\\/////////\\\_        _____/\\\///\\\____        ___/\\\\\\\\\\\\\__       
  _\/\\\_______\/\\\_        ___/\\\/__\///\\\__        __/\\\/////////\\\_      
   _\/\\\\\\\\\\\\\\__        __/\\\______\//\\\_        _\/\\\_______\/\\\_     
    _\/\\\/////////\\\_        _\/\\\_______\/\\\_        _\/\\\\\\\\\\\\\\\_    
     _\/\\\_______\/\\\_        _\//\\\______/\\\__        _\/\\\/////////\\\_   
      _\/\\\_______\/\\\_        __\///\\\__/\\\____        _\/\\\_______\/\\\_  
       _\/\\\\\\\\\\\\\/__        ____\///\\\\\/_____        _\/\\\_______\/\\\_ 
        _\/////////////____        ______\/////_______        _\///________\///__

```
