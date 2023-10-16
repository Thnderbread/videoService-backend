import axios from "../api/axios";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/home';

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('')
        try {
            const response = await axios.post('/auth/login',
                JSON.stringify({ email: email, password: password }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );
            console.log('Response:', response);

            navigate(from, { replace: true })

            // setAuth({ isAuthenticated: true, user: response.data.User });
            // navigate(from, { replace: true })

        } catch (error) {
            console.error(error);
            if (!error.response) {
                alert('No server response.');
            } else if (error.response.status === 401) {
                alert('Bad email or password.')
            } else if (error.response.status === 500) {
                alert('Something went wrong. Try again later.')
            }
        }
    }

    const googleAuth = () => {
        window.open(
            'http://localhost:8080/auth/google/redirect',
            "_blank"
        )
    }

    return (
        <section>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>

                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    autoComplete="off"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    required
                />

                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    autoComplete="on"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    required
                />

                <button type="submit">Log In</button>
            </form>
            <button className="google-sign-in-button" onClick={googleAuth}>Log In With Google</button>
            <p></p>
            <span>
                <Link to='/register'>Create an account</Link>
            </span>
        </section>
    )
}

export default Login