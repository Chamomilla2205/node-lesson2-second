const path = require('path');
const expressHBS = require('express-handlebars');
const express = require('express');
const fs = require('fs')

const app = express();

let error = {message: '', xxx: null};

app.use(express.json());
app.use(express.urlencoded({extended: true}))

app.use(express.static(path.join(__dirname, 'static')));

app.set('view engine', '.hbs');
app.engine('.hbs', expressHBS({defaultLayout: false}));
app.set('views', path.join(__dirname, 'static'))
const usersPath = path.join(__dirname, 'database', 'users.json')

app.get('/login', ((req, res) => {
    res.render('login')
}))

app.post('/login', ((req, res) => {
    fs.readFile(usersPath, (err, data) => {
        if (err) {
            console.log(err)
        }
        const users = JSON.parse(data);
        const userChecked = users.find(user => user.email === req.body.email && user.password === req.body.password)
        if (userChecked) {
            res.redirect(`/users/${userChecked.id}`)
            return;
        }
        error = {message: 'False password or email', xxx: true};
        res.redirect('/error')
    })
}))

app.get('/registration', ((req, res) => {
    res.render('registration')
}))

app.post('/registration', (req, res) => {
    fs.readFile(usersPath, (err, data) => {
        if (err) {
            console.log(err)
            return;
        }
        const users = JSON.parse(data);
        const checkError = users.some(user => user.email === req.body.email) // true or false
        if (checkError) {
            error = {message: 'User already exist', xxx: false};
            res.redirect('/error')
            return;
        }
        users.sort((a, b) => a.id - b.id)
        req.body.id = users[users.length - 1].id + 1;

        users.push(req.body)
        fs.writeFile(usersPath, JSON.stringify(users), (err1, data) => {
            if (err1) {
                console.log(err1)
            }
            res.redirect('/users')
        })


    })
});

app.get('/error', ((req, res) => {
    res.render('error', {error})
}));



app.get('/users/:userId', (({params: {userId}}, res) => {
    fs.readFile(usersPath, (err, data) => {
        if (err) {
            console.log(err)
            return;
        }

        const user = JSON.parse(data).find(user => user.id === +userId)
        res.render('user', {user})
    })
}))
app.get('/users', ((req, res) => {
    fs.readFile(usersPath, (err, data) => {
        if (err) {
            console.log(err)
        }
        const allUsers = JSON.parse(data)
        res.render('users', {allUsers})
    })
}))

app.listen(4500, () => {
    console.log('App listen 4500')
})

app.delete()
