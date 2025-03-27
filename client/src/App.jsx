import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import {Navigation} from './Components/Navigation';
import {PagesTable} from "./Components/Pages.jsx";
import {useEffect, useState} from "react";
import {BrowserRouter, Routes, Route, Navigate, Link} from "react-router-dom";
import {LoginForm} from "./Components/LogIn.jsx";
import {OpenedPage} from "./Components/OpenedPage";
import {FormPage} from "./Components/FormPage";
import {Container} from "react-bootstrap";
import API from "./API.jsx";
import dayjs from "dayjs";

function App() {
    const [pages, setPages] = useState([]);
    const [user, setUser] = useState(undefined);
    const [search, setSearch] = useState(true);
    const [dataDispondibili, setDataDispondibili] = useState(false);
    const [errorMsg, setErrorMsg] = useState("")
    const [back, setBack] = useState(false);

    const [orderedBy, setOrderedBy] = useState("publicationDate");
    const [orderType, setOrderType] = useState(true);//true asc

    const order = (a, b) => {
        if(a.publicationDate=="")
            return 1;
        if(b.publicationDate=="")
            return -1;
        let c=a.publicationDate.diff(b.publicationDate, "day");
        return orderType?c:-c;
    }

    const handleError = (err) => {
        console.log('err: '+JSON.stringify(err));  // Only for debug
        let errMsg = 'Unkwnown error';
        if (err.errors) {
            if (err.errors[0])
                if (err.errors[0].msg)
                    errMsg = err.errors[0].msg;
        } else if (err.error) {
            errMsg = err.error;
        }
        setErrorMsg(errMsg);
        setTimeout(()=>setDataDispondibili(false), 2000);  // Fetch correct version from server, after a while
    }

    useEffect(()=>{
        setPages((old)=>old.sort((a, b)=>{
            let c;
            switch (orderedBy){
                case "title": c=a.title.localeCompare(b.title); return orderType?c:-c;
                case "author": c=a.author.localeCompare(b.author);return orderType?c:-c;
                case "creationDate": c=a.creationDate.diff(b.creationDate, "day"); return orderType?c:-c;
                case "publicationDate": return order(a, b);
            }
        }))
    },[orderType, orderedBy]);


    useEffect(()=>{
        if(back)
            API.getAllPages().then((p) => {
                p.sort((a, b) => order(a, b));
                setPages(p);
                setDataDispondibili(true);
            }).catch((err) => handleError(err));
        else
            API.getAllPublishedPages().then((p) => {
                p.sort((a, b) => order(a, b));
                setPages(p);
                setDataDispondibili(true);
            }).catch((err) => handleError(err));
    },[dataDispondibili])

    useEffect(()=> {
        const checkAuth = async() => {
            try {
                const user = await API.getUserInfo();
                setUser(user);
                setDataDispondibili(false);
                //setLoggedIn(true);
            } catch(err) { /* empty */ }
        };
        checkAuth();
    }, []);

    const changeOffice = () => {
        setBack((old) => !old);
        setDataDispondibili(false);
    }

    const loginSuccessful = (user) => {
        setUser(user);
        setSearch(true);
        setDataDispondibili(false);
    }

    const doLogOut = () => {
        API.logOut().then( ()=> {
            setUser(undefined);
            setBack(false);
            setDataDispondibili(false);
        }).catch((err) => handleError(err));
    }

    const addPage = (page) => {
        let litePage = { status:'added', id: page.id, title: page.title, creationDate:dayjs(page.creationDate), publicationDate: page.publicationDate?dayjs(page.publicationDate):"",  author: page.author }
        setPages((old) => {
            const tempId = Math.max(...old.map((el) => el.id))+1;
            page.id = tempId;
            return [...pages, litePage]
        });

        API.addPage(page).then(() => setDataDispondibili(false)).catch((err) => handleError(err));
    }

    const update = (page) => {
        let litePage = { status: "updated", id: page.id, title: page.title, creationDate:dayjs(page.creationDate), publicationDate: page.publicationDate?dayjs(page.publicationDate):"",  author: page.author }
        setPages((old) => {
            return old.map((el) => {
                if(el.id == page.id)
                    return litePage;
                else
                    return el;
            })
        });
        API.updatePage(page).then(() => setDataDispondibili(false)).catch((err) => handleError(err));
    }

    const deletePage = (id) =>{
        setPages((old) => old.map((el)=>el.id==id?Object.assign({}, el, {status: 'deleted'}):el));
        API.deletePage(id).then(()=>setDataDispondibili(false)).catch((err) => handleError(err));
    }

    const searchByTitle = (title) => {
        if(title)
            setPages((old)=>{
                return old.filter((el)=>el.title.toUpperCase()==title.toUpperCase());
            })
        else
            setDataDispondibili(false);
    }

    return (
        <Container fluid>
            <BrowserRouter>
                <Navigation back={back} search={search} setSearch={setSearch} searchByTitle={searchByTitle} user={user} doLogOut={doLogOut} />
                <Routes>
                    <Route path="/" element={back?<Navigate replace to="/backOffice"/>:<PagesTable setSearch={setSearch} back={back} setBack={changeOffice} errorMsg={errorMsg} setErrorMsg={setErrorMsg} orderType={orderType} setOrderType={setOrderType} orderedBy={orderedBy} setOrderedBy={setOrderedBy} dataDispondibili={dataDispondibili} pages={pages} setPages={setPages} deletePage={deletePage} user={user}/>}/>
                    <Route path="/backOffice" element={!back?<Navigate replace to="/"/>:<PagesTable setSearch={setSearch}  back={back} setBack={changeOffice} errorMsg={errorMsg} setErrorMsg={setErrorMsg} orderType={orderType} setOrderType={setOrderType} orderedBy={orderedBy} setOrderedBy={setOrderedBy} dataDispondibili={dataDispondibili} pages={pages} setPages={setPages} deletePage={deletePage} user={user}/>}/>
                    <Route path="/logIn" element={<LoginForm setLogInState={setSearch} loginSuccessful={loginSuccessful}/>}/>
                    <Route path="/openedPage/:pageId" element={<OpenedPage setSearch={setSearch} back={back} deletePage={deletePage} user={user}/>}/>
                    <Route path="/modify/:pageId" element={<FormPage setSearch={setSearch} update={update} user={user}/>}/>
                    <Route path="/add" element={<FormPage setSearch={setSearch} addPage={addPage} user={user}/>}/>
                    <Route path="/*" element={<DefaultRoute/>}/>
                </Routes>
            </BrowserRouter>
        </Container>
    );
}

function DefaultRoute() {
    return(
        <Container className="below-nav" >
            <h1>There is no data here...</h1>
            <h2>Wronged Route!</h2>
            <Link to='/'>Please go back to main page</Link>
        </Container>
    );
}

export default App;