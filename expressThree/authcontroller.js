const signup = async (user, pass) => {
    try {
        const url = "http://127.0.0.1:3000/signup";

        const data = {
            user: user,
            pass: pass,
        };

        const headers = {
            "Content-Type": "application/json",
        };

        const response = await axios.post(url, data, { headers });

        console.log(response);
    } catch (error) {
        console.error("Error during POST request:", error);
    }
};

const login = async (user , pass) => {
    try {
        const url = "http://127.0.0.1:3000/login";

        const data = {
            user: user,
            pass: pass,
        };

        const headers = {
            "Content-Type": "application/json",
        };

        const response = await axios.post(url, data, { headers });

        const token = response.data.token;
        if (token) return token;
    } catch (error) {
        console.error("Error during POST request:", error);
    }
};


export class AuthController{
    static async login(req, res) {
        const { username, password } = req.body;
        try {
            const token = await login(username, password);
            if (token) {
                localStorage.setItem('authToken', token);
                res.redirect("/landing");
            } else {
                res.status(401).send("Login failed: Incorrect user details");
            }
        } catch (error) {
            res.status(401).send("Login failed: " + error.message);
        }
    }

    static async signup(req, res) {
        const { username, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).send("Passwords do not match");
        }

        try {
            await signup(username, password);
            res.redirect("/log_in");
        } catch (error) {
            res.status(400).send("Signup failed: " + error.message);
        }
    }
}