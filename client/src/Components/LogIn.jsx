import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../API';

function LoginForm(props) {
    const [username, setUsername] = useState('daniele.femia@outlook.com');
    const [password, setPassword] = useState('password');
    const [errorMessage, setErrorMessage] = useState('') ;

    const navigate = useNavigate();

    const doLogIn = (credentials) => {
        API.logIn(credentials)
            .then( user => {
                setErrorMessage('');
                props.loginSuccessful(user);
            })
            .catch(err => {
                setErrorMessage('Wrong username or password');
            })
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        setErrorMessage('');
        const credentials = { username, password };

        let valid = true;
        if(username === '') {
            setErrorMessage("Username vuoto")
            valid = false;
        }

        if(password === '') {
            setErrorMessage("Password vuota")
            valid = false;
        }

        if(valid)
        {
            doLogIn(credentials);
            props.setLogInState(false);
            navigate("/")
        }
    };

    return (
        <Container className="below-nav">
            <Row>
                <Col xs={3}></Col>
                <Col xs={6}>
                    <h2>LOGIN</h2>
                    <Form onSubmit={handleSubmit}>
                        {errorMessage ? <Alert variant='danger' dismissible onClick={()=>setErrorMessage('')}>{errorMessage}</Alert> : ''}
                        <Form.Group controlId='username'>
                            <Form.Label>Email or Username</Form.Label>
                            <Form.Control type='text' value={username} onChange={ev => setUsername(ev.target.value)} />
                        </Form.Group>
                        <Form.Group controlId='password'>
                            <Form.Label>Password</Form.Label>
                            <Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)} />
                        </Form.Group>
                        <Row className="justify-content-center">
                            <Col lg={4}>
                                <Button className='my-2' type='submit'>Login</Button>
                                <Button className='my-2 mx-2' variant='danger' onClick={()=>{props.setLogInState(false);navigate('/')}}>Cancel</Button>
                            </Col>
                        </Row>
                    </Form>
                </Col>
                <Col xs={3}></Col>
            </Row>
        </Container>
    )
}

export { LoginForm };