# create db
```
create database College_Event_Manager;
use College_Event_Manager;
```
# tables
```
create table Users(
    UID varchar(20) unique primary key,
    password varchar(100)
);

create table Users_Comments(
    UID varchar(20) primary key,
    text text,
    rating int,
    timestamp time,
    foreign key (UID) referecences Users(UID) on delete cascade
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
    Events_ID int auto_increment primary key,
    foreign key (Events_ID) references Events(Events_ID) on delete cascade
);

create table Public_Events(
    Events_ID int auto_increment primary key,
    foreign key (Events_ID) references Events(Events_ID) on delete cascade
);

create table RSO_Events(
    Events_ID int auto_increment primary key,
    foreign key (Events_ID) references Events(Events_ID) on delete cascade
);

create table RSOs(

);

create table Admins(
    UID varchar(20) primary key,
    foreign key (UID) references Users(UID) on delete cascade
);

create table SuperAdmins(
    UID varchar(20) primary key,
    foreign key (UID) references Users(UID) on delete cascade
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