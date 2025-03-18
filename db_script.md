# create db
```
create database College_Event_Manager;
use College_Event_Manager;
```
# tables
```
create table Users(

);

create table Location(
    Lname varchar(100) primary key,
    Address varchar(100),
    Longitutde varchar(100),
    Latitude varchar(100)
);

create table Events(
    Events_ID int auto_increment primary key,
    Time time unique not null,
    Location varchar(100) unique not null,
    Event_name varchar(100),
    Description varchar(1000),
    foreign key (Location) references Location(Lname) on delete cascade
);

create table Private_Events(

);

create table Public_Events(

);

create table RSO_Events(

);

create table RSOs(

);

create table Admins(

);

create table SuperAdmins(

);

```
# triggers
```

```
# db Admin login
USERNAME should be replaced with a username(Ex: Bob) same for PASSWORD
```
CREATE USER 'USERNAME'@'%' IDENTIFIED BY 'PASSWORD';
GRANT ALL PRIVILEGES ON College_Event_Manager.* TO 'USERNAME'@'%';
```