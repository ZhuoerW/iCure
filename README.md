# iCure
A Software Engineering Project

## Fork

Fork from the Original Repo to your GitHub <br>

The First Time to Build the Local Repo

```
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
