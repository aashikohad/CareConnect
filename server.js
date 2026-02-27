const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'views')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'homepage.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/userinterface', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'userinterface.html'));
});

app.get('/disease', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'disease.html'));
});

app.get('/hospital', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'hospital.html'));
});

app.post('/detect', (req, res) => {
    const symptoms = req.body.symptoms;
    let diagnosis = "No specific disease detected. Please consult a doctor.";

    const diseases = [
        { name: 'Cold', symptoms: ['fever', 'cough', 'fatigue'] },
        { name: 'Flu', symptoms: ['fever', 'headache', 'fatigue'] },
        { name: 'Malaria', symptoms: ['fever', 'nausea', 'fatigue'] },
    ];

    let possibleDiseases = diseases.filter(disease =>
        disease.symptoms.some(symptom => symptoms.includes(symptom))
    );

    if (possibleDiseases.length > 0) {
        diagnosis = "Possible Diseases: " + possibleDiseases.map(disease => disease.name).join(', ');
    }

    res.json({ diagnosis });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (email === 'user@example.com' && password === 'password123') {
        res.json({ message: 'Login successful', token: 'fake-jwt-token' });
    } else {
        res.json({ message: 'Invalid email or password' });
    }
});

app.post('/signup', (req, res) => {
    console.log("Signup Request Received:", req.body);
    const { username, email, password } = req.body;

    const userData = { username, email, password };

    fs.readFile('data.json', 'utf8', (err, data) => {
        let users = [];
        if (!err && data) {
            try {
                users = JSON.parse(data);
            } catch (parseError) {
                console.error('Error parsing data.json:', parseError);
                return res.status(500).json({ message: 'Internal server error' });
            }
        }
        users.push(userData);

        fs.writeFile('data.json', JSON.stringify(users, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('Error writing to data.json:', writeErr);
                return res.status(500).json({ message: 'Internal server error' });
            }
            console.log("Data written to data.json:", users);
            res.json({ message: 'Signup successful' });
        });
    });
});

app.post('/searchLocation', (req, res) => {
    console.log("search location request recieved:", req.body);
    const { username, location } = req.body;

    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading data.json:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        let users = [];
        try {
            users = JSON.parse(data);
        } catch (parseError) {
            console.error('Error parsing data.json:', parseError);
            return res.status(500).json({ message: 'Internal server error' });
        }

        const userIndex = users.findIndex(user => user.username === username);

        if (userIndex !== -1) {
            if (!users[userIndex].locations) {
                users[userIndex].locations = [];
            }
            users[userIndex].locations.push(location);

            fs.writeFile('data.json', JSON.stringify(users, null, 2), (writeErr) => {
                if (writeErr) {
                    console.error('Error writing to data.json:', writeErr);
                    return res.status(500).json({ message: 'Internal server error' });
                }
                console.log("location data written to data.json:", users);
                res.json({ message: 'Location saved' });
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});