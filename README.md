# ChatSystem
Assignment 1 for 3813ICT - Software Frameworks   return
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.2.0.

# Table of Contents

| Section | Content |
| --- | --- |
| 01 | Git |
| 02 | Data Structure |
| 03 | REST API |
| 04 | Angular Architecture |
| 05 | State Change |


# 01 - Git
Github was used for this project primarily as a means of data backup. There was only one branch used, the Master and files were pushed onto it daily. As this was a solo project I did not feel anything else was needed.

# 02 - Data Structure
This project utilises all kinds of data structures to function properly. Primarily strings and arrays are used, though there are a few instances of integers, booleans and objects. Strings are used to hold the majority of values passed between the front and back ends of the application. These strings are then usually collated into an array for longer storage within the application and iterated through for display. Objects are used primaryly for user data and finally for storing all data used in the application, this object is created initially by reading and taking the contents of a JSON file and manipulated through the running of the application. Integers are only used in one instance, user roles are stored as an integer to allow for easier control over functions (ie. a user must have a role of 2 or higher to create a new user). The roles are assigned as follows; 3 = Super Admin, 2 = Group Admin, 1 = Group Assist and 0 = General User. There are only two instances of booleans within the application, they are for storing the value of whether or not a user is valid when after logging in and if a user has entered a chat, because chat fucntionality has not yet been implemented, this boolean currently have no significance.

# 03 - REST API
The project relys on three parts to function, the front-end (angular), the back-end (node.js server) and the middleware for communicating data between the two, this project utilises Socket.IO to do this. Communication through Socket.IO is used conistantly throughout the application, though 
