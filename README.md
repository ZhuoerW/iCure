# iCure

The iCure is an Electronic Health Records system designed to support efficient communication among patients and doctors. Features include medical forum, appointment scheduling, patient-doctor private chatting, electronic records of medical treatments, and other supporting features all work together to provide both care for patients and efficiency for doctors.

The iCure allowing three types of users, including visitors, patients, and doctors. In addition to common functions like searching and viewing posts, each type of logged in user can enjoy more special functions, like making appointments or private chatting. Moreover, to get funding for maintaining the system, there is available space for advertisements of medical-related business. With data and information we get, iCure can provide tailored service for each user, which can refine the traditional medical treatment processes significantly.

## Prerequisites
The iCure system requirs the installation of mongodb and node.js 
Node.js
Open the terminal or DOS Shell and run (node -v) and (npm -v). Both commands should output a version number if the Node.js is successfully installed.
Please follow the instruction in this website to download node.js. 
https://nodejs.org/en/

Mongodb
To install MongoDB, use a package manager like apt on Linux or homebrew on MacOS (brew install mongodb)
An alternative way is to follow the instruction on this website https://docs.mongodb.com/manual/installation/.

## Installing and get start
a) Open the terminal or DOS Shell and go to the program folder. 
b) Run (npm install) to install all required modules. 
c) Open another window of terminal/DOS Shell, run (mongod) and then (mongo) to start the database of mongodb.
d) Go back to the window under the program folder and run (node app.js) to start the server. 
c) Open an browser and go to http://localhost:3000 to start the web application.

## Running the tests

## Contributors

Wenxin Feng -- Front-end development and test
Wujie Duan -- Back-end development and front-end development
Xinyi Wang -- Front-end development and project management
Zhuoer Wang -- Back-end development and test

## Documentation 
For detailed information about iCure system, please refer to the documentation.


git clone https://github.com/YOUR_ID/YOUR_REPOSITORY.git

git remote add upstream https://github.com/ORIGINAL_OWNER/ORIGINAL_REPOSITORY.git

git fetch upstream

git merge upstream/master
```

Get the Updated Version from the Original Repo

```
git checkout master

git fetch upstream

git merge upstream/master
```

Update Codes in Branch [branchname]. You can change the branch's name.

```
git branch [branchname]

git checkout [branchname]

git status

git add .

git commit -m "comment"

git push -u origin [branchname]
```

Merge Branch [branchname] to Branch master

```
git checkout master

git fetch upstream

git merge upstream/master

git merge [branchname]

git status

git push -u origin master
```

Pull Request from the Original Repo <br>

Approve and Merge <br>

Delete Branch [branchname]

```
git branch -d [branchname]

git push origin --delete [branchname]
```
