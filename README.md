# Box Office Atlas : : JS/EJS/SQL Project for DAW 2024-2025
> Explore global box office film performances

<img src="art/BOABannerTransparent.png" width=100% />

----

**Box Office Atlas** aka **"BOA"** is a web-app that visualizes the global economic performance of box office films, providing users with an interactive way to explore their favourite films' success. 

![image](https://github.com/user-attachments/assets/791cdeb2-fbbf-49e1-89e1-d80e6fb987df)
![image](https://github.com/user-attachments/assets/07762dc9-6c25-4264-b924-7195571f169a)
![image](https://github.com/user-attachments/assets/64e3abe6-edce-4740-8123-fa4370558658)

```
SNAPSHOTS FROM NOVEMBER 20TH, 2024
```

**FILL OTHER INFORMATION ABOUT ARCHITECTURE HERE**

----

### Directory Navigation

| Folder 				| Description 							|
|-----------------------|---------------------------------------|
| `art`| Images and Keyart that are for the docs / repo. Non-essential to app functionality |
| `db` | All SQL files to Create, Insert and Update Tables to interface properly with the app |
| `src`| All the essential EJS, JavaScript, and CSS files for the application|

----
# Requirements
If you are deploying on a Linux/Ubuntu server, you will need a version of Ubuntu > 18. This is because there are some packages that are not supported 18. I suggest using 22.X.

# Installation
Clone the repository.
```
git clone https://github.com/PrimalRex/Box-Office-Atlas.git
```

Install Node Dependencies & Packages.
```
npm install
```

Duplicate the ```template.env``` file and remove the 'template' prefix. Fill with valid Keys & Passwords. It is important these are valid as the app will not execute without them.

Execute all the SQL commands in the ```db``` directory to ensure the app can properly communicate to the Database backend.
The correct order goes: init_DB -> create_db -> stored_procedures -> extra_procedures

Launch a local instance of the app to verify that everything has been setup properly.
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
