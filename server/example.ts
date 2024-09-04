import axios from "axios";

const signup = async (user: string, pass: string) => {
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

const login = async (user: string, pass: string) => {
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

        const token = (response.data as { token?: string }).token;
        if (token) return token;
    } catch (error) {
        console.error("Error during POST request:", error);
    }
};

const getShapes = async (token: string) => {
    try {
        const url = "http://127.0.0.1:3000/shapes";
        const headers = {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
        };

        const response = await axios.get(url, { headers });
        return response.data;
    } catch (error) {
        console.error(error);
    }
};


const getShape = async (token: string, name: string) => {
    try {
        const url = `http://127.0.0.1:3000/shape:${name}`;
        const headers = {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
        };

        const response = await axios.get(url, { headers });
        return response.data;
    } catch (error) {
        console.error(error);
    }
};

const execute = async () => {
    await signup("deez", "nuts")
    const token = await login("bob", "bob");
    
    if (token) {
        const shapes = await getShapes(token);

        const ashape = await getShape(token, "abc")
        console.log(shapes, ashape);
    }
};

execute();
