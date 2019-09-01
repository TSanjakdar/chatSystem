# ChatSystem
Assignment 1 for 3813ICT - Software Frameworks <br />
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.2.0.

# Table of Contents

| Section | Content |
| --- | --- |
| 01 | Git |
| 02 | Data Structure |
| 03 | Angular Architecture & State Change |
| 04 | REST API |


# 01 - Git
Github was used for this project primarily as a means of data backup. There was only one branch used, the Master and files were pushed onto it daily. As this was a solo project I did not feel anything else was needed.

# 02 - Data Structure
This project utilises all kinds of data structures to function properly. Primarily strings and arrays are used, though there are a few instances of integers, booleans and objects. Strings are used to hold the majority of values passed between the front and back ends of the application. These strings are then usually collated into an array for longer storage within the application and iterated through for display. Objects are used primaryly for user data and finally for storing all data used in the application, this object is created initially by reading and taking the contents of a JSON file and manipulated through the running of the application. Integers are only used in one instance, user roles are stored as an integer to allow for easier control over functions (ie. a user must have a role of 2 or higher to create a new user). The roles are assigned as follows; 3 = Super Admin, 2 = Group Admin, 1 = Group Assist and 0 = General User. There are only two instances of booleans within the application, they are for storing the value of whether or not a user is valid when after logging in and if a user has entered a chat, because chat fucntionality has not yet been implemented, this boolean currently have no significance.

# 03 - Angular Architecture & State Change
The project relys on three parts to function, the front-end (angular), the back-end (node.js server) and the middleware for communicating data between the two, this project utilises Socket.IO to do this. Communication through Socket.IO is used conistantly throughout the application which is housed within four different components, currently only three of these components have been implemented and carry data between themseleves and the server, these are; Login, App and Dashboard. The fourth component, Chat, will be implemented in the next iteration of the project. The Login route, as the name suggests, handles the user logging in functionality, it sends the user's username to the server where it is matched to an existing user read from the stored JSON file and then returns the user's details (email and role) along with an added "valid" parameter which dictates if the user is then sent to the dashboard or alerted to being a non-existant user.

App serves as a toolbar for the application, allowing a user to logout, join groups and channels they have access to and enter/leave chat, with its contents only displayed after a successful login, its content remains available until the user has logged out. It is Within this and Dashboard that the vast majority of data is sent back and forth between the server. On a successful login, the server will send an array of groups the user has access to to App, allowing them to select one to join. Once a group has been selected and joined, that groups name is sent to the server and an array of channels the user has been invited to within that group is returned and displayed within App. Channel has a similar setup, though once a channel has been select, the user can then enter the chat for that channel (which has not been completly implemented). Finally, when a user logs out, they are returned to Login and App is wiped blank.

Dashboard, like App is only accessible after a successful login, when this occurs, Dashboard is sent the same group array as App, along with an array of all usernames, this is for user deletion, alteration and inviting to/removing from groups and channels. Dashboard serves as the hub where a user can create, edit and delete users based on their role, create and delete groups and channels that they have access to along with add and remove users, also based on their role. Anytime one of these functionalities is used, the relevant data is sent to the server where the JSON file is updated and then all relevent data is returned to update all necessary fields in both App and Dashboard. For example, of a ne user is created, that user's username will appear in the list of users that can be invited to the current group, if that user is then invited, their name will appear then appear in the list of users to be removed from that gorup.

# 04 - REST API
Within the application data is communicated through routes, each route is listend for by Socket.io and when a route is called, the designated function is used. Below is a table listing all routes used, a description of the attached functionality, input parameters and return values.

| Route | Parameters | Description | Return Values |
| --- | --- | --- | --- |
| login | username | Empties 'userGroups', 'allGroups' and 'userList' arrays, iterate through users stored in JSON file, compare username parameter to stored users usernames. If matched, add stored user data to user object with a valid parameter of true and emit userLoggedIn route. Iterate through all stored groups, add each group name to 'allGroups', check if current username in group, if so, add group name to 'userGroups' array. Emit allGroups, userGroups and getUsers. | user |
