const express = require('express');
const fs = require('fs');
const path = require('path');
const session = require('express-session');

const app = express();

app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const loginFilePath = path.join(__dirname, 'logins.txt');
const petsFilePath = path.join(__dirname, 'pets.txt');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Home.html'));
});

app.get('/CreateAccount.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'CreateAccount.html'));
});

app.get('/Give.html', (req, res) => {
    if (req.session.isLoggedIn) {
        // Serve the pet registration form directly here
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" href="Q7.css">
                <title>PAWS - Register Your Pet</title>
            </head>
            <body>
                <header>
                    <div class="header-content">
                        <a href="Home.html">
                            <img src="file.png" alt="PAWS Logo" style="height: 150px; width: 400px; vertical-align: middle;">
                        </a>
                        <h1 style="display: inline-block; vertical-align: middle; margin-left: 20px;">PAWS</h1>
                        <span id="timer" style="font-size: medium; display: inline-block; vertical-align: middle; margin-left: 40px;"></span>
                    </div>
                </header>
                <div class="container">
                    <nav class="nav">
                        <ul>
                            <li><a href="Home.html">Home</a></li>
                            <li><a href="Find.html">Find a Dog/Cat</a></li>
                            <li><a href="Care.html">Dog/Cat Care</a></li>
                            <li class="active"><a href="Give.html">Pet to Give Away</a></li>
                            <li><a href="Contact.html">Contact</a></li>
                            <li><a href="CreateAccount.html">Create Account</a></li>
                        </ul>
                    </nav>
                    <main class="content">
                        <h2>User logged in successfully</h2>
                        <h2>Please fill out this form concerning your pet</h2>
                        <form id="petForm" action="/submit-pet" method="POST">
                            <fieldset>
                                <legend>Pet Information</legend>
                                <label>Is your animal a cat or a dog?</label>
                                <input type="radio" id="dog" name="ani" value="dog" required>
                                <label for="dog">Dog</label>
                                <input type="radio" id="cat" name="ani" value="cat">
                                <label for="cat">Cat</label>
                                <br><br>
                                <label for="breed">Mention breed(s) of pet</label>
                                <input type="text" id="breed" name="breed" required>
                                <br><br>
                                <label>Select which age range your pet falls into</label>
                                <select name="age" required>
                                    <option value="">Select Age Range</option>
                                    <option value="0-1">0-1 years</option>
                                    <option value="2-6">2-6 years</option>
                                    <option value="7-12">7-12 years</option>
                                    <option value="12+">12 plus years</option>
                                </select>
                                <br><br>
                                <label>Gender of pet</label>
                                <input type="radio" id="fem" name="gen" value="female">
                                <label for="fem">Female</label>
                                <input type="radio" id="male" name="gen" value="male">
                                <label for="male">Male</label>
                                <br><br>
                                <label>Does this pet get along with other dogs, other cats, small children?</label>
                                <input type="radio" id="yes" name="oth" value="yes">
                                <label for="yes">Yes</label>
                                <input type="radio" id="no" name="oth" value="no">
                                <label for="no">No</label>
                                <br><br>
                                <label for="attractive">Please give some information that could help make your pet more attractive to potential owners</label>
                                <br>
                                <textarea id="attractive" name="attractive"></textarea>
                                <br><br>
                                <label for="owner">Your Full Name</label>
                                <input type="text" id="owner" name="owner" required>
                                <br><br>
                                <label for="own">Your Email</label>
                                <input type="email" id="own" name="email" required>
                                <br><br>
                                <input type="submit" value="Submit">
                                <input type="reset" value="Reset">
                            </fieldset>
                        </form>
                    </main>
                </div>
                <footer class="footer">
                    <a href="Disclaimer.html">Privacy/Disclaimer Statement</a>
                </footer>
            </body>
            </html>
        `);
    } else {
        res.sendFile(path.join(__dirname, 'public', 'Give.html'));
    }
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    fs.readFile(loginFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading login file:', err);
            return res.status(500).send('Server error');
        }

        const users = data.split('\n').map(line => line.split(':'));
        const isAuthenticated = users.some(user => user[0] === username && user[1] === password);

        if (isAuthenticated) {
            req.session.isLoggedIn = true;
            req.session.username = username;
            console.log('User authenticated:', username);
            res.redirect('/Give.html');  // Redirect back to /Give.html after successful login
        } else {
            console.log('Authentication failed for user:', username);
            res.redirect('/Give.html?error=invalid');
        }
    });
});

// Handle account creation
app.post('/create-account', (req, res) => {
    const { username, password } = req.body;
    const usernamePattern = /^[a-zA-Z0-9]+$/;
    const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{4,}$/;

    if (!usernamePattern.test(username) || !passwordPattern.test(password)) {
        return res.redirect('/CreateAccount.html?error=invalid');
    }

    fs.readFile(loginFilePath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Server error');

        const users = data.split('\n').map(line => line.split(':')[0]);
        if (users.includes(username)) {
            return res.redirect('/CreateAccount.html?error=exists');
        }

        const userEntry = `${username}:${password}\n`;
        fs.appendFile(loginFilePath, userEntry, err => {
            if (err) return res.status(500).send('Server error');
            res.redirect('/CreateAccount.html?success=true');
        });
    });
});

// Handle pet submission
app.post('/submit-pet', (req, res) => {
    if (req.session.isLoggedIn) {
        const { ani, breed, age, gen, oth, attractive, owner, email } = req.body;
        const username = req.session.username;
        const petId = Date.now(); // Use timestamp as unique ID for simplicity

        const petEntry = `${petId}:${username}:${ani}:${breed}:${age}:${gen}:${oth}:${attractive}:${owner}:${email}\n`;
        fs.appendFile(petsFilePath, petEntry, (err) => {
            if (err) {
                res.status(500).send('Server error');
            } else {
                res.redirect('/Give.html?message=Pet registered successfully.');
            }
        });
    } else {
        res.redirect('/Give.html');
    }
});

// Handle logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Server error');
        }
        res.redirect('/Give.html?message=You have been logged out.');
    });
});

// Start the server
app.listen(4200, () => {
    console.log('Server running on http://localhost:4200');
});
