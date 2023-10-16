// import './App.css';
import Login from './components/Login';
import Layout from './components/Layout';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Register from './components/Register';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route index element={<Login />} />
        <Route path='register' element={<Register />} />

        <Route path='home' element={<Home />} />
      </Route>
    </Routes>
  );
}

export default App;
