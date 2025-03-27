import 'bootstrap-icons/font/bootstrap-icons.css';
import {PersonCircle} from 'react-bootstrap-icons';
import {Navbar, Form, Nav, NavLink, Row, Col} from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import {useEffect, useState} from "react";
import API from "../API.jsx";

function Navigation(props){
    const [color, setColor] = useState("gray");
    const [search, setSearch] = useState("");

    const [title, setTitle] = useState();
    const [errTitle, setErrTitle] = useState('bg-ligth');

    const [done, setDone] = useState(false);

    useEffect(() => {
        API.getTitle().then((p) =>setTitle(p)).catch();
    },[]);

    useEffect(()=>{
        if(props.user)
            setColor('white');
    },[props.user]);

    const handleOnSubmit = (e)=>{
        e.preventDefault();
        if(search!="")
            props.searchByTitle(search);
        else
            props.searchByTitle(undefined);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if(title==""){
            setErrTitle("bg-warning");
        }
        else {
            setErrTitle("bg-light");
            API.changeTitle(title).then(()=>{
                setDone(true);
                setTimeout(()=>setDone(false), 3000);
            });
        }
    }

    const logIn = () => {
        props.setSearch(false);
        navigate("/logIn")
    }

    const navigate = useNavigate();

    return (
        <Navbar bg="dark" variant="dark" fixed="top" className="navbar-padding">
            <Navbar.Brand color="white">
                <Row>
                    <Col xs={1}>
                        <i className="bi-images"/>
                    </Col>
                    <Col xs={9}>
                    {
                        props.back && props.user && props.user.administrator?
                        <Form onSubmit={(e)=>handleSubmit(e)}>
                            <Form.Control className={errTitle} type="text" name="text" value={title} onChange={ev => setTitle(ev.target.value)}/>
                        </Form>
                        :title
                    }
                    </Col>
                    {
                        done?
                            <Col xs={1}><i className="bi-patch-check"></i></Col>: <Col xs={1}/>
                    }
                </Row>
            </Navbar.Brand>
            {
                props.search?
                <Form onSubmit={(e)=>handleOnSubmit(e)} className="my-2 my-lg-0 mx-auto">{/*mx-auto dove m=margin, x è affinche il margine sia uguale a destra e a sinistea auto=lo setta in automatico*/}
                    <Form.Control onChange={ev => setSearch(ev.target.value)} placeholder="Search by title" aria-label="SearchQuery"/>
                </Form>:<Col/>
            }
            <Navbar.Text>{props.user? props.user.username:""}</Navbar.Text>
            <Nav>
                <NavLink onClick={()=>{if(props.user){props.doLogOut();navigate("/")}else logIn()}}>
                    <PersonCircle onMouseLeave={()=>props.user?setColor("white"):setColor('gray')} onMouseEnter={()=>props.user?setColor("red"):setColor('white')} color={color} size={32}/>
                </NavLink>
            </Nav>
        </Navbar>
    );
}


export {Navigation};
